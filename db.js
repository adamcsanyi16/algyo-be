const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
