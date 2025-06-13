require("dotenv").config();
const mysql = require("mysql2/promise");
const initializeDatabase = require('./initDb');

let pool;
if (process.env.MYSQL_URL) {
  // Use connection string if available (Railway, etc.)
  pool = mysql.createPool(process.env.MYSQL_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Test the database connection and initialize
async function setupDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    if (process.env.DB_NAME) {
      console.log("Connected to database:", process.env.DB_NAME);
    }
    connection.release();

    // Initialize database schema and sample data
    await initializeDatabase();
  } catch (err) {
    console.error("Error setting up the database:", err);
    throw err;
  }
}

// Run setup
setupDatabase().catch(console.error);

module.exports = pool;
