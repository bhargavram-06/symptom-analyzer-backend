const express = require('express');
const router = express.Router();
const { sendOTP, resetPassword, login, register } = require('../controllers/authController');

// These must match the names used in your ForgotPassword.js
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);      // This is the missing link!
router.post('/reset-password', resetPassword);

module.exports = router;