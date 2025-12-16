export interface FeatureDescription {
  id: string;
  name: string;
  description: string;
  icon: string;
  comingSoon: boolean;
  badge?: string;
}

export const featureDescriptions: Record<string, FeatureDescription> = {
  'ai-forecasting': {
    id: 'ai-forecasting',
    name: 'AI-Aware Forecasting Dashboard',
    description: 'Upload historical contact data and leverage intelligent pattern recognition to identify daily peaks, weekly trends, and seasonal variations. Unlike traditional WFM tools, our forecasting is AI-aware from inception, providing accurate staffing projections that account for automated resolution capabilities.',
    icon: '🧠',
    comingSoon: true,
    badge: 'Coming Q2 2025'
  },

  'deflection-simulator': {
    id: 'deflection-simulator',
    name: 'Deflection Simulator',
    description: 'Model dynamic "what-if" scenarios through interactive controls. Evaluate potential outcomes when AI deflection improves by 10% next quarter or when implementing specialized automation. View real-time staffing impact analysis across all shifts and timeframes.',
    icon: '🎯',
    comingSoon: true,
    badge: 'Coming Q2 2025'
  },

  'workforce-view': {
    id: 'workforce-view',
    name: 'Human-AI Workforce View',
    description: 'Visualize your complete workforce ecosystem combining human agents and AI automation capacity. Monitor workforce composition trends over time and make data-driven decisions about AI investment versus traditional hiring strategies.',
    icon: '👥',
    comingSoon: true,
    badge: 'Coming Q2 2025'
  },

  'wfm-copilot': {
    id: 'wfm-copilot',
    name: 'WFM Copilot',
    description: 'Intelligent workforce management assistant providing on-demand analysis of staffing requirements, coverage gaps, and strategic planning scenarios. Receive instant insights through interactive visualizations and actionable recommendations.',
    icon: '💬',
    comingSoon: false,
    badge: 'Available Now'
  },

  'schedule-optimizer': {
    id: 'schedule-optimizer',
    name: 'Schedule Optimizer',
    description: 'Define scheduling constraints including overtime limits, agent preferences, and skill requirements, then generate optimal schedules using AI optimization. All recommendations include detailed explanations of scheduling rationale and performance impact.',
    icon: '📅',
    comingSoon: true,
    badge: 'Coming Q2 2025'
  },

  'forecast-tracker': {
    id: 'forecast-tracker',
    name: 'Forecast vs. Actual Tracker',
    description: 'Compare forecasted versus actual performance metrics with comprehensive accuracy tracking using MAPE (Mean Absolute Percentage Error) analysis. Receive proactive alerts when models begin drifting to enable timely recalibration and maintain operational efficiency.',
    icon: '📊',
    comingSoon: true,
    badge: 'Coming Q2 2025'
  }
};

export const getFeatureDescription = (featureId: string): FeatureDescription | undefined => {
  return featureDescriptions[featureId];
};

export const getAvailableFeatures = (): FeatureDescription[] => {
  return Object.values(featureDescriptions).filter(feature => !feature.comingSoon);
};

export const getComingSoonFeatures = (): FeatureDescription[] => {
  return Object.values(featureDescriptions).filter(feature => feature.comingSoon);
};