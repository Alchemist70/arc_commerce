const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateToken = require("../middleware/auth");

// Get wishlist items for the current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("Fetching wishlist for user:", userId);

    const query = `
      SELECT w.*, p.name, p.brand, p.price, p.image_url, p.description
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = $1
    `;

    const { rows: wishlistItems } = await db.query(query, [userId]);
    res.json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    res.status(500).json({ message: "Error fetching wishlist items" });
  }
});

// Add item to wishlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;
    console.log("Adding to wishlist for user:", userId, "product:", productId);

    // Check if product exists
    const [products] = await db.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);
    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already exists in wishlist
    const [existingItems] = await db.query(
      "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length > 0) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }

    // Add new item to wishlist
    await db.query("INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)", [
      userId,
      productId,
    ]);

    res.status(201).json({ message: "Item added to wishlist successfully" });
  } catch (error) {
    console.error("Error adding item to wishlist:", error);
    res.status(500).json({ message: "Error adding item to wishlist" });
  }
});

// Remove item from wishlist
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;

    const [result] = await db.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    console.error("Error removing item from wishlist:", error);
    res.status(500).json({ message: "Error removing item from wishlist" });
  }
});

module.exports = router;
