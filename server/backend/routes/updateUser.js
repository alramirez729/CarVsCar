const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your User model

router.put('/users/update', async (req, res) => {
  try {
    const { email, ...updates } = req.body; // Ensure you’re identifying the user, e.g., via email
    const updatedUser = await User.findOneAndUpdate({ email }, updates, { new: true });
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
