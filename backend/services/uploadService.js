const { pool } = require("../config/database");

async function findOrCreateAuthor(client, name) {
  const clean = String(name || "").trim();
  if (!clean) return null;

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

async function findOrCreateLanguage(client, code, name) {
  const cleanCode = String(code || "en").trim().toLowerCase();
  const cleanName = String(name || (cleanCode === "en" ? "English" : cleanCode.toUpperCase())).trim();

  const existing = await client.query(
    "SELECT id FROM languages WHERE lower(code) = lower($1) LIMIT 1",
    [cleanCode]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  const created = await client.query(
    "INSERT INTO languages (code, name) VALUES ($1, $2) RETURNING id",
    [cleanCode, cleanName]
  );

  return created.rows[0].id;
}

async function findOrCreateCategory(client, name) {
  if (!name) return null;

  const cleanName = String(name).trim();
  if (!cleanName) return null;

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const existing = await client.query(
    "SELECT id FROM categories WHERE slug = $1 OR lower(name) = lower($2) LIMIT 1",
    [slug, cleanName]
  );

  if (existing.rows[0]) return existing.rows[0].id;

  const created = await client.query(
    "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
    [cleanName, slug]
  );

  return created.rows[0].id;
}

/**
 * Save the uploaded book exactly as uploaded.
 * No parsing, no chapter splitting, no book_chapters writes.
 */
async function uploadBook({ metadata, file }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const authorId = await findOrCreateAuthor(client, metadata.author);

    const languageId = await findOrCreateLanguage(
      client,
      metadata.language || "en",
      metadata.languageName
    );

    const bookResult = await client.query(
      `INSERT INTO books
        (title, description, author_id, language_id, published_year, isbn,
         cover_url, source_url, rights_status, is_featured, is_popular)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        String(metadata.title || file.originalname).trim(),
        metadata.description?.trim() || null,
        authorId,
        languageId,
        metadata.publishedYear ? Number(metadata.publishedYear) : null,
        metadata.isbn?.trim() || null,
        metadata.coverUrl?.trim() || null,
        metadata.sourceUrl?.trim() || null,
        metadata.rightsStatus || "unknown",
        metadata.isFeatured === "true" || metadata.isFeatured === true,
        metadata.isPopular === "true" || metadata.isPopular === true,
      ]
    );

    const bookId = bookResult.rows[0].id;

    const categoryNames = String(metadata.category || metadata.categories || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    for (const categoryName of categoryNames) {
      const categoryId = await findOrCreateCategory(client, categoryName);

      if (categoryId) {
        await client.query(
          `INSERT INTO book_categories (book_id, category_id)
           VALUES ($1,$2)
           ON CONFLICT DO NOTHING`,
          [bookId, categoryId]
        );
      }
    }

    const format =
      file.mimetype === "text/plain"
        ? "txt"
        : file.originalname.toLowerCase().endsWith(".epub")
          ? "epub"
          : "pdf";

    const fileUrl = `/uploads/books/${file.filename}`;

    await client.query(
      `INSERT INTO book_files (book_id, format, file_url, size_bytes)
       VALUES ($1,$2,$3,$4)`,
      [bookId, format, fileUrl, file.size]
    );

    await client.query("COMMIT");

    return {
      id: bookId,
      fileUrl,
      format,
      sizeBytes: file.size,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { uploadBook };
