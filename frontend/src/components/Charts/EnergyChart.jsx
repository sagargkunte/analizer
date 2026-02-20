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

const EnergyChart = ({ data = [], height = 300 }) => {

  // Convert string energy to numeric scale
  const getEnergyValue = (level) => {
    switch (level) {
      case 'low':
        return 0;
      case 'normal':
        return 1;
      case 'high':
        return 2;
      case 'very_high':
        return 3;
      default:
        return 0;
    }
  };

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

  const getEnergyLabel = (value) => {
    switch (value) {
      case 0:
        return 'Low';
      case 1:
        return 'Normal';
      case 2:
        return 'High';
      case 3:
        return 'Very High';
      default:
        return '';
    }
  };

  // Normalize data to numeric values
  const normalizedData = data.map(item => ({
    ...item,
    energy_numeric: getEnergyValue(item.energy_level)
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {new Date(label).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Energy Level:{' '}
            <span className="font-semibold">
              {getEnergyLabel(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6">
        No energy data available
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={normalizedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

          <XAxis
            dataKey="date"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })
            }
          />

          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tickFormatter={getEnergyLabel}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="energy_numeric"
            name="Energy Level"
            radius={[4, 4, 0, 0]}
          >
            {normalizedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getEnergyColor(entry.energy_level)}
              />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default EnergyChart;