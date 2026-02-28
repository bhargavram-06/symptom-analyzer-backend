const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');

// Route for registration
router.post('/register', registerUser);

// Route for login
router.post('/login', loginUser);

module.exports = router;