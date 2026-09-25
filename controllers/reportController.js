const SportSession = require('../models/SportSession');
const Sport = require('../models/Sport');

// Show reports page
const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    let reportData = null;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      if (fromDate > toDate) {
        req.session.error = 'From date must be before To date.';
        return res.render('admin/reports', {
          title: 'Session Reports',
          reportData: null,
          from,
          to
        });
      }

      // Get sessions within date range
      const sessions = await SportSession.find({
        date: { $gte: fromDate, $lte: toDate }
      }).populate('sport', 'name');

      // Calculate stats
      const totalSessions = sessions.length;
      const activeSessions = sessions.filter(s => s.status === 'active').length;
      const cancelledSessions = sessions.filter(s => s.status === 'cancelled').length;

      // Check for past active sessions (completed)
      const now = new Date();
      const completedSessions = sessions.filter(s => {
        if (s.status !== 'active') return false;
        const sessionDate = new Date(s.date);
        const [hours, minutes] = s.time.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        return sessionDate < now;
      }).length;

      const upcomingSessions = activeSessions - completedSessions;

      // Group by sport for popularity
      const sportCounts = {};
      sessions.forEach(session => {
        if (session.sport) {
          const sportName = session.sport.name;
          sportCounts[sportName] = (sportCounts[sportName] || 0) + 1;
        }
      });

      // Sort by count descending
      const sportPopularity = Object.entries(sportCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      reportData = {
        totalSessions,
        activeSessions,
        cancelledSessions,
        completedSessions,
        upcomingSessions,
        sportPopularity
      };
    }

    res.render('admin/reports', {
      title: 'Session Reports',
      reportData,
      from: from || '',
      to: to || ''
    });
  } catch (error) {
    console.error('Reports error:', error);
    req.session.error = 'Error generating reports.';
    res.redirect('/admin/dashboard');
  }
};

module.exports = {
  getReports
};
