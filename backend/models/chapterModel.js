const { pool } = require("../config/database");

async function getChaptersByBookId(bookId) {
  const { rows } = await pool.query(
    `
      SELECT id, book_id, chapter_number, title, content, created_at, updated_at
      FROM book_chapters
      WHERE book_id = $1
      ORDER BY chapter_number ASC
    `,
    [bookId]
  );
  return rows;
}

async function getChapterById(bookId, chapterId) {
  const { rows } = await pool.query(
    `
      SELECT id, book_id, chapter_number, title, content, created_at, updated_at
      FROM book_chapters
      WHERE book_id = $1 AND id = $2
    `,
    [bookId, chapterId]
  );
  return rows[0] || null;
}

async function createChapter(
  bookId,
  { chapterNumber, title, content }
) {
  const safeTitle = String(title || "")
    .replace(/\u0000/g, "")
    .trim();

  const safeContent = String(content || "")
    .replace(/\u0000/g, "");

  const { rows } = await pool.query(
    `
      INSERT INTO book_chapters
        (book_id, chapter_number, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        book_id,
        chapter_number,
        title,
        content,
        created_at,
        updated_at
    `,
    [
      bookId,
      chapterNumber,
      safeTitle,
      safeContent,
    ]
  );

  return rows[0];
}

async function createChapters(bookId, chapters) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const created = [];

    for (const chapter of chapters) {
      const chapterNumber =
        Number(chapter.chapterNumber) || 1;

      const title = String(
        chapter.title || ""
      )
        .replace(/\u0000/g, "")
        .trim();

      const content = String(
        chapter.content || ""
      ).replace(/\u0000/g, "");

      if (!content.trim()) {
        continue;
      }

      const { rows } = await client.query(
        `
          INSERT INTO book_chapters
            (book_id, chapter_number, title, content)
          VALUES ($1, $2, $3, $4)
          RETURNING
            id,
            book_id,
            chapter_number,
            title,
            content,
            created_at,
            updated_at
        `,
        [
          bookId,
          chapterNumber,
          title,
          content,
        ]
      );

      created.push(rows[0]);
    }

    await client.query("COMMIT");

    return created;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function updateChapter(bookId, chapterId, { chapterNumber, title, content }) {
  const { rows } = await pool.query(
    `
      UPDATE book_chapters
      SET
        chapter_number = COALESCE($3, chapter_number),
        title = COALESCE($4, title),
        content = COALESCE($5, content),
        updated_at = NOW()
      WHERE book_id = $1 AND id = $2
      RETURNING id, book_id, chapter_number, title, content, created_at, updated_at
    `,
    [bookId, chapterId, chapterNumber ?? null, title ?? null, content ?? null]
  );
  return rows[0] || null;
}

async function deleteChapter(bookId, chapterId) {
  const result = await pool.query(
    `DELETE FROM book_chapters WHERE book_id = $1 AND id = $2`,
    [bookId, chapterId]
  );
  return result.rowCount > 0;
}

module.exports = {
  getChaptersByBookId,
  getChapterById,
  createChapter,
  createChapters,
  updateChapter,
  deleteChapter,
};
