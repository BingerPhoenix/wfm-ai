import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

// Cached synthetic data
let syntheticData: SyntheticData | null = null;

interface SyntheticData {
  summary: any;
  costs: any;
  deflection: any[];
  sla: any[];
  volume: any[];
  staffing: any[];
}

interface QueryIntent {
  isROI: boolean;
  isCoverage: boolean;
  isForecast: boolean;
  isComparison: boolean;
  keywords: string[];
}

// Load synthetic data on first request
async function loadSyntheticData(): Promise<SyntheticData> {
  if (syntheticData) return syntheticData;

  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');

    const [summary, costs, deflection, sla, volume, staffing] = await Promise.all([
      fs.readFile(path.join(dataDir, 'summary_stats.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'cost_data.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'deflection_history.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'sla_performance.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'historical_volume.json'), 'utf-8').then(JSON.parse),
      fs.readFile(path.join(dataDir, 'staffing_schedules.json'), 'utf-8').then(JSON.parse),
    ]);

    syntheticData = { summary, costs, deflection, sla, volume, staffing };
    return syntheticData;
  } catch (error) {
    console.error('Failed to load synthetic data:', error);
    // Return fallback data if files don't exist
    return {
      summary: { totalContacts: 782456, avgWeeklyVolume: 15047 },
      costs: { agentCosts: { average: 52000 }, aiCosts: { perContact: 0.12 } },
      deflection: [],
      sla: [],
      volume: [],
      staffing: []
    };
  }
}

// Parse query intent
function parseQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();

  return {
    isROI: /\b(roi|savings?|cost|budget|money|dollar|\$|investment|return)\b/.test(lowerQuery),
    isCoverage: /\b(coverage|gap|understaffed?|overstaffed?|schedule|shift)\b/.test(lowerQuery),
    isForecast: /\b(forecast|predict|next|future|trend|volume|contact|pattern)\b/.test(lowerQuery),
    isComparison: /\b(compar|vs|versus|benchmark|industry|average|typical|standard)\b/.test(lowerQuery),
    keywords: lowerQuery.split(' ').filter(word => word.length > 3)
  };
}

