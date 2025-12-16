import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  comingSoon?: string;
}

interface SidebarProps {
  activeFeatureId?: string;
  onFeatureClick?: (feature: Feature) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const features: Feature[] = [
  {
    id: 'forecasting',
    name: 'AI-Aware Forecasting',
    description: 'Historical data analysis with AI-powered insights',
    icon: '📊',
    available: false,
    comingSoon: 'Q2 2025'
  },
  {
    id: 'simulator',
    name: 'Deflection Simulator',
    description: 'Interactive scenario modeling and impact analysis',
    icon: '🎯',
    available: false,
    comingSoon: 'Q2 2025'
  },
  {
    id: 'workforce',
    name: 'Human-AI Workforce',
    description: 'Unified view of human and AI workforce capacity',
    icon: '🤖',
    available: false,
    comingSoon: 'Q2 2025'
  },
  {
    id: 'copilot',
    name: 'WFM Copilot',
    description: 'Intelligent workforce management assistant',
    icon: '💬',
    available: true
  },
  {
    id: 'scheduler',
    name: 'Schedule Optimizer',
    description: 'Automated scheduling optimization',
    icon: '⏰',
    available: false,
    comingSoon: 'Q2 2025'
  },
  {
    id: 'tracker',
    name: 'Forecast vs. Actual',
    description: 'Performance tracking and model accuracy analysis',
    icon: '📈',
    available: false,
    comingSoon: 'Q2 2025'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeFeatureId = 'copilot',
  onFeatureClick,
  isCollapsed: controlledCollapsed,
  onToggleCollapse
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(true);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleFeatureClick = (feature: Feature) => {
    if (onFeatureClick) {
      onFeatureClick(feature);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 80 : 280
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gray-800 border-r border-gray-700 flex flex-col"
    >
      {/* Toggle button */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Features list */}
      <nav className="flex-1 p-4 space-y-2">
        {features.map((feature) => {
          const isActive = activeFeatureId === feature.id;
          const isAvailable = feature.available;

          return (
            <motion.button
              key={feature.id}
              onClick={() => handleFeatureClick(feature)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center p-3 rounded-lg text-left transition-all duration-200
                ${isActive && isAvailable
                  ? 'bg-blue-900/50 border border-blue-500/50 text-blue-300'
                  : isAvailable
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-500 hover:bg-gray-750'
                }
              `}
              disabled={!isAvailable}
            >
              <div className="flex items-center min-w-0 flex-1">
                <span className="text-xl">{feature.icon}</span>

                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 min-w-0 flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">
                          {feature.name}
                        </span>

                        {/* Status indicators */}
                        {isAvailable ? (
                          <span className="ml-2 text-green-400 text-xs">✓</span>
                        ) : (
                          <span className="ml-2 text-gray-500 text-xs">🔒</span>
                        )}
                      </div>

                      {!isAvailable && (
                        <div className="text-xs text-gray-500 mt-1">
                          Coming {feature.comingSoon}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-gray-700"
          >
            <div className="text-xs text-gray-500 text-center">
              WFM.ai Prototype
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};