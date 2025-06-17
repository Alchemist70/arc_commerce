require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../models/db"); // Using pg pool
const jwt = require("jsonwebtoken");

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    const { rows: users } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    console.log("User found:", { ...user, password: "[REDACTED]" });

    let isValidPassword = false;

    isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      fullname: user.fullname,
      is_admin: Boolean(user.is_admin),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const { password: _, ...userWithoutPassword } = user;

    console.log(
      "Login successful for:",
      email,
      "is_admin:",
      Boolean(user.is_admin)
    );

    res.json({
      message: "Login successful",
      user: {
        ...userWithoutPassword,
        is_admin: Boolean(user.is_admin),
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// ------------------ TEST ROUTE ------------------
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working" });
});

// ------------------ ADMIN REGISTER ------------------
router.post("/admin-register", async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user exists
    const { rows: existingUsers } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new admin user
    const { rows: result } = await pool.query(
      "INSERT INTO users (fullname, email, phone, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, is_admin",
      [fullname, email, phone, hashedPassword, true]
    );
    res.status(201).json({
      message: "Admin registered successfully",
      userId: result[0].id,
      is_admin: Boolean(result[0].is_admin),
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error during admin registration" });
  }
});

// ------------------ REGISTER ------------------
router.post("/register", async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;
    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if user exists
    const { rows: existingUsers } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user (not admin)
    const { rows: result } = await pool.query(
      "INSERT INTO users (fullname, email, phone, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id, is_admin",
      [fullname, email, phone, hashedPassword, false]
    );
    res.status(201).json({
      message: "User registered successfully",
      userId: result[0].id,
      is_admin: Boolean(result[0].is_admin),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

module.exports = router;
