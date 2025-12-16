import type {
  ForecastData,
  StaffingMetrics,
  AIDeflectionMetrics,
  HourlyVolume,
  StaffingRequirements
} from './types';

// Interfaces for calculation results
export interface DeflectionImpact {
  staffingChange: number;
  percentReduction: number;
  costSavings: number;
}

export interface CoverageGap {
  hour: number;
  gap: number; // positive = understaffed, negative = overstaffed
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'gap' | 'surplus';
}

export interface ForecastComparison {
  hourlyTraditional: StaffingRequirements[];
  hourlyAiAware: StaffingRequirements[];
  dailyTotalTraditional: number;
  dailyTotalAiAware: number;
  dailyDifference: number;
}

// 1. Calculate staffing needs using Erlang C principles (simplified)
export const calculateStaffingNeeds = (
  contactVolume: number,
  deflectionRate: number = 0,
  avgHandleTime: number = 6, // minutes
  targetSLA: number = 0.80,
  shrinkage: number = 0.30
): number => {
  if (contactVolume <= 0) return 0;

  // Apply deflection to reduce volume
  const actualVolume = contactVolume * (1 - deflectionRate);

  // Convert to workload in hours
  const workloadMinutes = actualVolume * avgHandleTime;
  const workloadHours = workloadMinutes / 60;

  // Apply utilization (productive time after shrinkage)
  const utilization = 1 - shrinkage;

  // Base staffing calculation
  let baseStaff = workloadHours / utilization;

  // Erlang C adjustment for service level
  // Simplified formula: higher SLA requires more buffer
  const slaMultiplier = targetSLA <= 0.80 ? 1.1 :
                       targetSLA <= 0.85 ? 1.15 :
                       targetSLA <= 0.90 ? 1.20 : 1.25;

  // Additional buffer for small volumes (less than 10 contacts)
  const volumeBuffer = actualVolume < 10 ? 1.2 : 1.0;

  const requiredStaff = baseStaff * slaMultiplier * volumeBuffer;

  return Math.ceil(Math.max(1, requiredStaff)); // Minimum 1 agent
};

// 2. Calculate deflection impact
export const calculateDeflectionImpact = (
  currentDeflection: number,
  newDeflection: number,
  currentStaffing: number
): DeflectionImpact => {
  const deflectionIncrease = newDeflection - currentDeflection;
  const percentReduction = deflectionIncrease * 100;

  // Calculate staffing change (simplified - assumes linear relationship)
  const staffingReduction = Math.floor(currentStaffing * deflectionIncrease);
  const annualCostPerAgent = 50000; // $50k per agent per year
  const costSavings = staffingReduction * annualCostPerAgent;

  return {
    staffingChange: -staffingReduction, // negative = reduction
    percentReduction,
    costSavings
  };
};

// 3. Calculate hourly coverage
export const calculateHourlyCoverage = (
  hourlyVolume: HourlyVolume[],
  deflectionRate: number,
  currentStaffing: number[]
): StaffingRequirements[] => {
  return hourlyVolume.map((volume, index) => {
    const totalContacts = volume.calls + volume.chats + volume.emails;
    const traditionalFTE = calculateStaffingNeeds(totalContacts, 0);
    const aiAwareFTE = calculateStaffingNeeds(totalContacts, deflectionRate);
    const currentStaffed = currentStaffing[index] || 0;
    const coverageGap = traditionalFTE - currentStaffed;

    // Calculate projected SLA based on staffing adequacy
    let projectedSLA = 0.80; // Base target
    if (coverageGap > 0) {
      // Understaffed - SLA degrades
      projectedSLA = Math.max(0.30, 0.80 - (coverageGap * 0.05));
    } else if (coverageGap < 0) {
      // Overstaffed - SLA improves
      projectedSLA = Math.min(0.95, 0.80 + (Math.abs(coverageGap) * 0.02));
    }

    return {
      hour: volume.hour,
      traditionalFTE,
      aiAwareFTE,
      currentStaffed,
      coverageGap,
      projectedSLA: Math.round(projectedSLA * 100) / 100
    };
  });
};

// 4. Compare forecasts (traditional vs AI-aware)
export const compareForecasts = (
  hourlyVolume: HourlyVolume[],
  currentDeflection: number
): ForecastComparison => {
  const hourlyTraditional: StaffingRequirements[] = [];
  const hourlyAiAware: StaffingRequirements[] = [];

  hourlyVolume.forEach(volume => {
    const totalContacts = volume.calls + volume.chats + volume.emails;

    // Traditional staffing (no AI deflection)
    const traditionalFTE = calculateStaffingNeeds(totalContacts, 0);
    hourlyTraditional.push({
      hour: volume.hour,
      traditionalFTE,
      aiAwareFTE: traditionalFTE, // Same as traditional for this array
      currentStaffed: traditionalFTE,
      coverageGap: 0,
      projectedSLA: 0.80
    });

    // AI-aware staffing
    const aiAwareFTE = calculateStaffingNeeds(totalContacts, currentDeflection);
    hourlyAiAware.push({
      hour: volume.hour,
      traditionalFTE,
      aiAwareFTE,
      currentStaffed: aiAwareFTE,
      coverageGap: 0,
      projectedSLA: 0.80
    });
  });

  const dailyTotalTraditional = hourlyTraditional.reduce((sum, h) => sum + h.traditionalFTE, 0);
  const dailyTotalAiAware = hourlyAiAware.reduce((sum, h) => sum + h.aiAwareFTE, 0);
  const dailyDifference = dailyTotalTraditional - dailyTotalAiAware;

  return {
    hourlyTraditional,
    hourlyAiAware,
    dailyTotalTraditional,
    dailyTotalAiAware,
    dailyDifference
  };
};

