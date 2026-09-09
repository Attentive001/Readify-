const { Pool } = require("pg");

// A single shared connection pool. Reused across requests for efficiency
// and to support horizontal scaling of the API layer.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

module.exports = { pool };
