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
  let connection;
  try {
    const userId = req.user.userId;
    const {
      items,
      total,
      paymentMethod,
      paymentStatus,
      shipping,
      cardDetails,
    } = req.body;

    // BEGIN COMPREHENSIVE LOGGING
    console.log("\n[ORDER] ===== Order Creation Request =====");
    console.log("[ORDER] User ID:", userId);
    console.log("[ORDER] Request Body:", JSON.stringify(req.body, null, 2));
    console.log("[ORDER] Items:", JSON.stringify(items, null, 2));
    
    // Log data types
    console.log("[ORDER] Data Types:");
    console.log("- items type:", typeof items, "isArray:", Array.isArray(items));
    console.log("- total type:", typeof total, "value:", total);
    console.log("- paymentMethod type:", typeof paymentMethod, "value:", paymentMethod);
    console.log("- paymentStatus type:", typeof paymentStatus, "value:", paymentStatus);
    
    if (!shipping || !shipping.firstName || !shipping.lastName || !shipping.email || 
        !shipping.address || !shipping.city || !shipping.state || !shipping.zipCode) {
      console.log("[ORDER] Error: Incomplete shipping information");
      return res.status(400).json({ message: "Incomplete shipping information" });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log("[ORDER] Error: No items provided");
      return res.status(400).json({ message: "No items provided" });
    }

    if (!total || isNaN(parseFloat(total))) {
      console.log("[ORDER] Error: Invalid total amount");
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (!paymentMethod || !paymentStatus) {
      console.log("[ORDER] Error: Payment information is required");
      return res.status(400).json({ message: "Payment information is required" });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check that all product_ids exist in the products table
    const productIds = items.map(item => {
      const id = item.product_id;
      console.log("[ORDER] Processing item:", item);
      console.log("[ORDER] Product ID from item:", id, "type:", typeof id);
      return id;
    });
    
    console.log("[ORDER] All product IDs to check:", productIds);
    
    // First, let's directly check each product ID
    for (const id of productIds) {
      const [product] = await connection.query(
        "SELECT id, name FROM products WHERE id = ?",
        [id]
      );
      console.log(`[ORDER] Direct check for product ${id}:`, product);
    }
    
    // Now do the bulk check
    const productCheckQuery = `SELECT id FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`;
    console.log("[ORDER] SQL Query:", productCheckQuery);
    console.log("[ORDER] Query Parameters:", productIds);
    
    // Log the exact query that will be executed
    const finalQuery = productCheckQuery.replace(/\?/g, (_, i) => productIds[i]);
    console.log("[ORDER] Final SQL Query:", finalQuery);
    
    const [existingProducts] = await connection.query(
      productCheckQuery,
      productIds
    );
    
    console.log("[ORDER] Raw database results:", existingProducts);
    console.log("[ORDER] Database results type:", typeof existingProducts);
    console.log("[ORDER] Is array:", Array.isArray(existingProducts));
    
    // LOG existing IDs
    const existingIds = new Set(existingProducts.map(row => {
      console.log("[ORDER] Processing DB row:", row);
      console.log("[ORDER] Row ID:", row.id, "type:", typeof row.id);
      return row.id;
    }));
    console.log("[ORDER] Existing product IDs in DB:", Array.from(existingIds));
    
    const missingIds = productIds.filter(id => {
      const exists = existingIds.has(id);
      console.log("[ORDER] Checking ID:", id, "type:", typeof id, "exists:", exists);
      return !exists;
    });
    console.log("[ORDER] Missing product IDs:", missingIds);
    
    if (missingIds.length > 0) {
      console.log("[ORDER] Error: Products not found in database");
      await connection.rollback();
      return res.status(400).json({
        message: `Some products in your cart no longer exist: ${missingIds.join(', ')}`
      });
    }

    // Log all SQL parameters before insert
    const orderParams = [
      safe(userId),
      safe(total),
      safe(paymentMethod),
      safe(paymentStatus),
      "pending",
      safe(shipping?.firstName),
      safe(shipping?.lastName || "-"),
      safe(shipping?.email),
      safe(shipping?.address),
      safe(shipping?.city),
      safe(shipping?.state),
      safe(shipping?.zipCode),
    ];
    console.log("[ORDER] Order SQL params:", orderParams);
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id, total_amount, payment_method, payment_status, status,
        shipping_first_name, shipping_last_name, shipping_email,
        shipping_address, shipping_city, shipping_state, shipping_zip_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      orderParams
    );

    const orderId = orderResult.insertId;

    // Create payment record
    console.log("Payment params:", [orderId, total, paymentMethod, paymentStatus]);
    await connection.execute(
      "INSERT INTO payments (order_id, amount, payment_method, status) VALUES (?, ?, ?, ?)",
      [orderId, total, paymentMethod, paymentStatus]
    );

    // Insert order items
    for (const item of items) {
      console.log("Order item params:", [orderId, item.product_id, item.quantity, item.price]);
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear user's cart
    await connection.execute("DELETE FROM cart WHERE user_id = ?", [userId]);

    // Commit transaction
    await connection.commit();

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail({
        email: shipping.email,
        orderId,
        items,
        total,
        shipping,
        firstName: shipping.firstName,
        lastName: shipping.lastName,
      });
      console.log("Order confirmation email sent successfully");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      message: "Order created successfully",
      orderId,
      paymentStatus,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Order creation error:", error);
    res.status(500).json({
      message: "Failed to create order",
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

// Get user's orders
router.get("/", auth, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    connection = await pool.getConnection();

    // First, get all orders
    const [orders] = await connection.execute(
      `SELECT 
        o.*,
        p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC`,
      [userId]
    );

    // If no orders found, return empty array
    if (orders.length === 0) {
      return res.json([]);
    }

    // Get all order items for these orders
    const orderIds = orders.map((order) => order.id);
    const [allOrderItems] = await connection.execute(
      `SELECT 
        oi.order_id,
        oi.quantity,
        oi.price,
        p.name,
        p.description,
        p.image_url,
        p.category
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    // Group items by order
    const itemsByOrder = allOrderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
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

    // Combine orders with their items
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    });
    res.status(500).json({
      message: "Failed to fetch orders",
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

// Get single order details
router.get("/:orderId", auth, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;
    connection = await pool.getConnection();

    // First, get the order and payment details
    const [orderDetails] = await connection.execute(
      `SELECT 
        o.*,
        p.status as payment_status
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE o.id = ? AND o.user_id = ?`,
      [orderId, userId]
    );

    if (orderDetails.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Then, get the order items separately
    const [orderItems] = await connection.execute(
      `SELECT 
        oi.quantity,
        oi.price,
        prod.name,
        prod.description,
        prod.image_url,
        prod.category
      FROM order_items oi
      LEFT JOIN products prod ON oi.product_id = prod.id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    // Combine the results
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
    console.error("Error fetching order details:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
    });
    res.status(500).json({
      message: "Failed to fetch order details",
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

// Get all orders (admin only)
router.get("/orders", auth, adminAuth, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [orders] = await connection.execute(
      `SELECT orders.*, users.fullname 
      FROM orders 
      JOIN users ON orders.user_id = users.id`
    );
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  } finally {
    if (connection) connection.release();
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