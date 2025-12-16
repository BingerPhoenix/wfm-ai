import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '../store';
import { calculateAIDeflectionRate, calculateCostSavings } from '../lib/calculations';
import type { AIDeflectionMetrics } from '../lib/types';

export const useDeflection = () => {
  const { aiDeflectionMetrics, setAIDeflectionMetrics } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateMetrics = useCallback(async (newMetrics: Partial<AIDeflectionMetrics>) => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedMetrics: AIDeflectionMetrics = {
        ...aiDeflectionMetrics,
        ...newMetrics
      };

      // Recalculate derived metrics
      if (updatedMetrics.totalContacts && updatedMetrics.aiHandled) {
        updatedMetrics.resolutionRate = calculateAIDeflectionRate(
          updatedMetrics.aiHandled,
          updatedMetrics.totalContacts
        );
      }

      setAIDeflectionMetrics(updatedMetrics);
    } finally {
      setIsLoading(false);
    }
  }, [aiDeflectionMetrics, setAIDeflectionMetrics]);

  const calculateSavings = useCallback((costPerContact: number = 15) => {
    return calculateCostSavings(aiDeflectionMetrics, costPerContact);
  }, [aiDeflectionMetrics]);

  const getDeflectionRate = useCallback(() => {
    return calculateAIDeflectionRate(
      aiDeflectionMetrics.aiHandled,
      aiDeflectionMetrics.totalContacts
    );
  }, [aiDeflectionMetrics]);

  return {
    aiDeflectionMetrics,
    isLoading,
    updateMetrics,
    calculateSavings,
    getDeflectionRate
  };
};