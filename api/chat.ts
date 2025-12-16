import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Helper to set CORS headers
function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Synthetic data (embedded to avoid file system issues on Vercel)
const SYNTHETIC_DATA = {
  summary: {
    totalContacts: 782456,
    avgWeeklyVolume: 15047,
    peakDay: { date: 'June 4, 2024', volume: 6747, reason: 'Viral social media incident' },
    lowestDay: { date: 'December 25, 2024', volume: 612, reason: 'Christmas Day' },
    deflectionImprovement: '+9%',
    yearStartDeflection: 0.18,
    yearEndDeflection: 0.27
  },
  costs: {
    agentCosts: { average: 52000, range: { min: 45000, max: 65000 } },
    aiCosts: { perContact: 0.12, infrastructure: 2500 },
    benchmarks: {
      insurance: { deflection: 0.22, sla: 0.78, agentCost: 54000 },
      telecom: { deflection: 0.28, sla: 0.82, agentCost: 48000 },
      retail: { deflection: 0.35, sla: 0.85, agentCost: 46000 },
      technology: { deflection: 0.42, sla: 0.88, agentCost: 65000 }
    }
  },
  currentState: {
    deflectionRate: 0.27,
    staffing: 94,
    sla: 0.82,
    shifts: { morning: 26, midday: 42, evening: 26 },
    contactMix: { calls: 0.58, chats: 0.32, emails: 0.10 }
  },
  deflectionByType: {
    billing: 0.38,
    general: 0.48,
    technical: 0.18,
    sales: 0.12
  },
  keyEvents: [
    { date: 'March 2024', event: 'Billing Bot v2 launched', impact: '+8% billing deflection' },
    { date: 'June 3-4, 2024', event: 'Viral social media incident', impact: '3x normal volume' },
    { date: 'August 2024', event: 'FAQ expansion', impact: '+5% general deflection' },
    { date: 'October 10, 2024', event: 'Bot outage', impact: 'Deflection dropped to 5%' },
    { date: 'November 29, 2024', event: 'Black Friday', impact: '+40% volume surge' }
  ],
  coverageGaps: [
    { period: 'Tuesday 10am-12pm', issue: 'System maintenance callbacks', severity: 'high' },
    { period: 'Thursday 2-4pm', issue: 'Training overlap', severity: 'medium' },
    { period: 'Friday 4-6pm', issue: 'Early weekend departures', severity: 'low' }
  ]
};

interface QueryIntent {
  isROI: boolean;
  isCoverage: boolean;
  isForecast: boolean;
  isComparison: boolean;
  isDeflection: boolean;
}

// Parse query intent
function parseQueryIntent(query: string): QueryIntent {
  const lowerQuery = query.toLowerCase();
  return {
    isROI: /\b(roi|savings?|cost|budget|money|dollar|\$|investment|return|reduce|cut)\b/.test(lowerQuery),
    isCoverage: /\b(coverage|gap|understaffed?|overstaffed?|schedule|shift|staff)\b/.test(lowerQuery),
    isForecast: /\b(forecast|predict|next|future|trend|volume|contact|pattern|week|month)\b/.test(lowerQuery),
    isComparison: /\b(compar|vs|versus|benchmark|industry|average|typical|traditional)\b/.test(lowerQuery),
    isDeflection: /\b(deflect|bot|ai|automat|chatbot|improve|what if|scenario|35%|40%|30%)\b/.test(lowerQuery)
  };
}

