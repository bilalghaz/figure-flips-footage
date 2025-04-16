
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset loading state when key props change
  useEffect(() => {
    if (!data) {
      setIsLoading(true);
      return;
    }
    
    setIsLoading(true);
    setChartOpacity(0);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Short timeout to allow for React rendering cycle
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      
      // Fade in chart after loading is complete
      requestAnimationFrame(() => {
        setChartOpacity(1);
      });
    }, 300);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, region, mode]);
  
  if (isLoading || !data) {
    return (
      <div className={`relative h-[400px] w-full flex items-center justify-center ${className || ''}`}>
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
  
  return (
    <div 
      className={`relative h-[400px] w-full ${className || ''}`} 
      style={{ 
        opacity: chartOpacity,
        transition: 'opacity 0.3s ease-in-out'
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

export default memo(PressureChart);
