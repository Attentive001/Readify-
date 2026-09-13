const { pool } = require("../config/database");

async function createUser({ email, passwordHash, displayName }) {
  const query = `
    INSERT INTO users (
      email,
      password_hash,
      display_name
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      email,
      display_name,
      created_at,
      updated_at
  `;

  const values = [
    email.toLowerCase().trim(),
    passwordHash,
    displayName || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = `
    SELECT
      id,
      email,
      password_hash,
      display_name,
      created_at,
      updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [
    email.toLowerCase().trim(),
  ]);

  return result.rows[0] || null;
}

async function findUserById(id) {
  const query = `
    SELECT
      id,
      email,
      display_name,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};