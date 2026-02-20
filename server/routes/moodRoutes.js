const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');

// Create or update mood entry
router.post('/entry', async (req, res) => {
  try {
    const { date, ...moodData } = req.body;
    const userId = req.userId;

    // Create or update mood entry
    const entry = await MoodEntry.findOneAndUpdate(
      { userId, date: new Date(date) },
      { ...moodData, userId, date: new Date(date) },
      { upsert: true, new: true }
    );

    // Update user's last entry date and streak
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        lastEntryDate: new Date(date),
        $inc: { streakDays: 1 }
      },
      { new: true }
    );

    // If user doesn't exist, create it
    if (!user) {
      const newUser = new User({
        _id: userId,
        name: 'User',
        email: 'user@example.com',
        password: 'temporary', // This should be updated in production
        streakDays: 1,
        lastEntryDate: new Date(date)
      });
      await newUser.save();
    }

    res.status(201).json({ 
      success: true, 
      entry, 
      streak: user?.streakDays || 1 
    });
  } catch (error) {
    console.error('Error saving mood entry:', error);
    res.status(500).json({ message: 'Error saving mood entry' });
  }
});

// Get mood entries for a date range
router.get('/entries', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.userId;

    const query = { userId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const entries = await MoodEntry.find(query)
      .sort({ date: -1 })
      .limit(90);

    res.json({ success: true, entries });
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    res.status(500).json({ message: 'Error fetching mood entries' });
  }
});

// Get entries for last 30 days (for progress tracking)
router.get('/last30days', async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.json({ 
      success: true, 
      entries,
      count: entries.length
    });
  } catch (error) {
    console.error('Error fetching last 30 days entries:', error);
    res.status(500).json({ message: 'Error fetching entries' });
  }
});

// Get today's entry status
router.get('/today', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await MoodEntry.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.json({ 
      success: true, 
      hasEntry: !!entry,
      entry 
    });
  } catch (error) {
    console.error('Error checking today\'s entry:', error);
    res.status(500).json({ message: 'Error checking today\'s entry' });
  }
});

// Delete mood entry
router.delete('/entry/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.userId;

    const result = await MoodEntry.findOneAndDelete({
      userId,
      date: new Date(date)
    });

    if (!result) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    res.status(500).json({ message: 'Error deleting mood entry' });
  }
});

module.exports = router;