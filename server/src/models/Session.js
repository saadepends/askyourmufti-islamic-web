const mongoose = require('mongoose');

const translationBlock = {
  title: { type: String, default: "" },
  description: { type: String, default: "" },
};

const SessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    sessionNumber: { type: String, required: true, unique: true },
    dateRecorded: { type: Date },
    description: { type: String },
    audioUrl: { type: String },
    videoUrl: { type: String },
    translations: {
      ur: translationBlock,
      de: translationBlock,
      fr: translationBlock,
      es: translationBlock,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', SessionSchema);
