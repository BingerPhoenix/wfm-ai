import { DayOfWeek, ContactType } from '../lib/types';
import type {
  ForecastData,
  StaffingMetrics,
  Feature,
  AIDeflectionMetrics,
  WorkforceState,
  HourlyVolume,
  DeflectionParams,
  StaffingRequirements
} from '../lib/types';

export const mockForecastData: ForecastData[] = [
  {
    period: '09:00',
    contactVolume: 45,
    predictedVolume: 48,
    staffRequired: 12,
    currentStaff: 10
  },
  {
    period: '10:00',
    contactVolume: 68,
    predictedVolume: 72,
    staffRequired: 18,
    currentStaff: 15
  },
  {
    period: '11:00',
    contactVolume: 89,
    predictedVolume: 85,
    staffRequired: 22,
    currentStaff: 20
  },
  {
    period: '12:00',
    contactVolume: 112,
    predictedVolume: 108,
    staffRequired: 28,
    currentStaff: 25
  },
  {
    period: '13:00',
    contactVolume: 95,
    predictedVolume: 98,
    staffRequired: 25,
    currentStaff: 22
  },
  {
    period: '14:00',
    contactVolume: 78,
    predictedVolume: 82,
    staffRequired: 21,
    currentStaff: 18
  }
];

export const mockStaffingMetrics: StaffingMetrics[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    department: 'Customer Support',
    shift: 'Morning',
    utilization: 85,
    efficiency: 92,
    availability: true
  },
  {
    id: '2',
    name: 'Bob Smith',
    department: 'Technical Support',
    shift: 'Afternoon',
    utilization: 78,
    efficiency: 88,
    availability: true
  },
  {
    id: '3',
    name: 'Carol Davis',
    department: 'Sales Support',
    shift: 'Evening',
    utilization: 92,
    efficiency: 95,
    availability: false
  },
  {
    id: '4',
    name: 'David Wilson',
    department: 'Customer Support',
    shift: 'Morning',
    utilization: 73,
    efficiency: 81,
    availability: true
  }
];

export const mockFeatures: Feature[] = [
  {
    id: 'forecast-basic',
    name: 'Basic Forecasting',
    description: 'Simple volume prediction based on historical data',
    isLocked: false,
    icon: '📊',
    category: 'forecasting'
  },
  {
    id: 'forecast-advanced',
    name: 'AI-Powered Forecasting',
    description: 'Machine learning based forecasting with multiple variables',
    isLocked: true,
    icon: '🤖',
    category: 'forecasting'
  },
  {
    id: 'schedule-optimizer',
    name: 'Schedule Optimizer',
    description: 'Automatic shift scheduling based on demand patterns',
    isLocked: true,
    icon: '⏰',
    category: 'scheduling'
  },
  {
    id: 'real-time-analytics',
    name: 'Real-time Analytics',
    description: 'Live dashboard with performance metrics',
    isLocked: false,
    icon: '📈',
    category: 'analytics'
  },
  {
    id: 'ai-deflection',
    name: 'AI Deflection Tracking',
    description: 'Monitor AI chatbot performance and deflection rates',
    isLocked: false,
    icon: '🎯',
    category: 'ai-integration'
  },
  {
    id: 'predictive-scaling',
    name: 'Predictive Auto-scaling',
    description: 'Automatically adjust staffing based on predicted demand',
    isLocked: true,
    icon: '⚡',
    category: 'ai-integration'
  }
];

export const mockAIDeflectionMetrics: AIDeflectionMetrics = {
  totalContacts: 1250,
  aiHandled: 875,
  humanEscalation: 375,
  resolutionRate: 82.5,
  avgResponseTime: 1.2
};

export const mockWorkforceState: WorkforceState = {
  currentStaff: 85,
  requiredStaff: 92,
  utilization: 78.5,
  efficiency: 85.2,
  costs: 125420
};