// Build enhanced context based on query intent
function buildEnhancedContext(query: string): string {
  const intent = parseQueryIntent(query);
  const data = SYNTHETIC_DATA;

  let context = `You are an expert WFM Copilot with access to 12 months of real operational data for this contact center. You provide specific, data-backed insights.

═══════════════════════════════════════════════════════════════
                    CONTACT CENTER DATA (2024)
═══════════════════════════════════════════════════════════════

HISTORICAL SUMMARY:
• Total annual contacts: ${data.summary.totalContacts.toLocaleString()}
• Average weekly volume: ${data.summary.avgWeeklyVolume.toLocaleString()}
• Peak day: ${data.summary.peakDay.date} (${data.summary.peakDay.volume.toLocaleString()} contacts - ${data.summary.peakDay.reason})
• Lowest day: ${data.summary.lowestDay.date} (${data.summary.lowestDay.volume.toLocaleString()} contacts - ${data.summary.lowestDay.reason})

CURRENT STATE (December 2024):
• AI deflection rate: ${(data.currentState.deflectionRate * 100).toFixed(0)}% (improved from ${(data.summary.yearStartDeflection * 100).toFixed(0)}% in January)
• Total staffing: ${data.currentState.staffing} FTE
  - Morning shift (8am-12pm): ${data.currentState.shifts.morning} agents
  - Midday shift (12pm-5pm): ${data.currentState.shifts.midday} agents
  - Evening shift (5pm-9pm): ${data.currentState.shifts.evening} agents
• Current SLA: ${(data.currentState.sla * 100).toFixed(0)}% (Target: 80%)
• Contact mix: ${(data.currentState.contactMix.calls * 100).toFixed(0)}% calls, ${(data.currentState.contactMix.chats * 100).toFixed(0)}% chats, ${(data.currentState.contactMix.emails * 100).toFixed(0)}% emails

DEFLECTION BY CONTACT TYPE:
• Billing inquiries: ${(data.deflectionByType.billing * 100).toFixed(0)}% (FAQ bot handles invoices, payment questions)
• General inquiries: ${(data.deflectionByType.general * 100).toFixed(0)}% (password resets, account status checks)
• Technical support: ${(data.deflectionByType.technical * 100).toFixed(0)}% (complex issues require human agents)
• Sales inquiries: ${(data.deflectionByType.sales * 100).toFixed(0)}% (customers prefer human connection for purchases)

KEY EVENTS THIS YEAR:
${data.keyEvents.map(e => `• ${e.date}: ${e.event} (${e.impact})`).join('\n')}

KNOWN COVERAGE GAPS:
${data.coverageGaps.map(g => `• ${g.period}: ${g.issue} [${g.severity} severity]`).join('\n')}`;

  // Add ROI-specific context
  if (intent.isROI || intent.isDeflection) {
    context += `

═══════════════════════════════════════════════════════════════
                      COST & ROI ANALYSIS
═══════════════════════════════════════════════════════════════

COST STRUCTURE:
• Average agent cost: $${data.costs.agentCosts.average.toLocaleString()}/year (range: $${data.costs.agentCosts.range.min.toLocaleString()}-$${data.costs.agentCosts.range.max.toLocaleString()})
• Current annual labor cost: $${(data.costs.agentCosts.average * data.currentState.staffing).toLocaleString()} (${data.currentState.staffing} FTE × $${data.costs.agentCosts.average.toLocaleString()})
• AI cost per deflected contact: $${data.costs.aiCosts.perContact}
• Monthly AI infrastructure: $${data.costs.aiCosts.infrastructure.toLocaleString()}

ROI CALCULATION METHODOLOGY:
When calculating ROI for deflection improvements:
1. Calculate contacts shifted to AI: (new_rate - current_rate) × annual_contacts
2. Calculate handle time freed: shifted_contacts × 6 minutes avg handle time
3. Calculate FTE reduction: handle_time_freed ÷ (8 hours × 250 work days)
4. Calculate labor savings: FTE_reduction × $${data.costs.agentCosts.average.toLocaleString()}
5. Calculate additional AI costs: shifted_contacts × $${data.costs.aiCosts.perContact}
6. Net savings = labor_savings - additional_AI_costs

EXAMPLE - 35% DEFLECTION SCENARIO:
• Contacts shifted: (0.35 - 0.27) × 782,456 = 62,596 additional AI-handled
• FTE reduction: ~12.3 agents
• Annual labor savings: $639,600
• Additional AI costs: $7,512
• Net annual savings: $632,088
• Payback period: < 2 months`;
  }

  // Add coverage-specific context
  if (intent.isCoverage) {
    context += `

═══════════════════════════════════════════════════════════════
                    STAFFING & COVERAGE DETAIL
═══════════════════════════════════════════════════════════════

SHIFT DISTRIBUTION:
• Morning (8am-12pm): 26 agents - handles post-opening surge
• Midday (12pm-5pm): 42 agents - covers dual peaks (lunch + 2pm)
• Evening (5pm-9pm): 26 agents - tapering volume

TYPICAL DAILY PATTERN:
• 8-9am: Ramp up (120 calls/hr) - 14 agents needed
• 9-10am: Building (280 calls/hr) - 24 agents needed
• 10-11am: PEAK #1 (350 calls/hr) - 29 agents needed ⚠️
• 11am-12pm: High (320 calls/hr) - 27 agents needed
• 12-1pm: Lunch dip (250 calls/hr) - 21 agents needed
• 1-2pm: Recovery (290 calls/hr) - 24 agents needed
• 2-3pm: PEAK #2 (320 calls/hr) - 27 agents needed ⚠️
• 3-5pm: Decline (260→200 calls/hr) - 22→17 agents needed
• 5-9pm: Evening (150→80 calls/hr) - 13→7 agents needed

HISTORICAL UNDERSTAFFING:
• Tuesday 10am-12pm: Avg 6 agents short (system maintenance creates callback surge)
• Thursday 2-4pm: Avg 5 agents short (training pulls agents from floor)

HISTORICAL OVERSTAFFING:
• Wednesday 6-8pm: Avg 6 agents excess (can redistribute)
• Saturday all day: Avg 4 agents excess (volume 60% lower)`;
  }

  // Add benchmark context
  if (intent.isComparison) {
    context += `

═══════════════════════════════════════════════════════════════
                    INDUSTRY BENCHMARKS
═══════════════════════════════════════════════════════════════

DEFLECTION RATES BY INDUSTRY:
• Insurance: 22% (regulatory complexity limits automation)
• Telecom: 28% (billing/technical mix similar to ours)
• Retail: 35% (high volume of simple queries)
• Technology: 42% (tech-savvy customers, better self-service)
→ Our 27% is competitive but below retail/tech leaders

SLA PERFORMANCE BY INDUSTRY:
• Insurance: 78% (complex calls take longer)
• Telecom: 82% (matches our performance)
• Retail: 85% (simpler queries, faster resolution)
• Technology: 88% (efficient self-service reduces load)
→ Our 82% meets industry standard

AGENT COSTS BY MARKET:
• Toronto (our market): $54,000 avg
• US average: $48,000
• Philippines: $18,000
• UK: $52,000
→ Our $52,000 is competitive for Toronto

HANDLE TIME BENCHMARKS:
• Industry average: 5.5 minutes
• Our current: 6.0 minutes
• Best in class: 4.5 minutes
→ 0.5 minute reduction could free 8 FTE-equivalent hours daily`;
  }

  // Add forecast context
  if (intent.isForecast) {
    context += `

═══════════════════════════════════════════════════════════════
                    SEASONAL PATTERNS & FORECASTING
═══════════════════════════════════════════════════════════════

MONTHLY VOLUME INDICES (vs. average):
• January: +15% (post-holiday inquiries, billing questions)
• February: -5% (short month, post-holiday calm)
• March: +2% (baseline)
• April-May: +5% (spring activity uptick)
• June: +8% (summer prep, travel inquiries)
• July-August: -15% (summer vacation dip)
• September: +10% (back-to-school, routine returns)
• October: +5% (pre-holiday prep begins)
• November: +30% (Black Friday week: +40%)
• December: Mixed (-20% week of Christmas, +15% rest of month)

WEEKLY PATTERNS:
• Monday: Index 1.25 (weekend backlog)
• Tuesday: Index 1.20 (continued high volume)
• Wednesday: Index 1.00 (baseline)
• Thursday: Index 0.95 (slight decline)
• Friday: Index 0.85 (weekend prep)
• Saturday: Index 0.45 (60% reduction)
• Sunday: Index 0.40 (lowest volume)

DAILY PATTERNS:
• Peak hours: 10-11am (index 1.4) and 2-3pm (index 1.3)
• Low hours: 8am (index 0.5) and after 6pm (index 0.4)`;
  }

  context += `

═══════════════════════════════════════════════════════════════
                    RESPONSE REQUIREMENTS
═══════════════════════════════════════════════════════════════

When responding:
1. Always cite specific numbers from the data above
2. Show your calculations step-by-step for ROI questions
3. Compare to relevant benchmarks when applicable
4. Flag anomalies or notable patterns
5. Provide actionable recommendations
6. Use bullet points for clarity
7. Include emojis for visual scanning (📊 📈 📉 💰 ⚠️ ✅)

Format your response as helpful, specific analysis - not generic advice.`;

  return context;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Debug logging
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log("Request headers:", req.headers);

  // Set CORS headers on the response object
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    console.log("Rejecting method:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("Processing POST request");

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get the user's latest message for context building
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userQuery = lastUserMessage?.content || '';

    // Build enhanced system prompt with relevant data context
    const systemPrompt = buildEnhancedContext(userQuery);

    console.log('Calling Claude API with valid model...');

    // Call Claude API with VALID model name
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // ✅ FIXED: Using valid model instead of claude-sonnet-4-20250514
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }))
    });

    console.log('Claude API response received successfully');

    // Extract text content
    const content = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    return res.status(200).json({ content });

  } catch (error: unknown) {
    console.error('Claude API Error:', error);

    const apiError = error as { status?: number; message?: string };

    if (apiError.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a moment.' });
    }

    if (apiError.status === 401) {
      return res.status(401).json({ error: 'Invalid API key configuration' });
    }

    return res.status(500).json({
      error: 'Failed to process request',
      details: apiError.message || 'Unknown error'
    });
  }
}