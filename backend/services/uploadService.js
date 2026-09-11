const { pool } = require("../config/database");
const { parseBook } = require("./bookParser");

async function findOrCreateAuthor(client, name) {
  const clean = name.trim();
  const existing = await client.query(
    "SELECT id FROM authors WHERE lower(name) = lower($1) LIMIT 1",
    [clean]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await client.query(
    "INSERT INTO authors (name) VALUES ($1) RETURNING id",
    [clean]
  );
  return created.rows[0].id;
}

async function findOrCreateLanguage(client, code) {
  const cleanCode = (code || "en").trim().toLowerCase();
  const existing = await client.query(
    "SELECT id FROM languages WHERE lower(code) = lower($1) LIMIT 1",
    [cleanCode]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await client.query(
    "INSERT INTO languages (code, name) VALUES ($1, $2) RETURNING id",
    [cleanCode, cleanCode === "en" ? "English" : cleanCode.toUpperCase()]
  );
  return created.rows[0].id;
}

async function findOrCreateCategory(client, name) {
  if (!name) return null;
  const slug = name.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const existing = await client.query(
    "SELECT id FROM categories WHERE slug = $1 OR lower(name) = lower($2) LIMIT 1",
    [slug, name.trim()]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await client.query(
    "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
    [name.trim(), slug]
  );
  return created.rows[0].id;
}

async function uploadBook({ metadata, file }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const authorName = metadata.author
      ? await findOrCreateAuthor(client, metadata.author)
      : null;
    const languageId = await findOrCreateLanguage(client, metadata.language || "en");

    const bookResult = await client.query(
      `INSERT INTO books
        (title, description, author_id, language_id, published_year, isbn,
         cover_url, source_url, rights_status, is_featured, is_popular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        metadata.title.trim(),
        metadata.description?.trim() || null,
        authorName,
        languageId,
        metadata.publishedYear ? Number(metadata.publishedYear) : null,
        metadata.isbn?.trim() || null,
        metadata.coverUrl?.trim() || null,
        `/uploads/books/${file.filename}`,
        metadata.rightsStatus || "unknown",
        metadata.isFeatured === "true" || metadata.isFeatured === true,
        metadata.isPopular === "true" || metadata.isPopular === true,
      ]
    );
    const bookId = bookResult.rows[0].id;

    const categoryId = await findOrCreateCategory(client, metadata.category);
    if (categoryId) {
      await client.query(
        "INSERT INTO book_categories (book_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
        [bookId, categoryId]
      );
    }

    const chapters = await parseBook(file.path);

    for (const chapter of chapters) {
      await client.query(
        `INSERT INTO book_chapters (book_id, chapter_number, title, content)
         VALUES ($1,$2,$3,$4)`,
        [bookId, chapter.chapterNumber, chapter.title, chapter.content]
      );
    }

    await client.query(
      `INSERT INTO book_files (book_id, format, file_url, size_bytes)
       VALUES ($1,$2,$3,$4)`,
      [
        bookId,
        file.mimetype === "text/plain" ? "txt" :
          file.originalname.toLowerCase().endsWith(".epub") ? "epub" : "pdf",
        `/uploads/books/${file.filename}`,
        file.size,
      ]
    );

    await client.query("COMMIT");

    return {
      id: bookId,
      chaptersCount: chapters.length,
      fileUrl: `/uploads/books/${file.filename}`,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { uploadBook };
