import React from 'react';

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="w-full h-full animate-pulse">
      {/* Title skeleton */}
      <div className="mb-4">
        <div className="h-6 bg-gray-700 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-700 rounded w-64" />
      </div>

      {/* Chart area skeleton */}
      <div className="relative h-64 bg-gray-800 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-4 space-y-8">
          <div className="h-3 bg-gray-700 rounded w-8" />
          <div className="h-3 bg-gray-700 rounded w-8" />
          <div className="h-3 bg-gray-700 rounded w-8" />
          <div className="h-3 bg-gray-700 rounded w-8" />
        </div>

        {/* Chart lines */}
        <div className="ml-12 h-full flex items-end space-x-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-700 rounded-t"
              style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-2 left-12 right-4 flex justify-between">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-700 rounded w-12" />
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-700 rounded" />
          <div className="h-3 bg-gray-700 rounded w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-700 rounded" />
          <div className="h-3 bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
};