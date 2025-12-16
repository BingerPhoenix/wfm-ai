import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { QuickPrompts } from './QuickPrompts';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage as ChatMessageType } from '../../lib/types';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  className = ''
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const handleSendMessage = (message: string) => {
    onSendMessage(message);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Chat history scroll area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#4B5563 #374151'
        }}
      >
        {messages.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Welcome to WFM Copilot
                </h3>
                <p className="text-gray-400 text-sm">
                  Ask questions about staffing requirements, forecasting accuracy, and AI deflection scenarios.
                  I'll provide insights to optimize your workforce management strategy.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-1">
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll target */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick prompts */}
      <div className="border-t border-gray-700 p-4">
        <QuickPrompts
          onPromptClick={handleQuickPrompt}
          disabled={isLoading}
        />
      </div>

      {/* Input area - fixed at bottom */}
      <div className="border-t border-gray-700 p-4">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask about staffing requirements, forecasting accuracy, or deflection scenarios..."
        />
      </div>
    </div>
  );
};