const express = require('express');
const router = express.Router();
// Destructure the functions from the controller
const { login, register, sendOTP, resetPassword } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP); 
router.post('/reset-password', resetPassword);

module.exports = router;