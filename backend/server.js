require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const users = require("./routes/users");
const db = require("./config/db");

const app = express();

// Enable JSON body parsing
app.use(express.json());

// ✅ CORS configuration — ADD frontend deploy URL
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://alchemist70.github.io",
      "https://ars-commerce-frontend.onrender.com", // ✅ Render frontend domain
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// ✅ Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminProductRoutes);
app.use("/api/admin", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", users);

// ✅ Test route
app.get("/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// ✅ Catch-all for unhandled routes
app.use((req, res) => {
  console.log("Unhandled request:", req.method, req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5002;

db.once("open", () => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🔗 Test: http://localhost:${PORT}/test`);
    console.log(`🔗 Register: http://localhost:${PORT}/api/auth/register`);
  });
});

module.exports = app; // for testing
