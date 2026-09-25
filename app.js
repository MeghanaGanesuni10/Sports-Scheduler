const express = require('express');
const path = require('path');
const session = require('express-session');
const mongoStoreModule = require('connect-mongo');
const MongoStore = mongoStoreModule.default || mongoStoreModule;
const methodOverride = require('method-override');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sportRoutes = require('./routes/sportRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override for PUT/DELETE
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Make user session data available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  // Clear flash messages after reading
  delete req.session.success;
  delete req.session.error;
  next();
});

// Import controllers & middleware
const { getPlayerDashboard } = require('./controllers/sessionController');
const { requireAuth } = require('./middleware/auth');

// Unified /dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
  if (req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/player/dashboard');
});

// Explicit /player/dashboard route
app.get('/player/dashboard', requireAuth, getPlayerDashboard);

// Routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/sports', sportRoutes);
app.use('/sessions', sessionRoutes);
app.use('/admin/reports', reportRoutes);

// Home page
app.get('/', (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/player/dashboard');
  }
  res.render('home', { title: 'Sports Scheduler' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    error: { status: 404 }
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
