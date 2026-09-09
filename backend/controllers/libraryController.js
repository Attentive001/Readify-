const { pool } = require("../config/database");

async function getLibrary(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.title, b.cover_url, f.created_at AS saved_at
       FROM favorites f
       JOIN books b ON b.id = f.book_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    res.json({ books: rows });
  } catch (err) {
    next(err);
  }
}

async function addToLibrary(req, res, next) {
  try {
    await pool.query(
      `INSERT INTO favorites (user_id, book_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.bookId]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function removeFromLibrary(req, res, next) {
  try {
    await pool.query(
      `DELETE FROM favorites WHERE user_id = $1 AND book_id = $2`,
      [req.user.id, req.params.bookId]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLibrary, addToLibrary, removeFromLibrary };
