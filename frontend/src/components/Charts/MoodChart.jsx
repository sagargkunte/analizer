import React from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const MoodChart = ({ data, height = 400 }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {entry.name === 'Mood Rating' ? entry.value.toFixed(1) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate mood zones
  const manicThreshold = 3;
  const depressiveThreshold = -2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
            </linearGradient>
            
            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          
          <YAxis
            yAxisId="left"
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[-5, 5]}
            ticks={[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]}
          />
          
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[0, 12]}
            ticks={[0, 2, 4, 6, 8, 10, 12]}
          />

          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{
              paddingTop: 20,
              color: '#6B7280'
            }}
          />

          {/* Manic/Hypomanic zone */}
          <ReferenceArea
            yAxisId="left"
            y1={manicThreshold}
            y2={5}
            fill="#ef4444"
            fillOpacity={0.1}
            label={{
              value: 'Manic',
              position: 'insideTopRight',
              fill: '#ef4444',
              fontSize: 12
            }}
          />

          {/* Depressive zone */}
          <ReferenceArea
            yAxisId="left"
            y1={-5}
            y2={depressiveThreshold}
            fill="#3b82f6"
            fillOpacity={0.1}
            label={{
              value: 'Depressive',
              position: 'insideBottomLeft',
              fill: '#3b82f6',
              fontSize: 12
            }}
          />

          {/* Neutral zone indicators */}
          <ReferenceLine yAxisId="left" y={0} stroke="#9CA3AF" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="left" y={3} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine yAxisId="left" y={-2} stroke="#3b82f6" strokeDasharray="3 3" opacity={0.5} />

          {/* Mood Line */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mood_rating"
            name="Mood Rating"
            stroke="url(#moodGradient)"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              let fill = '#8b5cf6';
              if (payload.mood_rating >= 3) fill = '#ef4444';
              else if (payload.mood_rating <= -2) fill = '#3b82f6';
              
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill={fill}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
          />

          {/* Sleep Hours Line */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sleep_hours"
            name="Sleep Hours"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />

          {/* Energy Level indicators as areas */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="energy_level"
            name="Energy Level"
            stroke="none"
            fill="#f59e0b"
            fillOpacity={0.1}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default MoodChart;