
import React from 'react';
import EnhancedPressureChart from './EnhancedPressureChart';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
  className?: string; // Add className prop for more flexible styling
}

const PressureChart: React.FC<PressureChartProps> = ({ 
  data, 
  currentTime, 
  region, 
  mode,
  className
}) => {
  // Prevent layout shifts by using a fixed height container
  return (
    <div className={`relative h-[400px] w-full overflow-hidden ${className || ''}`}>
      <EnhancedPressureChart 
        data={data} 
        currentTime={currentTime} 
        region={region} 
        mode={mode} 
      />
    </div>
  );
};

export default PressureChart;
