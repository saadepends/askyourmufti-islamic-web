const express = require('express');
const router = express.Router();
const { createAskedQuestion, getAskedQuestions } = require('../controllers/askedQuestionController');

router.route('/').post(createAskedQuestion).get(getAskedQuestions);

module.exports = router;
