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
      bio,
      avatar_url,
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
      bio,
      avatar_url,
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
      bio,
      avatar_url,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] || null;
}

/**
 * Get complete profile information
 */
async function getUserProfile(userId) {
  const query = `
    SELECT
      id,
      email,
      display_name,
      bio,
      avatar_url,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0] || null;
}

/**
 * Update user profile
 */
async function updateUserProfile(
  userId,
  { displayName, bio, avatarUrl }
) {
  const query = `
    UPDATE users
    SET
      display_name = $1,
      bio = $2,
      avatar_url = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING
      id,
      email,
      display_name,
      bio,
      avatar_url,
      created_at,
      updated_at
  `;

  const values = [
    displayName || null,
    bio || null,
    avatarUrl || null,
    userId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getUserProfile,
  updateUserProfile,
};