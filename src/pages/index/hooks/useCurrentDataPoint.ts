
import { useState, useEffect, useCallback } from 'react';
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';

export const useCurrentDataPoint = (data: ProcessedData | null, currentTime: number) => {
  const [cachedDataPoint, setCachedDataPoint] = useState<PressureDataPoint | null>(null);
  
  // Memoized function to get current data point
  const getCurrentDataPoint = useCallback((): PressureDataPoint | null => {
    if (!data || !data.pressureData.length) return null;
    
    // Binary search for better performance with large datasets
    let start = 0;
    let end = data.pressureData.length - 1;
    
    while (start <= end) {
      const mid = Math.floor((start + end) / 2);
      if (data.pressureData[mid].time === currentTime) {
        return data.pressureData[mid];
      }
      
      if (data.pressureData[mid].time < currentTime) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    
    // If we didn't find an exact match, return the closest time before the current time
    return end >= 0 ? data.pressureData[end] : data.pressureData[0];
  }, [data, currentTime]);
  
  // Update cached data point when current time changes
  useEffect(() => {
    if (data) {
      setCachedDataPoint(getCurrentDataPoint());
    }
  }, [currentTime, data, getCurrentDataPoint]);
  
  return {
    cachedDataPoint,
    getCurrentDataPoint
  };
};
