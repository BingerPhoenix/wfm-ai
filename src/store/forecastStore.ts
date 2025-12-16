import { create } from 'zustand';
import { DayOfWeek, ContactType } from '../lib/types';
import type {
  HourlyVolume,
  DeflectionParams,
  StaffingRequirements,
  ChatMessage
} from '../lib/types';
import {
  calculateHourlyCoverage,
  calculateStaffingNeeds,
  findCoverageGaps,
  compareForecasts,
  type CoverageGap,
  type ForecastComparison
} from '../lib/calculations';
import {
  weeklyVolumeData,
  defaultDeflectionParams,
  currentStaffingSchedule
} from '../data/mockData';

interface ForecastStore {
  // State
  weeklyVolume: HourlyVolume[];
  deflectionParams: DeflectionParams;
  staffingData: StaffingRequirements[];
  chatHistory: ChatMessage[];
  selectedDay: DayOfWeek;
  isLoading: boolean;
  simulationMode: 'current' | 'scenario';
  scenarioParams: Partial<DeflectionParams> | null;

  // Actions
  setDeflectionRate: (rate: number) => void;
  setDeflectionByType: (type: ContactType, rate: number) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setSelectedDay: (day: DayOfWeek) => void;
  runScenario: (newDeflection: number) => void;
  resetToBaseline: () => void;
  updateChartsFromChat: (chartUpdate: string) => void;

  // Computed selectors
  getCurrentDayVolume: () => HourlyVolume[];
  getTotalWeeklyContacts: () => number;
  getCurrentStaffingGaps: () => CoverageGap[];
  getTraditionalVsAiComparison: () => ForecastComparison;
}

// Helper function to recalculate staffing data
const recalculateStaffingData = (
  weeklyVolume: HourlyVolume[],
  deflectionParams: DeflectionParams
): StaffingRequirements[] => {
  // Get current staffing levels from the original schedule
  const currentStaffingLevels = currentStaffingSchedule.map(s => s.currentStaffed);

  return calculateHourlyCoverage(
    weeklyVolume,
    deflectionParams.currentRate,
    currentStaffingLevels
  );
};

export const useForecastStore = create<ForecastStore>((set, get) => ({
  // Initial state
  weeklyVolume: weeklyVolumeData,
  deflectionParams: { ...defaultDeflectionParams },
  staffingData: currentStaffingSchedule,
  chatHistory: [],
  selectedDay: DayOfWeek.MONDAY,
  isLoading: false,
  simulationMode: 'current',
  scenarioParams: null,

  // Actions
  setDeflectionRate: (rate: number) => {
    set(state => {
      const newDeflectionParams = {
        ...state.deflectionParams,
        currentRate: Math.max(0, Math.min(1, rate)) // Clamp between 0 and 1
      };

      const newStaffingData = recalculateStaffingData(
        state.weeklyVolume,
        newDeflectionParams
      );

      return {
        deflectionParams: newDeflectionParams,
        staffingData: newStaffingData,
        simulationMode: 'scenario',
        scenarioParams: { currentRate: newDeflectionParams.currentRate }
      };
    });
  },

  setDeflectionByType: (type: ContactType, rate: number) => {
    set(state => {
      const clampedRate = Math.max(0, Math.min(1, rate));
      const newDeflectionParams = {
        ...state.deflectionParams,
        byContactType: {
          ...state.deflectionParams.byContactType,
          [type]: clampedRate
        }
      };

      const newStaffingData = recalculateStaffingData(
        state.weeklyVolume,
        newDeflectionParams
      );

      return {
        deflectionParams: newDeflectionParams,
        staffingData: newStaffingData,
        simulationMode: 'scenario',
        scenarioParams: { byContactType: newDeflectionParams.byContactType }
      };
    });
  },

  addChatMessage: (message: ChatMessage) => {
    set(state => ({
      chatHistory: [...state.chatHistory, message]
    }));
  },

  clearChat: () => {
    set({ chatHistory: [] });
  },

  setSelectedDay: (day: DayOfWeek) => {
    set({ selectedDay: day });
  },

  runScenario: (newDeflection: number) => {
    set(state => {
      set({ isLoading: true });

      // Simulate async calculation
      setTimeout(() => {
        const clampedDeflection = Math.max(0, Math.min(1, newDeflection));
        const scenarioDeflectionParams = {
          ...state.deflectionParams,
          currentRate: clampedDeflection
        };

        const newStaffingData = recalculateStaffingData(
          state.weeklyVolume,
          scenarioDeflectionParams
        );

        set({
          deflectionParams: scenarioDeflectionParams,
          staffingData: newStaffingData,
          simulationMode: 'scenario',
          scenarioParams: { currentRate: clampedDeflection },
          isLoading: false
        });
      }, 500); // 500ms delay to show loading state

      return {
        isLoading: true
      };
    });
  },

  resetToBaseline: () => {
    set({
      deflectionParams: { ...defaultDeflectionParams },
      staffingData: [...currentStaffingSchedule],
      simulationMode: 'current',
      scenarioParams: null,
      isLoading: false
    });
  },

  updateChartsFromChat: (chartUpdate: string) => {
    const state = get();

    // Parse chart update instruction and trigger appropriate updates
    // This is a simplified implementation - could be expanded with NLP
    if (chartUpdate.toLowerCase().includes('deflection')) {
      // Extract deflection rate if mentioned
      const deflectionMatch = chartUpdate.match(/(\d+)%/);
      if (deflectionMatch) {
        const newRate = parseInt(deflectionMatch[1]) / 100;
        get().setDeflectionRate(newRate);
      }
    } else if (chartUpdate.toLowerCase().includes('scenario')) {
      // Default scenario with 35% deflection
      get().runScenario(0.35);
    } else if (chartUpdate.toLowerCase().includes('reset') ||
               chartUpdate.toLowerCase().includes('baseline')) {
      get().resetToBaseline();
    }

    // Add a system message to chat about the chart update
    const updateMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `Charts updated based on: ${chartUpdate}`,
      timestamp: new Date(),
      chartUpdate: true
    };

    get().addChatMessage(updateMessage);
  },

  // Computed selectors
  getCurrentDayVolume: () => {
    const state = get();
    return state.weeklyVolume.filter(
      volume => volume.dayOfWeek === state.selectedDay
    );
  },

  getTotalWeeklyContacts: () => {
    const state = get();
    return state.weeklyVolume.reduce(
      (total, volume) => total + volume.calls + volume.chats + volume.emails,
      0
    );
  },

  getCurrentStaffingGaps: () => {
    const state = get();
    const currentDayData = state.staffingData.filter((_, index) => {
      const correspondingVolume = state.weeklyVolume[index];
      return correspondingVolume?.dayOfWeek === state.selectedDay;
    });

    return findCoverageGaps(currentDayData);
  },

  getTraditionalVsAiComparison: () => {
    const state = get();
    const currentDayVolume = state.getCurrentDayVolume();

    return compareForecasts(
      currentDayVolume,
      state.deflectionParams.currentRate
    );
  }
}));

