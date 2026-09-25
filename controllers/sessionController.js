const { body, validationResult } = require('express-validator');
const SportSession = require('../models/SportSession');
const Sport = require('../models/Sport');

// Helper: Check if a session's date/time is in the past
const isSessionPast = (session) => {
  const sessionDate = new Date(session.date);
  const [hours, minutes] = session.time.split(':').map(Number);
  sessionDate.setHours(hours, minutes, 0, 0);
  return sessionDate < new Date();
};

// Show create session form
const getCreateSession = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ name: 1 });
    res.render('player/create-session', {
      title: 'Create Session',
      sports,
      errors: []
    });
  } catch (error) {
    console.error('Get create session error:', error);
    req.session.error = 'Error loading session form.';
    res.redirect('/player/dashboard');
  }
};

// Handle create session
const postCreateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    const sports = await Sport.find().sort({ name: 1 });

    if (!errors.isEmpty()) {
      return res.render('player/create-session', {
        title: 'Create Session',
        sports,
        errors: errors.array(),
        formData: req.body
      });
    }

    const { sport, date, time, venue, maxPlayers } = req.body;

    // Verify sport exists
    const sportDoc = await Sport.findById(sport);
    if (!sportDoc) {
      return res.render('player/create-session', {
        title: 'Create Session',
        sports,
        errors: [{ msg: 'Selected sport does not exist.' }],
        formData: req.body
      });
    }

    // Check if date/time is in the past
    const sessionDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    sessionDate.setHours(hours, minutes, 0, 0);

    if (sessionDate < new Date()) {
      return res.render('player/create-session', {
        title: 'Create Session',
        sports,
        errors: [{ msg: 'Cannot create a session in the past.' }],
        formData: req.body
      });
    }

    // Create session with creator automatically joined
    const session = new SportSession({
      sport,
      createdBy: req.session.user.id,
      players: [req.session.user.id], // Creator auto-joins
      maxPlayers: parseInt(maxPlayers),
      date: new Date(date),
      time,
      venue,
      status: 'active'
    });

    await session.save();

    req.session.success = 'Session created successfully!';
    res.redirect('/sessions/my-sessions');
  } catch (error) {
    console.error('Create session error:', error);
    const sports = await Sport.find().sort({ name: 1 });
    res.render('player/create-session', {
      title: 'Create Session',
      sports,
      errors: [{ msg: 'Error creating session. Please try again.' }],
      formData: req.body
    });
  }
};

// Show available sessions (upcoming, active, not created by current user)
const getAvailableSessions = async (req, res) => {
  try {
    const sessions = await SportSession.find({
      status: { $ne: 'cancelled' }
    })
      .populate('sport', 'name')
      .populate('createdBy', 'name')
      .populate('players', 'name')
      .sort({ date: 1 });

    // Add computed properties for display
    const processedSessions = sessions.map(session => {
      const sessionObj = session.toObject();
      sessionObj._id = session._id;
      sessionObj.isPast = isSessionPast(session);
      sessionObj.isFull = session.players.length >= session.maxPlayers;
      sessionObj.hasJoined = session.players.some(
        p => p._id.toString() === req.session.user.id.toString()
      );
      sessionObj.isCreator = session.createdBy._id.toString() === req.session.user.id.toString();
      sessionObj.availableSlots = session.maxPlayers - session.players.length;
      return sessionObj;
    });

    res.render('player/available-sessions', {
      title: 'Available Sessions',
      sessions: processedSessions
    });
  } catch (error) {
    console.error('Get available sessions error:', error);
    req.session.error = 'Error loading sessions.';
    res.redirect('/player/dashboard');
  }
};

// Show session details
const getSessionDetails = async (req, res) => {
  try {
    const session = await SportSession.findById(req.params.id)
      .populate('sport', 'name')
      .populate('createdBy', 'name')
      .populate('players', 'name');

    if (!session) {
      req.session.error = 'Session not found.';
      return res.redirect('/sessions');
    }

    const sessionObj = session.toObject();
    sessionObj.isPast = isSessionPast(session);
    sessionObj.isFull = session.players.length >= session.maxPlayers;
    sessionObj.hasJoined = session.players.some(
      p => p._id.toString() === req.session.user.id.toString()
    );
    sessionObj.isCreator = session.createdBy._id.toString() === req.session.user.id.toString();
    sessionObj.availableSlots = session.maxPlayers - session.players.length;

    res.render('sessions/details', {
      title: 'Session Details',
      session: sessionObj
    });
  } catch (error) {
    console.error('Get session details error:', error);
    req.session.error = 'Error loading session details.';
    res.redirect('/sessions');
  }
};

