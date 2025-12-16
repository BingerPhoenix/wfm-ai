// Enums
export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

export enum ContactType {
  BILLING = 'billing',
  TECHNICAL = 'technical',
  GENERAL = 'general',
  SALES = 'sales'
}

export enum QueryIntent {
  DEFLECTION_SCENARIO = 'deflection_scenario',
  COVERAGE_ANALYSIS = 'coverage_analysis',
  FORECAST_QUERY = 'forecast_query',
  COMPARISON = 'comparison',
  STAFFING_IMPACT = 'staffing_impact',
  COST_ANALYSIS = 'cost_analysis',
  RECOMMENDATION = 'recommendation'
}

// Core WFM Interfaces
export interface HourlyVolume {
  hour: number;
  dayOfWeek: DayOfWeek;
  calls: number;
  chats: number;
  emails: number;
}

export interface DeflectionParams {
  currentRate: number;
  improvementRate: number;
  byContactType: Record<ContactType, number>;
}

export interface StaffingRequirements {
  hour: number;
  traditionalFTE: number;
  aiAwareFTE: number;
  currentStaffed: number;
  coverageGap: number;
  projectedSLA: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chartUpdate?: boolean;
}

export interface ForecastState {
  weeklyVolume: HourlyVolume[];
  deflectionParams: DeflectionParams;
  staffingData: StaffingRequirements[];
  chatHistory: ChatMessage[];
  selectedDay: DayOfWeek;
}

export interface SimulationResult {
  totalVolume: number;
  deflectedVolume: number;
  remainingVolume: number;
  traditionalFTERequired: number;
  aiAwareFTERequired: number;
  fteSavings: number;
  costSavings: number;
  slaImpact: number;
  confidence: number;
}

// Legacy interfaces - keeping for backward compatibility
export interface ForecastData {
  period: string;
  contactVolume: number;
  predictedVolume: number;
  staffRequired: number;
  currentStaff: number;
}

export interface StaffingMetrics {
  id: string;
  name: string;
  department: string;
  shift: string;
  utilization: number;
  efficiency: number;
  availability: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  isLocked: boolean;
  icon: string;
  category: string;
}

export interface AIDeflectionMetrics {
  totalContacts: number;
  aiHandled: number;
  humanEscalation: number;
  resolutionRate: number;
  avgResponseTime: number;
}

export interface WorkforceState {
  currentStaff: number;
  requiredStaff: number;
  utilization: number;
  efficiency: number;
  costs: number;
}

export type FeatureCategory = 'forecasting' | 'scheduling' | 'analytics' | 'ai-integration';