const express = require('express');
const { generateStudy } = require('../controllers/studyController');
const router = express.Router();
router.post('/study', generateStudy);
module.exports = router;
