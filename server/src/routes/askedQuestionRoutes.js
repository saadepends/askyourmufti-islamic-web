const express = require('express');
const router = express.Router();
const { createAskedQuestion, getAskedQuestions, answerAskedQuestion } = require('../controllers/askedQuestionController');

router.route('/').post(createAskedQuestion).get(getAskedQuestions);
router.post('/:id/answer', answerAskedQuestion);

module.exports = router;
