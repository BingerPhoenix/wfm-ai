import { useState, useCallback, useEffect } from 'react';
import { useForecastStore } from '../store/forecastStore';
import { callClaudeAPI, type ChatResponse } from '../lib/api';
import { demoConversation, shouldLoadDemoConversation } from '../data/demoConversation';
import type { ChatMessage, ForecastState } from '../lib/types';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  getWelcomeMessage: () => ChatMessage;
  retryLastMessage: () => Promise<void>;
}

export const useChat = (): UseChatReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string>('');
  const [messageQueue, setMessageQueue] = useState<string[]>([]);

  // Zustand store access
  const {
    chatHistory,
    addChatMessage,
    clearChat,
    setDeflectionRate,
    setDeflectionByType,
    updateChartsFromChat,
    deflectionParams,
    selectedDay,
    weeklyVolume,
    staffingData
  } = useForecastStore();

  // Get welcome message
  const getWelcomeMessage = useCallback((): ChatMessage => ({
    id: 'welcome',
    role: 'assistant',
    content: `Welcome! I'm your WFM Copilot. I can assist you with:

• **Staffing requirement forecasting** based on historical contact volumes
• **AI deflection scenario modeling** to quantify operational savings
• **Coverage gap identification** within your current scheduling framework
• **Comparative analysis** of traditional versus AI-optimized workforce planning

What would you like to analyze? Ask about coverage gaps, forecasting accuracy, or scenario planning with varying AI deflection rates.`,
    timestamp: new Date(),
    chartUpdate: false
  }), []);

  // Initialize with welcome message or demo conversation on first load
  useEffect(() => {
    if (chatHistory.length === 0) {
      const isDemoMode = shouldLoadDemoConversation();

      if (isDemoMode) {
        // Load demo conversation
        demoConversation.forEach(message => {
          addChatMessage(message);
        });

        // Set deflection rate to 35% to match demo conversation
        setDeflectionRate(0.35);
      } else {
        // Load normal welcome message
        const welcomeMessage = getWelcomeMessage();
        addChatMessage(welcomeMessage);
      }
    }
  }, [chatHistory.length, addChatMessage, getWelcomeMessage, setDeflectionRate]);

  // Process message queue for rate limiting
  useEffect(() => {
    if (messageQueue.length > 0 && !isLoading) {
      const nextMessage = messageQueue[0];
      setMessageQueue(prev => prev.slice(1));
      processMessage(nextMessage);
    }
  }, [messageQueue, isLoading]);

  // Build forecast state for API context
  const buildForecastState = useCallback((): ForecastState => ({
    weeklyVolume,
    deflectionParams,
    staffingData,
    chatHistory,
    selectedDay
  }), [weeklyVolume, deflectionParams, staffingData, chatHistory, selectedDay]);

  // Process individual message
  const processMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    setLastMessage(content);

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      chartUpdate: false
    };

    addChatMessage(userMessage);

    try {
      // Get current forecast state for context
      const currentState = buildForecastState();

      // Call Claude API
      const response = await callClaudeAPI(content, currentState);

      if (response.success && response.data) {
        const chatResponse: ChatResponse = response.data;

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: chatResponse.answer,
          timestamp: new Date(),
          chartUpdate: chatResponse.chartUpdate !== 'none'
        };

        addChatMessage(assistantMessage);

        // Handle parameter updates
        if (chatResponse.updatedParams) {
          const { currentRate, byContactType } = chatResponse.updatedParams;

          if (currentRate !== undefined) {
            setDeflectionRate(currentRate);
          }

          if (byContactType) {
            Object.entries(byContactType).forEach(([type, rate]) => {
              setDeflectionByType(type as any, rate);
            });
          }
        }

        // Handle chart updates
        if (chatResponse.chartUpdate && chatResponse.chartUpdate !== 'none') {
          updateChartsFromChat(chatResponse.chartUpdate);
        }

      } else {
        throw new Error(response.error || 'Unable to process request. Please try again.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';

      // Determine user-friendly error message
      let userErrorMessage = 'I encountered an issue processing your request. Please try again or rephrase your question.';

      if (errorMessage.includes('rate limit')) {
        userErrorMessage = 'High request volume detected. Please wait a moment before submitting another query.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        userErrorMessage = 'Connection issue detected. Please verify your network connection and try again.';
      } else if (errorMessage.includes('API key')) {
        userErrorMessage = 'API configuration required for full functionality. You can explore the interface and interact with the scenario controls while in demo mode.';
      }

      const errorChatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: userErrorMessage,
        timestamp: new Date(),
        chartUpdate: false
      };

      addChatMessage(errorChatMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [addChatMessage, buildForecastState, setDeflectionRate, setDeflectionByType, updateChartsFromChat]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // If already loading, queue the message
    if (isLoading) {
      setMessageQueue(prev => [...prev, content.trim()]);
      return;
    }

    await processMessage(content.trim());
  }, [isLoading, processMessage]);

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (lastMessage && !isLoading) {
      setError(null);
      await processMessage(lastMessage);
    }
  }, [lastMessage, isLoading, processMessage]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    clearChat();
    setError(null);
    setLastMessage('');
    setMessageQueue([]);

    // Add welcome message back
    const welcomeMessage = getWelcomeMessage();
    addChatMessage(welcomeMessage);
  }, [clearChat, getWelcomeMessage, addChatMessage]);

  return {
    messages: chatHistory,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    getWelcomeMessage,
    retryLastMessage
  };
};