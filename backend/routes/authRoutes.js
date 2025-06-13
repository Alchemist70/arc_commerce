require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../models/db");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    connection = await pool.getConnection();

    // Get user from database
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("User found:", { ...user, password: "[REDACTED]" }); // Log user info without password

    // Special handling for admin login
    let isValidPassword = false;

    if (user.isAdmin) {
      // For admin, direct password comparison
      isValidPassword = password === user.password;
    } else {
      // For regular users, use bcrypt comparison
      isValidPassword = await bcrypt.compare(password, user.password);
    }

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token with consistent field names
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      isAdmin: Boolean(user.isAdmin),
    };

    console.log("Token payload:", tokenPayload); // Log token payload for debugging

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    console.log(
      "Login successful for:",
      email,
      "isAdmin:",
      Boolean(user.isAdmin)
    );

    res.json({
      message: "Login successful",
      user: {
        ...userWithoutPassword,
        isAdmin: Boolean(user.isAdmin), // Ensure isAdmin is boolean
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

// Registration route
router.post("/register", async (req, res) => {
  let connection;
  try {
    console.log("Registration request received:", req.body);

    const { fullname, email, phone, password } = req.body;

    // Validate input
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    connection = await pool.getConnection();

    // Check if user exists
    const [existingUsers] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await connection.execute(
      "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)",
      [fullname, email, phone, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

module.exports = router;