export const quickPrompts = [
  "What's our current AI deflection rate?",
  "How many agents do we need for peak hours?",
  "Show me efficiency trends for this week",
  "What's the cost impact of increasing AI automation?",
  "Predict staffing needs for next Monday"
];

// REALISTIC CONTACT CENTER DATA

// Helper function to calculate realistic hourly volume
const calculateHourlyVolume = (
  hour: number,
  day: DayOfWeek,
  baseMultiplier: number = 1
): { calls: number; chats: number; emails: number } => {
  // Weekend modifier (40% of weekday volume)
  const weekendModifier = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY].includes(day) ? 0.4 : 1;

  // Day of week modifiers - Enhanced for DEMO STORY
  const dayModifiers = {
    [DayOfWeek.MONDAY]: 1.20,     // Post-weekend surge
    [DayOfWeek.TUESDAY]: 1.35,    // DEMO: Major spike - system issues create rush
    [DayOfWeek.WEDNESDAY]: 0.90,  // Recovery day
    [DayOfWeek.THURSDAY]: 0.85,
    [DayOfWeek.FRIDAY]: 0.80,     // Lighter Friday
    [DayOfWeek.SATURDAY]: 0.3,
    [DayOfWeek.SUNDAY]: 0.25,     // Quietest day
  };

  // Hour modifiers for business hours (8am = 8, 9pm = 21)
  const hourModifiers: Record<number, number> = {
    8: 0.6,   // Early start
    9: 0.85,  // Building up
    10: 1.3,  // First peak
    11: 1.25, // Peak continues
    12: 1.0,  // Lunch dip
    13: 0.9,  // Post lunch
    14: 1.3,  // Second peak
    15: 1.25, // Peak continues
    16: 1.1,  // Afternoon
    17: 0.9,  // Early evening
    18: 0.8,  // Evening
    19: 0.7,  // Late evening
    20: 0.6,  // Very late
    21: 0.4,  // Closing
  };

  // Base volume calculation (aiming for ~15,000 total weekly contacts)
  const baseHourlyVolume = 85; // This will scale appropriately

  const totalVolume = Math.round(
    baseHourlyVolume *
    baseMultiplier *
    (dayModifiers[day] || 1) *
    weekendModifier *
    (hourModifiers[hour] || 0.5)
  );

  // Split by contact type: 60% calls, 30% chats, 10% emails
  return {
    calls: Math.round(totalVolume * 0.6),
    chats: Math.round(totalVolume * 0.3),
    emails: Math.round(totalVolume * 0.1),
  };
};

// Generate full week of hourly volume data
export const weeklyVolumeData: HourlyVolume[] = [];

Object.values(DayOfWeek).forEach(day => {
  for (let hour = 8; hour <= 21; hour++) {
    const volume = calculateHourlyVolume(hour, day);
    weeklyVolumeData.push({
      hour,
      dayOfWeek: day,
      ...volume,
    });
  }
});

// Default deflection parameters
export const defaultDeflectionParams: DeflectionParams = {
  currentRate: 0.25, // 25%
  improvementRate: 0.15, // Potential 15% improvement
  byContactType: {
    [ContactType.BILLING]: 0.35,    // 35% - highest deflection
    [ContactType.TECHNICAL]: 0.15,  // 15% - lowest deflection
    [ContactType.GENERAL]: 0.45,    // 45% - highest deflection
    [ContactType.SALES]: 0.10,      // 10% - lowest deflection
  },
};

// Helper function to calculate FTE requirements based on volume
const calculateFTERequirement = (
  totalContacts: number,
  avgHandleTime: number = 8, // minutes
  utilization: number = 0.75,
  shrinkage: number = 0.15
): number => {
  const totalMinutes = totalContacts * avgHandleTime;
  const productiveMinutes = 60 * utilization * (1 - shrinkage);
  return Math.ceil(totalMinutes / productiveMinutes);
};

// Current staffing schedule with realistic distribution
export const currentStaffingSchedule: StaffingRequirements[] = [];

