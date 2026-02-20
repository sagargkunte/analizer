import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Crisis = () => {
  const [activeTab, setActiveTab] = useState('resources');

  const crisisResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      description: 'Free and confidential support 24/7',
      contact: '988 (call or text)',
      type: 'phone',
      availability: '24/7',
      region: 'United States',
      icon: '📞'
    },
    {
      name: 'Crisis Text Line',
      description: 'Text-based support from trained counselors',
      contact: 'Text HOME to 741741',
      type: 'text',
      availability: '24/7',
      region: 'United States',
      icon: '💬'
    },
    {
      name: 'International Association for Suicide Prevention',
      description: 'Global directory of crisis centers',
      contact: 'https://www.iasp.info/resources/Crisis_Centres/',
      type: 'web',
      availability: '24/7',
      region: 'International',
      icon: '🌍'
    },
    {
      name: 'Samaritans',
      description: 'Emotional support and crisis intervention',
      contact: '116 123 (free)',
      type: 'phone',
      availability: '24/7',
      region: 'UK & Ireland',
      icon: '📞'
    },
    {
      name: 'Lifeline Australia',
      description: 'Crisis support and suicide prevention',
      contact: '13 11 14 (free)',
      type: 'phone',
      availability: '24/7',
      region: 'Australia',
      icon: '📞'
    },
    {
      name: 'Emergency Services',
      description: 'For immediate life-threatening emergencies',
      contact: '911 (US) or local emergency number',
      type: 'phone',
      availability: '24/7',
      region: 'Worldwide',
      icon: '🚨'
    }
  ];

  const copingStrategies = [
    {
      title: 'Grounding Technique (5-4-3-2-1)',
      description:
        'Name 5 things you see, 4 things you touch, 3 things you hear, 2 things you smell, 1 thing you taste.',
      icon: '🌍'
    },
    {
      title: 'Deep Breathing',
      description:
        'Breathe in for 4 counts, hold for 4, exhale for 4. Repeat 10 times.',
      icon: '🌬️'
    },
    {
      title: 'Progressive Muscle Relaxation',
      description:
        'Tense and release each muscle group for 5 seconds, starting from toes to head.',
      icon: '💪'
    },
    {
      title: 'Reach Out',
      description:
        'Contact a trusted friend, family member, or call a crisis line.',
      icon: '🤝'
    },
    {
      title: 'Physical Activity',
      description:
        'Take a walk, stretch, or do light exercise to release tension.',
      icon: '🏃'
    },
    {
      title: 'Mindfulness',
      description:
        'Practice meditation or guided breathing exercises.',
      icon: '🧘'
    }
  ];

  const warningSignsOfCrisis = [
    'Thinking about death or suicide',
    'Expressing that others would be better off without them',
    'Searching for ways to harm themselves',
    'Talking about feeling hopeless',
    'Feeling trapped or in unbearable pain',
    'Increased substance use',
    'Acting anxious, agitated, or reckless',
    'Sleeping too much or too little',
    'Withdrawing from family and friends',
    'Showing rage or talking about seeking revenge',
    'Displaying extreme mood swings',
    'Giving away possessions',
    "Saying goodbye as if they won't be around"
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border-2 border-red-600 rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-start space-x-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-red-900 dark:text-red-200 mb-2">
              Crisis Support & Resources
            </h1>
            <p className="text-red-800 dark:text-red-300 text-lg">
              If you're experiencing a mental health crisis, immediate help is available.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="tel:988"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>Call 988 Now</span>
              </a>

              <a
                href="sms:741741?body=HOME"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>💬</span>
                <span>Text HOME to 741741</span>
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {['resources', 'coping', 'warnings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            {tab === 'resources'
              ? 'Crisis Resources'
              : tab === 'coping'
              ? 'Coping Strategies'
              : 'Warning Signs'}
          </button>
        ))}
      </div>

      {/* Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crisisResources.map((resource, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
            >
              <div className="text-4xl mb-3">{resource.icon}</div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {resource.name}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {resource.description}
              </p>

              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-semibold break-all">
                {resource.type === 'phone' && (
                  <PhoneIcon className="w-5 h-5" />
                )}
                {resource.type === 'web' && (
                  <GlobeAltIcon className="w-5 h-5" />
                )}
                {resource.type === 'web' ? (
                  <a
                    href={resource.contact}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {resource.contact}
                  </a>
                ) : (
                  <span>{resource.contact}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Crisis;