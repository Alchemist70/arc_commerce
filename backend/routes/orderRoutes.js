const express = require("express");
const router = express.Router();
const pool = require("../models/db");
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const { sendOrderConfirmationEmail } = require("../utils/emailService");

// Helper to ensure no undefined values are passed to SQL
function safe(v) {
  return v === undefined ? null : v;
}

// Create new order with payment
router.post("/", auth, async (req, res) => {
  const userId = req.user.userId;
  const { items, total, paymentMethod, paymentStatus, shipping } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Check that all product_ids exist in the products table
    const productIds = items.map(item => item.product_id);
    const productCheckQuery = `SELECT id FROM products WHERE id = ANY($1)`;
    const { rows: existingProducts } = await client.query(productCheckQuery, [productIds]);
    const existingIds = new Set(existingProducts.map(row => row.id));
    const missingIds = productIds.filter(id => !existingIds.has(id));
    if (missingIds.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `Some products in your cart no longer exist: ${missingIds.join(', ')}`
      });
    }
    // Insert order
    const orderParams = [
      safe(userId), safe(total), safe(paymentMethod), safe(paymentStatus), "pending",
      safe(shipping?.firstName), safe(shipping?.lastName || "-"), safe(shipping?.email),
      safe(shipping?.address), safe(shipping?.city), safe(shipping?.state), safe(shipping?.zipCode)
    ];
    const orderInsert = await client.query(
      `INSERT INTO orders (
        user_id, total_amount, payment_method, payment_status, status,
        shipping_first_name, shipping_last_name, shipping_email,
        shipping_address, shipping_city, shipping_state, shipping_zip_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      orderParams
    );
    const orderId = orderInsert.rows[0].id;
    // Create payment record
    await client.query(
      "INSERT INTO payments (order_id, amount, payment_method, status) VALUES ($1, $2, $3, $4)",
      [orderId, total, paymentMethod, paymentStatus]
    );
    // Insert order items
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
    // Clear user's cart
    await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);
    await client.query('COMMIT');
    res.status(201).json({ message: "Order placed successfully", orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: "Failed to place order", error: error.message });
  } finally {
    client.release();
  }
});

// Get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows: orders } = await pool.query(
      `SELECT o.*, p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC`,
      [userId]
    );
    if (orders.length === 0) {
      return res.json([]);
    }
    const orderIds = orders.map((order) => order.id);
    const { rows: allOrderItems } = await pool.query(
      `SELECT oi.order_id, oi.quantity, oi.price, p.name, p.description, p.image_url, p.category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ANY($1)`,
      [orderIds]
    );
    const itemsByOrder = allOrderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push({
        name: item.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        description: item.description,
        image_url: item.image_url,
        category: item.category,
      });
      return acc;
    }, {});
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
});

// Get single order details
router.get("/:orderId", auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    const { rows: orderDetails } = await pool.query(
      `SELECT o.*, p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );
    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { rows: orderItems } = await pool.query(
      `SELECT oi.quantity, oi.price, prod.name, prod.description, prod.image_url, prod.category
      FROM order_items oi
      LEFT JOIN products prod ON oi.product_id = prod.id
      WHERE oi.order_id = $1`,
      [orderId]
    );
    const order = {
      ...orderDetails[0],
      items: orderItems.map((item) => ({
        name: item.name || "Unknown Product",
        quantity: item.quantity,
        price: item.price,
        description: item.description,
        image_url: item.image_url,
        category: item.category,
      })),
    };
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order details", error: error.message });
  }
});

// Get all orders (admin only)
router.get("/orders", auth, adminAuth, async (req, res) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT orders.*, users.fullname 
      FROM orders 
      JOIN users ON orders.user_id = users.id`
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update order status
router.put("/orders/:id/status", auth, adminAuth, async (req, res) => {
  let connection;
  try {
    const { status } = req.body;
    connection = await pool.getConnection();
    await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Error updating order status" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router; 