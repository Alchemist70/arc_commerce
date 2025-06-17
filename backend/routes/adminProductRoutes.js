const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");

// Get all products (admin only)
router.get("/products", auth, adminAuth, async (req, res) => {
  try {
    const { rows: products } = await db.query("SELECT * FROM products");
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Add new product (admin only)
router.post("/products", auth, adminAuth, async (req, res) => {
  try {
    const { name, brand, category, price, description, image_url } = req.body;
    const { rows } = await db.query(
      "INSERT INTO products (name, brand, category, price, description, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [name, brand, category, price, description, image_url]
    );
    res.status(201).json({
      message: "Product added successfully",
      productId: rows[0].id,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Error adding product" });
  }
});

// Delete product (admin only)
router.delete("/products/:id", auth, adminAuth, async (req, res) => {
  try {
    const { rowCount } = await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

module.exports = router;
