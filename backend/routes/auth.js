const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ User Registration
router.post("/register", (req, res) => {
  console.log("Registration request received:", req.body);
  const { fullname, email, phone, password } = req.body;

  if (!fullname || !email || !phone || !password) {
    console.log("Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  User.findByEmail(email, (err, user) => {
    if (err) {
      console.error("Database error during email check:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (user) {
      console.log("Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    User.register(req.body, (err, result) => {
      if (err) {
        console.error("Error during user registration:", err);
        return res
          .status(500)
          .json({ message: "Error registering user", error: err });
      }
      console.log("User registered successfully:", email);
      res.json({ message: "User registered successfully!" });
    });
  });
});

// ✅ User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  User.findByEmail(email, (err, user) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (!user) return res.status(404).json({ message: "User not found" });

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error comparing passwords", error: err });
      if (!isMatch)
        return res.status(401).json({ message: "Incorrect password" });

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, fullname: user.fullname, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: { id: user.id, fullname: user.fullname, email: user.email },
      });
    });
  });
});

module.exports = router;
