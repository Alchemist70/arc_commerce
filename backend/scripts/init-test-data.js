const pool = require("../models/db");

async function initTestData() {
  try {
    // Create a test order
    console.log("Creating test order...");
    const orderInsert = await pool.query(
      `
      INSERT INTO orders (
        user_id,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        status,
        shipping_first_name,
        shipping_last_name,
        shipping_email,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_zip_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
    `,
      [
        3, // user_id (admin user)
        299.99,
        "card",
        "completed",
        "processing",
        "processing",
        "Admin",
        "User",
        "abdulhadiakanni@gmail.com",
        "123 Test Street",
        "Test City",
        "Test State",
        "12345",
      ]
    );
    const orderId = orderInsert.rows[0].id;
    console.log("Created order with ID:", orderId);

    // Create test order items
    console.log("Creating test order items...");
    await pool.query(
      `
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price
      ) VALUES ($1, $2, $3, $4)
    `,
      [
        orderId,
        1, // product_id (assuming you have products)
        2,
        149.99,
      ]
    );

    // Create test payment
    console.log("Creating test payment...");
    await pool.query(
      `
      INSERT INTO payments (
        order_id,
        amount,
        payment_method,
        status,
        transaction_id
      ) VALUES ($1, $2, $3, $4, $5)
    `,
      [orderId, 299.99, "card", "completed", "test_tx_" + Date.now()]
    );

    console.log("Test data initialized successfully");
  } catch (error) {
    console.error("Error initializing test data:", error);
  }
}

initTestData()
  .then(() => {
    console.log("Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
