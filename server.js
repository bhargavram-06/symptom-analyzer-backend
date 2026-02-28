const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const symptomRoutes = require('./routes/symptomRoutes');

dotenv.config();
connectDB();

const app = express();

// 1. Updated CORS Configuration for Netlify
app.use(cors({
    origin: ["https://symptom-analyzer.netlify.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// 2. Routes
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);

app.get('/', (req, res) => {
    res.send('API is running and Database is connected...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`.yellow.bold)
);