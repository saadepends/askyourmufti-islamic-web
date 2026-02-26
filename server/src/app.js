require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const sessionRoutes = require('./routes/sessionRoutes');
const faqRoutes = require('./routes/faqRoutes');
const topicRoutes = require('./routes/topicRoutes');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const askedQuestionRoutes = require('./routes/askedQuestionRoutes');
const seoSettingsRoutes = require('./routes/seoSettingsRoutes');

const app = express();

connectDB();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: '10mb' }));

app.use('/api/sessions', sessionRoutes);
app.use('/api/qa', faqRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/asked-questions', askedQuestionRoutes);
app.use('/api/seo-settings', seoSettingsRoutes);
app.use('/api/seo', seoSettingsRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
