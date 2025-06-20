const express = require("express");
const router = express.Router();
const db = require("../models/db");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Get all categories
router.get("/categories", auth, adminAuth, async (req, res) => {
  try {
    const { rows: categories } = await db.query("SELECT * FROM categories");
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Add new category
router.post("/categories", auth, adminAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { rows } = await db.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
      [name, description]
    );
    res.status(201).json({ message: "Category added successfully", id: rows[0].id });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ message: "Error adding category" });
  }
});

module.exports = router;
