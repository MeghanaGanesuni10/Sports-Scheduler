const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/role');
const { getReports } = require('../controllers/reportController');

// All report routes require admin
router.use(requireAdmin);

router.get('/', getReports);

module.exports = router;