// Helper hooks for easier access to computed values
export const useCurrentDayVolume = () => {
  return useForecastStore(state => state.getCurrentDayVolume());
};

export const useTotalWeeklyContacts = () => {
  return useForecastStore(state => state.getTotalWeeklyContacts());
};

export const useCurrentStaffingGaps = () => {
  return useForecastStore(state => state.getCurrentStaffingGaps());
};

export const useTraditionalVsAiComparison = () => {
  return useForecastStore(state => state.getTraditionalVsAiComparison());
};

// Selector for chart data
export const useChartData = () => {
  const state = useForecastStore();
  const currentDayVolume = state.getCurrentDayVolume();
  const currentDayStaffing = state.staffingData.filter((_, index) => {
    const correspondingVolume = state.weeklyVolume[index];
    return correspondingVolume?.dayOfWeek === state.selectedDay;
  });

  return {
    volumeData: currentDayVolume,
    staffingData: currentDayStaffing,
    deflectionParams: state.deflectionParams,
    isScenario: state.simulationMode === 'scenario',
    gaps: state.getCurrentStaffingGaps()
  };
};

// Selector for summary metrics
export const useSummaryMetrics = () => {
  const state = useForecastStore();
  const totalContacts = state.getTotalWeeklyContacts();
  const deflectedContacts = Math.round(totalContacts * state.deflectionParams.currentRate);
  const remainingContacts = totalContacts - deflectedContacts;

  // Calculate total FTE requirements
  const totalTraditionalFTE = state.staffingData.reduce(
    (sum, req) => sum + req.traditionalFTE, 0
  );
  const totalAiAwareFTE = state.staffingData.reduce(
    (sum, req) => sum + req.aiAwareFTE, 0
  );
  const fteSavings = totalTraditionalFTE - totalAiAwareFTE;
  const costSavings = fteSavings * 50000; // $50k per agent per year

  return {
    totalContacts,
    deflectedContacts,
    remainingContacts,
    deflectionRate: state.deflectionParams.currentRate,
    totalTraditionalFTE,
    totalAiAwareFTE,
    fteSavings,
    costSavings,
    isScenario: state.simulationMode === 'scenario'
  };
};