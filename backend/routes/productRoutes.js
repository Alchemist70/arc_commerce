const express = require("express");
const router = express.Router();
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const authenticateToken = require("../middleware/auth");

// Get all products (public access)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    // Map each product to include 'id' field
    const mappedProducts = products.map((product) => ({
      id: product._id.toString(),
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      description: product.description,
      image_url: product.image_url,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }));
    res.json(mappedProducts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
});

// Add new product (admin only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, brand, category, price, description, image_url } = req.body;
    const product = await Product.create({
      name,
      brand,
      category,
      price,
      description,
      image_url,
    });
    res
      .status(201)
      .json({ message: "Product added successfully", productId: product._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding product", error: error.message });
  }
});

// Delete product (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Add to cart (authenticated users)
router.post("/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;
    let cartItem = await Cart.findOne({ user: userId, product: productId });
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = new Cart({ user: userId, product: productId, quantity });
      await cartItem.save();
    }
    res.json({ message: "Product added to cart successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// Add to wishlist (authenticated users)
router.post("/wishlist", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.userId;
    const existing = await Wishlist.findOne({
      user: userId,
      product: productId,
    });
    if (!existing) {
      await Wishlist.create({ user: userId, product: productId });
      res.json({ message: "Product added to wishlist successfully" });
    } else {
      res.status(400).json({ message: "Product already in wishlist" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist" });
  }
});

module.exports = router;
