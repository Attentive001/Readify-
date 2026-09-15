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
async function searchBooks({
  q = "",
  categorySlug = null,
  languageCode = null,
  year = null,
  page = 1,
  pageSize = 20,
}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.min(
    100,
    Math.max(1, Number(pageSize) || 20)
  );

  const offset = (safePage - 1) * safePageSize;

  const values = [];
  const conditions = [];

  /*
   * Search by:
   * - title
   * - author
   * - ISBN
   * - description
   * - category
   */
  if (q && q.trim()) {
    values.push(`%${q.trim()}%`);

    const index = values.length;

    conditions.push(`
      (
        b.title ILIKE $${index}
        OR a.name ILIKE $${index}
        OR b.isbn ILIKE $${index}
        OR b.description ILIKE $${index}
        OR EXISTS (
          SELECT 1
          FROM book_categories bc_search
          JOIN categories c_search
            ON c_search.id = bc_search.category_id
          WHERE bc_search.book_id = b.id
            AND c_search.name ILIKE $${index}
        )
      )
    `);
  }

  /*
   * Filter by category
   */
  if (categorySlug) {
    values.push(categorySlug);

    const index = values.length;

    conditions.push(`
      EXISTS (
        SELECT 1
        FROM book_categories bc_category
        JOIN categories c_category
          ON c_category.id = bc_category.category_id
        WHERE bc_category.book_id = b.id
          AND c_category.slug = $${index}
      )
    `);
  }

  /*
   * Filter by publication year
   */
  if (year && String(year).trim()) {
    values.push(Number(year));
    const index = values.length;
    conditions.push(`b.published_year = $${index}`);
  }

  /*
   * Filter by language
   */
  if (languageCode) {
    values.push(languageCode);

    const index = values.length;

    conditions.push(`
      l.code = $${index}
    `);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

  /*
   * Count results
   */
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM books b
    LEFT JOIN authors a
      ON a.id = b.author_id
    LEFT JOIN languages l
      ON l.id = b.language_id
    ${whereClause}
  `;

  const countResult = await pool.query(
    countQuery,
    values
  );

  const total = countResult.rows[0]?.total || 0;

  /*
   * Get books
   *
   * IMPORTANT:
   * Categories are loaded using a correlated
   * subquery instead of GROUP BY.
   *
   * This prevents the PostgreSQL GROUP BY error.
   */
  const dataValues = [...values];

  dataValues.push(safePageSize);
  const limitIndex = dataValues.length;

  dataValues.push(offset);
  const offsetIndex = dataValues.length;

  const dataQuery = `
    SELECT
      b.id,
      b.title,
      b.description,
      b.published_year,
      b.isbn,
      b.cover_url,
      b.rights_status,
      b.is_featured,
      b.is_popular,
      b.created_at,

      a.id AS author_id,
      a.name AS author_name,

      l.code AS language_code,
      l.name AS language_name,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', c.id,
              'name', c.name,
              'slug', c.slug
            )
            ORDER BY c.name
          )
          FROM book_categories bc
          JOIN categories c
            ON c.id = bc.category_id
          WHERE bc.book_id = b.id
        ),
        '[]'::json
      ) AS categories

    FROM books b

    LEFT JOIN authors a
      ON a.id = b.author_id

    LEFT JOIN languages l
      ON l.id = b.language_id

    ${whereClause}

    ORDER BY b.title ASC

    LIMIT $${limitIndex}
    OFFSET $${offsetIndex}
  `;

  const result = await pool.query(
    dataQuery,
    dataValues
  );

  return {
    books: result.rows,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(
      total / safePageSize
    ),
  };
}

async function findBookById(id) {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!UUID_RE.test(String(id || ""))) {
    return null;
  }

  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE b.id = $1 ${GROUP_BY}`,
    [id]
  );

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
      data.title, data.description, data.authorName, data.languageId,
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

    // =========================
    // 1. FIND / CREATE AUTHOR
    // =========================
    let authorId = null;

    if (bookData.authorName) {
      const authorResult = await client.query(
        `SELECT id
         FROM authors
         WHERE LOWER(name) = LOWER($1)
         LIMIT 1`,
        [bookData.authorName.trim()]
      );

      if (authorResult.rows.length > 0) {
        authorId = authorResult.rows[0].id;
      } else {
        const newAuthor = await client.query(
          `INSERT INTO authors (name)
           VALUES ($1)
           RETURNING id`,
          [bookData.authorName.trim()]
        );

        authorId = newAuthor.rows[0].id;
      }
    }

    // =========================
    // 2. FIND / CREATE LANGUAGE
    // =========================
    let languageId = null;

    if (bookData.languageCode && bookData.languageName) {
      const languageResult = await client.query(
        `SELECT id
         FROM languages
         WHERE LOWER(code) = LOWER($1)
         LIMIT 1`,
        [bookData.languageCode.trim()]
      );

      if (languageResult.rows.length > 0) {
        languageId = languageResult.rows[0].id;
      } else {
        const newLanguage = await client.query(
          `INSERT INTO languages (code, name)
           VALUES ($1, $2)
           RETURNING id`,
          [
            bookData.languageCode.trim(),
            bookData.languageName.trim(),
          ]
        );

        languageId = newLanguage.rows[0].id;
      }
    }

    // =========================
    // 3. CREATE BOOK
    // =========================
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
        authorId,
        languageId,
        bookData.publishedYear || null,
        bookData.isbn || null,
        bookData.coverUrl || null,
        bookData.sourceUrl || null,
        bookData.rightsStatus || "unknown",
      ]
    );

    const bookId = bookResult.rows[0].id;

    // =========================
    // 4. SAVE CATEGORIES
    // =========================
    if (bookData.categories) {
      const categoryNames = bookData.categories
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      for (const categoryName of categoryNames) {
        const slug = categoryName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let categoryId = null;

        // Find existing category
        const categoryResult = await client.query(
          `SELECT id
           FROM categories
           WHERE LOWER(name) = LOWER($1)
              OR slug = $2
           LIMIT 1`,
          [categoryName, slug]
        );

        if (categoryResult.rows.length > 0) {
          categoryId = categoryResult.rows[0].id;
        } else {
          // Create category if it doesn't exist
          const newCategory = await client.query(
            `INSERT INTO categories (name, slug)
             VALUES ($1, $2)
             RETURNING id`,
            [categoryName, slug]
          );

          categoryId = newCategory.rows[0].id;
        }

        // Connect book to category
        await client.query(
          `INSERT INTO book_categories
            (book_id, category_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [bookId, categoryId]
        );
      }
    }

    // =========================
    // 5. SAVE ALL CHAPTERS
    // =========================
    for (const chapter of chapters) {
  const cleanTitle = String(chapter.title || "")
    .replace(/\u0000/g, "")
    .trim();

  const cleanContent = String(chapter.content || "")
    .replace(/\u0000/g, "");

  await client.query(
    `INSERT INTO book_chapters
      (book_id, chapter_number, title, content)
     VALUES ($1, $2, $3, $4)`,
    [
      bookId,
      chapter.chapterNumber,
      cleanTitle,
      cleanContent,
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
