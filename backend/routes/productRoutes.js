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
  let connection;
  try {
    const { name, brand, category, price, description, image_url } = req.body;
    console.log("Adding new product:", req.body);

    connection = await pool.getConnection();
    const query = `
      INSERT INTO products (name, brand, category, price, description, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const [result] = await connection.execute(query, [
      name,
      brand,
      category,
      price,
      description,
      image_url,
    ]);

    res.status(201).json({
      message: "Product added successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

// Delete product (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute("DELETE FROM products WHERE id = $1", [
      req.params.id,
    ]);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product" });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

// Add to cart (authenticated users)
router.post("/cart", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    connection = await pool.getConnection();
    // Check if product exists in cart
    const [existingItems] = await connection.execute(
      "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length > 0) {
      // Update quantity if product exists
      await connection.execute(
        "UPDATE cart SET quantity = quantity + $3 WHERE user_id = $1 AND product_id = $2",
        [userId, productId, quantity]
      );
    } else {
      // Add new item to cart
      await connection.execute(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
        [userId, productId, quantity]
      );
    }

    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Error adding to cart" });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

// Add to wishlist (authenticated users)
router.post("/wishlist", authenticateToken, async (req, res) => {
  let connection;
  try {
    const { productId } = req.body;
    const userId = req.user.userId;

    connection = await pool.getConnection();
    // Check if product exists in wishlist
    const [existingItems] = await connection.execute(
      "SELECT * FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, productId]
    );

    if (existingItems.length === 0) {
      // Add to wishlist if not exists
      await connection.execute(
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
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

module.exports = router;