// Build enhanced context based on query intent and data
function buildEnhancedContext(query: string, data: SyntheticData): string {
  const intent = parseQueryIntent(query);

  let baseContext = `You are an expert WFM Copilot with access to 12 months of real operational data for this contact center.

HISTORICAL SUMMARY (2024):
• Total contacts: ${data.summary.totalContacts?.toLocaleString() || '782,456'}
• Average weekly volume: ${data.summary.avgWeeklyVolume?.toLocaleString() || '15,047'}
• Peak day: ${data.summary.peakDay?.date || 'June 4'} (${data.summary.peakDay?.volume?.toLocaleString() || '6,747'} contacts - viral social media incident)
• Lowest day: ${data.summary.lowestDay?.date || 'Dec 25'} (${data.summary.lowestDay?.volume?.toLocaleString() || '612'} contacts - Christmas)

CURRENT STATE (Dec 2024):
• AI deflection rate: 27% (improved from 18% at year start)
• Staffing: 94 FTE across 3 shifts (morning 26, midday 42, evening 26)
• YTD SLA average: 82% (target: 80%)
• Contact mix: 58% calls, 32% chats, 10% emails

DEFLECTION BY TYPE:
• Billing: 38% (FAQ bot handles invoices, payments)
• General: 48% (password resets, account status)
• Technical: 18% (complex issues need humans)
• Sales: 12% (customers prefer human connection)

KEY EVENTS & MILESTONES:
• March: Billing Bot v2 launched (+8% billing deflection)
• June: Social media viral incident (3x normal volume for 2 days)
• August: FAQ expansion (+5% general inquiry deflection)
• October 10: Bot outage (deflection dropped to 5% for one day)
• November: Black Friday week (+40% volume surge)

KNOWN PATTERNS:
• Daily peaks: 10-11am and 2-3pm
• Weekly: Mon/Tue highest, weekends 60% lower
• Seasonal: Summer dips (-15%), holiday spikes (+30%)
• Coverage gaps: Tuesday 10am-12pm, Thursday 2-4pm training overlaps`;

  // Add specific context based on query intent
  if (intent.isROI && data.costs) {
    baseContext += `

DETAILED COST ANALYSIS:
• Average agent cost: $${data.costs.agentCosts?.average?.toLocaleString() || '52,000'}/year
• Current annual labor cost: $${((data.costs.agentCosts?.average || 52000) * 94).toLocaleString()}
• AI cost per deflected contact: $${data.costs.aiCosts?.perContact || '0.12'}
• YTD AI infrastructure cost: $${(data.costs.aiCosts?.infrastructure || 2500) * 12}

BENCHMARKS vs INDUSTRY:
• Our deflection (27%) vs Industry average (28%): Slightly below
• Handle time: 6.0 min (Industry: 5.5 min) - Room for improvement
• Agent costs competitive with Toronto market ($54K average)

ROI POTENTIAL (35% deflection scenario):
• FTE reduction: ~12 agents
• Annual savings: $${((data.costs.agentCosts?.average || 52000) * 12).toLocaleString()}
• Additional AI costs: ~$7,500/year
• Net savings: $${(((data.costs.agentCosts?.average || 52000) * 12) - 7500).toLocaleString()}/year
• Payback period: 1.1 months`;
  }

  if (intent.isCoverage && data.staffing.length > 0) {
    // Calculate recent staffing patterns
    const recentStaffing = data.staffing.slice(-30); // Last 30 days
    const avgPTO = recentStaffing.reduce((sum, s) => sum + (s.ptoCount || 0), 0) / recentStaffing.length;
    const avgSick = recentStaffing.reduce((sum, s) => sum + (s.sickCount || 0), 0) / recentStaffing.length;

    baseContext += `

CURRENT STAFFING PATTERNS:
• Average daily PTO: ${avgPTO.toFixed(1)} agents (higher in summer/December)
• Average sick leave: ${avgSick.toFixed(1)} agents (peaks in winter)
• Training schedule: Tuesdays/Thursdays 2-4pm (midday shift)
• Overtime usage: Minimal due to AI deflection improvements

HISTORICAL GAPS:
• Tuesday 10am-12pm: Consistently understaffed (system maintenance callbacks)
• Thursday 2-4pm: Training overlap creates coverage risk
• Friday 4-6pm: Early departures for weekend
• December 23-26: Holiday PTO creates 30% staffing reduction`;
  }

  if (intent.isForecast && data.volume.length > 0) {
    // Get seasonal patterns from historical data
    const monthlyAvg = data.volume.reduce((acc, v) => {
      const month = new Date(v.date).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(v.calls + v.chats + v.emails);
      return acc;
    }, {} as Record<number, number[]>);

    baseContext += `

SEASONAL FORECAST PATTERNS:
• January: +15% (post-holiday inquiries)
• Feb-Mar: Baseline levels
• July-August: -15% (summer vacation dip)
• September: +10% (back-to-school spike)
• November: +30% (Black Friday week +40%)
• December: Mixed (high pre-Christmas, low 23-26)

CONTACT TYPE TRENDS:
• Billing: Higher end-of-month (+20% days 25-31)
• Technical: Winter peaks (+15% Dec-Mar)
• General: Steady with slight summer decline
• Sales: Q4 surge (+25% Oct-Dec)`;
  }

  if (intent.isComparison && data.costs.benchmarks) {
    baseContext += `

INDUSTRY BENCHMARKS:
• Insurance: 22% deflection, 78% SLA, $54K agent cost
• Telecom: 28% deflection, 82% SLA, $48K agent cost
• Retail: 35% deflection, 85% SLA, $46K agent cost
• Technology: 42% deflection, 88% SLA, $65K agent cost

YOUR POSITION:
• Deflection: 27% (Above insurance, below tech/retail)
• SLA: 82% (Competitive across all industries)
• Costs: $52K (Mid-range, competitive for Toronto market)

IMPROVEMENT OPPORTUNITIES:
• Technical support deflection (18% vs 30% industry average)
• Handle time reduction (6.0min vs 5.5min benchmark)
• Weekend coverage optimization (currently 60% reduced)`;
  }

  baseContext += `

RESPONSE GUIDELINES:
• Reference specific historical data points
• Provide concrete numbers, not estimates
• Compare to relevant benchmarks when applicable
• Flag interesting patterns or anomalies
• Make data-backed recommendations
• Always respond with valid JSON format for chart updates`;

  return baseContext;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).json({ body: 'OK', ...corsHeaders });
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      ...corsHeaders
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
        ...corsHeaders
      });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'API key not configured',
        ...corsHeaders
      });
    }

    // Load synthetic data for enhanced context
    const data = await loadSyntheticData();

    // Get the user's latest message for context building
    const userMessage = messages[messages.length - 1];
    const userQuery = userMessage?.role === 'user' ? userMessage.content : '';

    // Build enhanced system prompt with data
    const enhancedSystemPrompt = buildEnhancedContext(userQuery, data);

    // Call Claude API with enhanced context
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500, // Increased for detailed responses
      temperature: 0.7,
      system: enhancedSystemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
    });

    // Extract text content from response
    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return res.status(200).json({
      content,
      ...corsHeaders
    });

  } catch (error: any) {
    console.error('Claude API Error:', error);

    // Handle rate limits
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        ...corsHeaders
      });
    }

    // Handle API key issues
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Invalid API key',
        ...corsHeaders
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      ...corsHeaders
    });
  }
}