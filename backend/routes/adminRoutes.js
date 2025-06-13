const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const pool = require("../models/db");
const { sendOrderStatusEmail } = require("../utils/emailService");

// Get all users (admin only)
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle admin status (admin only)
router.put("/users/:userId/toggle-admin", auth, adminAuth, async (req, res) => {
  try {
    const result = await User.toggleAdminStatus(req.params.userId);
    if (!result.affectedRows) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User admin status updated" });
  } catch (error) {
    console.error("Error toggling admin status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin only)
router.get("/orders", auth, adminAuth, async (req, res) => {
  console.log("Received request for admin orders");
  console.log("User:", req.user);

  let connection;
  try {
    console.log("Getting database connection...");
    connection = await pool.getConnection();
    console.log("Database connection acquired");

    // First, check if the orders table exists
    console.log("Checking if orders table exists...");
    const [tables] = await connection.execute("SHOW TABLES LIKE 'orders'");
    console.log("Tables check result:", tables);

    if (tables.length === 0) {
      console.log("Orders table does not exist!");
      return res.status(500).json({ message: "Orders table does not exist" });
    }

    // Check table structure
    console.log("Checking orders table structure...");
    const [columns] = await connection.execute("DESCRIBE orders");
    console.log("Orders table columns:", columns);

    // Simple query first
    console.log("Executing simple orders query...");
    const [orders] = await connection.execute("SELECT * FROM orders");
    console.log("Found", orders.length, "orders");

    if (orders.length === 0) {
      console.log("No orders found");
      return res.json([]);
    }

    // Now get additional details
    const enrichedOrders = [];
    for (const order of orders) {
      console.log("Processing order:", order.id);

      // Get user details
      const [users] = await connection.execute(
        "SELECT email, fullname FROM users WHERE id = ?",
        [order.user_id]
      );
      const user = users[0] || {};

      // Get order items
      const [items] = await connection.execute(
        `SELECT oi.*, p.name as product_name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      // Get payment status
      const [payments] = await connection.execute(
        "SELECT status FROM payments WHERE order_id = ?",
        [order.id]
      );
      const payment = payments[0] || {};

      enrichedOrders.push({
        order_id: order.id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        order_date: order.created_at,
        status: order.status,
        user_email: user.email,
        first_name: user.fullname?.split(" ")[0] || "",
        last_name: user.fullname?.split(" ")[1] || "",
        payment_status: payment.status || "pending",
        items: items,
      });
    }

    console.log(
      "Sending response with",
      enrichedOrders.length,
      "enriched orders"
    );
    res.json(enrichedOrders);
  } catch (error) {
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  } finally {
    if (connection) {
      try {
        console.log("Releasing database connection");
        await connection.release();
        console.log("Database connection released");
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError);
      }
    }
  }
});

// Update order status (admin only)
router.put("/orders/:orderId/status", auth, adminAuth, async (req, res) => {
  let connection;
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Get connection from the pool
    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    // Update order status
    await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      orderId,
    ]);

    // Get order details for email notification
    const [orders] = await connection.execute(
      `SELECT o.*, u.email, u.fullname 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    const firstName = order.fullname?.split(" ")[0] || "";
    const lastName = order.fullname?.split(" ")[1] || "";

    // Send email notification for specific status changes
    if (["shipped", "delivered", "cancelled"].includes(status.toLowerCase())) {
      try {
        await sendOrderStatusEmail({
          email: order.email,
          orderId: order.id,
          status,
          firstName,
          lastName,
        });
        console.log(`Status update email sent for order ${orderId}`);
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
        // Don't rollback the transaction if email fails
        // The status update should still proceed
      }
    }

    // Commit the transaction
    await connection.commit();

    res.json({
      message: "Order status updated successfully",
      emailSent: ["shipped", "delivered", "cancelled"].includes(
        status.toLowerCase()
      ),
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }

    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
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

module.exports = router;
