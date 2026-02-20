import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const PatternHighlighter = ({ patterns, onPatternClick }) => {
  const [expandedPattern, setExpandedPattern] = useState(null);

  const getPatternIcon = (type) => {
    switch (type) {
      case 'manic':
      case 'hypomanic':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'depressive':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'mixed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <LightBulbIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPatternColor = (type) => {
    switch (type) {
      case 'manic':
      case 'hypomanic':
        return 'red';
      case 'depressive':
        return 'blue';
      case 'mixed':
        return 'purple';
      default:
        return 'yellow';
    }
  };

  const getPatternTitle = (pattern) => {
    switch (pattern.type) {
      case 'manic':
        return 'Manic Episode Detected';
      case 'hypomanic':
        return 'Hypomanic Pattern';
      case 'depressive':
        return 'Depressive Episode';
      case 'mixed':
        return 'Mixed Episode';
      default:
        return 'Pattern Detected';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {patterns.map((pattern, index) => {
        const color = getPatternColor(pattern.type);
        const isExpanded = expandedPattern === index;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-${color}-50 dark:bg-${color}-900/20 rounded-xl border-l-4 border-${color}-500 overflow-hidden`}
          >
            {/* Pattern header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => onPatternClick && onPatternClick(pattern)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getPatternIcon(pattern.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {getPatternTitle(pattern)}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="w-4 h-4" />
                        <span>
                          {formatDate(pattern.startDate)} - {formatDate(pattern.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>{pattern.duration} days</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedPattern(isExpanded ? null : index);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 space-y-3">
                    {/* Pattern characteristics */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Characteristics:
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {pattern.characteristics?.map((char, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Severity indicator */}
                    {pattern.severity && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Severity:
                        </h5>
                        <div className="flex items-center space-x-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-800 dark:bg-${color}-900/30 dark:text-${color}-400`}>
                            {pattern.severity}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {pattern.recommendations && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recommendations:
                        </h5>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {pattern.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <ShieldCheckIcon className="w-4 h-4 text-green-500 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warning */}
                    {pattern.warning && (
                      <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          ⚠️ {pattern.warning}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {patterns.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
        >
          <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No significant patterns detected in the analyzed period.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Continue tracking to identify meaningful patterns.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PatternHighlighter;