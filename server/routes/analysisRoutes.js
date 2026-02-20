const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const cerebrasService = require('../services/cerebrasService');

// Get AI-powered analysis for last 30 days
router.get('/ai-analysis', async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    if (entries.length < 7) {
      return res.json({
        success: true,
        analysis: "Not enough data for AI analysis. Please continue logging for at least 7 days.",
        needsMoreData: true
      });
    }

    // Get Cerebras AI analysis
    const aiAnalysis = await cerebrasService.analyzeMoodPatterns(entries);
    
    if (!aiAnalysis.success) {
      // Fallback to basic analysis if AI fails
      const basicAnalysis = generateBasicAnalysis(entries);
      return res.json({
        success: true,
        analysis: basicAnalysis,
        aiError: aiAnalysis.error,
        usingAI: false
      });
    }

    res.json({
      success: true,
      analysis: aiAnalysis.analysis,
      usingAI: true,
      dataPoints: entries.length
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({ message: 'Error analyzing patterns' });
  }
});

// Get daily insight
router.get('/daily-insight', async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntry = await MoodEntry.findOne({
      userId,
      date: { $gte: today }
    });

    if (!todayEntry) {
      return res.json({
        success: true,
        insight: "Log today's mood to receive a personalized insight!"
      });
    }

    const previousEntries = await MoodEntry.find({
      userId,
      date: { $lt: today }
    }).sort({ date: -1 }).limit(7);

    const insight = await cerebrasService.generateDailyInsight(todayEntry, previousEntries);

    res.json({
      success: true,
      insight
    });
  } catch (error) {
    console.error('Error generating daily insight:', error);
    res.status(500).json({ message: 'Error generating insight' });
  }
});

// Get pattern detection (non-AI fallback)
router.get('/patterns', async (req, res) => {
  try {
    const userId = req.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await MoodEntry.find({
      userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    if (entries.length < 7) {
      return res.json({
        success: true,
        analysis: "Not enough data for pattern analysis. Please continue logging for at least 7 days.",
        patterns: []
      });
    }

    const analysis = generateBasicAnalysis(entries);
    
    res.json({ 
      success: true, 
      analysis,
      dataPoints: entries.length
    });
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({ message: 'Error analyzing patterns' });
  }
});

// Basic analysis function (fallback)
function generateBasicAnalysis(entries) {
  const avgMood = entries.reduce((sum, e) => sum + e.mood_rating, 0) / entries.length;
  const avgSleep = entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length;
  
  // Detect patterns
  const patterns = detectBasicPatterns(entries);
  
  let summary = `Over the past ${entries.length} days, `;
  
  if (patterns.length === 0) {
    summary += "your mood patterns appear stable. Continue monitoring for any changes.";
  } else {
    summary += "I noticed some patterns in your data: ";
    patterns.forEach((pattern, index) => {
      if (index > 0) summary += " Also, ";
      summary += pattern.description;
    });
  }
  
  summary += " These patterns are worth discussing with a mental health professional.";

  return {
    summary,
    patterns,
    recommendations: generateRecommendations(patterns)
  };
}

function detectBasicPatterns(entries) {
  const patterns = [];
  
  // Detect potential hypomanic episodes
  for (let i = 0; i < entries.length - 2; i++) {
    if (entries[i].mood_rating >= 3 && 
        entries[i].energy_level === 'very_high' &&
        entries[i].sleep_hours < 6) {
      patterns.push({
        type: 'hypomanic',
        description: `a ${findConsecutiveDays(entries, i)}-day period of elevated mood and energy`,
        startDate: entries[i].date,
        severity: 'moderate'
      });
      i += 2;
    }
  }
  
  // Detect potential depressive episodes
  for (let i = 0; i < entries.length - 4; i++) {
    if (entries[i].mood_rating <= -2 && 
        entries[i].energy_level === 'low') {
      patterns.push({
        type: 'depressive',
        description: `a ${findConsecutiveDays(entries, i)}-day period of low mood and energy`,
        startDate: entries[i].date,
        severity: 'moderate'
      });
      i += 4;
    }
  }
  
  return patterns;
}

function findConsecutiveDays(entries, startIndex) {
  let count = 1;
  const startDate = new Date(entries[startIndex].date);
  
  for (let i = startIndex + 1; i < entries.length; i++) {
    const nextDate = new Date(entries[i].date);
    const diffDays = Math.round((nextDate - startDate) / (1000 * 60 * 60 * 24));
    if (diffDays === count) {
      count++;
    } else {
      break;
    }
  }
  
  return count;
}

function generateRecommendations(patterns) {
  const recommendations = [];
  
  if (patterns.some(p => p.type === 'hypomanic')) {
    recommendations.push("Consider discussing high-energy periods with a healthcare provider.");
  }
  
  if (patterns.some(p => p.type === 'depressive')) {
    recommendations.push("Your data shows periods of low mood. Reach out to your support system.");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Keep tracking to build more comprehensive data for analysis.");
  }
  
  recommendations.push("Remember: This tool provides insights but not medical diagnoses.");
  
  return recommendations;
}

module.exports = router;