// 5. Find coverage gaps
export const findCoverageGaps = (
  staffingRequirements: StaffingRequirements[]
): CoverageGap[] => {
  const gaps: CoverageGap[] = [];

  staffingRequirements.forEach(requirement => {
    const gap = requirement.coverageGap;

    if (gap === 0) return; // No gap

    // Determine severity based on gap size
    const absGap = Math.abs(gap);
    let severity: 'low' | 'medium' | 'high' | 'critical';

    if (absGap <= 2) severity = 'low';
    else if (absGap <= 4) severity = 'medium';
    else if (absGap <= 7) severity = 'high';
    else severity = 'critical';

    gaps.push({
      hour: requirement.hour,
      gap,
      severity,
      type: gap > 0 ? 'gap' : 'surplus'
    });
  });

  return gaps;
};

// Legacy functions - keeping for backward compatibility
export const calculateStaffingRequirement = (
  contactVolume: number,
  avgHandleTime: number,
  serviceLevel: number = 0.8,
  targetAnswerTime: number = 20
): number => {
  return calculateStaffingNeeds(contactVolume, 0, avgHandleTime / 60, serviceLevel);
};

export const calculateUtilization = (
  actualWork: number,
  availableTime: number
): number => {
  return Math.min((actualWork / availableTime) * 100, 100);
};

export const calculateEfficiency = (
  completedTasks: number,
  expectedTasks: number
): number => {
  return Math.min((completedTasks / expectedTasks) * 100, 100);
};

export const calculateAIDeflectionRate = (
  aiHandled: number,
  totalContacts: number
): number => {
  return (aiHandled / totalContacts) * 100;
};

export const calculateCostSavings = (
  aiDeflectionMetrics: AIDeflectionMetrics,
  avgAgentCostPerContact: number
): number => {
  return aiDeflectionMetrics.aiHandled * avgAgentCostPerContact;
};

export const forecastVolume = (
  historicalData: number[],
  periods: number = 7
): number[] => {
  const windowSize = Math.min(3, historicalData.length);
  const forecast: number[] = [];

  for (let i = 0; i < periods; i++) {
    const recent = historicalData.slice(-windowSize);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    forecast.push(Math.round(avg * (0.95 + Math.random() * 0.1)));
    historicalData.push(forecast[i]);
  }

  return forecast;
};

// UNIT TESTS
export const runCalculationTests = () => {
  // console.log('Running WFM Calculation Tests...\n');

  // Test 1: calculateStaffingNeeds
  // console.log('Test 1: calculateStaffingNeeds');
  const test1Result = calculateStaffingNeeds(100, 0.25, 8, 0.80, 0.30);
  // console.log(`Input: 100 contacts, 25% deflection, 8min AHT, 80% SLA, 30% shrinkage`);
  // console.log(`Expected: ~3-4 agents, Actual: ${test1Result}\n`);

  // Test 2: calculateDeflectionImpact
  // console.log('Test 2: calculateDeflectionImpact');
  const test2Result = calculateDeflectionImpact(0.25, 0.40, 50);
  // console.log(`Input: 25% to 40% deflection increase, 50 current agents`);
  // console.log(`Expected: ~7-8 agent reduction, Actual: ${JSON.stringify(test2Result)}\n`);

  // Test 3: findCoverageGaps
  // console.log('Test 3: findCoverageGaps');
  const mockStaffing: StaffingRequirements[] = [
    { hour: 9, traditionalFTE: 10, aiAwareFTE: 8, currentStaffed: 6, coverageGap: 4, projectedSLA: 0.75 },
    { hour: 10, traditionalFTE: 15, aiAwareFTE: 12, currentStaffed: 18, coverageGap: -3, projectedSLA: 0.88 },
    { hour: 11, traditionalFTE: 12, aiAwareFTE: 9, currentStaffed: 12, coverageGap: 0, projectedSLA: 0.80 }
  ];
  const test3Result = findCoverageGaps(mockStaffing);
  // console.log(`Input: 3 hours with gaps [4, -3, 0]`);
  // console.log(`Expected: 2 gaps found, Actual: ${test3Result.length} gaps`);
  // console.log(`Details: ${JSON.stringify(test3Result, null, 2)}\n`);

  // Test 4: compareForecasts
  // console.log('Test 4: compareForecasts');
  const mockVolume: HourlyVolume[] = [
    { hour: 9, dayOfWeek: 'monday' as any, calls: 60, chats: 30, emails: 10 },
    { hour: 10, dayOfWeek: 'monday' as any, calls: 90, chats: 45, emails: 15 }
  ];
  const test4Result = compareForecasts(mockVolume, 0.30);
  // console.log(`Input: 2 hours, 100 and 150 contacts, 30% deflection`);
  // console.log(`Traditional total: ${test4Result.dailyTotalTraditional}, AI-aware total: ${test4Result.dailyTotalAiAware}`);
  // console.log(`Savings: ${test4Result.dailyDifference} agents\n`);

  // console.log('All tests completed!');
};