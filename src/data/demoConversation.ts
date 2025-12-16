import type { ChatMessage } from '../lib/types';

export const demoConversation: ChatMessage[] = [
  {
    id: 'demo-welcome',
    role: 'assistant',
    content: `Welcome! I'm your WFM Copilot. I can assist you with:

• **Staffing requirement forecasting** based on historical contact volumes
• **AI deflection scenario modeling** to quantify operational savings
• **Coverage gap identification** within your current scheduling framework
• **Comparative analysis** of traditional versus AI-optimized workforce planning

What would you like to analyze? Ask about coverage gaps, forecasting accuracy, or scenario planning with varying AI deflection rates.`,
    timestamp: new Date(Date.now() - 360000), // 6 minutes ago
    chartUpdate: false
  },
  {
    id: 'demo-user-1',
    role: 'user',
    content: 'Please analyze coverage gaps for the upcoming week.',
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
    chartUpdate: false
  },
  {
    id: 'demo-assistant-1',
    role: 'assistant',
    content: `Analysis of upcoming week reveals the following staffing deficiencies:

**🚨 Critical Gap: Tuesday 9:00 AM - 12:00 PM**
• Understaffed by **8 FTE** during peak volume period
• SLA performance will decline to **65%** (target: 85%)
• Root cause: Scheduled system maintenance callbacks coinciding with normal volume spike

**⚠️ Moderate Gap: Thursday 2:00-3:00 PM**
• Staffing shortage of **3 FTE**
• Projected SLA impact: **78%** (minor deviation from target)

**📊 Weekly Impact Assessment:**
• Total understaffed hours: **15 hours**
• Estimated SLA penalty exposure: **$45,000**
• Customer impact: **2,400 contacts** exceeding 2-minute queue threshold

**Strategic Recommendation**: Current 25% AI deflection rate could mitigate these gaps through optimization. Would you like to analyze the impact of enhanced deflection scenarios?`,
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
    chartUpdate: true
  },
  {
    id: 'demo-user-2',
    role: 'user',
    content: 'Please model a scenario with 35% AI deflection rate.',
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    chartUpdate: false
  },
  {
    id: 'demo-assistant-2',
    role: 'assistant',
    content: `**Significant operational impact achieved** with 35% AI deflection:

**💰 Financial Impact:**
• **-12 FTE** reduction in weekly staffing requirements
• **$600,000+** projected annual labor cost savings
• **$45,000** elimination of SLA penalty exposure

**📈 Performance Enhancement:**
• Tuesday critical period: **65% → 87% SLA** (22-point improvement)
• Thursday staffing gap: **Completely resolved**
• Overall SLA performance: **82% → 91%** (exceeding enterprise target)

**🎯 Implementation Pathway:**
• Chat deflection optimization: **25% → 45%** (enhanced knowledge base)
• Email auto-resolution: **35% → 60%** (intelligent classification)
• Voice channel deflection: **15% → 25%** (advanced IVR capabilities)

**Executive Summary**: 10% deflection improvement delivers $600K annual savings plus SLA excellence. This demonstrates how AI-aware workforce management captures optimization opportunities invisible to traditional WFM approaches.`,
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    chartUpdate: true
  }
];

export const shouldLoadDemoConversation = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('demo') === 'true';
};

export const isScreenshotMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('screenshots') === 'true';
};

export const getUrlModeParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    demo: urlParams.get('demo') === 'true',
    screenshots: urlParams.get('screenshots') === 'true',
    presentation: urlParams.get('presentation') === 'true'
  };
};