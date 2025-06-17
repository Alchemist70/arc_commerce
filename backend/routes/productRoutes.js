const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateToken = require("../middleware/auth");

// Get all products (public access)
router.get("/", async (req, res) => {
  try {
    console.log("Fetching products...");
    const { rows: products } = await pool.query("SELECT * FROM products");
    console.log("Products fetched:", products);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// Add new product (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, brand, category, price, description, image_url } = req.body;
    console.log("Adding new product:", req.body);

    const query = `
      INSERT INTO products (name, brand, category, price, description, image_url)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;

    const { rows } = await pool.query(query, [
      name,
      brand,
      category,
      price,
      description,
      image_url,
    ]);

    res.status(201).json({
      message: "Product added successfully",
      productId: rows[0].id,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
});

// Delete product (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Add to cart (authenticated users)
router.post("/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Check if product exists in cart
    const { rows: existingItems } = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity if product exists
      await pool.query(
        "UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3",
        [quantity, userId, productId]
      );
    } else {
      // Add new item to cart
      await pool.query(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [userId, productId, quantity]
      );
    }

    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// Add to wishlist (authenticated users)
router.post("/wishlist", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    // Check if product exists in wishlist
    const { rows: existingItems } = await pool.query(
      "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length === 0) {
      // Add to wishlist if not exists
      await pool.query(
        "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)",
        [userId, productId]
      );
      res.json({ message: "Product added to wishlist successfully" });
    } else {
      res.status(400).json({ message: "Product already in wishlist" });
    }
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Error adding to wishlist" });
  }
});

module.exports = router;
