const express = require("express");
const router = express.Router();
const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const User = require("../models/User");
const authenticateToken = require("../middleware/auth");

// Get wishlist items for the current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get wishlist items and populate product details
    const items = await Wishlist.find({ user: userId }).populate("product");
    const mappedItems = items.map((item) => ({
      id: item._id,
      productId: item.product?._id,
      name: item.product?.name || "Unknown Product",
      brand: item.product?.brand || "",
      price: item.product?.price || 0,
      image_url: item.product?.image_url || "",
      description: item.product?.description || "",
    }));
    res.json(mappedItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching wishlist items", error: error.message });
  }
});

// Add item to wishlist
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Check if item already exists in wishlist
    const existing = await Wishlist.findOne({
      user: userId,
      product: productId,
    });
    if (existing) {
      return res.status(400).json({ message: "Item already in wishlist" });
    }
    // Add new item to wishlist
    await Wishlist.create({ user: userId, product: productId });
    res.status(201).json({ message: "Item added to wishlist successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding item to wishlist", error: error.message });
  }
});

// Remove item from wishlist
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.userId;
    const result = await Wishlist.findOneAndDelete({
      user: userId,
      product: productId,
    });
    if (!result) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }
    res.json({ message: "Item removed from wishlist successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error removing item from wishlist",
        error: error.message,
      });
  }
});

module.exports = router;
