import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  BellAlertIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const NotificationAlert = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose,
  actions = [],
  dismissible = true,
  aiGenerated = false
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress < 0 ? 0 : newProgress;
        });
      }, 100);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    if (aiGenerated) return <SparklesIcon className="w-6 h-6 text-purple-500" />;
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
      case 'crisis':
        return <BellAlertIcon className="w-6 h-6 text-red-600" />;
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (aiGenerated) return 'bg-purple-50 dark:bg-purple-900/20 border-purple-500';
    
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500';
      case 'crisis':
        return 'bg-red-100 dark:bg-red-900/30 border-red-600';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500';
    }
  };

  const getTextColor = () => {
    if (aiGenerated) return 'text-purple-800 dark:text-purple-300';
    
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-300';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-300';
      case 'error':
        return 'text-red-800 dark:text-red-300';
      case 'crisis':
        return 'text-red-900 dark:text-red-200';
      default:
        return 'text-blue-800 dark:text-blue-300';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className={`relative mb-4 rounded-xl border-l-4 shadow-lg overflow-hidden ${getBgColor()}`}
          role="alert"
        >
          {/* Progress bar */}
          {duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              className={`absolute bottom-0 left-0 h-1 ${
                aiGenerated ? 'bg-purple-500' :
                type === 'success' ? 'bg-green-500' :
                type === 'warning' ? 'bg-yellow-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'crisis' ? 'bg-red-600' :
                'bg-blue-500'
              }`}
            />
          )}

          <div className="p-4">
            <div className="flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0 mr-3">
                {getIcon()}
              </div>

              {/* Content */}
              <div className="flex-1">
                {title && (
                  <h3 className={`text-sm font-semibold mb-1 flex items-center gap-2 ${getTextColor()}`}>
                    {title}
                    {aiGenerated && (
                      <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                        AI
                      </span>
                    )}
                  </h3>
                )}
                <p className={`text-sm ${getTextColor()}`}>
                  {message}
                </p>

                {/* Actions */}
                {actions.length > 0 && (
                  <div className="mt-3 flex space-x-3">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        className={`text-sm font-medium ${
                          aiGenerated ? 'text-purple-600 hover:text-purple-700 dark:text-purple-400' :
                          type === 'success' ? 'text-green-600 hover:text-green-700 dark:text-green-400' :
                          type === 'warning' ? 'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400' :
                          type === 'error' ? 'text-red-600 hover:text-red-700 dark:text-red-400' :
                          type === 'crisis' ? 'text-red-700 hover:text-red-800 dark:text-red-300' :
                          'text-blue-600 hover:text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Close button */}
              {dismissible && (
                <button
                  onClick={handleClose}
                  className={`flex-shrink-0 ml-3 ${getTextColor()} hover:opacity-75 transition-opacity`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Crisis Alert Component
export const CrisisAlert = ({ onClose }) => {
  const crisisResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      phone: '1-800-273-8255',
      description: '24/7, free and confidential support'
    },
    {
      name: 'Crisis Text Line',
      phone: 'Text HOME to 741741',
      description: '24/7 support via text message'
    },
    {
      name: 'SAMHSA National Helpline',
      phone: '1-800-662-4357',
      description: 'Treatment referral and information'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-4 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <BellAlertIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're Not Alone
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            If you're experiencing a crisis, immediate help is available.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {crisisResources.map((resource, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <h3 className="font-semibold text-sm sm:text-base text-red-800 dark:text-red-300 mb-1">
                {resource.name}
              </h3>
              <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                {resource.phone}
              </p>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                {resource.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <a
            href="tel:1-800-273-8255"
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
          >
            Call Now
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Daily Reminder Alert
export const DailyReminderAlert = ({ onLogNow, onLater, onDismiss }) => {
  return (
    <NotificationAlert
      type="info"
      title="Daily Check-in Reminder"
      message="Don't forget to log your mood for today. Consistent tracking helps identify patterns!"
      duration={10000}
      onClose={onDismiss}
      actions={[
        { label: 'Log Now', onClick: onLogNow },
        { label: 'Remind Later', onClick: onLater }
      ]}
    />
  );
};

// Pattern Detected Alert
export const PatternDetectedAlert = ({ pattern, onViewAnalysis, onDismiss }) => {
  const getPatternMessage = () => {
    switch (pattern.type) {
      case 'manic':
        return 'We detected a pattern of elevated mood and energy. This might be worth discussing with your healthcare provider.';
      case 'depressive':
        return 'We noticed a period of low mood and energy. Consider reaching out to your support system.';
      default:
        return 'We detected an interesting pattern in your recent data. View analysis for details.';
    }
  };

  return (
    <NotificationAlert
      type="warning"
      title="Pattern Detected"
      message={getPatternMessage()}
      duration={0}
      onClose={onDismiss}
      aiGenerated={true}
      actions={[
        { label: 'View Analysis', onClick: onViewAnalysis },
        { label: 'Dismiss', onClick: onDismiss }
      ]}
    />
  );
};

// Streak Achievement Alert
export const StreakAchievementAlert = ({ streak, onShare, onDismiss }) => {
  return (
    <NotificationAlert
      type="success"
      title="🎉 Achievement Unlocked!"
      message={`You've logged your mood for ${streak} days in a row! Keep up the great work!`}
      duration={8000}
      onClose={onDismiss}
      actions={[
        { label: 'Share Progress', onClick: onShare }
      ]}
    />
  );
};

// AI Insight Alert
export const AIInsightAlert = ({ insight, onViewDetails, onDismiss }) => {
  return (
    <NotificationAlert
      type="info"
      title="AI Generated Insight"
      message={insight}
      duration={10000}
      onClose={onDismiss}
      aiGenerated={true}
      actions={[
        { label: 'View Details', onClick: onViewDetails }
      ]}
    />
  );
};

export default NotificationAlert;