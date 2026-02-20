import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: HeartIcon,
      title: 'Mood Tracking',
      description: 'Track your daily mood and emotional patterns with our intuitive interface'
    },
    {
      icon: SparklesIcon,
      title: 'AI Insights',
      description: 'Get personalized insights powered by advanced AI analysis'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never share personal information'
    },
    {
      icon: UserGroupIcon,
      title: 'Support',
      description: 'Access crisis resources and support when you need help'
    },
    {
      icon: AcademicCapIcon,
      title: 'Learning',
      description: 'Learn about mood patterns and mental health through data-driven insights'
    },
    {
      icon: LightBulbIcon,
      title: 'Growth',
      description: 'Track your progress and celebrate improvements over time'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          About Mood Analyzer
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Your personal mental health companion powered by artificial intelligence
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          We believe everyone deserves access to tools that help them understand their mental health better. 
          Mood Analyzer combines technology and compassion to provide personalized insights into your emotional patterns, 
          helping you make informed decisions about your wellbeing.
        </p>
      </motion.div>

      {/* Features Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Key Features</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-600 text-white font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Track Your Mood</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Log your daily mood with a simple and intuitive interface. Choose your emotional state and add notes.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Our AI engine analyzes your patterns to identify trends and potential triggers in your emotional wellness.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-pink-600 text-white font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get Insights</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Receive actionable insights and recommendations to support your mental health journey.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 md:p-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Privacy Matters</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          We take your privacy and security seriously. All your data is:
        </p>
        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
          <li className="flex items-center space-x-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Encrypted end-to-end</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Never shared with third parties without your consent</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Under your complete control - export or delete anytime</span>
          </li>
          <li className="flex items-center space-x-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Compliant with GDPR and data protection regulations</span>
          </li>
        </ul>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Have Questions?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          We're here to help. Contact us or check out our resources.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
            Contact Us
          </button>
          <button className="px-6 py-3 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
            Terms & Privacy
          </button>
        </div>
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mood Analyzer v1.0.0 • Built with care for mental health
        </p>
      </motion.div>
    </motion.div>
  );
};

export default About;
