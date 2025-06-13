const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');

router.post('/wishlist', (req, res) => {
    const { userId, productId } = req.body;
    User.addWishlist(userId, productId, (err, result) => {
        if (err) res.status(500).send(err);
        res.json({ message: 'Added to wishlist' });
    });
});

router.get('/wishlist/:userId', (req, res) => {
    User.getWishlist(req.params.userId, (err, results) => {
        if (err) res.status(500).send(err);
        res.json(results);
    });
});

// Add or update shipping address
router.post('/address', auth, async (req, res) => {
  const userId = req.user.userId;
  const { address, city, state, zipCode } = req.body;

  console.log('Attempting to save address for userId:', userId, { address, city, state, zipCode });

  if (!address || !city || !state || !zipCode) {
    return res.status(400).json({ message: 'All address fields are required' });
  }

  try {
    // ✅ fetch user email and phone first
    const sql = 'SELECT email, phone FROM users WHERE id = ?';
    const [results] = await require('../models/db').query(sql, [userId]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { email, phone } = results[0];

    await User.saveAddress(userId, {
      address,
      city,
      state,
      zipCode,
      email,
      phone
    });

    res.json({ message: 'Address saved successfully' });
  } catch (err) {
    console.error('Failed to save address for userId:', userId, err);
    res.status(500).json({ message: 'Failed to save address', error: err.message });
  }
});


// Get shipping address
router.get('/address', auth, async (req, res) => {
  const userId = req.user.userId;
  console.log('Fetching address for userId:', userId);
  try {
    const address = await User.getAddress(userId);
    console.log('Fetched address:', address);
    res.json({ address });
  } catch (err) {
    console.error('Error fetching address:', err);
    res.status(500).json({ message: 'Failed to fetch address', error: err.message });
  }
});

module.exports = router;
