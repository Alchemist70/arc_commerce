const express = require("express");
const router = express.Router();
const db = require("../models/db");
const authenticateToken = require("../middleware/auth");

// 🛍️ Add to Wishlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Check if item already exists in wishlist
    const { rows: existing } = await db.query(
      "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    await db.query(
      "INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)",
      [userId, productId]
    );

    res.status(200).json({ message: "Added to wishlist successfully" });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// ❤️ Get Wishlist Items for a User
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT token
    const { rows: items } = await db.query(
      `SELECT p.* 
       FROM products p 
       JOIN wishlist w ON p.id = w.product_id 
       WHERE w.user_id = $1`,
      [userId]
    );

    res.json(items);
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: "Failed to fetch wishlist items" });
  }
});

// Remove from Wishlist
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await db.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: "Failed to remove item from wishlist" });
  }
});

module.exports = router;
