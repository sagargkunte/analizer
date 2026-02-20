const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email: /login", email,password);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const user = await User.findById(userId).select('settings');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve settings' 
    });
  }
});

// Save user settings
router.post('/settings', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const settings = req.body; // The entire body is the settings object

    const user = await User.findByIdAndUpdate(
      userId,
      { settings },
      { new: true, runValidators: true }
    ).select('settings');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Settings saved successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save settings' 
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const user = await User.findById(userId).select('streakDays currentStreak longestStreak daysTracked lastEntryDate');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      stats: {
        totalEntries: user.daysTracked || 0,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        daysTracked: user.daysTracked || 0,
        lastEntry: user.lastEntryDate
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve statistics' 
    });
  }
});

// Export user data
router.get('/export-data', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Also get mood entries if available
    const MoodEntry = require('../models/MoodEntry');
    const moodEntries = await MoodEntry.find({ userId });

    const exportData = {
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        settings: user.settings
      },
      moodEntries: moodEntries,
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export data' 
    });
  }
});

// Reset user data
router.delete('/data', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware

    // Delete all mood entries for this user
    const MoodEntry = require('../models/MoodEntry');
    await MoodEntry.deleteMany({ userId });

    // Reset user stats
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        daysTracked: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'All data has been reset successfully'
    });
  } catch (error) {
    console.error('Reset data error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to reset data' 
    });
  }
});

// Delete user account
router.delete('/account', async (req, res) => {
  try {
    const userId = req.userId; // Set by authMiddleware

    // Delete user
    await User.findByIdAndDelete(userId);

    // Delete all mood entries for this user
    const MoodEntry = require('../models/MoodEntry');
    await MoodEntry.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete account' 
    });
  }
});

module.exports = router;