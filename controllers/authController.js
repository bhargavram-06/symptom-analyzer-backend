const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 1. Register a new user (Renamed to 'register' to match routes)
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

// 2. Login user (Renamed to 'login' to match routes)
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

// 3. Send OTP (The missing function Render was looking for!)
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.otpExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Symptom Analyzer Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Your Password Reset OTP",
            text: `Your OTP is ${otp}. It expires in 10 minutes.`
        });

        res.json({ message: "OTP sent successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

// 4. Reset Password (The other missing function!)
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            resetOTP: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetOTP = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (error) {
        res.status(500).json({ message: "Reset failed", error: error.message });
    }
};