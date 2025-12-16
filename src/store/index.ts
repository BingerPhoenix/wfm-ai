import { create } from 'zustand';
import type {
  ChatMessage,
  ForecastData,
  StaffingMetrics,
  Feature,
  AIDeflectionMetrics,
  WorkforceState
} from '../lib/types';

interface AppState {
  // Chat state
  messages: ChatMessage[];
  isLoading: boolean;

  // Workforce data
  forecastData: ForecastData[];
  staffingMetrics: StaffingMetrics[];
  workforceState: WorkforceState;
  aiDeflectionMetrics: AIDeflectionMetrics;

  // Features
  features: Feature[];

  // Actions
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setForecastData: (data: ForecastData[]) => void;
  setStaffingMetrics: (metrics: StaffingMetrics[]) => void;
  setWorkforceState: (state: WorkforceState) => void;
  setAIDeflectionMetrics: (metrics: AIDeflectionMetrics) => void;
  setFeatures: (features: Feature[]) => void;
  toggleFeature: (featureId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  messages: [],
  isLoading: false,
  forecastData: [],
  staffingMetrics: [],
  workforceState: {
    currentStaff: 0,
    requiredStaff: 0,
    utilization: 0,
    efficiency: 0,
    costs: 0
  },
  aiDeflectionMetrics: {
    totalContacts: 0,
    aiHandled: 0,
    humanEscalation: 0,
    resolutionRate: 0,
    avgResponseTime: 0
  },
  features: [],

  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setForecastData: (data) =>
    set({ forecastData: data }),

  setStaffingMetrics: (metrics) =>
    set({ staffingMetrics: metrics }),

  setWorkforceState: (workforceState) =>
    set({ workforceState }),

  setAIDeflectionMetrics: (metrics) =>
    set({ aiDeflectionMetrics: metrics }),

  setFeatures: (features) =>
    set({ features }),

  toggleFeature: (featureId) =>
    set((state) => ({
      features: state.features.map(feature =>
        feature.id === featureId
          ? { ...feature, isLocked: !feature.isLocked }
          : feature
      )
    }))
}));