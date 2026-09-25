const Sport = require('../models/Sport');
const SportSession = require('../models/SportSession');
const User = require('../models/User');

// Admin dashboard with rich reports & analytics
const getDashboard = async (req, res) => {
  try {
    const sports = await Sport.find({ createdBy: req.session.user.id })
      .sort({ createdAt: -1 });

    const totalSportsCount = await Sport.countDocuments();
    const totalSessions = await SportSession.countDocuments();
    const activeSessions = await SportSession.countDocuments({ status: 'active' });
    const cancelledSessions = await SportSession.countDocuments({ status: 'cancelled' });
    const completedSessions = await SportSession.countDocuments({ status: 'completed' });
    
    const totalPlayers = await User.countDocuments({ role: 'player' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Fetch all sessions to calculate enrollments and sport popularity breakdown
    const allSessions = await SportSession.find().populate('sport', 'name');
    
    let totalEnrollments = 0;
    const sportCounts = {};
    
    allSessions.forEach(session => {
      totalEnrollments += (session.players ? session.players.length : 0);
      if (session.sport && session.sport.name) {
        const name = session.sport.name;
        sportCounts[name] = (sportCounts[name] || 0) + 1;
      }
    });

    // Format sport popularity array
    const sportPopularity = Object.entries(sportCounts)
      .map(([name, count]) => ({
        name,
        count,
        pct: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Recent sessions log for quick management
    const recentSessions = await SportSession.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('sport', 'name')
      .populate('createdBy', 'name')
      .populate('players', 'name');

    res.render('admin/dashboard', {
      title: 'Admin Dashboard & Analytics',
      sports,
      totalSportsCount,
      totalSessions,
      activeSessions,
      cancelledSessions,
      completedSessions,
      totalPlayers,
      totalAdmins,
      totalEnrollments,
      sportPopularity,
      recentSessions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    req.session.error = 'Error loading admin dashboard analytics.';
    res.redirect('/');
  }
};

module.exports = {
  getDashboard
};
