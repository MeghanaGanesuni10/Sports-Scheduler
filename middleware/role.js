// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.error = 'Access denied. Admin privileges required.';
    return res.redirect('/login');
  }
  next();
};

// Require player role (both admin and player can access player features)
const requirePlayer = (req, res, next) => {
  if (!req.session.user) {
    req.session.error = 'Please log in to access this page.';
    return res.redirect('/login');
  }
  next();
};

module.exports = { requireAdmin, requirePlayer };
