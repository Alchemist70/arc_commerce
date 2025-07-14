const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const authenticateToken = require("../middleware/auth");

// Get Cart Items
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "User ID not found in token" });
    }
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }
    // Get cart items and populate product details
    const items = await Cart.find({ user: userId }).populate("product");
    const mappedItems = items.map((item) => ({
      id: item._id,
      productId: item.product?._id,
      name: item.product?.name || "Unknown Product",
      price: item.product?.price || 0,
      quantity: item.quantity || 0,
      description: item.product?.description || "",
      image_url: item.product?.image_url || "",
      category: item.product?.category || "uncategorized",
    }));
    res.json(mappedItems);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cart items",
      error: error.message,
    });
  }
});

// Add to Cart
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing from token" });
    }
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Check if item already exists in cart
    let cartItem = await Cart.findOne({ user: userId, product: productId });
    if (cartItem) {
      cartItem.quantity += quantity || 1;
      await cartItem.save();
    } else {
      cartItem = new Cart({
        user: userId,
        product: productId,
        quantity: quantity || 1,
      });
      await cartItem.save();
    }
    res.status(200).json({ message: "Added to cart successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add to cart",
      error: error.message,
    });
  }
});

// Update Cart Item Quantity
router.put("/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    const cartItem = await Cart.findOneAndUpdate(
      { user: userId, product: productId },
      { quantity },
      { new: true }
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart" });
  }
});

// Remove from Cart
router.delete("/:productId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const cartItem = await Cart.findOneAndDelete({
      user: userId,
      product: productId,
    });
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

module.exports = router;
