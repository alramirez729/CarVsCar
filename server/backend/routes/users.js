const express = require('express');
const createUser = require('./createUser');
const getAllUsers = require('./getAllUsers');

const router = express.Router();

// Combine routes
router.use('/create', createUser);
router.use('/all', getAllUsers);

module.exports = router;
