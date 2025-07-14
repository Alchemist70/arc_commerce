const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Get all categories
router.get("/categories", auth, adminAuth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// Add new category
router.post("/categories", auth, adminAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res
      .status(201)
      .json({ message: "Category added successfully", id: category._id });
  } catch (error) {
    res.status(500).json({ message: "Error adding category" });
  }
});

module.exports = router;
