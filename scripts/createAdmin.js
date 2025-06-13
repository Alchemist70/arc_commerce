const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const MONGODB_URI = "mongodb://localhost:27017/your_database";

const User = require("../models/User");

async function createAdminUser() {
  try {
    await mongoose.connect(MONGODB_URI);

    const adminUser = {
      fullname: "Admin User",
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10), // Change this password
      isAdmin: true,
    };

    const user = await User.findOne({ email: adminUser.email });
    if (user) {
      console.log("Admin user already exists");
      return;
    }

    await User.create(adminUser);
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
}

createAdminUser();
