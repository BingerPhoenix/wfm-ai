import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { forecastVolume, calculateStaffingRequirement } from '../lib/calculations';
import type { ForecastData } from '../lib/types';

export const useForecast = () => {
  const { forecastData, setForecastData } = useAppStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const generateForecast = useCallback(async (
    historicalData?: number[],
    periods: number = 7
  ) => {
    setIsUpdating(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const defaultHistorical = [45, 68, 89, 112, 95, 78, 65];
      const volumes = forecastVolume(historicalData || defaultHistorical, periods);

      const newForecastData: ForecastData[] = volumes.map((volume, index) => {
        const hour = 9 + index;
        return {
          period: `${hour.toString().padStart(2, '0')}:00`,
          contactVolume: index === 0 ? volume : 0, // Only current hour has actual data
          predictedVolume: volume,
          staffRequired: calculateStaffingRequirement(volume, 300), // 5 min avg handle time
          currentStaff: Math.floor(volume * 0.8) // Simulated current staffing
        };
      });

      setForecastData(newForecastData);
    } finally {
      setIsUpdating(false);
    }
  }, [setForecastData]);

  const updateForecastData = useCallback((updatedData: ForecastData[]) => {
    setForecastData(updatedData);
  }, [setForecastData]);

  return {
    forecastData,
    isUpdating,
    generateForecast,
    updateForecastData
  };
};