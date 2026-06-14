/**
 * routes/simplifyRoute.js
 * Routes for text simplification and mode listing.
 */

const express = require('express');
const { simplify, getModes } = require('../controllers/simplifyController');

const router = express.Router();

router.get('/modes', getModes);
router.post('/simplify', simplify);

module.exports = router;
