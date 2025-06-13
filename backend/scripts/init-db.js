require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log("Reading SQL file...");
    const sqlFile = path.join(__dirname, "../models/init-db.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    console.log("Executing SQL commands...");
    await connection.query(sql);
    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
