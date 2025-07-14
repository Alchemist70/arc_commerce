const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Get all products (admin only)
router.get("/products", auth, adminAuth, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Add new product (admin only)
router.post("/products", auth, adminAuth, async (req, res) => {
  try {
    const { name, brand, category, price, description, image_url } = req.body;
    const product = await Product.create({
      name,
      brand,
      category,
      price,
      description,
      image_url,
    });
    res
      .status(201)
      .json({ message: "Product added successfully", productId: product._id });
  } catch (error) {
    res.status(500).json({ message: "Error adding product" });
  }
});

// Delete product (admin only)
router.delete("/products/:id", auth, adminAuth, async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
