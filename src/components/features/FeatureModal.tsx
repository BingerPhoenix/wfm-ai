import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeatureDescription } from '../../data/featureDescriptions';

interface FeatureModalProps {
  feature: FeatureDescription | null;
  isOpen: boolean;
  onClose: () => void;
  onTryWFMCopilot: () => void;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({
  feature,
  isOpen,
  onClose,
  onTryWFMCopilot
}) => {
  const [email, setEmail] = useState('');
  const [showThanks, setShowThanks] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setShowThanks(true);
      setEmail('');
      setTimeout(() => setShowThanks(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail('');
    setShowThanks(false);
    onClose();
  };

  if (!feature) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto sm:max-w-lg sm:rounded-2xl sm:m-4 m-2 sm:max-h-[85vh] max-h-[95vh]"
          >
            {/* Close button - larger on mobile */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="p-8">
              {/* Feature icon */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {feature.name}
                </h2>

                {/* Coming Soon badge */}
                {feature.comingSoon && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm font-medium border border-blue-500/30">
                    <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature.badge}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed mb-8 text-center">
                {feature.description}
              </p>

              {/* Email notification form - only for coming soon features */}
              {feature.comingSoon && (
                <div className="space-y-4 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Get notified when it's ready
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Be the first to try {feature.name} when it launches
                    </p>
                  </div>

                  {showThanks ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <div className="text-green-400 text-lg font-medium flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Thanks! We'll notify you.
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                      >
                        Notify Me
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Try WFM Copilot CTA */}
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-900 px-4 text-gray-400">
                      Available now
                    </span>
                  </div>
                </div>

                <button
                  onClick={onTryWFMCopilot}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors border border-gray-600 hover:border-gray-500 flex items-center justify-center group"
                >
                  Try WFM Copilot Instead
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};