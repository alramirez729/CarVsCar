const express = require('express');
const User = require('../models/User');

const getAllUsers = express.Router();

// Get all users
getAllUsers.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = getAllUsers;
