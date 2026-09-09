const { pool } = require("../config/database");

async function listBookmarks(userId, bookId) {
  const { rows } = await pool.query(
    `SELECT id, location, note, created_at FROM bookmarks
     WHERE user_id = $1 AND book_id = $2 ORDER BY created_at DESC`,
    [userId, bookId]
  );
  return rows;
}

async function addBookmark(userId, bookId, { location, note }) {
  const { rows } = await pool.query(
    `INSERT INTO bookmarks (user_id, book_id, location, note)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, book_id, location) DO UPDATE SET note = EXCLUDED.note
     RETURNING id, location, note, created_at`,
    [userId, bookId, location, note || null]
  );
  return rows[0];
}

async function removeBookmark(userId, bookId, location) {
  await pool.query(
    `DELETE FROM bookmarks WHERE user_id = $1 AND book_id = $2 AND location = $3`,
    [userId, bookId, location]
  );
}

module.exports = { listBookmarks, addBookmark, removeBookmark };
