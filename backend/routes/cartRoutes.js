const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const authenticateToken = require("../middleware/auth");

// Test endpoint to check database connection
router.get("/test", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // Test database connection
    const [result] = await connection.execute("SELECT 1");
    console.log("Database connection test:", result);

    // Check cart table structure
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM cart
    `);
    console.log("Cart table structure:", columns);

    // Check if cart table has any records
    const [count] = await connection.execute(`
      SELECT COUNT(*) as count FROM cart
    `);
    console.log("Cart records count:", count[0]);

    res.json({
      status: "success",
      message: "Database connection successful",
      tableInfo: {
        columns,
        recordCount: count[0].count,
      },
    });
  } catch (error) {
    console.error("Database test error:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({
      status: "error",
      message: "Database test failed",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

// Get Cart Items
router.get("/", authenticateToken, async (req, res) => {
  let connection;
  try {
    console.log("GET /cart - Auth user info:", {
      user: req.user,
      headers: req.headers,
    });

    const userId = req.user.userId;
    if (!userId) {
      console.error("No userId found in request");
      return res.status(401).json({ message: "User ID not found in token" });
    }

    connection = await pool.getConnection();

    // First, check if the user exists
    const [userExists] = await connection.execute(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );

    if (!userExists.length) {
      console.error("User not found in database:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found in database:", userExists[0]);

    // Then get cart items with error handling for the JOIN
    const query = `
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id as product_id,
        p.name,
        p.price,
        p.description,
        p.image_url,
        p.category
      FROM cart c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `;

    console.log("Executing cart query for user:", userId);
    const [items] = await connection.execute(query, [userId]);

    // Log the raw items for debugging
    console.log("Raw cart items:", JSON.stringify(items, null, 2));

    // Map the items to ensure all required fields are present
    const mappedItems = items.map((item) => ({
      id: item.cart_item_id,
      productId: item.product_id,
      name: item.name || "Unknown Product",
      price: item.price || 0,
      quantity: item.quantity || 0,
      description: item.description || "",
      image_url: item.image_url || "",
      category: item.category || "uncategorized",
    }));

    console.log("Cart query results:", {
      userId,
      itemCount: mappedItems.length,
      items: mappedItems,
    });

    res.json(mappedItems);
  } catch (error) {
    console.error("Cart error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    });

    res.status(500).json({
      message: "Failed to fetch cart items",
      error: error.message,
      details: error.sqlMessage,
    });
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

// Add to Cart
router.post("/", authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    console.log("Cart Add Request:", {
      userId,
      productId,
      quantity,
      userInfo: req.user,
      body: req.body,
    });

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing from token" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // First, verify that the product exists
    console.log("Verifying product exists...");
    const [product] = await connection.execute(
      "SELECT id FROM products WHERE id = ?",
      [productId]
    );

    if (product.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if item already exists in cart
    console.log("Checking existing cart item...");
    const [existing] = await connection.execute(
      "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );
    console.log("Existing items found:", existing.length);

    if (existing.length > 0) {
      // Update quantity if item exists
      console.log("Updating existing cart item...");
      await connection.execute(
        "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity || 1, userId, productId]
      );
    } else {
      // Add new item to cart
      console.log("Adding new item to cart...");
      await connection.execute(
        "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [userId, productId, quantity || 1]
      );
    }

    await connection.commit();
    console.log("Cart operation successful");
    res.status(200).json({ message: "Added to cart successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Cart error details:", {
      message: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      code: error.code,
    });
    res.status(500).json({
      message: "Failed to add to cart",
      error: error.message,
      sqlMessage: error.sqlMessage,
    });
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

// Update Cart Item Quantity
router.put("/:productId", authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    connection = await pool.getConnection();
    await connection.execute(
      "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?",
      [quantity, userId, productId]
    );

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ message: "Failed to update cart" });
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

// Remove from Cart
router.delete("/:productId", authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    connection = await pool.getConnection();
    await connection.execute(
      "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Cart error:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
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
