const Sport = require('../models/Sport');
const SportSession = require('../models/SportSession');

// Admin dashboard
const getDashboard = async (req, res) => {
  try {
    const sports = await Sport.find({ createdBy: req.session.user.id })
      .sort({ createdAt: -1 });

    const totalSessions = await SportSession.countDocuments();
    const activeSessions = await SportSession.countDocuments({ status: 'active' });

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      sports,
      totalSessions,
      activeSessions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.session.error = 'Error loading dashboard.';
    res.redirect('/');
  }
};

module.exports = {
  getDashboard
};
