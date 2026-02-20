import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DailyEntry = () => {
  const navigate = useNavigate();
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

  const [loading, setLoading] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState(false);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  const checkTodayEntry = async () => {
    try {
      const response = await api.get('/mood/today');
      if (response.data.success && response.data.hasEntry) {
        setHasExistingEntry(true);
        setFormData(prev => ({
          ...prev,
          ...response.data.entry
        }));
      }
    } catch (error) {
      console.error('Error checking today\'s entry:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/mood/entry', formData);
      
      if (response.data.success) {
        toast.success(hasExistingEntry ? 'Entry updated successfully!' : 'Entry saved successfully!');
        navigate('/dashboard');
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
  };

  const InputCard = ({ children, title }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      {children}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {hasExistingEntry ? 'Update Today\'s Entry' : 'Daily Mood Entry'}
        </h1>
        {hasExistingEntry && (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Already logged for today
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date and Mood Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputCard title="Date">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </InputCard>

          <InputCard title="Mood Rating (-5 to +5)">
            <div className="space-y-2">
              <input
                type="range"
                name="mood_rating"
                min="-5"
                max="5"
                value={formData.mood_rating}
                onChange={handleChange}
                className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Very Low (-5)</span>
                <span className="font-bold text-purple-600">{formData.mood_rating}</span>
                <span>Very High (+5)</span>
              </div>
            </div>
          </InputCard>
        </div>

        {/* Energy Level and Sleep */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputCard title="Energy Level">
            <select
              name="energy_level"
              value={formData.energy_level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="very_high">Very High</option>
            </select>
          </InputCard>

          <InputCard title="Sleep Hours">
            <input
              type="number"
              name="sleep_hours"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleep_hours}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </InputCard>
        </div>

        {/* Irritability and Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputCard title="Irritability Level">
            <div className="space-y-2">
              <input
                type="range"
                name="irritability"
                min="0"
                max="5"
                value={formData.irritability}
                onChange={handleChange}
                className="w-full h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm">
                <span>Calm (0)</span>
                <span className="font-bold text-purple-600">{formData.irritability}</span>
                <span>Very Irritable (5)</span>
              </div>
            </div>
          </InputCard>

          <InputCard title="Goal-Directed Activity">
            <select
              name="goal_directed_activity"
              value={formData.goal_directed_activity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </InputCard>
        </div>

        {/* Behavioral Indicators */}
        <InputCard title="Behavioral Indicators">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="risky_behavior"
                checked={formData.risky_behavior}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Risky Behavior</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="impulsivity"
                checked={formData.impulsivity}
                onChange={handleChange}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Impulsivity</span>
            </label>

            <div>
              <select
                name="functional_impairment"
                value={formData.functional_impairment}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="none">No Impairment</option>
                <option value="mild">Mild Impairment</option>
                <option value="moderate">Moderate Impairment</option>
                <option value="severe">Severe Impairment</option>
              </select>
            </div>
          </div>
        </InputCard>

        {/* Notes */}
        <InputCard title="Additional Notes">
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Any additional observations or feelings..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
            maxLength="500"
          />
          <p className="text-sm text-gray-500 mt-2">
            {formData.notes.length}/500 characters
          </p>
        </InputCard>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            hasExistingEntry ? 'Update Entry' : 'Save Entry'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default DailyEntry;