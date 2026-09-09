const { pool } = require("../config/database");

async function getProgress(userId, bookId) {
  const { rows } = await pool.query(
    `SELECT percent, location, updated_at FROM reading_progress WHERE user_id = $1 AND book_id = $2`,
    [userId, bookId]
  );
  return rows[0] || null;
}

async function upsertProgress(userId, bookId, { percent, location }) {
  const { rows } = await pool.query(
    `INSERT INTO reading_progress (user_id, book_id, percent, location, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, book_id)
     DO UPDATE SET percent = EXCLUDED.percent, location = EXCLUDED.location, updated_at = now()
     RETURNING percent, location, updated_at`,
    [userId, bookId, percent, location]
  );
  return rows[0];
}

async function recordHistory(userId, bookId) {
  await pool.query(
    `INSERT INTO reading_history (user_id, book_id) VALUES ($1, $2)`,
    [userId, bookId]
  );
}

async function listHistory(userId, limit = 30) {
  const { rows } = await pool.query(
    `SELECT rh.opened_at, b.id AS book_id, b.title, b.cover_url
     FROM reading_history rh
     JOIN books b ON b.id = rh.book_id
     WHERE rh.user_id = $1
     ORDER BY rh.opened_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

module.exports = { getProgress, upsertProgress, recordHistory, listHistory };
