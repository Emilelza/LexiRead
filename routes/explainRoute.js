const express = require('express');
const { explain } = require('../controllers/explainController');
const router = express.Router();
router.post('/explain-word', explain);
module.exports = router;
