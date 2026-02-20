import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  PencilSquareIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  HeartIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [entriesCount, setEntriesCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/mood/entries?last30days=true');
      if (response.data.success) {
        const count = response.data.entries.length;
        setEntriesCount(count);
        setProgress(Math.min((count / 30) * 100, 100));
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: HomeIcon, 
      color: 'from-purple-500 to-purple-600',
      description: 'Overview & statistics'
    },
    { 
      path: '/daily-entry', 
      name: 'Daily Entry', 
      icon: PencilSquareIcon, 
      color: 'from-blue-500 to-blue-600',
      description: 'Log your daily mood'
    },
    { 
      path: '/analysis', 
      name: 'Analysis', 
      icon: ChartBarIcon, 
      color: 'from-green-500 to-green-600',
      description: 'Pattern insights'
    },
    { 
      path: '/history', 
      name: 'History', 
      icon: ClockIcon, 
      color: 'from-yellow-500 to-yellow-600',
      description: 'Past entries'
    },
    { 
      path: '/settings', 
      name: 'Settings', 
      icon: Cog6ToothIcon, 
      color: 'from-gray-500 to-gray-600',
      description: 'Preferences & privacy'
    },
  ];

  const resources = [
    { 
      name: 'Crisis Support', 
      icon: HeartIcon, 
      color: 'text-red-500', 
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      link: '/crisis',
      description: '24/7 emergency help'
    },
    { 
      name: 'About', 
      icon: InformationCircleIcon, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/about',
      description: 'Learn about the app'
    },
  ];

  return (
    <>
      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className="hidden lg:flex lg:flex-shrink-0"
      >
        <div className="flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  MoodTracker
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</p>
              </div>
            </div>
          </div>

          {/* User Info - Quick Summary */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ''}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  ⭐ {entriesCount} entries
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <span className="text-sm">{item.name}</span>
                      <p className={`text-xs mt-0.5 ${
                        isActive ? 'text-purple-100' : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1.5 h-1.5 bg-white rounded-full absolute right-3"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}

            {/* Divider */}
            <div className="my-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Resources
              </p>
            </div>

            {/* Resources */}
            <div className="space-y-2">
              {resources.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.link}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      isActive
                        ? `${item.bgColor} ${item.color}`
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.color} transition-transform group-hover:scale-110`} />
                  <div className="flex-1">
                    <span className="text-sm">{item.name}</span>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Progress card */}
          <div className="px-4 py-4 mx-4 mb-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">30</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  30-Day Challenge
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track daily for insights
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {entriesCount}/30 days
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                />
              </div>
              {entriesCount >= 30 ? (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  🎉 Challenge completed! Great job!
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {30 - entriesCount} more days to complete
                </p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowRightOnRectangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to logout? You can always log back in.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 z-50">
        <div className="flex justify-around items-center">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-lg transition-all ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;