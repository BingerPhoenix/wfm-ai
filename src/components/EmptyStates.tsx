import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type: 'no-gaps' | 'chat-cleared';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  if (type === 'no-gaps') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
        >
          <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Optimal Coverage Achieved</h3>
        <p className="text-gray-600 max-w-md">
          No coverage gaps detected. Your current staffing allocation aligns optimally with forecasted demand.
          Excellent workforce optimization performance.
        </p>
      </motion.div>
    );
  }

  if (type === 'chat-cleared') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center h-full text-center"
      >
        <div className="space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome back to WFM Copilot
            </h3>
            <p className="text-gray-600 text-sm">
              Your conversation has been cleared. Ask questions about staffing requirements,
              forecasting accuracy, or AI deflection scenarios to begin analysis.
            </p>
          </div>
          <div className="pt-2">
            <p className="text-xs text-gray-500">
              Tip: Use the quick action buttons below for common analysis requests
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};