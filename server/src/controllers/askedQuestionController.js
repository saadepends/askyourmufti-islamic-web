const AskedQuestion = require('../models/AskedQuestion');

// @desc    Create asked question from public form
// @route   POST /api/asked-questions
// @access  Public
const createAskedQuestion = async (req, res) => {
    try {
        const { fullName, email, category, preferredLanguage, question, consent } = req.body;

        if (!fullName || !email || !category || !question || consent !== true) {
            return res.status(400).json({ message: 'Please provide all required fields and consent.' });
        }

        const askedQuestion = await AskedQuestion.create({
            fullName,
            email,
            category,
            preferredLanguage: preferredLanguage || 'en',
            question,
            consent: true,
        });

        res.status(201).json({
            message: 'Question submitted successfully.',
            id: askedQuestion._id,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all asked questions for admin
// @route   GET /api/asked-questions
// @access  Admin
const getAskedQuestions = async (req, res) => {
    try {
        const askedQuestions = await AskedQuestion.find({}).sort({ createdAt: -1 });
        res.json(askedQuestions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createAskedQuestion,
    getAskedQuestions,
};
