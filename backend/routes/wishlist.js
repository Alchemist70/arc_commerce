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

    const connection = await db();

    // Check if item already exists in wishlist
    const [existing] = await connection.execute(
      "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    await connection.execute(
      "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)",
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
    const connection = await db();

    const [items] = await connection.execute(
      `SELECT p.* 
       FROM products p 
       JOIN wishlist w ON p.id = w.product_id 
       WHERE w.user_id = ?`,
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

    const connection = await db();
    await connection.execute(
      "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Wishlist error:", error);
    res.status(500).json({ message: "Failed to remove item from wishlist" });
  }
});

module.exports = router;
