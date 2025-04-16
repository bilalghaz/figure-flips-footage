
import React, { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Skeleton } from '@/components/ui/skeleton';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
  className?: string;
}

const PressureChart: React.FC<PressureChartProps> = ({ 
  data, 
  currentTime, 
  region, 
  mode,
  className
}) => {
  if (!data) {
    return (
      <div className={`relative h-[400px] w-full flex items-center justify-center ${className || ''}`}>
        <Skeleton className="h-[350px] w-full rounded-md" />
      </div>
    );
  }
  
  // Sample data points for better performance
  const maxPoints = 200; // Limit to maximum 200 points for better performance
  const stride = Math.max(1, Math.floor(data.pressureData.length / maxPoints));
  
  const chartData = [];
  for (let i = 0; i < data.pressureData.length; i += stride) {
    const point = data.pressureData[i];
    chartData.push({
      time: point.time,
      left: point.leftFoot[region][mode],
      right: point.rightFoot[region][mode],
      current: point.time <= currentTime
    });
  }
  
  // Always include the current time point for accurate display
  const currentIndex = data.pressureData.findIndex(point => point.time > currentTime);
  if (currentIndex > 0) {
    const currentPoint = data.pressureData[currentIndex - 1];
    chartData.push({
      time: currentPoint.time,
      left: currentPoint.leftFoot[region][mode],
      right: currentPoint.rightFoot[region][mode],
      current: true
    });
  }
  
  // Sort to ensure correct order
  chartData.sort((a, b) => a.time - b.time);
  
  // Calculate max Y value for the chart
  const maxValue = Math.max(
    ...chartData.map(d => Math.max(d.left, d.right)),
    mode === 'peak' ? data.maxPeakPressure * 0.5 : data.maxMeanPressure * 0.5
  ) * 1.1;
  
  const getRegionName = (region: string) => {
    switch (region) {
      case 'heel': return 'Heel';
      case 'medialMidfoot': return 'Medial Midfoot';
      case 'lateralMidfoot': return 'Lateral Midfoot';
      case 'forefoot': return 'Forefoot';
      case 'toes': return 'Toes';
      case 'hallux': return 'Hallux';
      default: return region;
    }
  };
  
  return (
    <div className="h-[400px] bg-card p-4 rounded-md shadow-sm">
      <h3 className="text-sm font-medium mb-4">
        {getRegionName(region)} {mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)
      </h3>
      
      <div className="relative h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }}
              type="number"
              scale="linear"
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft', offset: 0 }}
              domain={[0, maxValue]}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip 
              formatter={(value: number) => [value.toFixed(2) + ' kPa']}
              labelFormatter={(time) => `Time: ${Number(time).toFixed(2)}s`}
              contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* Current time reference line */}
            <ReferenceLine 
              x={currentTime} 
              stroke="var(--destructive)" 
              strokeWidth={2} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Current', 
                position: 'top', 
                fill: 'var(--destructive)',
                fontSize: 12
              }}
            />
            
            <Line 
              type="monotone" 
              dataKey="left" 
              name="Left Foot" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animations for better performance
            />
            <Line 
              type="monotone" 
              dataKey="right" 
              name="Right Foot" 
              stroke="#82ca9d" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animations for better performance
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(PressureChart);
