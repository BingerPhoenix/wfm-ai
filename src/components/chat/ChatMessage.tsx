import React from 'react';
import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isTyping?: boolean;
}

// Simple markdown renderer for basic formatting
const renderMarkdown = (content: string): JSX.Element => {
  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        // Code block
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).trim();
          return (
            <pre key={index} className="bg-gray-800 text-green-400 p-3 rounded-lg text-sm overflow-x-auto">
              <code>{code}</code>
            </pre>
          );
        }

        // Inline code
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = part.slice(1, -1);
          return (
            <code key={index} className="bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
              {code}
            </code>
          );
        }

        // Regular text with basic formatting
        const formatted = part
          .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
          .map((segment, segIndex) => {
            if (segment.startsWith('**') && segment.endsWith('**')) {
              return <strong key={segIndex}>{segment.slice(2, -2)}</strong>;
            }
            if (segment.startsWith('*') && segment.endsWith('*')) {
              return <em key={segIndex}>{segment.slice(1, -1)}</em>;
            }

            // Handle line breaks
            return segment.split('\n').map((line, lineIndex, arr) => (
              <React.Fragment key={lineIndex}>
                {line}
                {lineIndex < arr.length - 1 && <br />}
              </React.Fragment>
            ));
          });

        return <div key={index}>{formatted}</div>;
      })}
    </div>
  );
};

// Typing indicator component
const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
    <span className="text-gray-500 text-sm ml-2">AI is thinking...</span>
  </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isTyping = false
}) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        ease: "easeOut"
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 message-appear`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
            ${isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
            }
          `}
        >
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl relative max-w-full
            ${isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }
          `}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed">
            {isTyping ? (
              <TypingIndicator />
            ) : isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              renderMarkdown(message.content)
            )}
          </div>

          {/* Chart update indicator */}
          {message.chartUpdate && !isTyping && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                </svg>
                <span>Charts updated</span>
              </div>
            </div>
          )}

          {/* Timestamp */}
          {!isTyping && (
            <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};