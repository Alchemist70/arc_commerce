require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function updateDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log("Reading SQL file...");
    const sqlFile = path.join(__dirname, "update-tables.sql");
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
    console.log("Database tables updated successfully!");
  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    await pool.end();
  }
}

updateDatabase();
