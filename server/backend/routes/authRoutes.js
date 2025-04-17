import express from 'express';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Route to check if token is valid
router.get('/check', authenticate, (req, res) => {
  res.status(200).json({ message: 'Token is valid', userId: req.userId });
});

export default router;