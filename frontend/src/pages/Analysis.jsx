import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  DocumentTextIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import MoodChart from '../components/Charts/MoodChart';
import EnergyChart from '../components/Charts/EnergyChart';
import SleepChart from '../components/Charts/SleepChart';
import PatternHighlighter from '../components/Dashboard/PatternHighlighter';
import { CrisisAlert } from '../components/Alerts/NotificationAlert';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Analysis = () => {
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCrisis, setShowCrisis] = useState(false);
  const [resources, setResources] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [usingAI, setUsingAI] = useState(false);

  useEffect(() => {
    fetchAnalysisData();
    fetchAIAnalysis();
    fetchResources();
  }, [selectedPeriod]);

  const fetchAnalysisData = async () => {
    setLoading(true);
    try {
      const days = selectedPeriod === '30days' ? 30 : selectedPeriod === '90days' ? 90 : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const [moodResponse, analysisResponse] = await Promise.all([
        api.get(`/mood/entries?startDate=${startDate.toISOString()}&endDate=${new Date().toISOString()}`),
        api.get('/analysis/patterns')
      ]);
      
      if (moodResponse.data.success) {
        setMoodData(moodResponse.data.entries);
      }
      
      if (analysisResponse.data.success) {
        setAnalysis(analysisResponse.data);
        
        // Highlight pattern if passed from dashboard
        if (location.state?.highlightPattern) {
          setActiveTab('patterns');
        }
      }
    } catch (error) {
      toast.error('Failed to fetch analysis data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAIAnalysis = async () => {
    setAiLoading(true);
    try {
      const response = await api.get('/analysis/ai-analysis');
      if (response.data.success) {
        setAiAnalysis(response.data.analysis);
        setUsingAI(response.data.usingAI || false);
      }
    } catch (error) {
      console.error('Failed to fetch AI analysis:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await api.get('/analysis/resources');
      if (response.data.success) {
        setResources(response.data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(moodData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `mood-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'ai-insights', name: 'AI Insights', icon: SparklesIcon },
    { id: 'patterns', name: 'Patterns', icon: LightBulbIcon },
    { id: 'charts', name: 'Charts', icon: DocumentTextIcon },
    { id: 'recommendations', name: 'Recommendations', icon: ShieldCheckIcon }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Pattern Analysis
            </h1>
            {usingAI && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                <CpuChipIcon className="w-3 h-3" />
                AI Powered
              </span>
            )}
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into your mood patterns and trends
          </p>
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:text-white text-sm"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleExportData}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Export Data"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrintReport}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Print Report"
          >
            <PrinterIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex space-x-4 sm:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6 sm:mt-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                30-Day Pattern Summary
              </h2>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                {analysis?.analysis?.summary || "Not enough data for analysis. Continue logging for at least 7 days."}
              </p>
              {analysis?.dataPoints && (
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  Based on {analysis.dataPoints} days of data
                </p>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Mood Stability
                </h3>
                <div className="flex items-end space-x-1 sm:space-x-2">
                  <span className="text-xl sm:text-3xl font-bold text-purple-600">
                    {analysis?.analysis?.metrics?.moodStability || 'N/A'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 mb-1">/100</span>
                </div>
                <div className="mt-2 sm:mt-4 w-full h-1.5 sm:h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${analysis?.analysis?.metrics?.moodStability || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Sleep Quality
                </h3>
                <div className="flex items-end space-x-1 sm:space-x-2">
                  <span className="text-xl sm:text-3xl font-bold text-blue-600">
                    {analysis?.analysis?.metrics?.sleepQuality || 'N/A'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 mb-1">/100</span>
                </div>
                <div className="mt-2 sm:mt-4 w-full h-1.5 sm:h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${analysis?.analysis?.metrics?.sleepQuality || 0}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-6">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Energy Consistency
                </h3>
                <div className="flex items-end space-x-1 sm:space-x-2">
                  <span className="text-xl sm:text-3xl font-bold text-green-600">
                    {analysis?.analysis?.metrics?.energyConsistency || 'N/A'}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 mb-1">/100</span>
                </div>
                <div className="mt-2 sm:mt-4 w-full h-1.5 sm:h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${analysis?.analysis?.metrics?.energyConsistency || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Mood & Sleep Overview
                </h3>
                <MoodChart data={moodData} height={400} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Energy Levels
                  </h3>
                  <EnergyChart data={moodData} height={300} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Sleep Patterns
                  </h3>
                  <SleepChart data={moodData} height={300} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ai-insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {aiLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">AI is analyzing your patterns...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">AI-Powered Insights</h2>
                    <p className="text-sm sm:text-base text-purple-100">Based on your mood patterns</p>
                  </div>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {aiAnalysis}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-xs sm:text-sm text-purple-100">
                    🤖 These insights are generated by Cerebras AI and are for awareness only, not diagnostic.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
                <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Not enough data for AI analysis. Continue logging for at least 7 days.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'patterns' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-8"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Detected Patterns
            </h2>
            {analysis?.analysis?.patterns?.length > 0 ? (
              <PatternHighlighter patterns={analysis.analysis.patterns} />
            ) : (
              <div className="text-center py-8 sm:py-12">
                <LightBulbIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  No significant patterns detected in this period.
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Continue tracking to identify meaningful patterns.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'charts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Mood Timeline
              </h3>
              <MoodChart data={moodData} height={400} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Energy Distribution
              </h3>
              <EnergyChart data={moodData} height={300} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sleep Analysis
              </h3>
              <SleepChart data={moodData} height={300} />
            </div>
          </motion.div>
        )}

        {activeTab === 'recommendations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-8">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Personalized Recommendations
              </h2>
              
              {analysis?.analysis?.recommendations?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {analysis.analysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-l-4 border-purple-500"
                    >
                      <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  No recommendations available yet. Continue tracking for personalized insights.
                </p>
              )}
            </div>

            {/* Crisis Resources */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl shadow-lg p-4 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-red-800 dark:text-red-300 mb-4">
                Crisis Resources
              </h3>
              <p className="text-sm sm:text-base text-red-700 dark:text-red-400 mb-6">
                If you're experiencing a mental health crisis, immediate help is available:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-md"
                  >
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">
                      {resource.name}
                    </h4>
                    <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mb-1">
                      {resource.phone}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {resource.description}
                    </p>
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 sm:mt-3 inline-block text-xs sm:text-sm text-purple-600 hover:text-purple-700"
                    >
                      Learn more →
                    </a>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowCrisis(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Get Immediate Help
              </button>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ This tool provides insights but not medical diagnoses. Always consult with healthcare providers for proper evaluation and treatment.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Crisis Modal */}
      {showCrisis && (
        <CrisisAlert onClose={() => setShowCrisis(false)} />
      )}
    </motion.div>
  );
};

export default Analysis;