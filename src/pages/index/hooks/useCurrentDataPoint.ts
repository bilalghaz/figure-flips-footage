
import { useState, useEffect } from 'react';
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';

export const useCurrentDataPoint = (data: ProcessedData | null, currentTime: number) => {
  const [dataPoint, setDataPoint] = useState<PressureDataPoint | null>(null);
  
  useEffect(() => {
    if (!data || !data.pressureData.length) return;
    
    // Find the closest data point to current time
    const closestPoint = findClosestDataPoint(data.pressureData, currentTime);
    setDataPoint(closestPoint);
  }, [data, currentTime]);
  
  // Simple linear search for closest point - more reliable than binary search for this use case
  const findClosestDataPoint = (points: PressureDataPoint[], time: number): PressureDataPoint => {
    let closest = points[0];
    let minDiff = Math.abs(points[0].time - time);
    
    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].time - time);
      if (diff < minDiff) {
        minDiff = diff;
        closest = points[i];
      }
    }
    
    return closest;
  };
  
  return {
    dataPoint,
    getCurrentDataPoint: () => dataPoint
  };
};
