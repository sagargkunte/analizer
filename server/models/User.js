const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  settings: {
    // Notification Settings
    dailyReminder: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '20:00'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: false
    },
    
    // Appearance Settings
    darkMode: {
      type: Boolean,
      default: false
    },
    compactView: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium'
    },
    
    // Privacy Settings
    shareAnonymizedData: {
      type: Boolean,
      default: false
    },
    allowResearch: {
      type: Boolean,
      default: false
    },
    crisisResources: {
      type: Boolean,
      default: true
    },
    
    // Data Settings
    autoExport: {
      type: Boolean,
      default: false
    },
    exportFrequency: {
      type: String,
      enum: ['never', 'weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    dataRetention: {
      type: String,
      enum: ['forever', '1year', '2years', '5years'],
      default: 'forever'
    },
    
    // Language & Region
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    
    // Dashboard Preferences
    defaultView: {
      type: String,
      default: 'dashboard'
    },
    showCharts: {
      type: Boolean,
      default: true
    },
    showStats: {
      type: Boolean,
      default: true
    },
    showPatterns: {
      type: Boolean,
      default: true
    }
  },
  streakDays: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  daysTracked: {
    type: Number,
    default: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);