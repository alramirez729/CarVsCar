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

const storage = multer.memoryStorage();
const upload = multer({ storage });


// Route to save comparison

router.post('/save-comparison', authenticate, upload.single('pdf'), async (req, res) => {
  try {
    const userId = req.userId;
    const { car1, car2 } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided.' });
    }
    console.log("🚀 Incoming file:", req.file);
    console.log("📄 Body data:", req.body);



    const pdfBuffer = req.file.buffer;
    console.log('Buffer size:', req.file?.buffer?.length); // add this


    const user = await User.findById(userId);

    user.savedComparisons.push({
      file: pdfBuffer,
      car1,
      car2,
      date: new Date()
    });

    await user.save();

    res.status(200).json({ message: 'Comparison saved successfully!' });
  } catch (err) {
    console.error('Save comparison error:', err);
    res.status(500).json({ error: 'Saving comparison failed.' });
  }
});

router.get('/view-comparison/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const comparison = user.savedComparisons.id(req.params.id); // finds embedded doc by _id
    if (!comparison || !comparison.file) {
      return res.status(404).json({ message: 'Comparison or file not found' });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="comparison-${comparison._id}.pdf"`,
    });

    res.send(comparison.file); // Buffer is sent directly
  } catch (err) {
    console.error('Error retrieving PDF:', err);
    res.status(500).json({ message: 'Server error retrieving PDF' });
  }
});




export default router;
