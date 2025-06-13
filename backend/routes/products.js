const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");

// 🛒 Fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: error.message });
  }
});

// 📥 Add a new product (Admin)
router.post("/add", async (req, res) => {
  try {
    const result = await Product.add(req.body);
    res.json(result);
  } catch (error) {
    console.error("Failed to add product:", error);
    res
      .status(500)
      .json({ error: "Failed to add product", details: error.message });
  }
});

module.exports = router;
