
import React, { useState, useEffect, useRef, memo } from 'react';
import EnhancedPressureChart from './EnhancedPressureChart';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { LoaderCircle } from 'lucide-react';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
  className?: string;
}

// Memoize the chart component to prevent unnecessary re-renders
const MemoizedEnhancedPressureChart = memo(EnhancedPressureChart);

const PressureChart: React.FC<PressureChartProps> = ({ 
  data, 
  currentTime, 
  region, 
  mode,
  className
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartOpacity, setChartOpacity] = useState(0);
  const lastRegionRef = useRef(region);
  const lastModeRef = useRef(mode);
  
  useEffect(() => {
    // Only trigger loading state when region or mode changes
    if (lastRegionRef.current !== region || lastModeRef.current !== mode) {
      setIsLoading(true);
      setChartOpacity(0);
      
      lastRegionRef.current = region;
      lastModeRef.current = mode;
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        // After loading state ends, gradually fade in the chart
        const fadeTimer = setTimeout(() => {
          setChartOpacity(1);
        }, 50);
        
        return () => clearTimeout(fadeTimer);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [data, region, mode]);
  
  if (isLoading || !data) {
    return (
      <div className={`relative h-[400px] w-full overflow-hidden flex flex-col items-center justify-center ${className || ''}`}>
        <Skeleton className="h-[350px] w-full rounded-md" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center">
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading chart...</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Prevent layout shifts and display issues with appropriate container styling
  return (
    <div 
      className={`relative h-[400px] w-full overflow-hidden ${className || ''}`} 
      style={{ 
        contain: 'size layout',
        opacity: chartOpacity,
        transition: 'opacity 0.2s ease-in-out'
      }}
    >
      <MemoizedEnhancedPressureChart 
        data={data} 
        currentTime={currentTime} 
        region={region} 
        mode={mode} 
      />
    </div>
  );
};

export default PressureChart;
