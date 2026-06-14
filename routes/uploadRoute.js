const express = require('express');
const upload = require('../middleware/upload');
const { uploadDocument } = require('../controllers/uploadController');
const router = express.Router();
router.post('/upload', upload.single('file'), uploadDocument);
module.exports = router;
