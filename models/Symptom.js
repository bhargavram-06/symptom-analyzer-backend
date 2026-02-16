const mongoose = require('mongoose');

const symptomSchema = mongoose.Schema({
    // 1. Link this search to the User
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 2. The symptom the user searched for
    name: {
        type: String,
        required: true,
        // Removed "unique: true" so multiple people can search for the same flu
    },
    medicines: [{
        ageGroup: { type: String, required: true }, // e.g., "Adults", "Children"
        recommendation: String,
        dosage: String
    }],
    dietaryAdvice: {
        include: [String],
        avoid: [String]
    }
}, {
    timestamps: true // This will automatically add 'createdAt' (useful for history)
});

module.exports = mongoose.model('Symptom', symptomSchema);