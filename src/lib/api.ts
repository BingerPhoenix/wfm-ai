// Anthropic SDK is now used server-side only
import { QueryIntent } from './types';
import type {
  ForecastState,
  DeflectionParams
} from './types';

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ChatResponse {
  answer: string;
  updatedParams?: Partial<DeflectionParams>;
  chartUpdate: 'none' | 'deflection' | 'staffing' | 'both';
}

// System prompt for WFM Copilot
export const WFM_SYSTEM_PROMPT = `You are WFM-AI, an expert workforce management planning assistant for contact centers.

CONTEXT:
- Contact center with ~15,000 weekly contacts
- Current AI deflection rate: 25%
- Total staffing: 94 FTEs across shifts
- Current SLA: 82%
- Peak hours: 10-11am, 2-3pm weekdays
- Contact mix: 60% calls, 30% chats, 10% emails

CAPABILITIES:
- Forecast analysis and volume predictions
- Scenario simulation with different AI deflection rates
- Coverage gap analysis and staffing recommendations
- Cost impact calculations
- SLA projections

RESPONSE FORMAT:
Always respond with valid JSON in this exact format:
{
  "answer": "Your detailed response to the user's question",
  "updatedParams": {
    "currentRate": 0.25,
    "byContactType": {
      "billing": 0.35,
      "technical": 0.15,
      "general": 0.45,
      "sales": 0.10
    }
  },
  "chartUpdate": "deflection" | "staffing" | "both" | "none"
}

RULES:
1. Keep responses conversational but data-driven
2. Include specific numbers and percentages when possible
3. Use chartUpdate to trigger visual updates when recommendations change parameters
4. Set updatedParams only when recommending specific changes
5. Be concise but comprehensive - aim for 2-4 sentences
6. Always respond with valid JSON

When users ask about scenarios, projections, or "what if" questions, set chartUpdate to "deflection" or "both" and include updatedParams with your recommended deflection rates.`;

// Parse query intent from user message
export const parseQueryIntent = (userMessage: string): QueryIntent => {
  const message = userMessage.toLowerCase();

  // Deflection scenario keywords
  if (message.includes('deflection') || message.includes('ai rate') ||
      message.includes('automation') || message.includes('what if')) {
    return QueryIntent.DEFLECTION_SCENARIO;
  }

  // Coverage analysis keywords
  if (message.includes('coverage') || message.includes('gap') ||
      message.includes('understaffed') || message.includes('overstaffed')) {
    return QueryIntent.COVERAGE_ANALYSIS;
  }

  // Forecast queries
  if (message.includes('forecast') || message.includes('predict') ||
      message.includes('volume') || message.includes('contacts')) {
    return QueryIntent.FORECAST_QUERY;
  }

  // Comparison keywords
  if (message.includes('compare') || message.includes('vs') ||
      message.includes('traditional') || message.includes('difference')) {
    return QueryIntent.COMPARISON;
  }

  // Staffing impact
  if (message.includes('staff') || message.includes('agents') ||
      message.includes('fte') || message.includes('headcount')) {
    return QueryIntent.STAFFING_IMPACT;
  }

  // Cost analysis
  if (message.includes('cost') || message.includes('savings') ||
      message.includes('budget') || message.includes('money')) {
    return QueryIntent.COST_ANALYSIS;
  }

  // Recommendation
  if (message.includes('recommend') || message.includes('suggest') ||
      message.includes('should') || message.includes('best')) {
    return QueryIntent.RECOMMENDATION;
  }

  // Default to forecast query
  return QueryIntent.FORECAST_QUERY;
};

