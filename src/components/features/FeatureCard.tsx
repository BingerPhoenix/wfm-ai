import React from 'react';
import { motion } from 'framer-motion';
import type { FeatureDescription } from '../../data/featureDescriptions';

interface FeatureCardProps {
  feature: FeatureDescription;
  onClick: () => void;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  onClick,
  className = ''
}) => {
  const isAvailable = !feature.comingSoon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`
        relative cursor-pointer p-6 rounded-xl border transition-all duration-200
        ${isAvailable
          ? 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600 grayscale hover:grayscale-0'
        }
        ${className}
      `}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        {isAvailable ? (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Feature icon */}
      <div className="text-4xl mb-4">{feature.icon}</div>

      {/* Feature name */}
      <h3 className={`text-lg font-semibold mb-2 ${isAvailable ? 'text-white' : 'text-gray-300'}`}>
        {feature.name}
      </h3>

      {/* Feature description - truncated */}
      <p className={`text-sm leading-relaxed mb-4 ${isAvailable ? 'text-gray-300' : 'text-gray-400'}`}>
        {feature.description.length > 120
          ? `${feature.description.slice(0, 120)}...`
          : feature.description
        }
      </p>

      {/* Status badge and CTA */}
      <div className="flex items-center justify-between">
        <div className={`
          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
          ${isAvailable
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }
        `}>
          {isAvailable ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Available Now
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Coming Soon
            </>
          )}
        </div>

        <div className={`
          text-xs font-medium flex items-center
          ${isAvailable ? 'text-blue-400' : 'text-gray-500'}
        `}>
          {isAvailable ? 'Try Now' : 'Learn More'}
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover overlay for locked features */}
      {!isAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center"
        >
          <div className="text-white text-sm font-medium bg-blue-600 px-3 py-1.5 rounded-lg">
            Click to get notified
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};