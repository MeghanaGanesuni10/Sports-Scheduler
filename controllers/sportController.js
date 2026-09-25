const { body, validationResult } = require('express-validator');
const Sport = require('../models/Sport');

// Show create sport form
const getCreateSport = (req, res) => {
  res.render('admin/create-sport', { title: 'Create Sport', errors: [] });
};

// Handle create sport
const postCreateSport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('admin/create-sport', {
        title: 'Create Sport',
        errors: errors.array(),
        name: req.body.name
      });
    }

    const { name } = req.body;

    // Check for duplicate sport name (case-insensitive)
    const existingSport = await Sport.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingSport) {
      return res.render('admin/create-sport', {
        title: 'Create Sport',
        errors: [{ msg: 'A sport with this name already exists.' }],
        name
      });
    }

    const sport = new Sport({
      name: name.trim(),
      createdBy: req.session.user.id
    });

    await sport.save();

    req.session.success = `Sport "${sport.name}" created successfully!`;
    res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Create sport error:', error);
    res.render('admin/create-sport', {
      title: 'Create Sport',
      errors: [{ msg: 'Error creating sport. Please try again.' }],
      name: req.body.name
    });
  }
};

// Show all sports
const getSports = async (req, res) => {
  try {
    const sports = await Sport.find().populate('createdBy', 'name').sort({ createdAt: -1 });
    res.render('admin/sports', { title: 'All Sports', sports });
  } catch (error) {
    console.error('Get sports error:', error);
    req.session.error = 'Error loading sports.';
    res.redirect('/admin/dashboard');
  }
};

// Validation rules
const createSportValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Sport name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Sport name must be between 2 and 50 characters.')
];

module.exports = {
  getCreateSport,
  postCreateSport,
  getSports,
  createSportValidation
};
