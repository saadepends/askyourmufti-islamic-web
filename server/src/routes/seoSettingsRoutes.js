const express = require('express');
const router = express.Router();
const { getSeoSettings, upsertSeoSettings } = require('../controllers/seoSettingsController');

router.route('/').get(getSeoSettings).put(upsertSeoSettings);

module.exports = router;