// Join a session
const postJoinSession = async (req, res) => {
  try {
    const session = await SportSession.findById(req.params.id)
      .populate('players', 'name');

    if (!session) {
      req.session.error = 'Session not found.';
      return res.redirect('/sessions');
    }

    // Validation checks
    if (session.status === 'cancelled') {
      req.session.error = 'Cannot join a cancelled session.';
      return res.redirect(`/sessions/${session._id}`);
    }

    if (isSessionPast(session)) {
      req.session.error = 'Cannot join a past session.';
      return res.redirect(`/sessions/${session._id}`);
    }

    if (session.players.length >= session.maxPlayers) {
      req.session.error = 'This session is already full.';
      return res.redirect(`/sessions/${session._id}`);
    }

    // Check if user already joined
    const alreadyJoined = session.players.some(
      p => p._id.toString() === req.session.user.id.toString()
    );

    if (alreadyJoined) {
      req.session.error = 'You have already joined this session.';
      return res.redirect(`/sessions/${session._id}`);
    }

    // Add user to players
    session.players.push(req.session.user.id);
    await session.save();

    req.session.success = 'Successfully joined the session!';
    res.redirect(`/sessions/${session._id}`);
  } catch (error) {
    console.error('Join session error:', error);
    req.session.error = 'Error joining session.';
    res.redirect('/sessions');
  }
};

// Show my sessions (created + joined)
const getMySessions = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Sessions created by me
    const createdSessions = await SportSession.find({ createdBy: userId })
      .populate('sport', 'name')
      .populate('createdBy', 'name')
      .populate('players', 'name')
      .sort({ date: -1 });

    // Sessions joined by me (not created by me)
    const joinedSessions = await SportSession.find({
      players: userId,
      createdBy: { $ne: userId }
    })
      .populate('sport', 'name')
      .populate('createdBy', 'name')
      .populate('players', 'name')
      .sort({ date: -1 });

    // Process sessions
    const processCreated = createdSessions.map(session => {
      const obj = session.toObject();
      obj.isPast = isSessionPast(session);
      obj.availableSlots = session.maxPlayers - session.players.length;
      return obj;
    });

    const processJoined = joinedSessions.map(session => {
      const obj = session.toObject();
      obj.isPast = isSessionPast(session);
      obj.availableSlots = session.maxPlayers - session.players.length;
      return obj;
    });

    res.render('player/my-sessions', {
      title: 'My Sessions',
      createdSessions: processCreated,
      joinedSessions: processJoined
    });
  } catch (error) {
    console.error('Get my sessions error:', error);
    req.session.error = 'Error loading your sessions.';
    res.redirect('/player/dashboard');
  }
};

// Cancel a session
const postCancelSession = async (req, res) => {
  try {
    const session = await SportSession.findById(req.params.id);

    if (!session) {
      req.session.error = 'Session not found.';
      return res.redirect('/sessions/my-sessions');
    }

    // Only creator can cancel
    if (session.createdBy.toString() !== req.session.user.id.toString()) {
      req.session.error = 'Only the session creator can cancel this session.';
      return res.redirect(`/sessions/${session._id}`);
    }

    if (session.status === 'cancelled') {
      req.session.error = 'This session is already cancelled.';
      return res.redirect(`/sessions/${session._id}`);
    }

    const { cancellationReason } = req.body;

    if (!cancellationReason || cancellationReason.trim() === '') {
      req.session.error = 'Please provide a cancellation reason.';
      return res.redirect(`/sessions/${session._id}`);
    }

    session.status = 'cancelled';
    session.cancellationReason = cancellationReason.trim();
    await session.save();

    req.session.success = 'Session cancelled successfully.';
    res.redirect('/sessions/my-sessions');
  } catch (error) {
    console.error('Cancel session error:', error);
    req.session.error = 'Error cancelling session.';
    res.redirect('/sessions/my-sessions');
  }
};

// Player dashboard
const getPlayerDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const availableCount = await SportSession.countDocuments({
      status: 'active',
      date: { $gte: new Date() }
    });

    const createdCount = await SportSession.countDocuments({
      createdBy: userId
    });

    const joinedCount = await SportSession.countDocuments({
      players: userId,
      createdBy: { $ne: userId }
    });

    res.render('player/dashboard', {
      title: 'Player Dashboard',
      availableCount,
      createdCount,
      joinedCount
    });
  } catch (error) {
    console.error('Player dashboard error:', error);
    req.session.error = 'Error loading dashboard.';
    res.redirect('/');
  }
};

// Validation rules for session creation
const createSessionValidation = [
  body('sport')
    .notEmpty().withMessage('Please select a sport.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Please enter a valid date.'),
  body('time')
    .notEmpty().withMessage('Time is required.')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please enter a valid time.'),
  body('venue')
    .trim()
    .notEmpty().withMessage('Venue is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Venue must be between 2 and 100 characters.'),
  body('maxPlayers')
    .notEmpty().withMessage('Maximum players is required.')
    .isInt({ min: 2, max: 50 }).withMessage('Maximum players must be between 2 and 50.')
];

module.exports = {
  getCreateSession,
  postCreateSession,
  getAvailableSessions,
  getSessionDetails,
  postJoinSession,
  getMySessions,
  postCancelSession,
  getPlayerDashboard,
  createSessionValidation,
  isSessionPast
};
