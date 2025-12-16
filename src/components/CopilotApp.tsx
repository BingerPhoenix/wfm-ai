import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { MainContent } from './layout/MainContent';
import { ChatInterface } from './chat/ChatInterface';
import { ForecastChart } from './charts/ForecastChart';
import { MetricsCards } from './charts/MetricsCards';
import { FeatureModal } from './landing/FeatureModal';
import { useChat } from '../hooks/useChat';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useForecastStore } from '../store/forecastStore';
import { getUrlModeParams } from '../data/demoConversation';
import { quickPrompts } from '../data/mockData';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: string;
  longDescription?: string;
}

// Extended feature data with long descriptions for modals
const extendedFeatures: Record<string, Feature> = {
  forecasting: {
    id: 'forecasting',
    name: 'AI-Aware Forecasting Dashboard',
    description: 'Upload data, get AI-adjusted forecasts',
    icon: '📊',
    available: false,
    comingSoon: 'Q2 2025',
    longDescription: 'Upload your historical contact data and get forecasts that automatically account for AI deflection rates. Our ML models learn from your specific patterns and adjust predictions based on your AI implementation timeline.'
  },
  simulator: {
    id: 'simulator',
    name: 'Deflection Simulator',
    description: 'Model AI improvement scenarios in real-time',
    icon: '🎯',
    available: false,
    comingSoon: 'Q2 2025',
    longDescription: 'Run what-if scenarios to see how different AI deflection rates impact your staffing needs. Test automation improvements before implementation and quantify ROI with precision.'
  },
  workforce: {
    id: 'workforce',
    name: 'Human-AI Workforce View',
    description: 'See your blended workforce capacity',
    icon: '🤖',
    available: false,
    comingSoon: 'Q2 2025',
    longDescription: 'Visualize your workforce as a unified team of humans and AI. Track capacity, utilization, and efficiency across your entire blended workforce with real-time dashboards.'
  },
  scheduler: {
    id: 'scheduler',
    name: 'Schedule Optimizer',
    description: 'AI-generated schedules with explainability',
    icon: '⏰',
    available: false,
    comingSoon: 'Q2 2025',
    longDescription: 'Generate optimal schedules that account for both human agent preferences and AI capacity. Every scheduling decision comes with clear explanations of the trade-offs considered.'
  },
  tracker: {
    id: 'tracker',
    name: 'Forecast vs. Actual Tracker',
    description: 'Track accuracy, catch model drift',
    icon: '📈',
    available: false,
    comingSoon: 'Q2 2025',
    longDescription: 'Monitor forecast accuracy over time and get alerts when your AI deflection models start drifting. Maintain prediction quality with automated model health checks.'
  }
};

export const CopilotApp: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // Chat functionality
  const { messages, isLoading, sendMessage, clearHistory } = useChat();

  // URL mode detection
  const modeParams = getUrlModeParams();

  // Keyboard shortcuts for live demos
  useKeyboardShortcuts({
    onResetDemo: () => {
      clearHistory();
      // Reset to baseline state
    }
  });

  // Forecast store for charts data
  const {
    getCurrentDayVolume,
    getTotalWeeklyContacts,
    deflectionParams,
    selectedDay
  } = useForecastStore();

  // Get chart data
  const currentDayVolume = getCurrentDayVolume();
  const totalContacts = getTotalWeeklyContacts();

  // Convert volume data to forecast chart format
  const chartData = currentDayVolume.map(volume => ({
    period: `${volume.hour.toString().padStart(2, '0')}:00`,
    contactVolume: volume.calls + volume.chats + volume.emails,
    predictedVolume: Math.round((volume.calls + volume.chats + volume.emails) * 1.05),
    staffRequired: Math.ceil((volume.calls + volume.chats + volume.emails) / 8),
    currentStaff: Math.ceil((volume.calls + volume.chats + volume.emails) / 10)
  }));

  // Mock metrics for cards
  const mockWorkforceState = {
    currentStaff: 85,
    requiredStaff: 92,
    utilization: 78.5,
    efficiency: 85.2,
    costs: 125420
  };

  const mockAIDeflectionMetrics = {
    totalContacts: totalContacts,
    aiHandled: Math.round(totalContacts * deflectionParams.currentRate),
    humanEscalation: Math.round(totalContacts * (1 - deflectionParams.currentRate)),
    resolutionRate: 82.5,
    avgResponseTime: 1.2
  };

  const handleBackToFeatures = () => {
    navigate('/');
  };

  const handleFeatureClick = (feature: Feature) => {
    if (!feature.available) {
      const extendedFeature = extendedFeatures[feature.id];
      setSelectedFeature(extendedFeature || feature);
    }
  };

  const handleTryCopilot = () => {
    setSelectedFeature(null);
    // Already in copilot, just close modal
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header
        showCopilotStatus={true}
        onBackToFeatures={handleBackToFeatures}
      />

      <div className="flex-1 flex min-h-0">
        <Sidebar
          activeFeatureId="copilot"
          onFeatureClick={handleFeatureClick}
        />

        <MainContent layout="copilot">
          {/* Top 55% - Charts Area */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-0 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                AI-Aware Workforce Dashboard
              </h2>
              <p className="text-gray-400 text-sm">
                Viewing {selectedDay} data • {deflectionParams.currentRate * 100}% AI deflection
              </p>
            </div>

            {/* Metrics Cards */}
            <div className="mb-6">
              <MetricsCards />
            </div>

            {/* Forecast Chart */}
            <div className="flex-1 min-h-0">
              <div className="rounded-lg p-4 h-full">
                <div className="h-64">
                  <ForecastChart
                    height={250}
                    enableDateSelection={true}
                    showAnomalies={true}
                    className="bg-gray-900 p-4 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 45% - Chat Interface */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-0 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white mb-2">
                WFM Copilot
              </h2>
              <p className="text-gray-400 text-sm">
                Ask questions about staffing, forecasts, and AI deflection
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <ChatInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
              />
            </div>
          </div>
        </MainContent>
      </div>

      {/* Feature Modal */}
      <FeatureModal
        feature={selectedFeature}
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onTryCopilot={handleTryCopilot}
      />
    </div>
  );
};