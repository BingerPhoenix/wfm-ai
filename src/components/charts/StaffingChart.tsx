import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { StaffingMetrics } from '../../lib/types';

interface StaffingChartProps {
  data: StaffingMetrics[];
  height?: number;
  metric?: 'utilization' | 'efficiency' | 'both';
}

export const StaffingChart: React.FC<StaffingChartProps> = ({
  data,
  height = 300,
  metric = 'utilization'
}) => {
  const chartData = data.map(staff => ({
    name: staff.name,
    utilization: staff.utilization,
    efficiency: staff.efficiency,
    department: staff.department
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}%`,
              name === 'utilization' ? 'Utilization' : 'Efficiency'
            ]}
          />
          <Legend />
          {metric === 'utilization' && (
            <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
          )}
          {metric === 'efficiency' && (
            <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
          )}
          {metric === 'both' && (
            <>
              <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
              <Bar dataKey="efficiency" fill="#10b981" name="Efficiency %" />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};