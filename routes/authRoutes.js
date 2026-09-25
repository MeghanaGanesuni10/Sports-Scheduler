const express = require('express');
const router = express.Router();
const {
  getSignup,
  postSignup,
  getLogin,
  postLogin,
  postLogout,
  signupValidation,
  loginValidation
} = require('../controllers/authController');

// Signup
router.get('/signup', getSignup);
router.post('/signup', signupValidation, postSignup);

// Login
router.get('/login', getLogin);
router.post('/login', loginValidation, postLogin);

// Logout
router.post('/logout', postLogout);

module.exports = router;
