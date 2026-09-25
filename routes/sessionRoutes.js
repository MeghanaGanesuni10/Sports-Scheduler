const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requirePlayer } = require('../middleware/role');
const {
  getCreateSession,
  postCreateSession,
  getAvailableSessions,
  getSessionDetails,
  postJoinSession,
  getMySessions,
  postCancelSession,
  getPlayerDashboard,
  createSessionValidation
} = require('../controllers/sessionController');

// All session routes require authentication
router.use(requireAuth);

// Player dashboard endpoints
router.get('/player/dashboard', getPlayerDashboard);
router.get('/dashboard', getPlayerDashboard);

// Create session
router.get('/create', getCreateSession);
router.post('/create', createSessionValidation, postCreateSession);

// Available sessions
router.get('/', getAvailableSessions);

// My sessions
router.get('/my-sessions', getMySessions);

// Session details
router.get('/:id', getSessionDetails);

// Join session
router.post('/:id/join', postJoinSession);

// Cancel session
router.post('/:id/cancel', postCancelSession);

module.exports = router;
