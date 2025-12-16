import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useForecastStore } from '../../store/forecastStore';
import { calculateStaffingNeeds } from '../../lib/calculations';
import { DayOfWeek } from '../../lib/types';
import type { StaffingRequirements } from '../../lib/types';

interface ForecastChartProps {
  height?: number;
  className?: string;
}

interface ChartDataPoint {
  hour: string;
  traditionalFTE: number;
  aiAwareFTE: number;
  scenarioFTE?: number;
  currentStaffed: number;
  coverageGap: number;
  gapPositive?: number;
  gapNegative?: number;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg">
      <h3 className="text-white font-semibold mb-2">{label}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between items-center space-x-4">
          <span className="text-gray-300">Traditional (No AI):</span>
          <span className="text-gray-400 font-mono">{data.traditionalFTE} agents</span>
        </div>
        <div className="flex justify-between items-center space-x-4">
          <span className="text-blue-300">AI-Aware:</span>
          <span className="text-blue-400 font-mono">{data.aiAwareFTE} agents</span>
        </div>
        {data.scenarioFTE !== undefined && (
          <div className="flex justify-between items-center space-x-4">
            <span className="text-purple-300">Scenario:</span>
            <span className="text-purple-400 font-mono">{data.scenarioFTE} agents</span>
          </div>
        )}
        <div className="flex justify-between items-center space-x-4">
          <span className="text-green-300">Currently Scheduled:</span>
          <span className="text-green-400 font-mono">{data.currentStaffed} agents</span>
        </div>
        <div className="border-t border-gray-600 pt-1 mt-2">
          <div className="flex justify-between items-center space-x-4">
            <span className="text-gray-300">Coverage Gap:</span>
            <span className={`font-mono ${
              data.coverageGap > 0 ? 'text-red-400' : data.coverageGap < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              {data.coverageGap > 0 ? '+' : ''}{data.coverageGap} agents
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Day selector tabs
const DayTabs: React.FC<{
  selectedDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}> = ({ selectedDay, onDayChange }) => {
  const days: { key: DayOfWeek; label: string }[] = [
    { key: DayOfWeek.MONDAY, label: 'Mon' },
    { key: DayOfWeek.TUESDAY, label: 'Tue' },
    { key: DayOfWeek.WEDNESDAY, label: 'Wed' },
    { key: DayOfWeek.THURSDAY, label: 'Thu' },
    { key: DayOfWeek.FRIDAY, label: 'Fri' },
    { key: DayOfWeek.SATURDAY, label: 'Sat' },
    { key: DayOfWeek.SUNDAY, label: 'Sun' },
  ];

  return (
    <div className="flex space-x-1 mb-6">
      {days.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onDayChange(key)}
          className={`
            px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${selectedDay === key
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export const ForecastChart: React.FC<ForecastChartProps & { isUpdating?: boolean }> = ({
  height = 400,
  className = '',
  isUpdating = false
}) => {
  const {
    selectedDay,
    setSelectedDay,
    getCurrentDayVolume,
    deflectionParams,
    simulationMode,
    scenarioParams
  } = useForecastStore();

  // Get current day volume data
  const currentDayVolume = getCurrentDayVolume();

  // Calculate chart data
  const chartData: ChartDataPoint[] = useMemo(() => {
    return currentDayVolume.map(volume => {
      const totalContacts = volume.calls + volume.chats + volume.emails;

      // Calculate different staffing scenarios
      const traditionalFTE = calculateStaffingNeeds(totalContacts, 0); // No AI
      const aiAwareFTE = calculateStaffingNeeds(totalContacts, deflectionParams.currentRate);

      // Scenario FTE if in scenario mode
      let scenarioFTE: number | undefined;
      if (simulationMode === 'scenario' && scenarioParams?.currentRate) {
        scenarioFTE = calculateStaffingNeeds(totalContacts, scenarioParams.currentRate);
      }

      // Mock current staffing (would come from real staffing schedule)
      const currentStaffed = Math.ceil(traditionalFTE * 0.85); // 85% coverage

      // Calculate gap (positive = understaffed, negative = overstaffed)
      const coverageGap = traditionalFTE - currentStaffed;

      return {
        hour: `${volume.hour.toString().padStart(2, '0')}:00`,
        traditionalFTE,
        aiAwareFTE,
        scenarioFTE,
        currentStaffed,
        coverageGap,
        gapPositive: coverageGap > 0 ? coverageGap : 0,
        gapNegative: coverageGap < 0 ? Math.abs(coverageGap) : 0,
      };
    });
  }, [currentDayVolume, deflectionParams.currentRate, simulationMode, scenarioParams]);

  const isScenario = simulationMode === 'scenario';

  return (
    <motion.div
      className={`w-full ${className} ${isUpdating ? 'chart-flash' : ''}`}
      animate={isUpdating ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Day Selector */}
      <DayTabs selectedDay={selectedDay} onDayChange={setSelectedDay} />

      {/* Chart Container */}
      <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 data-transition">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Staffing Forecast - {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)}
          </h3>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
              <span className="text-gray-600">Traditional Staffing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-gray-600">AI-Optimized Staffing</span>
            </div>
            <AnimatePresence>
              {isScenario && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-3 h-0.5 bg-purple-500"></div>
                  <span className="text-gray-600">Scenario</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 opacity-60 rounded-sm"></div>
              <span className="text-gray-600">Current Schedule</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 opacity-60 rounded-sm"></div>
              <span className="text-gray-600">Coverage Gap</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="hour"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{ value: 'Agents (FTE)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Coverage gaps (red areas where understaffed) */}
            <Area
              dataKey="gapPositive"
              stackId="gap"
              stroke="none"
              fill="#ef4444"
              fillOpacity={0.3}
            />

            {/* Current staffing bars */}
            <Bar
              dataKey="currentStaffed"
              fill="#10b981"
              fillOpacity={0.6}
              stroke="#10b981"
              strokeWidth={1}
            />

            {/* Traditional forecast line (gray dashed) */}
            <Line
              type="monotone"
              dataKey="traditionalFTE"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              connectNulls
            />

            {/* AI-aware forecast line (blue solid) */}
            <Line
              type="monotone"
              dataKey="aiAwareFTE"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
              connectNulls
            />

            {/* Scenario forecast line (purple solid) - only when scenario active */}
            <AnimatePresence>
              {isScenario && (
                <Line
                  type="monotone"
                  dataKey="scenarioFTE"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                  connectNulls
                />
              )}
            </AnimatePresence>

            {/* Target line at 80% utilization */}
            <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="2 2" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};