require("dotenv").config();
const db = require("../config/db");

async function createAdminUser() {
  try {
    const adminEmail = "admin@arskart.com";
    const adminPassword = "admin123"; // This will be stored as plain text for admin

    // Check if admin already exists
    const { rows: existingAdmins } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [adminEmail]
    );

    if (existingAdmins.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    // Insert admin user
    await db.query(
      "INSERT INTO users (fullname, email, phone, password) VALUES ($1, $2, $3, $4)",
      ["Admin User", adminEmail, "0000000000", adminPassword]
    );

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    process.exit();
  }
}

createAdminUser();