// Build context prompt from current state
export const buildContextPrompt = (state: ForecastState): string => {
  const totalContacts = state.weeklyVolume.reduce(
    (sum, v) => sum + v.calls + v.chats + v.emails, 0
  );

  const currentDayVolume = state.weeklyVolume.filter(
    v => v.dayOfWeek === state.selectedDay
  );

  const dailyContacts = currentDayVolume.reduce(
    (sum, v) => sum + v.calls + v.chats + v.emails, 0
  );

  // Recent chat context (last 3 messages)
  const recentChat = state.chatHistory
    .slice(-3)
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');

  return `CURRENT STATE:
Selected Day: ${state.selectedDay}
Daily Volume: ${dailyContacts} contacts
Weekly Total: ${totalContacts} contacts

Current Deflection: ${(state.deflectionParams.currentRate * 100).toFixed(1)}%
- Billing: ${(state.deflectionParams.byContactType.billing * 100).toFixed(1)}%
- Technical: ${(state.deflectionParams.byContactType.technical * 100).toFixed(1)}%
- General: ${(state.deflectionParams.byContactType.general * 100).toFixed(1)}%
- Sales: ${(state.deflectionParams.byContactType.sales * 100).toFixed(1)}%

${recentChat ? `Recent conversation:\n${recentChat}` : 'No recent conversation.'}

Please respond based on this context.`;
};

// Claude API Integration (Server-side)
export class WfmApi {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    // Use environment variable or default to relative path
    this.baseUrl = import.meta.env.VITE_API_URL || baseUrl || '';
  }

  async sendChatMessage(
    userMessage: string,
    context: ForecastState
  ): Promise<ApiResponse<ChatResponse>> {
    try {
      const contextPrompt = buildContextPrompt(context);
      const intent = parseQueryIntent(userMessage);

      const fullPrompt = `${contextPrompt}\n\nUser Query (Intent: ${intent}): ${userMessage}`;

      // Call server-side API route
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: fullPrompt
          }],
          system: WFM_SYSTEM_PROMPT
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      // Try to parse JSON response from Claude
      let parsedResponse: ChatResponse;
      try {
        parsedResponse = JSON.parse(data.content);
      } catch {
        // Fallback if response isn't valid JSON
        parsedResponse = {
          answer: data.content,
          chartUpdate: 'none'
        };
      }

      return {
        success: true,
        data: parsedResponse
      };

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Claude API error:', error);
      }

      // Intelligent fallback based on query intent
      const intent = parseQueryIntent(userMessage);
      const fallbackResponse = this.generateFallbackResponse(userMessage, intent, context);

      return {
        success: true,
        data: fallbackResponse
      };
    }
  }

  // Generate intelligent fallback responses
  private generateFallbackResponse(
    userMessage: string,
    intent: QueryIntent,
    context: ForecastState
  ): ChatResponse {
    const deflectionRate = (context.deflectionParams.currentRate * 100).toFixed(1);
    const totalContacts = context.weeklyVolume.reduce(
      (sum, v) => sum + v.calls + v.chats + v.emails, 0
    );

    switch (intent) {
      case QueryIntent.DEFLECTION_SCENARIO:
        return {
          answer: `Your current AI deflection rate is ${deflectionRate}%. Typical contact centers see 30-40% deflection rates with advanced AI. Would you like to simulate a higher deflection scenario?`,
          updatedParams: {
            currentRate: 0.35 // Suggest 35% deflection
          },
          chartUpdate: 'deflection'
        };

      case QueryIntent.COST_ANALYSIS:
        const potentialSavings = Math.round((totalContacts * 0.1 * 50000) / 52); // Rough weekly savings
        return {
          answer: `With ${totalContacts} weekly contacts, increasing AI deflection by 10% could save approximately $${potentialSavings.toLocaleString()} per week in staffing costs.`,
          chartUpdate: 'both'
        };

      case QueryIntent.STAFFING_IMPACT:
        return {
          answer: `Your current deflection rate of ${deflectionRate}% is helping reduce staffing needs. Traditional WFM would require about 15-20% more agents without AI assistance.`,
          chartUpdate: 'staffing'
        };

      default:
        return {
          answer: `I understand you're asking about ${userMessage}. Your current deflection rate is ${deflectionRate}% with ${totalContacts.toLocaleString()} weekly contacts. Use the controls above to explore different scenarios.`,
          chartUpdate: 'none'
        };
    }
  }

  // Legacy method for backward compatibility
  async getForecastData(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/forecast`);
      const data = await response.json();
      return { data, success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Convenience function for API calls
export const callClaudeAPI = async (
  userMessage: string,
  context: ForecastState
): Promise<ApiResponse<ChatResponse>> => {
  const api = new WfmApi();
  return api.sendChatMessage(userMessage, context);
};