import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const History = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageMood: 0,
    averageSleep: 0,
    highMoodDays: 0,
    lowMoodDays: 0
  });

  useEffect(() => {
    fetchEntries();
  }, [currentMonth]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);
      
      const response = await api.get(`/mood/entries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      
      if (response.data.success) {
        setEntries(response.data.entries);
        calculateStats(response.data.entries);
      }
    } catch (error) {
      toast.error('Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries) => {
    if (entries.length === 0) {
      setStats({
        totalEntries: 0,
        averageMood: 0,
        averageSleep: 0,
        highMoodDays: 0,
        lowMoodDays: 0
      });
      return;
    }

    const avgMood = entries.reduce((sum, e) => sum + e.mood_rating, 0) / entries.length;
    const avgSleep = entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length;
    const highMoodDays = entries.filter(e => e.mood_rating >= 3).length;
    const lowMoodDays = entries.filter(e => e.mood_rating <= -2).length;

    setStats({
      totalEntries: entries.length,
      averageMood: avgMood.toFixed(1),
      averageSleep: avgSleep.toFixed(1),
      highMoodDays,
      lowMoodDays
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/mood/entry/${id}`);
      toast.success('Entry deleted successfully');
      fetchEntries();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    // Navigate to daily entry with the entry data
    navigate('/daily-entry', { state: { entry } });
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
  };

  const filteredEntries = entries.filter(entry => {
    if (filter === 'high') return entry.mood_rating >= 3;
    if (filter === 'low') return entry.mood_rating <= -2;
    if (filter === 'risky') return entry.risky_behavior;
    return true;
  });

  const getMoodColor = (rating) => {
    if (rating >= 3) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (rating <= -2) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
    return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
  };

  const getMoodEmoji = (rating) => {
    if (rating >= 4) return '😊';
    if (rating >= 2) return '🙂';
    if (rating >= -1) return '😐';
    if (rating >= -3) return '😕';
    return '😢';
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      if (direction === 'prev') {
        return subMonths(prev, 1);
      } else {
        return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your past mood entries
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEntries}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Mood</p>
          <p className="text-2xl font-bold text-purple-600">{stats.averageMood}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Sleep</p>
          <p className="text-2xl font-bold text-blue-600">{stats.averageSleep}h</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">High Mood Days</p>
          <p className="text-2xl font-bold text-red-600">{stats.highMoodDays}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Low Mood Days</p>
          <p className="text-2xl font-bold text-blue-600">{stats.lowMoodDays}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:text-white"
        >
          <option value="all">All Entries</option>
          <option value="high">High Mood (≥3)</option>
          <option value="low">Low Mood (≤-2)</option>
          <option value="risky">Risky Behavior</option>
        </select>
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <ArrowPathIcon className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">No entries found for this period</p>
          <p className="text-sm text-gray-500">Start logging your daily mood to see history</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mood
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Energy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sleep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Indicators
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEntries.map((entry) => (
                  <motion.tr
                    key={entry._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(entry.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(entry.date), 'EEEE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getMoodEmoji(entry.mood_rating)}</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getMoodColor(entry.mood_rating)}`}>
                          {entry.mood_rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.energy_level === 'very_high' ? 'bg-red-100 text-red-800' :
                        entry.energy_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        entry.energy_level === 'normal' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.energy_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {entry.sleep_hours} hrs
                      </div>
                      <div className="text-xs text-gray-500">
                        {entry.sleep_hours < 6 ? '😴 Low' : 
                         entry.sleep_hours > 9 ? '💤 High' : '✅ Optimal'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-1">
                        {entry.risky_behavior && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Risky
                          </span>
                        )}
                        {entry.impulsivity && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Impulsive
                          </span>
                        )}
                        {entry.functional_impairment !== 'none' && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            entry.functional_impairment === 'severe' ? 'bg-red-100 text-red-800' :
                            entry.functional_impairment === 'moderate' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.functional_impairment}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(entry)}
                          className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Entry Modal */}
      {selectedEntry && !showDeleteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedEntry(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Entry Details
                </h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(selectedEntry.date), 'EEEE, MMMM dd, yyyy')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Mood Rating</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{getMoodEmoji(selectedEntry.mood_rating)}</span>
                      <span className={`text-2xl font-bold ${getMoodColor(selectedEntry.mood_rating)}`}>
                        {selectedEntry.mood_rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sleep Hours</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedEntry.sleep_hours}h</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Energy Level</p>
                    <p className={`text-xl font-semibold ${
                      selectedEntry.energy_level === 'very_high' ? 'text-red-600' :
                      selectedEntry.energy_level === 'high' ? 'text-orange-600' :
                      selectedEntry.energy_level === 'normal' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {selectedEntry.energy_level}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Irritability</p>
                    <p className="text-xl font-semibold text-purple-600">{selectedEntry.irritability}/5</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Behavioral Indicators</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.risky_behavior && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Risky Behavior
                      </span>
                    )}
                    {selectedEntry.impulsivity && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Impulsivity
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedEntry.functional_impairment === 'severe' ? 'bg-red-100 text-red-800' :
                      selectedEntry.functional_impairment === 'moderate' ? 'bg-orange-100 text-orange-800' :
                      selectedEntry.functional_impairment === 'mild' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedEntry.functional_impairment} impairment
                    </span>
                  </div>
                </div>

                {selectedEntry.notes && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Notes</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedEntry.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Delete Entry
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete the entry for{' '}
                {format(new Date(selectedEntry.date), 'MMMM dd, yyyy')}?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedEntry._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default History;