Object.values(DayOfWeek).forEach(day => {
  for (let hour = 8; hour <= 21; hour++) {
    // Find corresponding volume data
    const volumeData = weeklyVolumeData.find(v => v.hour === hour && v.dayOfWeek === day);
    const totalVolume = volumeData ? volumeData.calls + volumeData.chats + volumeData.emails : 0;

    // Calculate traditional FTE requirement
    const traditionalFTE = calculateFTERequirement(totalVolume);

    // Calculate AI-aware FTE (with 25% deflection)
    const deflectedVolume = totalVolume * defaultDeflectionParams.currentRate;
    const remainingVolume = totalVolume - deflectedVolume;
    const aiAwareFTE = calculateFTERequirement(remainingVolume);

    // Current staffing based on shift patterns
    let currentStaffed = 0;

    // Morning shift (8am-12pm): 24 agents
    if (hour >= 8 && hour < 12) {
      currentStaffed = 24;
    }
    // Midday shift (12pm-5pm): 38 agents
    else if (hour >= 12 && hour < 17) {
      currentStaffed = 38;
    }
    // Evening shift (5pm-9pm): 20 agents
    else if (hour >= 17 && hour <= 21) {
      currentStaffed = 20;
    }

    // Add overlap during peaks (10-11am and 2-3pm)
    if ((hour === 10 || hour === 11) || (hour === 14 || hour === 15)) {
      currentStaffed += 8; // Additional coverage during peaks
    }

    // Apply coverage gaps for demonstration
    let coverageGap = traditionalFTE - currentStaffed;

    // DEMO STORY: Enhanced gaps for compelling narrative
    if (day === DayOfWeek.TUESDAY && (hour >= 9 && hour <= 12)) {
      // Tuesday morning crisis - system outage causes surge
      coverageGap = hour === 10 || hour === 11 ? 8 : 6; // Severe understaffing
      currentStaffed = traditionalFTE - coverageGap;
    } else if (day === DayOfWeek.MONDAY && (hour === 10 || hour === 11)) {
      coverageGap = 4; // Monday rush gap
      currentStaffed = traditionalFTE - 4;
    } else if (day === DayOfWeek.THURSDAY && (hour === 14 || hour === 15)) {
      coverageGap = 3; // Minor Thursday afternoon gap
      currentStaffed = traditionalFTE - 3;
    } else if (day === DayOfWeek.WEDNESDAY && (hour === 18 || hour === 19)) {
      coverageGap = -5; // Wednesday evening overstaffing
      currentStaffed = traditionalFTE + 5;
    }

    // Calculate projected SLA based on staffing adequacy
    let projectedSLA = 0.85; // Base SLA target
    if (coverageGap > 0) {
      // Understaffed - SLA drops
      projectedSLA = Math.max(0.4, 0.85 - (coverageGap * 0.05));
    } else if (coverageGap < 0) {
      // Overstaffed - SLA improves
      projectedSLA = Math.min(0.95, 0.85 + (Math.abs(coverageGap) * 0.02));
    }

    currentStaffingSchedule.push({
      hour,
      traditionalFTE,
      aiAwareFTE,
      currentStaffed,
      coverageGap,
      projectedSLA: Math.round(projectedSLA * 100) / 100, // Round to 2 decimal places
    });
  }
});

// Summary metrics for validation
export const weeklyTotals = {
  totalContacts: weeklyVolumeData.reduce((sum, h) => sum + h.calls + h.chats + h.emails, 0),
  totalCalls: weeklyVolumeData.reduce((sum, h) => sum + h.calls, 0),
  totalChats: weeklyVolumeData.reduce((sum, h) => sum + h.chats, 0),
  totalEmails: weeklyVolumeData.reduce((sum, h) => sum + h.emails, 0),
  totalFTEHours: currentStaffingSchedule.reduce((sum, s) => sum + s.currentStaffed, 0),
  avgWeeklyFTE: Math.round(currentStaffingSchedule.reduce((sum, s) => sum + s.currentStaffed, 0) / currentStaffingSchedule.length),
};