const express = require('express');
const router = express.Router();
const { getRecommendations, addSymptom } = require('../controllers/symptomController');

router.post('/recommend', getRecommendations);
router.post('/', addSymptom); // For seeding data initially

module.exports = router;