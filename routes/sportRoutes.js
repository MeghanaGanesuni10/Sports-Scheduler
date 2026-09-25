const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getSports } = require('../controllers/sportController');

// Public sport listing (for session creation dropdowns)
router.get('/', requireAuth, getSports);

module.exports = router;
