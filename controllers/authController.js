const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Show signup page
const getSignup = (req, res) => {
  res.render('auth/signup', { title: 'Sign Up', errors: [] });
};

// Handle signup
const postSignup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/signup', {
        title: 'Sign Up',
        errors: errors.array(),
        name: req.body.name,
        email: req.body.email
      });
    }

    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.render('auth/signup', {
        title: 'Sign Up',
        errors: [{ msg: 'An account with this email already exists.' }],
        name,
        email
      });
    }

    // Create new user
    const user = new User({ name, email, password, role: 'player' });
    await user.save();

    // Auto-login after signup
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.success = 'Account created successfully! Welcome to Sports Scheduler.';
    res.redirect('/player/dashboard');
  } catch (error) {
    console.error('Signup error:', error);
    res.render('auth/signup', {
      title: 'Sign Up',
      errors: [{ msg: 'An error occurred during signup. Please try again.' }],
      name: req.body.name,
      email: req.body.email
    });
  }
};

// Show login page
const getLogin = (req, res) => {
  res.render('auth/login', { title: 'Log In', errors: [] });
};

// Handle login
const postLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Log In',
        errors: errors.array(),
        email: req.body.email
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('auth/login', {
        title: 'Log In',
        errors: [{ msg: 'Invalid email or password.' }],
        email
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Log In',
        errors: [{ msg: 'Invalid email or password.' }],
        email
      });
    }

    // Set session - never include password
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.session.success = `Welcome back, ${user.name}!`;

    // Redirect based on role
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    res.redirect('/player/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Log In',
      errors: [{ msg: 'An error occurred during login. Please try again.' }],
      email: req.body.email
    });
  }
};

// Handle logout
const postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

// Validation rules
const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

module.exports = {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout,
  signupValidation,
  loginValidation
};
