const { pool } = require("../config/database");

const BASE_SELECT = `
  SELECT
    b.id, b.title, b.description, b.published_year, b.isbn, b.cover_url,
    b.rights_status, b.is_featured, b.is_popular, b.created_at,
    a.id AS author_id, a.name AS author_name,
    l.code AS language_code, l.name AS language_name,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug))
        FILTER (WHERE c.id IS NOT NULL), '[]'
    ) AS categories
  FROM books b
  LEFT JOIN authors a ON a.id = b.author_id
  LEFT JOIN languages l ON l.id = b.language_id
  LEFT JOIN book_categories bc ON bc.book_id = b.id
  LEFT JOIN categories c ON c.id = bc.category_id
`;
const GROUP_BY = `GROUP BY b.id, a.id, l.id`;

// Supports title/author/isbn/category/keyword search plus language and year filters,
// with cursor-free offset pagination (swap for keyset pagination once the catalog is large).
async function searchBooks({ q, categorySlug, languageCode, page = 1, pageSize = 20 }) {
  const clauses = [];
  const params = [];

  if (q) {
    params.push(q);
    clauses.push(`(b.search_vector @@ plainto_tsquery('english', $${params.length})
      OR a.name ILIKE '%' || $${params.length} || '%'
      OR b.isbn ILIKE '%' || $${params.length} || '%')`);
  }
  if (categorySlug) {
    params.push(categorySlug);
    clauses.push(`c.slug = $${params.length}`);
  }
  if (languageCode) {
    params.push(languageCode);
    clauses.push(`l.code = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;
  params.push(pageSize, offset);

  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ${GROUP_BY}
     ORDER BY b.created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

async function findBookById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE b.id = $1 ${GROUP_BY}`, [id]);
  return rows[0] || null;
}

async function listFeatured(limit = 12) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE b.is_featured = true ${GROUP_BY} ORDER BY b.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

async function listPopular(limit = 12) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE b.is_popular = true ${GROUP_BY} ORDER BY b.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

async function listRecentlyAdded(limit = 12) {
  const { rows } = await pool.query(
    `${BASE_SELECT} ${GROUP_BY} ORDER BY b.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

async function createBook(data) {
  const { rows } = await pool.query(
    `INSERT INTO books (title, description, author_id, language_id, published_year, isbn, cover_url, source_url, rights_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      data.title, data.description, data.authorId, data.languageId,
      data.publishedYear, data.isbn, data.coverUrl, data.sourceUrl,
      data.rightsStatus || "unknown",
    ]
  );
  return findBookById(rows[0].id);
}

async function createBookWithChapters(bookData, chapters) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create the book
    const bookResult = await client.query(
      `INSERT INTO books
        (
          title,
          description,
          author_id,
          language_id,
          published_year,
          isbn,
          cover_url,
          source_url,
          rights_status
        )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id`,
      [
        bookData.title,
        bookData.description || null,
        bookData.authorId || null,
        bookData.languageId || null,
        bookData.publishedYear || null,
        bookData.isbn || null,
        bookData.coverUrl || null,
        bookData.sourceUrl || null,
        bookData.rightsStatus || "unknown",
      ]
    );

    const bookId = bookResult.rows[0].id;

    // Save every chapter
    for (const chapter of chapters) {
      await client.query(
        `INSERT INTO book_chapters
          (book_id, chapter_number, title, content)
         VALUES ($1, $2, $3, $4)`,
        [
          bookId,
          chapter.chapterNumber,
          chapter.title,
          chapter.content,
        ]
      );
    }

    await client.query("COMMIT");

    return findBookById(bookId);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function listChaptersByBookId(bookId) {
  const { rows } = await pool.query(
    `SELECT
       id,
       book_id,
       chapter_number,
       title,
       content,
       created_at
     FROM book_chapters
     WHERE book_id = $1
     ORDER BY chapter_number ASC`,
    [bookId]
  );

  return rows;
}
module.exports = {
  searchBooks,
  findBookById,
  listFeatured,
  listPopular,
  listRecentlyAdded,
  createBook,
  createBookWithChapters,
  listChaptersByBookId,
};
