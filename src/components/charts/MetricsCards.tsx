import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForecastStore, useSummaryMetrics } from '../../store/forecastStore';
import { calculateStaffingNeeds } from '../../lib/calculations';
import { useCountUp } from '../../hooks/useCountUp';

interface MetricCardProps {
  title: string;
  icon: string;
  currentValue: string | number;
  scenarioValue?: string | number;
  isScenario: boolean;
  changeType?: 'improvement' | 'decline' | 'neutral';
  threshold?: {
    value: number;
    label: string;
  };
  animated?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon,
  currentValue,
  scenarioValue,
  isScenario,
  changeType = 'neutral',
  threshold,
  animated = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState<number>(0);

  // Parse numeric value from string
  const parseNumericValue = (value: string | number): { num: number, prefix: string, suffix: string } => {
    if (typeof value === 'number') return { num: value, prefix: '', suffix: '' };
    const match = value.toString().match(/^([^0-9]*)([\d.]+)(.*)$/);
    if (!match) return { num: 0, prefix: '', suffix: value.toString() };
    return {
      num: parseFloat(match[2]),
      prefix: match[1] || '',
      suffix: match[3] || ''
    };
  };

  const parsed = parseNumericValue(currentValue);
  const animatedValue = useCountUp({
    start: prevValue,
    end: parsed.num,
    duration: 800,
    decimals: parsed.num % 1 !== 0 ? 1 : 0,
    prefix: parsed.prefix,
    suffix: parsed.suffix
  });

  // Update previous value when current value changes
  useEffect(() => {
    setPrevValue(parsed.num);
  }, [currentValue]);

  // Trigger animation when value changes
  useEffect(() => {
    if (animated) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentValue, scenarioValue, animated]);

  const getChangeColor = () => {
    switch (changeType) {
      case 'improvement':
        return 'text-green-400';
      case 'decline':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'improvement':
        return '↗';
      case 'decline':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <motion.div
      className={`
        bg-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden
        ${isAnimating ? 'ring-2 ring-blue-500/50' : ''}
      `}
      animate={isAnimating ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Pulse animation overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="absolute inset-0 bg-blue-500/10 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Value */}
      <div className="space-y-2">
        <motion.div
          key={currentValue?.toString()}
          initial={animated ? { scale: 0.9, opacity: 0.7 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-white"
        >
          {animated && parsed.num > 0 ? animatedValue : currentValue}
        </motion.div>

        {/* Scenario comparison */}
        <AnimatePresence>
          {isScenario && scenarioValue && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center space-x-2 ${getChangeColor()}`}
            >
              <span className="text-lg">{getChangeIcon()}</span>
              <span className="font-semibold">{scenarioValue}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Threshold indicator */}
        {threshold && (
          <div className="text-xs text-gray-500 mt-2">
            Target: {threshold.label}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MetricsCards: React.FC = () => {
  const {
    deflectionParams,
    simulationMode,
    scenarioParams,
    getCurrentDayVolume
  } = useForecastStore();

  const summaryMetrics = useSummaryMetrics();
  const [prevValues, setPrevValues] = useState<any>(null);

  // Track value changes for animations
  useEffect(() => {
    if (prevValues) {
      // Values have changed, trigger animations
    }
    setPrevValues({
      deflectionRate: deflectionParams.currentRate,
      fteSavings: summaryMetrics.fteSavings,
      totalFTE: summaryMetrics.totalAiAwareFTE
    });
  }, [deflectionParams.currentRate, summaryMetrics.fteSavings, summaryMetrics.totalAiAwareFTE]);

  // Calculate current day average SLA
  const currentDayVolume = getCurrentDayVolume();
  const avgSLA = currentDayVolume.length > 0
    ? currentDayVolume.reduce((sum, v) => {
        const totalContacts = v.calls + v.chats + v.emails;
        const traditionalFTE = calculateStaffingNeeds(totalContacts, 0);
        const currentStaffed = Math.ceil(traditionalFTE * 0.9); // Mock current staffing
        const gap = traditionalFTE - currentStaffed;
        let sla = 0.82; // Base SLA
        if (gap > 0) sla = Math.max(0.4, 0.82 - (gap * 0.05));
        else if (gap < 0) sla = Math.min(0.95, 0.82 + (Math.abs(gap) * 0.02));
        return sum + sla;
      }, 0) / currentDayVolume.length
    : 0.82;

  const isScenario = simulationMode === 'scenario';

  // Calculate scenario values
  const baselineDeflection = 0.25; // 25% baseline
  const scenarioDeflection = scenarioParams?.currentRate || deflectionParams.currentRate;

  const scenarioFTE = isScenario ? summaryMetrics.totalAiAwareFTE : null;
  const baselineFTE = summaryMetrics.totalTraditionalFTE;

  const scenarioSLA = isScenario ? Math.min(0.95, avgSLA + 0.05) : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      {/* Card 1 - Deflection Rate */}
      <MetricCard
        title="AI Deflection Rate (%)"
        icon="📈"
        currentValue={`${(deflectionParams.currentRate * 100).toFixed(1)}%`}
        scenarioValue={isScenario ? `${(scenarioDeflection * 100).toFixed(1)}%` : undefined}
        isScenario={isScenario}
        changeType={
          isScenario && scenarioDeflection > baselineDeflection
            ? 'improvement'
            : isScenario && scenarioDeflection < baselineDeflection
            ? 'decline'
            : 'neutral'
        }
        animated={true}
      />

      {/* Card 2 - Staffing Required */}
      <MetricCard
        title="Required FTE (Full-Time Equivalent)"
        icon="👥"
        currentValue={`${summaryMetrics.totalAiAwareFTE} agents`}
        scenarioValue={isScenario ? `${scenarioFTE} agents` : undefined}
        isScenario={isScenario}
        changeType={
          isScenario && scenarioFTE && scenarioFTE < baselineFTE
            ? 'improvement'
            : isScenario && scenarioFTE && scenarioFTE > baselineFTE
            ? 'decline'
            : 'neutral'
        }
        animated={true}
      />

      {/* Card 3 - SLA Forecast */}
      <MetricCard
        title="SLA Performance (Service Level Agreement %)"
        icon="🎯"
        currentValue={`${(avgSLA * 100).toFixed(1)}%`}
        scenarioValue={isScenario ? `${(scenarioSLA! * 100).toFixed(1)}%` : undefined}
        isScenario={isScenario}
        changeType={
          isScenario && scenarioSLA && scenarioSLA > avgSLA
            ? 'improvement'
            : isScenario && scenarioSLA && scenarioSLA < avgSLA
            ? 'decline'
            : 'neutral'
        }
        threshold={{
          value: 80,
          label: '80% SLA target'
        }}
        animated={true}
      />
    </div>
  );
};