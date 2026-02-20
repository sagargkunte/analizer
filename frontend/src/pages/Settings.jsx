import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  MoonIcon,
  SunIcon,
  EnvelopeIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  UserIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');
  const [settings, setSettings] = useState({
    // Notification Settings
    dailyReminder: true,
    reminderTime: '20:00',
    emailNotifications: true,
    pushNotifications: false,
    
    // Appearance Settings
    darkMode: false,
    compactView: false,
    fontSize: 'medium',
    
    // Privacy Settings
    shareAnonymizedData: false,
    allowResearch: false,
    crisisResources: true,
    
    // Data Settings
    autoExport: false,
    exportFrequency: 'monthly',
    dataRetention: 'forever',
    
    // Language & Region
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    
    // Dashboard Preferences
    defaultView: 'dashboard',
    showCharts: true,
    showStats: true,
    showPatterns: true
  });

  const [stats, setStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    daysTracked: 0,
    lastEntry: null
  });

  useEffect(() => {
    loadSettings();
    loadUserStats();
    loadDarkMode();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/user/settings');
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await api.get('/user/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadDarkMode = () => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setSettings(prev => ({ ...prev, darkMode: isDark }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/user/settings', settings);
      
      // Apply dark mode immediately
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/export-data', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mood-data-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/user/account');
      toast.success('Account deleted successfully');
      await signOut();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure you want to reset all your mood data? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await api.delete('/user/data');
      toast.success('All data has been reset');
      loadUserStats();
    } catch (error) {
      toast.error('Failed to reset data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'preferences', name: 'Preferences', icon: UserIcon, description: 'General app preferences' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, description: 'Manage your notifications' },
    { id: 'appearance', name: 'Appearance', icon: SunIcon, description: 'Customize the look and feel' },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon, description: 'Control your privacy settings' },
    { id: 'data', name: 'Data Management', icon: DocumentTextIcon, description: 'Export or delete your data' },
    { id: 'account', name: 'Account', icon: KeyIcon, description: 'Manage your account settings' }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xlarge', label: 'Extra Large' }
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
  ];

  const exportFrequencies = [
    { value: 'never', label: 'Never' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const dataRetentions = [
    { value: 'forever', label: 'Keep Forever' },
    { value: '1year', label: '1 Year' },
    { value: '2years', label: '2 Years' },
    { value: '5years', label: '5 Years' }
  ];

  const SettingSection = ({ title, children }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex items-start space-x-3 flex-1">
        {Icon && (
          <div className="flex-shrink-0 mt-1">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
    </label>
  );

  const Select = ({ value, onChange, options, className = '' }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:text-white ${className}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and privacy settings
          </p>
        </div>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <>
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Save Changes</span>
              <ChevronRightIcon className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Entries</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEntries}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-purple-600">{stats.currentStreak} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-blue-600">{stats.longestStreak} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Days Tracked</p>
          <p className="text-2xl font-bold text-green-600">{stats.daysTracked}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{tab.name}</p>
                    <p className={`text-xs ${
                      activeTab === tab.id ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>

            {/* Version Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <InformationCircleIcon className="w-4 h-4" />
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <SettingSection title="General Preferences">
                  <SettingItem
                    icon={GlobeAltIcon}
                    title="Language"
                    description="Choose your preferred language"
                  >
                    <Select
                      value={settings.language}
                      onChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                      options={languages.map(lang => ({ 
                        value: lang.code, 
                        label: `${lang.flag} ${lang.name}` 
                      }))}
                      className="w-40"
                    />
                  </SettingItem>

                  <SettingItem
                    icon={ClockIcon}
                    title="Timezone"
                    description="Your current timezone"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.timezone}
                    </span>
                  </SettingItem>

                  <SettingItem
                    icon={DocumentTextIcon}
                    title="Date Format"
                    description="How dates should be displayed"
                  >
                    <Select
                      value={settings.dateFormat}
                      onChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}
                      options={dateFormats}
                      className="w-40"
                    />
                  </SettingItem>
                </SettingSection>

                <SettingSection title="Dashboard Preferences">
                  <SettingItem
                    title="Default View"
                    description="Which page to show after login"
                  >
                    <Select
                      value={settings.defaultView}
                      onChange={(value) => setSettings(prev => ({ ...prev, defaultView: value }))}
                      options={[
                        { value: 'dashboard', label: 'Dashboard' },
                        { value: 'daily-entry', label: 'Daily Entry' },
                        { value: 'analysis', label: 'Analysis' },
                        { value: 'history', label: 'History' }
                      ]}
                      className="w-40"
                    />
                  </SettingItem>

                  <SettingItem
                    icon={ChartBarIcon}
                    title="Show Charts"
                    description="Display charts on dashboard"
                  >
                    <Toggle
                      checked={settings.showCharts}
                      onChange={(checked) => setSettings(prev => ({ ...prev, showCharts: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    title="Show Statistics"
                    description="Display statistics cards"
                  >
                    <Toggle
                      checked={settings.showStats}
                      onChange={(checked) => setSettings(prev => ({ ...prev, showStats: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    title="Show Patterns"
                    description="Display detected patterns"
                  >
                    <Toggle
                      checked={settings.showPatterns}
                      onChange={(checked) => setSettings(prev => ({ ...prev, showPatterns: checked }))}
                    />
                  </SettingItem>
                </SettingSection>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <SettingSection title="Notification Preferences">
                  <SettingItem
                    icon={BellIcon}
                    title="Daily Reminder"
                    description="Get a daily reminder to log your mood"
                  >
                    <Toggle
                      checked={settings.dailyReminder}
                      onChange={(checked) => setSettings(prev => ({ ...prev, dailyReminder: checked }))}
                    />
                  </SettingItem>

                  {settings.dailyReminder && (
                    <SettingItem
                      icon={ClockIcon}
                      title="Reminder Time"
                      description="Choose when to receive reminders"
                    >
                      <input
                        type="time"
                        value={settings.reminderTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:text-white"
                      />
                    </SettingItem>
                  )}

                  <SettingItem
                    icon={EnvelopeIcon}
                    title="Email Notifications"
                    description="Receive updates and insights via email"
                  >
                    <Toggle
                      checked={settings.emailNotifications}
                      onChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    icon={DevicePhoneMobileIcon}
                    title="Push Notifications"
                    description="Receive push notifications on your device"
                  >
                    <Toggle
                      checked={settings.pushNotifications}
                      onChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </SettingItem>
                </SettingSection>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <SettingSection title="Theme">
                  <SettingItem
                    icon={settings.darkMode ? MoonIcon : SunIcon}
                    title="Dark Mode"
                    description="Switch between light and dark theme"
                  >
                    <Toggle
                      checked={settings.darkMode}
                      onChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </SettingItem>
                </SettingSection>

                <SettingSection title="Layout">
                  <SettingItem
                    title="Compact View"
                    description="Show more content with reduced spacing"
                  >
                    <Toggle
                      checked={settings.compactView}
                      onChange={(checked) => setSettings(prev => ({ ...prev, compactView: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    title="Font Size"
                    description="Adjust the text size"
                  >
                    <Select
                      value={settings.fontSize}
                      onChange={(value) => setSettings(prev => ({ ...prev, fontSize: value }))}
                      options={fontSizes}
                      className="w-32"
                    />
                  </SettingItem>
                </SettingSection>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <SettingSection title="Privacy Settings">
                  <SettingItem
                    icon={ShieldCheckIcon}
                    title="Share Anonymized Data"
                    description="Help improve the app by sharing anonymous usage data"
                  >
                    <Toggle
                      checked={settings.shareAnonymizedData}
                      onChange={(checked) => setSettings(prev => ({ ...prev, shareAnonymizedData: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    title="Allow Research"
                    description="Allow your anonymized data to be used for research"
                  >
                    <Toggle
                      checked={settings.allowResearch}
                      onChange={(checked) => setSettings(prev => ({ ...prev, allowResearch: checked }))}
                    />
                  </SettingItem>

                  <SettingItem
                    title="Crisis Resources"
                    description="Show crisis resources when patterns indicate need"
                  >
                    <Toggle
                      checked={settings.crisisResources}
                      onChange={(checked) => setSettings(prev => ({ ...prev, crisisResources: checked }))}
                    />
                  </SettingItem>
                </SettingSection>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                  <p className="text-sm text-purple-800 dark:text-purple-300">
                    🔒 Your privacy is important. All data is encrypted and stored securely.
                    You can export or delete your data at any time.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8
"
              >
                <SettingSection title="Data Management">
                  <SettingItem
                    icon={DocumentTextIcon}
                    title="Export Data"
                    description="Download all your mood tracking data"
                  >
                    <button
                      onClick={handleExportData}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Exporting...' : 'Export JSON'}
                    </button>
                  </SettingItem>

                  <SettingItem
                    title="Auto Export"
                    description="Automatically export your data periodically"
                  >
                    <Toggle
                      checked={settings.autoExport}
                      onChange={(checked) => setSettings(prev => ({ ...prev, autoExport: checked }))}
                    />
                  </SettingItem>

                  {settings.autoExport && (
                    <SettingItem
                      title="Export Frequency"
                      description="How often to auto-export your data"
                    >
                      <Select
                        value={settings.exportFrequency}
                        onChange={(value) => setSettings(prev => ({ ...prev, exportFrequency: value }))}
                        options={exportFrequencies}
                        className="w-32"
                      />
                    </SettingItem>
                  )}

                  <SettingItem
                    title="Data Retention"
                    description="How long to keep your data"
                  >
                    <Select
                      value={settings.dataRetention}
                      onChange={(value) => setSettings(prev => ({ ...prev, dataRetention: value }))}
                      options={dataRetentions}
                      className="w-32"
                    />
                  </SettingItem>
                </SettingSection>

                <SettingSection title="Danger Zone">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-300">
                          Reset All Data
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Permanently delete all your mood entries
                        </p>
                      </div>
                      <button
                        onClick={handleResetData}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                      >
                        Reset Data
                      </button>
                    </div>

                    <div className="border-t border-red-200 dark:border-red-800 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-800 dark:text-red-300">
                            Delete Account
                          </h4>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </SettingSection>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <SettingSection title="Profile Information">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user?.fullName}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Member since {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Edit Profile
                  </button>
                </SettingSection>

                <SettingSection title="Security">
                  <button
                    onClick={() => navigate('/change-password')}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Change Password
                  </button>

                  <button
                    onClick={() => navigate('/two-factor')}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Two-Factor Authentication
                  </button>

                  <button
                    onClick={() => navigate('/sessions')}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Active Sessions
                  </button>
                </SettingSection>

                <SettingSection title="Account Actions">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </SettingSection>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
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
                Delete Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete your account? This action cannot be undone.
                All your data will be permanently deleted.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Settings;