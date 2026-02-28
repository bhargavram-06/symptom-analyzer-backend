const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 1. Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, age, bloodGroup, height, weight } = req.body;
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            age,
            bloodGroup,
            height,
            weight
        });

        await user.save();
        res.status(201).json({ message: "Success! Profile saved to MongoDB Atlas." });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Login Error" });
    }
};

// 3. Send OTP (With Render TLS Fix)
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.otpExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        // Nodemailer Transporter Configuration
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Ensure NO SPACES in Render Environment Variables
            },
            tls: {
                // IMPORTANT: This allows Render to bypass local certificate issues
                rejectUnauthorized: false
            }
        });

        // Email Content
        const mailOptions = {
            from: `"Symptom Analyzer Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2c3e50;">Password Reset Request</h2>
                    <p>You requested an OTP for resetting your password.</p>
                    <h1 style="color: #3498db; letter-spacing: 5px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="font-size: 0.8em; color: #7f8c8d;">If you did not request this, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "OTP sent successfully!" });

    } catch (error) {
        console.error("Nodemailer Error:", error.message);
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

// 4. Reset Password
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            resetOTP: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear OTP fields after successful reset
        user.resetOTP = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful! You can now login." });
    } catch (error) {
        res.status(500).json({ message: "Reset failed", error: error.message });
    }
};