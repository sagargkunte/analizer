import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import MoodChart from '../components/Charts/MoodChart';
import StatsCards from '../components/Dashboard/StatsCards';
import PatternHighlighter from '../components/Dashboard/PatternHighlighter';
import NotificationAlert, { DailyReminderAlert, StreakAchievementAlert } from '../components/Alerts/NotificationAlert';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [moodData, setMoodData] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [dailyInsight, setDailyInsight] = useState('');
  const [stats, setStats] = useState({
    averageMood: 0,
    averageSleep: 0,
    streakDays: 0,
    energyLevel: 'normal',
    moodVariability: 0,
    wellnessScore: 0
  });
  const [trends, setTrends] = useState({
    mood: 0,
    sleep: 0,
    streak: 0,
    energy: 0,
    variability: 0,
    wellness: 0
  });
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    checkTodayEntry();
    fetchDailyInsight();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [moodResponse, analysisResponse] = await Promise.all([
        api.get(`/mood/entries?startDate=${thirtyDaysAgo.toISOString()}&endDate=${new Date().toISOString()}`),
        api.get('/analysis/patterns')
      ]);
      
      if (moodResponse.data.success) {
        setMoodData(moodResponse.data.entries);
        calculateStats(moodResponse.data.entries);
        checkStreak(moodResponse.data.entries);
      }
      
      if (analysisResponse.data.success) {
        setPatterns(analysisResponse.data.analysis?.patterns || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyInsight = async () => {
    try {
      const response = await api.get('/analysis/daily-insight');
      if (response.data.success) {
        setDailyInsight(response.data.insight);
      }
    } catch (error) {
      console.error('Failed to fetch daily insight:', error);
    }
  };

  const checkTodayEntry = async () => {
    try {
      const response = await api.get('/mood/today');
      if (response.data.success && !response.data.hasEntry) {
        setShowReminder(true);
      } else if (response.data.success && response.data.entry) {
        setLastEntry(response.data.entry);
      }
    } catch (error) {
      console.error('Error checking today\'s entry:', error);
    }
  };

  const calculateStats = (entries) => {
    if (entries.length === 0) return;

    const avgMood = entries.reduce((sum, e) => sum + e.mood_rating, 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length;
    
    const moodVariance = entries.reduce((sum, e) => sum + Math.pow(e.mood_rating - avgMood, 2), 0) / entries.length;
    const moodStdDev = Math.sqrt(moodVariance);
    
    const energyCounts = entries.reduce((acc, e) => {
      acc[e.energy_level] = (acc[e.energy_level] || 0) + 1;
      return acc;
    }, {});
    const dominantEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'normal';
    
    const moodScore = ((avgMood + 5) / 10) * 40;
    const sleepScore = Math.min(avgSleep / 8, 1) * 30;
    const stabilityScore = Math.max(0, 10 - moodStdDev) * 3;
    const wellnessScore = Math.min(100, moodScore + sleepScore + stabilityScore);

    setStats({
      averageMood: Number(avgMood.toFixed(1)),
      averageSleep: Number(avgSleep.toFixed(1)),
      streakDays: entries.length,
      energyLevel: dominantEnergy,
      moodVariability: Number(moodStdDev.toFixed(1)),
      wellnessScore: Math.round(wellnessScore)
    });

    if (entries.length >= 14) {
      const last7Days = entries.slice(-7);
      const prev7Days = entries.slice(-14, -7);
      
      const last7AvgMood = last7Days.reduce((sum, e) => sum + e.mood_rating, 0) / 7;
      const prev7AvgMood = prev7Days.reduce((sum, e) => sum + e.mood_rating, 0) / 7;
      
      const last7AvgSleep = last7Days.reduce((sum, e) => sum + e.sleep_hours, 0) / 7;
      const prev7AvgSleep = prev7Days.reduce((sum, e) => sum + e.sleep_hours, 0) / 7;
      
      const prevMoodVariance = prev7Days.reduce((sum, e) => sum + Math.pow(e.mood_rating - prev7AvgMood, 2), 0) / 7;
      const prevStdDev = Math.sqrt(prevMoodVariance);
      
      const prevMoodScore = ((prev7AvgMood + 5) / 10) * 40;
      const prevSleepScore = Math.min(prev7AvgSleep / 8, 1) * 30;
      const prevStabilityScore = Math.max(0, 10 - prevStdDev) * 3;
      const prevWellness = Math.min(100, prevMoodScore + prevSleepScore + prevStabilityScore);

      setTrends({
        mood: prev7AvgMood !== 0 ? Number(((last7AvgMood - prev7AvgMood) / Math.abs(prev7AvgMood) * 100).toFixed(1)) : 0,
        sleep: prev7AvgSleep !== 0 ? Number(((last7AvgSleep - prev7AvgSleep) / prev7AvgSleep * 100).toFixed(1)) : 0,
        streak: entries.length > (prev7Days.length || 0) ? 10 : 0,
        energy: 5,
        variability: prevStdDev !== 0 ? Number((-(moodStdDev - prevStdDev) / prevStdDev * 100).toFixed(1)) : 0,
        wellness: prevWellness !== 0 ? Number(((wellnessScore - prevWellness) / prevWellness * 100).toFixed(1)) : 0
      });
    }
  };

  const checkStreak = (entries) => {
    if (entries.length > 0 && entries.length % 7 === 0 && entries.length > 0) {
      setShowStreak(true);
    }
  };

  const handleLogNow = () => {
    setShowReminder(false);
    navigate('/daily-entry');
  };

  const handleRemindLater = () => {
    setShowReminder(false);
    toast.success('I\'ll remind you later!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* Alerts */}
      <div className="fixed top-20 right-4 z-50 w-80 sm:w-96 space-y-4">
        {showReminder && (
          <DailyReminderAlert
            onLogNow={handleLogNow}
            onLater={handleRemindLater}
            onDismiss={() => setShowReminder(false)}
          />
        )}
        
        {showStreak && (
          <StreakAchievementAlert
            streak={stats.streakDays}
            onShare={() => toast.success('Share feature coming soon!')}
            onDismiss={() => setShowStreak(false)}
          />
        )}
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Here's your mood overview for the last 30 days
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/daily-entry')}
          className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Log Today's Mood</span>
        </motion.button>
      </div>

      {/* Daily Insight */}
      {dailyInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
              <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-100 mb-1">Daily Insight</p>
              <p className="text-sm sm:text-base">{dailyInsight}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} trends={trends} />

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
              Mood & Sleep Patterns
            </h2>
            <button
              onClick={() => navigate('/analysis')}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Detailed Analysis</span>
            </button>
          </div>
          {moodData.length > 0 ? (
            <MoodChart data={moodData} height={350} />
          ) : (
            <div className="h-80 sm:h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <div className="text-center p-4">
                <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No data available</p>
                <button
                  onClick={() => navigate('/daily-entry')}
                  className="mt-4 text-sm sm:text-base text-purple-600 hover:text-purple-700 font-medium"
                >
                  Start logging your mood →
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Stats & Patterns */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/daily-entry')}
                className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <span className="font-medium text-purple-700 dark:text-purple-300 text-sm">
                  {lastEntry ? 'Update Today\'s Entry' : 'Log Today\'s Mood'}
                </span>
                <span className="text-sm text-purple-600">
                  {lastEntry ? '✏️ Edit' : '➕ Add'}
                </span>
              </button>
              
              <button
                onClick={() => navigate('/analysis')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="font-medium text-blue-700 dark:text-blue-300 text-sm">
                  View Full Analysis
                </span>
                <ChartBarIcon className="w-5 h-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Last Entry Summary */}
          {lastEntry && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Today's Entry
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mood:</span>
                  <span className={`text-sm font-bold ${
                    lastEntry.mood_rating >= 3 ? 'text-red-500' :
                    lastEntry.mood_rating <= -2 ? 'text-blue-500' :
                    'text-purple-500'
                  }`}>
                    {lastEntry.mood_rating}/5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sleep:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {lastEntry.sleep_hours} hrs
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Energy:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {lastEntry.energy_level.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6"
        >
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Detected Patterns
          </h2>
          <PatternHighlighter 
            patterns={patterns} 
            onPatternClick={(pattern) => {
              navigate('/analysis', { state: { highlightPattern: pattern } });
            }}
          />
        </motion.div>
      )}

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center p-6 sm:p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl"
      >
        <blockquote className="text-sm sm:text-xl text-gray-800 dark:text-gray-200 italic mb-2">
          "Every day may not be good, but there's something good in every day."
        </blockquote>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">
          Keep tracking, you're doing great! 🌟
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;