const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Payment = require("../models/paymentModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/User");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { sendOrderConfirmationEmail } = require("../utils/emailService");

// Create new order with payment
router.post("/", auth, async (req, res) => {
  const userId = req.user.userId;
  const { items, total, paymentMethod, paymentStatus, shipping } = req.body;
  try {
    // Check that all product_ids exist
    const productIds = items.map((item) => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } });
    const existingIds = new Set(products.map((p) => p._id.toString()));
    const missingIds = productIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      return res.status(400).json({
        message: `Some products in your cart no longer exist: ${missingIds.join(
          ", "
        )}`,
      });
    }
    // Create order
    const order = await Order.create({
      user: userId,
      total_amount: total,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      status: "pending",
      shipping_first_name: shipping?.firstName,
      shipping_last_name: shipping?.lastName || "-",
      shipping_email: shipping?.email,
      shipping_address: shipping?.address,
      shipping_city: shipping?.city,
      shipping_state: shipping?.state,
      shipping_zip_code: shipping?.zipCode,
    });
    // Create payment record
    await Payment.create({
      order: order._id,
      amount: total,
      payment_method: paymentMethod,
      status: paymentStatus,
    });
    // Insert order items
    for (const item of items) {
      await OrderItem.create({
        order: order._id,
        product: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
    }
    // Clear user's cart
    await Cart.deleteMany({ user: userId });
    res
      .status(201)
      .json({ message: "Order placed successfully", orderId: order._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId }).sort({ created_at: -1 });
    if (orders.length === 0) {
      return res.json([]);
    }
    const orderIds = orders.map((order) => order._id);
    const allOrderItems = await OrderItem.find({
      order: { $in: orderIds },
    }).populate("product");
    const itemsByOrder = allOrderItems.reduce((acc, item) => {
      const oid = item.order.toString();
      if (!acc[oid]) acc[oid] = [];
      acc[oid].push({
        name: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        description: item.product?.description,
        image_url: item.product?.image_url,
        category: item.product?.category,
      });
      return acc;
    }, {});
    const formattedOrders = orders.map((order) => ({
      ...order.toObject(),
      items: itemsByOrder[order._id.toString()] || [],
    }));
    res.json(formattedOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: error.message });
  }
});

// Get single order details
router.get("/:orderId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const orderItems = await OrderItem.find({ order: orderId }).populate(
      "product"
    );
    const formattedItems = orderItems.map((item) => ({
      name: item.product?.name || "Unknown Product",
      quantity: item.quantity,
      price: item.price,
      description: item.product?.description,
      image_url: item.product?.image_url,
      category: item.product?.category,
    }));
    res.json({ ...order.toObject(), items: formattedItems });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order details", error: error.message });
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

// Update order status
router.put("/orders/:id/status", auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
});

module.exports = router;
