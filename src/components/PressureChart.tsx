
import React from 'react';
import EnhancedPressureChart from './EnhancedPressureChart';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
}

const PressureChart: React.FC<PressureChartProps> = (props) => {
  return <EnhancedPressureChart {...props} />;
};

export default PressureChart;
