const { pool } = require("../config/database");

async function listCategories() {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.slug, c.call_prefix, COUNT(bc.book_id)::int AS book_count
     FROM categories c
     LEFT JOIN book_categories bc ON bc.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  return rows;
}

async function findCategoryBySlug(slug) {
  const { rows } = await pool.query(`SELECT * FROM categories WHERE slug = $1`, [slug]);
  return rows[0] || null;
}

module.exports = { listCategories, findCategoryBySlug };
