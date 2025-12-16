import React, { useRef } from 'react';
import { motion } from 'framer-motion';

interface QuickPromptsProps {
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
  className?: string;
}

const defaultPrompts = [
  "Identify coverage gaps",
  "Compare forecast accuracy",
  "Analyze 35% deflection scenario",
  "Review Monday staffing requirements",
  "Calculate ROI potential",
  "Display current metrics",
  "Optimize workforce schedule",
  "Analyze peak hour demands"
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onPromptClick,
  disabled = false,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-400">Quick actions:</p>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors shadow-lg"
          disabled={disabled}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right scroll button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 transition-colors shadow-lg"
          disabled={disabled}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable prompts */}
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide px-10 py-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          } as React.CSSProperties}
        >
          {defaultPrompts.map((prompt, index) => (
            <motion.button
              key={prompt}
              onClick={() => !disabled && onPromptClick(prompt)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 prompt-hover
                ${disabled
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:shadow-lg border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                }
              `}
            >
              {prompt}
            </motion.button>
          ))}
        </div>

        {/* Fade gradients for scroll indication */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-800 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none" />
      </div>

      {/* Mobile scroll hint */}
      <div className="mt-2 text-xs text-gray-500 text-center md:hidden">
        ← Scroll for more prompts →
      </div>
    </div>
  );
};