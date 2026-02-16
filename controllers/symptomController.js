const Symptom = require('../models/Symptom');

// @desc Get recommendations for specific symptoms
// @route POST /api/symptoms/recommend
const getRecommendations = async (req, res) => {
    // Expecting symptoms array AND the current logged-in user's ID
    const { symptoms, userId } = req.body; 

    try {
        // 1. Find the medical data for the selected symptoms
        const recommendations = await Symptom.find({
            name: { $in: symptoms }
        });

        // 2. Optional: If you want to log this search to a 'SearchHistory' collection
        // you would do that here. But for now, returning the data is perfect.
        
        if (recommendations.length === 0) {
            return res.status(404).json({ message: "No specific recommendations found for these symptoms." });
        }

        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: "Database Error: " + error.message });
    }
};

// @desc Add a new symptom (Admin Setup)
// @route POST /api/symptoms
const addSymptom = async (req, res) => {
    const { name, medicines, dietaryAdvice } = req.body;
    try {
        // Standard check to prevent duplicate medical entries
        const exists = await Symptom.findOne({ name });
        if (exists) return res.status(400).json({ message: "Symptom already exists in database." });

        const symptom = await Symptom.create({ name, medicines, dietaryAdvice });
        res.status(201).json(symptom);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getRecommendations, addSymptom };