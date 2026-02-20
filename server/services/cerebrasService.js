const axios = require('axios');

class CerebrasService {
  constructor() {
    this.apiKey = process.env.CEREBRAS_API_KEY;
    this.model = process.env.CEREBRAS_MODEL || 'llama3.1-8b';
    this.apiUrl = 'https://api.cerebras.ai/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('WARNING: CEREBRAS_API_KEY not set. Cerebras API calls will fail.');
    }
  }

  async analyzeMoodPatterns(moodData) {
    try {
      const prompt = this.buildAnalysisPrompt(moodData);
      
      const response = await axios.post(this.apiUrl, {
        messages: [
          {
            role: "system",
            content: "You are a mental health pattern analyzer. Provide empathetic, non-diagnostic insights about mood patterns based on the data provided. Never make medical diagnoses. Always encourage professional help when patterns suggest potential concerns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 500,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        analysis: response.data.choices[0].message.content,
        usage: response.data.usage
      };
    } catch (error) {
      console.error('Cerebras API error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  buildAnalysisPrompt(moodData) {
    const summary = this.prepareDataSummary(moodData);
    
    return `
      Analyze this 30-day mood tracking data and provide a supportive, non-diagnostic summary:
      
      ${summary}
      
      Please provide:
      1. Overview of mood patterns (stability, fluctuations)
      2. Sleep patterns and their relationship to mood
      3. Energy level trends
      4. Any detected patterns (potential manic/hypomanic or depressive episodes)
      5. Gentle recommendations for self-care
      
      Remember: This is for awareness only, not diagnosis. Always recommend consulting healthcare providers.
    `;
  }

  prepareDataSummary(entries) {
    const summary = {
      totalDays: entries.length,
      moodStats: this.calculateMoodStats(entries),
      sleepStats: this.calculateSleepStats(entries),
      energyDistribution: this.calculateEnergyDistribution(entries),
      patterns: this.detectBasicPatterns(entries),
      riskFactors: this.identifyRiskFactors(entries)
    };

    return JSON.stringify(summary, null, 2);
  }

  calculateMoodStats(entries) {
    const moods = entries.map(e => e.mood_rating);
    const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    const volatility = this.calculateVolatility(moods);
    
    // Detect mood episodes
    const highMoodDays = entries.filter(e => e.mood_rating >= 3).length;
    const lowMoodDays = entries.filter(e => e.mood_rating <= -2).length;

    return {
      average: avgMood.toFixed(2),
      volatility: volatility.toFixed(2),
      range: {
        min: Math.min(...moods),
        max: Math.max(...moods)
      },
      episodes: {
        high: highMoodDays,
        low: lowMoodDays
      }
    };
  }

  calculateSleepStats(entries) {
    const sleepHours = entries.map(e => e.sleep_hours);
    const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    
    // Detect sleep deprivation episodes
    const lowSleepDays = entries.filter(e => e.sleep_hours < 6).length;
    const highSleepDays = entries.filter(e => e.sleep_hours > 9).length;

    return {
      average: avgSleep.toFixed(2),
      lowSleepDays,
      highSleepDays,
      pattern: this.analyzeSleepPattern(entries)
    };
  }

  calculateEnergyDistribution(entries) {
    const distribution = {
      very_high: 0,
      high: 0,
      normal: 0,
      low: 0
    };

    entries.forEach(entry => {
      distribution[entry.energy_level]++;
    });

    return distribution;
  }

  detectBasicPatterns(entries) {
    const patterns = [];
    
    // Detect consecutive high mood days
    let highStreak = 0;
    let lowStreak = 0;

    entries.forEach(entry => {
      if (entry.mood_rating >= 3) {
        highStreak++;
        if (highStreak >= 3 && entry.energy_level === 'very_high' && entry.sleep_hours < 6) {
          patterns.push({
            type: 'potential_hypomanic',
            day: entry.date,
            duration: highStreak
          });
        }
      } else {
        highStreak = 0;
      }

      if (entry.mood_rating <= -2) {
        lowStreak++;
        if (lowStreak >= 5) {
          patterns.push({
            type: 'potential_depressive',
            day: entry.date,
            duration: lowStreak
          });
        }
      } else {
        lowStreak = 0;
      }
    });

    return patterns;
  }

  identifyRiskFactors(entries) {
    const risks = [];
    
    // Check for risky behaviors
    const riskyDays = entries.filter(e => e.risky_behavior).length;
    if (riskyDays > 0) {
      risks.push({
        factor: 'risky_behavior',
        days: riskyDays,
        severity: riskyDays > 3 ? 'high' : 'moderate'
      });
    }

    // Check for impulsivity
    const impulsiveDays = entries.filter(e => e.impulsivity).length;
    if (impulsiveDays > 0) {
      risks.push({
        factor: 'impulsivity',
        days: impulsiveDays,
        severity: impulsiveDays > 5 ? 'high' : 'moderate'
      });
    }

    // Check functional impairment
    const severeImpairment = entries.filter(e => e.functional_impairment === 'severe').length;
    if (severeImpairment > 0) {
      risks.push({
        factor: 'functional_impairment',
        days: severeImpairment,
        severity: 'high'
      });
    }

    return risks;
  }

  calculateVolatility(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  analyzeSleepPattern(entries) {
    const patterns = [];
    
    for (let i = 1; i < entries.length; i++) {
      const sleepChange = entries[i].sleep_hours - entries[i-1].sleep_hours;
      if (Math.abs(sleepChange) > 3) {
        patterns.push({
          date: entries[i].date,
          change: sleepChange
        });
      }
    }

    return patterns;
  }

  async generateDailyInsight(entry, previousEntries) {
    try {
      const prompt = `
        Based on today's mood entry and recent history, provide a brief, encouraging insight:
        
        Today: Mood ${entry.mood_rating}/5, Energy: ${entry.energy_level}, Sleep: ${entry.sleep_hours}h
        
        Previous 7 days average mood: ${this.calculateAverageMood(previousEntries.slice(-7))}
        
        Provide a short, supportive message (1-2 sentences) focusing on self-awareness and encouragement.
      `;

      const response = await axios.post(this.apiUrl, {
        messages: [
          {
            role: "system",
            content: "You are a supportive mental health companion. Provide brief, encouraging insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 100,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating daily insight:', error.response?.data || error.message);
      return "Keep tracking your mood - consistency brings awareness! 🌟";
    }
  }

  calculateAverageMood(entries) {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, e) => acc + e.mood_rating, 0);
    return (sum / entries.length).toFixed(2);
  }
}

module.exports = new CerebrasService();