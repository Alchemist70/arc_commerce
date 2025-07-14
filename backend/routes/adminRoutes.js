const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { sendOrderStatusEmail } = require("../utils/emailService");

// Get all users (admin only)
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
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
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders (admin only)
router.get("/orders", auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate("user");
    res.json(orders);
  } catch (error) {
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
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Get order details for email notification
    const user = await User.findById(order.user);
    const firstName = user?.fullname?.split(" ")[0] || "";
    const lastName = user?.fullname?.split(" ")[1] || "";
    // Send email notification for specific status changes
    if (["shipped", "delivered", "cancelled"].includes(status.toLowerCase())) {
      try {
        await sendOrderStatusEmail({
          email: user.email,
          orderId: order._id,
          status,
          firstName,
          lastName,
        });
      } catch (emailError) {
        // Don't rollback the transaction if email fails
      }
    }
    res.json({
      message: "Order status updated successfully",
      emailSent: ["shipped", "delivered", "cancelled"].includes(
        status.toLowerCase()
      ),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
});

module.exports = router;
