import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Ensure the `.js` extension is included
import authenticate from '../middleware/authenticate.js'; // Ensure the `.js` extension


const router = express.Router();

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


// POST /register
router.post('/register', async (req, res) => {
  const { username, email, password, birthdate } = req.body;

  try {
      const formattedBirthdate = birthdate ? new Date(birthdate) : null;

      const newUser = new User({ 
          username, 
          email, 
          password, 
          birthdate: formattedBirthdate  // Ensure birthdate is stored correctly
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
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
    const user = await User.findById(req.userId).select('username email biography birthdate -_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let age = null;
    if (user.birthdate) {
      const today = new Date();
      const birthDate = new Date(user.birthdate);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--; // Adjust if birthday hasn't occurred yet this year
      }
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /update
router.put('/update', authenticate, async (req, res) => {
    const allowedUpdates = ['username', 'email', 'biography', 'birthdate'];
    const updates = req.body;
  
    try {
      const filteredUpdates = {};
      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          if (key === 'birthdate' && updates[key]) {
            filteredUpdates[key] = new Date(updates[key]); // Ensure date format
          } else {
            filteredUpdates[key] = updates[key];
          }
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

  // PUT /preferences - Save or Update User Preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    const {
      occupation,
      annualMiles,
      safetyImportance,
      fuelEfficiencyImportance,
      horsepowerImportance,
      speedImportance,
      carUsage
    } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update preferences inside the User schema
    user.preferences = {
      occupation,
      annualMiles,
      safetyImportance,
      fuelEfficiencyImportance,
      horsepowerImportance,
      speedImportance,
      carUsage
    };

    await user.save();

    res.status(200).json({ message: 'Preferences saved successfully', preferences: user.preferences });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /preferences - Retrieve User Preferences
router.get('/preferences', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('preferences -_id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ preferences: user.preferences });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

  

export default router;
