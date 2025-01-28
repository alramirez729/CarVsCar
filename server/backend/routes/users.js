const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import your User model
const authenticate = require('../middleware/authenticate'); // Import middleware
const router = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /register
router.post('/register', async (req, res) => {
    const { username, email, password, age } = req.body;
  
    try {
      console.log('Raw password:', password); // Log the raw password
      const newUser = new User({ username, email, password, age }); // Pass the raw password
      await newUser.save(); // `pre('save')` middleware will hash the password
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  
// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      console.log('Login attempt:', email, password);
  
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ message: 'User not found' });
      }
  
      console.log('Password from DB:', user.password);
      const isMatch = await bcrypt.compare(password, user.password);
      console.log('Password match result:', isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      console.log('Login successful, token generated');
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

// GET /me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email biography -_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /update
router.put('/update', authenticate, async (req, res) => {
    const allowedUpdates = ['username', 'email', 'biography'];
    const updates = req.body;
  
    try {
      const filteredUpdates = {};
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
  
      console.log('Updating user:', req.userId, 'with updates:', filteredUpdates); // Debug log
  
      const updatedUser = await User.findByIdAndUpdate(req.userId, filteredUpdates, { new: true }).select('-password');
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

module.exports = router;
