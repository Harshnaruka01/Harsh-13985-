const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'college_av_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role && ['STUDENT', 'ADMIN'].includes(role) ? role : 'STUDENT'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Demo Quick Login (Auto-ensures demo account exists and returns token)
// @route   POST /api/auth/demo-login
// @access  Public
const demoLogin = async (req, res) => {
  try {
    const role = (req.body.role || 'STUDENT').toUpperCase();
    const email = role === 'ADMIN' ? 'admin@college.edu' : 'aarav@college.edu';
    const name = role === 'ADMIN' ? 'AV Room Incharge (Admin)' : 'Aarav Sharma (Student)';

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        maxBorrowLimit: role === 'ADMIN' ? 10 : 3
      });
    } else if (user.role !== role) {
      user.role = role;
      user.maxBorrowLimit = role === 'ADMIN' ? 10 : 3;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Demo login error', error: error.message });
  }
};

// @desc    Switch role for current logged in user
// @route   POST /api/auth/switch-role
// @access  Private
const switchRole = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextRole = req.body.role ? req.body.role.toUpperCase() : (user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN');
    user.role = nextRole;
    user.maxBorrowLimit = nextRole === 'ADMIN' ? 10 : 3;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      maxBorrowLimit: user.maxBorrowLimit,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({ message: 'Failed to switch role', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  demoLogin,
  switchRole,
  getMe
};
