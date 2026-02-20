import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

const EnergyChart = ({ data, height = 300 }) => {
  const getEnergyColor = (level) => {
    switch (level) {
      case 'very_high':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'normal':
        return '#10b981';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getEnergyLabel = (level) => {
    switch (level) {
      case 'very_high':
        return 'Very High';
      case 'high':
        return 'High';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Low';
      default:
        return level;
    }
  };

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
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].color }} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Energy Level: <span className="font-medium text-gray-900 dark:text-white">
                  {getEnergyLabel(payload[0].value)}
                </span>
              </span>
            </div>
            {payload[0].payload.impulsivity && (
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                  Impulsive
                </span>
              </div>
            )}
            {payload[0].payload.risky_behavior && (
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                  Risky Behavior
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          
          <YAxis
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={(value) => {
              switch (value) {
                case 0: return 'Low';
                case 1: return 'Normal';
                case 2: return 'High';
                case 3: return 'Very High';
                default: return value;
              }
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          
          <Legend />

          <Bar
            dataKey="energy_level"
            name="Energy Level"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getEnergyColor(entry.energy_level)}
                stroke={getEnergyColor(entry.energy_level)}
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default EnergyChart;