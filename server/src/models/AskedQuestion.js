const mongoose = require('mongoose');

const AskedQuestionSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        category: { type: String, required: true, trim: true },
        preferredLanguage: { type: String, default: 'en', trim: true },
        question: { type: String, required: true, trim: true },
        consent: { type: Boolean, required: true, default: false },
        status: { type: String, enum: ['new', 'reviewed'], default: 'new' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AskedQuestion', AskedQuestionSchema);
