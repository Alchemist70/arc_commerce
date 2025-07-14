require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ------------------ LOGIN ------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      fullname: user.fullname,
      is_admin: Boolean(user.is_admin),
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: "Login successful",
      user: {
        ...userWithoutPassword,
        is_admin: Boolean(user.is_admin),
      },
      token,
    });
  } catch (error) {
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
    const { fullname, email, phone, password, secretCode } = req.body;
    if (!fullname || !email || !phone || !password || !secretCode) {
      return res
        .status(400)
        .json({ message: "All fields and secret code are required" });
    }
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: "Invalid secret code" });
    }
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new admin user
    const newUser = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      is_admin: true,
    });
    res.status(201).json({
      message: "Admin registered successfully",
      userId: newUser._id,
      is_admin: Boolean(newUser.is_admin),
    });
  } catch (error) {
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert new user (not admin)
    const newUser = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      is_admin: false,
    });
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
      is_admin: Boolean(newUser.is_admin),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
});

module.exports = router;
