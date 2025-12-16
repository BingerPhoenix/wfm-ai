import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FeatureModal } from '../features/FeatureModal';
import { FeatureCard } from '../features/FeatureCard';
import { featureDescriptions, type FeatureDescription } from '../../data/featureDescriptions';

// Convert feature descriptions to array for grid display
const featuresArray = Object.values(featureDescriptions);

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureDescription | null>(null);

  const handleFeatureClick = (feature: FeatureDescription) => {
    if (!feature.comingSoon) {
      onEnterApp();
    } else {
      setSelectedFeature(feature);
    }
  };

  const handleTryWFMCopilot = () => {
    setSelectedFeature(null);
    onEnterApp();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black"
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-transparent"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative px-6 py-24 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
            >
              AI-Native Workforce Management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-6 text-xl leading-8 text-gray-300 max-w-2xl mx-auto"
            >
              Stop treating AI as a deduction. Start treating it as a team member.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={onEnterApp}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
              >
                <span className="relative flex items-center">
                  Try WFM Copilot
                  <svg
                    className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="px-6 py-24 mx-auto max-w-7xl lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The Complete WFM Suite
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Built for the era of AI-human collaboration
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {featuresArray.map((feature, index) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
            >
              <FeatureCard
                feature={feature}
                onClick={() => handleFeatureClick(feature)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="border-t border-gray-800 py-8 text-center text-gray-400"
      >
        <p>Built by Shubbankar Sharma | Prototype for UJET</p>
      </motion.footer>

      {/* Feature Modal */}
      <FeatureModal
        feature={selectedFeature}
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onTryWFMCopilot={handleTryWFMCopilot}
      />
    </div>
  );
};