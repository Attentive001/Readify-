const { pool } = require("../config/database");

async function listAuthors({ page = 1, pageSize = 20 } = {}) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `SELECT id, name FROM authors ORDER BY name ASC LIMIT $1 OFFSET $2`,
    [pageSize, offset]
  );
  return rows;
}

async function findAuthorById(id) {
  const { rows } = await pool.query(`SELECT * FROM authors WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function listBooksByAuthor(authorName) {
  const { rows } = await pool.query(
    `SELECT id, title, cover_url, published_year FROM books WHERE author_id = $1 ORDER BY published_year ASC`,
    [authorName]
  );
  return rows;
}

module.exports = { listAuthors, findAuthorById, listBooksByAuthor };
