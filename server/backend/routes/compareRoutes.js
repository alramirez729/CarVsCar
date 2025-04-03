// routes/compareRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import authenticate from '../middleware/authenticate.js';
import User from '../models/User.js';

const router = express.Router();

// Setup __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../pdfs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `comparison-${Date.now()}.pdf`);
  }
});

const upload = multer({ storage });

// Route to save comparison
router.post('/save-comparison', authenticate, upload.single('pdf'), async (req, res) => {
  try {
    const userId = req.user.id;
    const filePath = req.file.path;

    const user = await User.findById(userId);
    user.savedComparisons.push({ filePath, date: new Date() });
    await user.save();

    res.status(200).json({ message: 'Comparison saved successfully!' });
  } catch (err) {
    console.error('Save comparison error:', err);
    res.status(500).json({ error: 'Saving comparison failed.' });
  }
});


export default router;
