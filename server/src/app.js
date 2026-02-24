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

const app = express();

connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/sessions', sessionRoutes);
app.use('/api/qa', faqRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/asked-questions', askedQuestionRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

module.exports = app;
