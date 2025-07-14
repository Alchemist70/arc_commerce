const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const auth = require("../middleware/auth");

// Add or update shipping address
router.post("/address", auth, async (req, res) => {
  const userId = req.user.userId;
  const { address, city, state, zipCode } = req.body;

  if (!address || !city || !state || !zipCode) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  try {
    // Fetch user for email and phone
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.saveAddress(userId, {
      address,
      city,
      state,
      zipCode,
      email: user.email,
      phone: user.phone,
    });
    res.json({ message: "Address saved successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to save address", error: err.message });
  }
});

// Get shipping address
router.get("/address", auth, async (req, res) => {
  const userId = req.user.userId;
  try {
    const address = await User.getAddress(userId);
    res.json({ address });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch address", error: err.message });
  }
});

module.exports = router;
