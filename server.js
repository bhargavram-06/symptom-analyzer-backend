const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const connectDB = require('./config/db');

// Import your new Auth routes and Symptom routes
const authRoutes = require('./routes/authRoutes'); // Changed from userRoutes
const symptomRoutes = require('./routes/symptomRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Redirect the API paths to your new route files
app.use('/api/auth', authRoutes); // Professional naming for Login/Register
app.use('/api/symptoms', symptomRoutes);

app.get('/', (req, res) => {
    res.send('API is running and Database is connected...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`.yellow.bold)
);