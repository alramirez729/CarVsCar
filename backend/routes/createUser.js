const express = require('express');
const User = require('../models/User');

const createUser = express.Router();

// Create a new user
createUser.post('/', async (req, res) => {
    const user = new User(req.body);
    try {
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = createUser;
