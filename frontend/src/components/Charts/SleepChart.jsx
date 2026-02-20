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
  ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const SleepChart = ({ data, height = 300 }) => {
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
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sleep Hours: <span className="font-medium text-gray-900 dark:text-white">
                {payload[0].value.toFixed(1)} hrs
              </span>
            </p>
            <p className="text-xs text-gray-500">
              {payload[0].value < 6 ? '⚠️ Below recommended' : 
               payload[0].value > 9 ? '😴 Above average' : 
               '✅ Optimal range'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate sleep statistics
  const avgSleep = data.reduce((sum, entry) => sum + entry.sleep_hours, 0) / data.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="sleepAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
            stroke="#6B7280"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[0, 12]}
            ticks={[0, 2, 4, 6, 8, 10, 12]}
          />

          <Tooltip content={<CustomTooltip />} />
          
          <Legend />

          {/* Optimal sleep range indicators */}
          <ReferenceLine y={7} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min Optimal', position: 'right', fill: '#10b981', fontSize: 11 }} />
          <ReferenceLine y={9} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Max Optimal', position: 'right', fill: '#10b981', fontSize: 11 }} />
          
          {/* Average line */}
          <ReferenceLine 
            y={avgSleep} 
            stroke="#8b5cf6" 
            strokeDasharray="5 5" 
            label={{ 
              value: `Avg: ${avgSleep.toFixed(1)}h`, 
              position: 'left', 
              fill: '#8b5cf6', 
              fontSize: 11 
            }} 
          />

          {/* Area under the curve */}
          <Area
            type="monotone"
            dataKey="sleep_hours"
            stroke="none"
            fill="url(#sleepAreaGradient)"
          />

          {/* Main sleep line */}
          <Line
            type="monotone"
            dataKey="sleep_hours"
            name="Sleep Hours"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 6, fill: '#8b5cf6', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Sleep statistics */}
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {avgSleep.toFixed(1)}h
          </p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Optimal Days</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {data.filter(d => d.sleep_hours >= 7 && d.sleep_hours <= 9).length}
          </p>
        </div>
        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400">Low Sleep</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">
            {data.filter(d => d.sleep_hours < 6).length}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SleepChart;