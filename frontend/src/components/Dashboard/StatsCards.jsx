import React from 'react';
import { motion } from 'framer-motion';
import {
  SunIcon,
  MoonIcon,
  Battery100Icon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats, trends }) => {
  const cards = [
    {
      title: 'Average Mood',
      value: stats.averageMood,
      unit: '/5',
      icon: SunIcon,
      color: 'purple',
      trend: trends.mood,
      description: 'Overall mood balance'
    },
    {
      title: 'Average Sleep',
      value: stats.averageSleep,
      unit: 'hrs',
      icon: MoonIcon,
      color: 'blue',
      trend: trends.sleep,
      description: 'Rest quality'
    },
    {
      title: 'Current Streak',
      value: stats.streakDays,
      unit: 'days',
      icon: Battery100Icon,
      color: 'green',
      trend: trends.streak,
      description: 'Consistency'
    },
    {
      title: 'Energy Level',
      value: stats.energyLevel,
      unit: '',
      icon: ArrowTrendingUpIcon,
      color: 'yellow',
      trend: trends.energy,
      description: 'Activity level'
    },
    {
      title: 'Mood Variability',
      value: stats.moodVariability,
      unit: '',
      icon: ArrowTrendingDownIcon,
      color: 'red',
      trend: trends.variability,
      description: 'Stability score'
    },
    {
      title: 'Wellness Score',
      value: stats.wellnessScore,
      unit: '%',
      icon: HeartIcon,
      color: 'pink',
      trend: trends.wellness,
      description: 'Overall health'
    }
  ];

  const getTrendIcon = (trend) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    if (trend < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {cards.map((card, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-${card.color}-100 dark:bg-${card.color}-900/20`}>
              <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
            </div>
            {card.trend !== undefined && (
              <div className="flex items-center space-x-1">
                {getTrendIcon(card.trend)}
                <span className={`text-sm font-medium ${
                  card.trend > 0 ? 'text-green-600' : 
                  card.trend < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {Math.abs(card.trend)}%
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              {card.title}
            </h3>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof card.value === 'number' ? card.value.toFixed(1) : card.value}
              </p>
              <p className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                {card.unit}
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {card.description}
            </p>
          </div>

          {/* Progress bar for wellness score */}
          {card.title === 'Wellness Score' && (
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.value}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCards;