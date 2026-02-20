const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    unique: true
  },
  mood_rating: {
    type: Number,
    required: true,
    min: -5,
    max: 5
  },
  energy_level: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high', 'very_high']
  },
  sleep_hours: {
    type: Number,
    required: true,
    min: 0,
    max: 24
  },
  irritability: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  risky_behavior: {
    type: Boolean,
    required: true,
    default: false
  },
  impulsivity: {
    type: Boolean,
    required: true,
    default: false
  },
  goal_directed_activity: {
    type: String,
    required: true,
    enum: ['low', 'normal', 'high']
  },
  functional_impairment: {
    type: String,
    required: true,
    enum: ['none', 'mild', 'moderate', 'severe']
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
moodEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);