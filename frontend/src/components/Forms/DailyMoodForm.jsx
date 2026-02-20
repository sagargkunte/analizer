import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaceSmileIcon,
  FaceFrownIcon,
  BoltIcon,
  MoonIcon,
  FireIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const DailyMoodForm = ({ initialData, onSave }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood_rating: 0,
    energy_level: 'normal',
    sleep_hours: 7,
    irritability: 2,
    risky_behavior: false,
    impulsivity: false,
    goal_directed_activity: 'normal',
    functional_impairment: 'none',
    notes: ''
  });

  const [showTips, setShowTips] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};
    
    if (formData.mood_rating < -5 || formData.mood_rating > 5) {
      errors.mood_rating = 'Mood rating must be between -5 and 5';
    }
    
    if (formData.sleep_hours < 0 || formData.sleep_hours > 24) {
      errors.sleep_hours = 'Sleep hours must be between 0 and 24';
    }
    
    if (formData.irritability < 0 || formData.irritability > 5) {
      errors.irritability = 'Irritability must be between 0 and 5';
    }
    
    if (formData.notes && formData.notes.length > 500) {
      errors.notes = 'Notes cannot exceed 500 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/mood/entry', formData);
      
      if (response.data.success) {
        toast.success(
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span>Entry saved successfully! 🔥 {response.data.streak} day streak!</span>
          </div>
        );
        
        if (onSave) {
          onSave(response.data.entry);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const quickSelectMood = (rating) => {
    setFormData(prev => ({ ...prev, mood_rating: rating }));
  };

  const moodEmojis = [
    { value: -5, emoji: '😢', label: 'Very Low' },
    { value: -3, emoji: '😕', label: 'Low' },
    { value: 0, emoji: '😐', label: 'Neutral' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😊', label: 'Excellent' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Quick Mood Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date Input */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </motion.div>

          {/* Quick Mood Selector */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Mood Select
            </label>
            <div className="flex justify-between">
              {moodEmojis.map((mood) => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => quickSelectMood(mood.value)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    formData.mood_rating === mood.value
                      ? 'bg-purple-100 dark:bg-purple-900/30 scale-110'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mood Rating Slider */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mood Rating
            </label>
            <div className="flex items-center space-x-2">
              <FaceFrownIcon className={`w-5 h-5 ${formData.mood_rating < 0 ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`text-2xl font-bold ${
                formData.mood_rating >= 3 ? 'text-red-500' :
                formData.mood_rating <= -2 ? 'text-blue-500' :
                'text-purple-500'
              }`}>
                {formData.mood_rating}
              </span>
              <FaceSmileIcon className={`w-5 h-5 ${formData.mood_rating > 0 ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </div>
          
          <input
            type="range"
            name="mood_rating"
            min="-5"
            max="5"
            value={formData.mood_rating}
            onChange={handleChange}
            className="w-full h-2 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded-lg appearance-none cursor-pointer"
            step="1"
          />
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Very Low (-5)</span>
            <span>Neutral (0)</span>
            <span>Very High (+5)</span>
          </div>
          
          {validationErrors.mood_rating && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.mood_rating}</p>
          )}
        </motion.div>

        {/* Energy and Sleep */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Level */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Energy Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['low', 'normal', 'high', 'very_high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, energy_level: level }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.energy_level === level
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sleep Hours */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Sleep Hours
            </label>
            <div className="flex items-center space-x-4">
              <MoonIcon className="w-6 h-6 text-purple-500" />
              <input
                type="number"
                name="sleep_hours"
                min="0"
                max="24"
                step="0.5"
                value={formData.sleep_hours}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white"
                required
              />
              <span className="text-gray-600 dark:text-gray-400">hours</span>
            </div>
            {validationErrors.sleep_hours && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.sleep_hours}</p>
            )}
          </motion.div>
        </div>

        {/* Irritability and Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Irritability */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Irritability Level
            </label>
            <input
              type="range"
              name="irritability"
              min="0"
              max="5"
              value={formData.irritability}
              onChange={handleChange}
              className="w-full h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-lg appearance-none cursor-pointer"
              step="1"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-green-600">Calm (0)</span>
              <span className="text-sm font-bold text-purple-600">{formData.irritability}</span>
              <span className="text-xs text-red-600">Very Irritable (5)</span>
            </div>
            {validationErrors.irritability && (
              <p className="mt-2 text-sm text-red-600">{validationErrors.irritability}</p>
            )}
          </motion.div>

          {/* Goal-Directed Activity */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Goal-Directed Activity
            </label>
            <select
              name="goal_directed_activity"
              value={formData.goal_directed_activity}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low - Difficulty focusing</option>
              <option value="normal">Normal - Regular productivity</option>
              <option value="high">High - Very productive</option>
            </select>
          </motion.div>
        </div>

        {/* Behavioral Indicators */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Behavioral Indicators
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risky Behavior */}
            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                name="risky_behavior"
                checked={formData.risky_behavior}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Risky Behavior
                </span>
                <span className="text-xs text-gray-500">
                  Unusual risk-taking
                </span>
              </div>
            </label>

            {/* Impulsivity */}
            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                name="impulsivity"
                checked={formData.impulsivity}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Impulsivity
                </span>
                <span className="text-xs text-gray-500">
                  Acting without thinking
                </span>
              </div>
            </label>

            {/* Functional Impairment */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Functional Impairment
              </label>
              <select
                name="functional_impairment"
                value={formData.functional_impairment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="none">None</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notes */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional observations, feelings, or events you'd like to note..."
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:bg-gray-700 dark:text-white resize-none"
            maxLength="500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">
              {formData.notes.length}/500 characters
            </span>
            {formData.notes.length >= 450 && (
              <span className="text-xs text-yellow-600">
                Approaching character limit
              </span>
            )}
          </div>
          {validationErrors.notes && (
            <p className="mt-2 text-sm text-red-600">{validationErrors.notes}</p>
          )}
        </motion.div>

        {/* Tips Toggle */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
          >
            <LightBulbIcon className="w-4 h-4" />
            <span>{showTips ? 'Hide Tips' : 'Show Tracking Tips'}</span>
          </button>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
            >
              Cancel
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>{initialData ? 'Update Entry' : 'Save Entry'}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Tips Panel */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2" />
              Tips for Accurate Tracking
            </h4>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
              <li>• Be honest with yourself - accurate data leads to better insights</li>
              <li>• Try to log at the same time each day for consistency</li>
              <li>• Note any significant events that might affect your mood</li>
              <li>• Remember: This is for your awareness, not judgment</li>
              <li>• If you're experiencing crisis, reach out to emergency services</li>
            </ul>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default DailyMoodForm;