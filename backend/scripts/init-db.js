const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log("Reading SQL file...");
    const sqlFile = path.join(__dirname, "../database.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Successfully executed SQL statement');
      } catch (error) {
        console.error('Error executing statement:', error.message);
      }
    }
    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
