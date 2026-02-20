const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get notifications from database
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // If no notifications in DB, return mock notifications
    if (notifications.length === 0) {
      const mockNotifications = [
        {
          id: '1',
          message: 'Welcome to MoodTracker! Start logging your daily mood to see patterns.',
          type: 'info',
          read: false,
          createdAt: new Date()
        },
        {
          id: '2',
          message: '💡 Tip: Logging at the same time each day helps identify patterns better.',
          type: 'tip',
          read: false,
          createdAt: new Date(Date.now() - 86400000)
        },
        {
          id: '3',
          message: 'Remember to log your mood today to maintain your streak!',
          type: 'reminder',
          read: true,
          createdAt: new Date(Date.now() - 172800000)
        }
      ];
      
      return res.json({
        success: true,
        notifications: mockNotifications
      });
    }
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Try to update in database if exists
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      // If not in DB, just return success (for mock notifications)
      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.userId;
    
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    await Notification.findOneAndDelete({ _id: id, userId });
    
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Create notification (can be used internally)
router.post('/create', async (req, res) => {
  try {
    const { userId, message, type = 'info' } = req.body;
    
    const notification = new Notification({
      userId,
      message,
      type,
      read: false
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.userId;
    
    const count = await Notification.countDocuments({
      userId,
      read: false
    });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

// Generate streak achievement notification
router.post('/generate-streak', async (req, res) => {
  try {
    const { userId, streak } = req.body;
    
    const notification = new Notification({
      userId,
      message: `🎉 Congratulations! You've maintained a ${streak}-day streak!`,
      type: 'achievement',
      read: false
    });
    
    await notification.save();
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error generating streak notification:', error);
    res.status(500).json({ message: 'Error generating streak notification' });
  }
});

// Generate pattern detected notification
router.post('/generate-pattern', async (req, res) => {
  try {
    const { userId, patternType, description } = req.body;
    
    let message = '';
    switch (patternType) {
      case 'hypomanic':
        message = '⚠️ Pattern detected: Several days of elevated mood and energy. Consider discussing with your healthcare provider.';
        break;
      case 'depressive':
        message = '📉 Pattern detected: Several days of low mood and energy. Reach out to your support system.';
        break;
      default:
        message = `🔍 Pattern detected: ${description}`;
    }
    
    const notification = new Notification({
      userId,
      message,
      type: 'pattern',
      read: false
    });
    
    await notification.save();
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error generating pattern notification:', error);
    res.status(500).json({ message: 'Error generating pattern notification' });
  }
});

// Generate daily reminder (can be called by cron job)
router.post('/generate-reminder', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user already has an unread reminder today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingReminder = await Notification.findOne({
      userId,
      type: 'reminder',
      createdAt: { $gte: today }
    });
    
    if (!existingReminder) {
      const notification = new Notification({
        userId,
        message: '📝 Don\'t forget to log your mood for today!',
        type: 'reminder',
        read: false
      });
      
      await notification.save();
    }
    
    res.json({
      success: true,
      message: 'Reminder generated'
    });
  } catch (error) {
    console.error('Error generating reminder:', error);
    res.status(500).json({ message: 'Error generating reminder' });
  }
});

module.exports = router;