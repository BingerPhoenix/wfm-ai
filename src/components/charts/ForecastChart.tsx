import React, { useState, useEffect, useMemo } from 'react';
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
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DataExtractors, SyntheticDataLoader } from '../../lib/dataLoader';
import { useForecastStore } from '../../store/forecastStore';
import type { VolumeRecord } from '../../lib/dataLoader';

interface ForecastChartProps {
  height?: number;
  className?: string;
  selectedDate?: string;
  showAnomalies?: boolean;
  enableDateSelection?: boolean;
}

interface ChartDataPoint {
  hour: string;
  demand: number;
  traditionalStaffing: number;
  aiOptimizedStaffing: number;
  actualStaffed: number;
  coverageGap: number;
  gapPositive?: number;
  gapNegative?: number;
  volume: number;
  isAnomaly?: boolean;
  anomalyType?: string;
}

interface Anomaly {
  date: string;
  type: 'outage' | 'viral' | 'campaign' | 'bot_failure';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  height = 400,
  className = '',
  selectedDate = '2024-11-26', // Default to a Tuesday with gaps
  showAnomalies = true,
  enableDateSelection = false
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const { deflectionParams } = useForecastStore();

  // Load real synthetic data
  useEffect(() => {
    const loadChartData = async () => {
      setIsLoading(true);
      try {
        const [volumeData, staffingAnalysis, anomalyData] = await Promise.all([
          DataExtractors.getHourlyPattern(currentDate),
          DataExtractors.getStaffingAnalysis(currentDate),
          DataExtractors.getAnomalies()
        ]);

        // Check if current date has an anomaly
        const dateAnomaly = anomalyData.find(a => a.date === currentDate);

        const chartPoints: ChartDataPoint[] = staffingAnalysis.map((staff, index) => {
          const volume = volumeData[index];
          const totalVolume = volume ? volume.calls + volume.chats + volume.emails : 0;

          // Calculate traditional staffing (no AI)
          const traditionalDemand = Math.ceil(totalVolume / 6); // 6 contacts per agent per hour (no AI help)

          // Calculate AI-optimized staffing
          const deflectionRate = deflectionParams.currentRate || 0.27;
          const effectiveVolume = totalVolume * (1 - deflectionRate);
          const aiOptimizedDemand = Math.ceil(effectiveVolume / 8); // 8 contacts per agent with AI support

          const coverageGap = staff.actual - aiOptimizedDemand;

          return {
            hour: staff.hour,
            demand: aiOptimizedDemand,
            traditionalStaffing: traditionalDemand,
            aiOptimizedStaffing: aiOptimizedDemand,
            actualStaffed: staff.actual,
            coverageGap,
            gapPositive: coverageGap > 0 ? coverageGap : 0,
            gapNegative: coverageGap < 0 ? Math.abs(coverageGap) : 0,
            volume: totalVolume,
            isAnomaly: !!dateAnomaly,
            anomalyType: dateAnomaly?.type
          };
        });

        setChartData(chartPoints);
        setAnomalies(anomalyData);
      } catch (error) {
        console.error('Failed to load chart data:', error);
        // Fallback to empty data
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartData();
  }, [currentDate, deflectionParams.currentRate]);

  // Memoized chart configuration
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    bars: [
      { dataKey: 'gapNegative', fill: '#EF4444', name: 'Understaffed', stackId: 'gap' },
      { dataKey: 'gapPositive', fill: '#10B981', name: 'Overstaffed', stackId: 'gap' }
    ],
    lines: [
      { dataKey: 'traditionalStaffing', stroke: '#6B7280', strokeWidth: 2, strokeDasharray: '5 5', name: 'Traditional (No AI)' },
      { dataKey: 'aiOptimizedStaffing', stroke: '#3B82F6', strokeWidth: 3, name: 'AI-Optimized Target' },
      { dataKey: 'actualStaffed', stroke: '#10B981', strokeWidth: 2, name: 'Actually Scheduled' }
    ]
  }), []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload as ChartDataPoint;

    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg min-w-72">
        <h3 className="text-white font-semibold mb-2 flex items-center">
          {label}
          {data.isAnomaly && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded">
              {data.anomalyType?.toUpperCase()}
            </span>
          )}
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Contact Volume:</span>
            <span className="text-white font-mono">{data.volume} contacts</span>
          </div>
          <div className="border-t border-gray-600 pt-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Traditional (No AI):</span>
              <span className="text-gray-300 font-mono">{data.traditionalStaffing} agents</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-300">AI-Optimized Target:</span>
              <span className="text-blue-400 font-mono">{data.aiOptimizedStaffing} agents</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-300">Actually Scheduled:</span>
              <span className="text-green-400 font-mono">{data.actualStaffed} agents</span>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Coverage Gap:</span>
              <span className={`font-mono ${
                data.coverageGap > 0
                  ? 'text-green-400'
                  : data.coverageGap < 0
                    ? 'text-red-400'
                    : 'text-gray-400'
              }`}>
                {data.coverageGap > 0 ? '+' : ''}{data.coverageGap} agents
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Date selection handler
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(event.target.value);
  };

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading real data...</span>
        </div>
      </div>
    );
  }

  const currentAnomaly = anomalies.find(a => a.date === currentDate);

  return (
    <div className={className}>
      {/* Header with date selection */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Hourly Staffing Analysis
          </h3>
          <p className="text-sm text-gray-400">
            Real data for {new Date(currentDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {enableDateSelection && (
          <div className="flex items-center space-x-2">
            <label htmlFor="date-picker" className="text-sm text-gray-300">Date:</label>
            <input
              id="date-picker"
              type="date"
              value={currentDate}
              onChange={handleDateChange}
              min="2024-01-01"
              max="2024-12-31"
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
        )}
      </div>

      {/* Anomaly alert */}
      {currentAnomaly && showAnomalies && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded-lg border-l-4 ${
            currentAnomaly.impact === 'high'
              ? 'bg-red-500/10 border-red-500 text-red-300'
              : 'bg-yellow-500/10 border-yellow-500 text-yellow-300'
          }`}
        >
          <div className="flex items-center">
            <span className="font-semibold mr-2">⚠️ Anomaly Detected:</span>
            {currentAnomaly.description}
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={chartConfig.margin}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="hour"
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{ value: 'Agents (FTE)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#9CA3AF' }}
            />

            {/* Coverage gap bars */}
            {chartConfig.bars.map(bar => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.fill}
                name={bar.name}
                stackId={bar.stackId}
                radius={[2, 2, 0, 0]}
              />
            ))}

            {/* Staffing lines */}
            {chartConfig.lines.map(line => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                strokeDasharray={line.strokeDasharray}
                name={line.name}
                dot={{ r: 3, fill: line.stroke }}
                connectNulls
              />
            ))}

            {/* Reference line for optimal staffing */}
            <ReferenceLine
              y={0}
              stroke="#6B7280"
              strokeDasharray="2 2"
              label={{ value: "Perfect Coverage", position: "left", fill: "#9CA3AF" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
      >
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400">Total Volume</div>
          <div className="text-xl font-semibold text-white">
            {chartData.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">contacts</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400">Avg Coverage Gap</div>
          <div className={`text-xl font-semibold ${
            chartData.length > 0 && chartData.reduce((sum, d) => sum + d.coverageGap, 0) / chartData.length < 0
              ? 'text-red-400'
              : 'text-green-400'
          }`}>
            {chartData.length > 0
              ? (chartData.reduce((sum, d) => sum + d.coverageGap, 0) / chartData.length).toFixed(1)
              : '0.0'
            }
          </div>
          <div className="text-xs text-gray-500">agents</div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400">AI Efficiency</div>
          <div className="text-xl font-semibold text-blue-400">
            {chartData.length > 0
              ? Math.round((1 - chartData.reduce((sum, d) => sum + d.aiOptimizedStaffing, 0) / chartData.reduce((sum, d) => sum + d.traditionalStaffing, 0)) * 100)
              : 0
            }%
          </div>
          <div className="text-xs text-gray-500">reduction vs traditional</div>
        </div>
      </motion.div>
    </div>
  );
};