const express = require('express');
const router = express.Router();
const { getTopics, createTopic, updateTopic, deleteTopic } = require('../controllers/topicController');

router.route('/').get(getTopics).post(createTopic);
router.route('/:id').put(updateTopic).delete(deleteTopic);

module.exports = router;
