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
  try {
    // Simple query first
    const { rows: orders } = await pool.query("SELECT orders.*, users.fullname FROM orders JOIN users ON orders.user_id = users.id");
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update order status (admin only)
router.put("/orders/:orderId/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.orderId;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Update order status
    const { rowCount } = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2",
      [status, orderId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Get order details for email notification
    const { rows: orders } = await pool.query(
      `SELECT o.*, u.email, u.fullname 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [orderId]
    );

    if (orders.length === 0) {
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

    res.json({
      message: "Order status updated successfully",
      emailSent: ["shipped", "delivered", "cancelled"].includes(
        status.toLowerCase()
      ),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Error updating order status",
      error: error.message,
    });
  }
});

module.exports = router;
