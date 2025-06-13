require("dotenv").config();
const mysql = require("mysql2/promise");

let pool;
if (process.env.MYSQL_URL) {
  // Use connection string if available (Railway, etc.)
  pool = mysql.createPool(process.env.MYSQL_URL);
} else {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'electronics_catalogs',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

module.exports = pool;
