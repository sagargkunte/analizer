const axios = require('axios');

const analyzePatterns = async (entries) => {
  try {
    // Prepare data for analysis
    const moodData = entries.map(entry => ({
      date: entry.date,
      mood: entry.mood_rating,
      energy: entry.energy_level,
      sleep: entry.sleep_hours,
      irritability: entry.irritability,
      risky: entry.risky_behavior,
      impulsive: entry.impulsivity,
      activity: entry.goal_directed_activity,
      impairment: entry.functional_impairment
    }));

    // Detect patterns manually first
    const patterns = detectPatterns(moodData);
    
    // Generate summary using OpenAI (optional)
    let aiSummary = "";
    if (process.env.OPENAI_API_KEY) {
      aiSummary = await generateAISummary(moodData, patterns);
    }

    return {
      patterns,
      summary: aiSummary || generateSummary(moodData, patterns),
      recommendations: generateRecommendations(patterns)
    };
  } catch (error) {
    console.error('Error in pattern analysis:', error);
    return generateFallbackAnalysis(entries);
  }
};

const detectPatterns = (data) => {
  const patterns = [];
  
  // Detect manic/hypomanic episodes
  let manicPeriod = [];
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (entry.mood >= 3 && 
        (entry.energy === 'high' || entry.energy === 'very_high') &&
        entry.sleep < 6 &&
        entry.impulsive) {
      manicPeriod.push(entry);
    } else {
      if (manicPeriod.length >= 3) {
        patterns.push({
          type: 'hypomanic',
          startDate: manicPeriod[0].date,
          endDate: manicPeriod[manicPeriod.length - 1].date,
          duration: manicPeriod.length,
          severity: manicPeriod.some(e => e.risky) ? 'high' : 'moderate'
        });
      }
      manicPeriod = [];
    }
  }

  // Detect depressive episodes
  let depressivePeriod = [];
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (entry.mood <= -2 && 
        entry.energy === 'low' &&
        entry.irritability >= 3 &&
        entry.impairment !== 'none') {
      depressivePeriod.push(entry);
    } else {
      if (depressivePeriod.length >= 5) {
        patterns.push({
          type: 'depressive',
          startDate: depressivePeriod[0].date,
          endDate: depressivePeriod[depressivePeriod.length - 1].date,
          duration: depressivePeriod.length,
          severity: depressivePeriod.some(e => e.impairment === 'severe') ? 'severe' : 'moderate'
        });
      }
      depressivePeriod = [];
    }
  }

  return patterns;
};

const generateSummary = (data, patterns) => {
  if (patterns.length === 0) {
    return "Your mood patterns appear stable over the analyzed period. No significant episodes detected. Continue monitoring for any changes.";
  }

  let summary = "Based on your last 30 days of data, ";
  
  patterns.forEach((pattern, index) => {
    if (index > 0) summary += " Additionally, ";
    
    const startDate = new Date(pattern.startDate).toLocaleDateString();
    const endDate = new Date(pattern.endDate).toLocaleDateString();
    
    if (pattern.type === 'hypomanic') {
      summary += `I noticed a ${pattern.duration}-day period from ${startDate} to ${endDate} with elevated mood and energy, reduced sleep, and increased impulsivity. `;
    } else {
      summary += `there was a ${pattern.duration}-day period from ${startDate} to ${endDate} characterized by low mood, low energy, and increased irritability. `;
    }
  });

  summary += "These patterns may be worth discussing with a mental health professional for proper evaluation and support.";

  return summary;
};

const generateRecommendations = (patterns) => {
  const recommendations = [];

  if (patterns.some(p => p.type === 'hypomanic' && p.severity === 'high')) {
    recommendations.push("Consider discussing your high-energy periods with a healthcare provider, especially if they involve risky behaviors.");
  }

  if (patterns.some(p => p.type === 'depressive' && p.severity === 'severe')) {
    recommendations.push("Your data shows periods of significant low mood and functional impairment. Please reach out to a mental health professional.");
  }

  if (patterns.length === 0) {
    recommendations.push("Keep up with your daily tracking to maintain awareness of your mental health patterns.");
  }

  recommendations.push("Remember: This tool provides insights but not medical diagnoses. Always consult with healthcare providers for proper evaluation.");

  return recommendations;
};

const generateFallbackAnalysis = (entries) => {
  const avgMood = entries.reduce((sum, e) => sum + e.mood_rating, 0) / entries.length;
  const avgSleep = entries.reduce((sum, e) => sum + e.sleep_hours, 0) / entries.length;

  return {
    patterns: [],
    summary: `Over the past ${entries.length} days, your average mood was ${avgMood.toFixed(1)} on a -5 to +5 scale, with an average of ${avgSleep.toFixed(1)} hours of sleep per night. Continue tracking to identify meaningful patterns.`,
    recommendations: ["Continue daily tracking to build more comprehensive data for analysis."]
  };
};

const generateAISummary = async (data, patterns) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a mental health pattern analyzer. Provide empathetic, non-diagnostic insights about mood patterns based on the data provided."
        },
        {
          role: "user",
          content: `Analyze this 30-day mood data and provide a supportive summary: ${JSON.stringify(data)}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return null;
  }
};

module.exports = { analyzePatterns, generateSummary, generateRecommendations, generateFallbackAnalysis, generateAISummary };