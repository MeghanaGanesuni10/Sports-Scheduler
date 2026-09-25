const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/role');
const { getDashboard } = require('../controllers/adminController');
const {
  getCreateSport,
  postCreateSport,
  getSports,
  createSportValidation
} = require('../controllers/sportController');

// All admin routes require admin role
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Sports management
router.get('/sports', getSports);
router.get('/sports/create', getCreateSport);
router.post('/sports/create', createSportValidation, postCreateSport);

module.exports = router;
