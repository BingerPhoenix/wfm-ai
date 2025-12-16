import { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

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
    const { messages, system } = req.body;

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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      temperature: 0.7,
      system: system || 'You are a helpful AI assistant for workforce management. You help users understand staffing needs, AI deflection rates, and forecast accuracy.',
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