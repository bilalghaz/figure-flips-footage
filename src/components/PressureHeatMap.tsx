
import React, { useState, useCallback, useEffect } from 'react';
import { PressureDataPoint, SVG_TO_SENSOR_MAP_LEFT, SVG_TO_SENSOR_MAP_RIGHT } from '@/utils/pressureDataProcessor';
import { getPressureColor } from '@/utils/colorUtils';
import { Skeleton } from '@/components/ui/skeleton';

interface PressureHeatMapProps {
  dataPoint: PressureDataPoint | null;
  side: 'left' | 'right';
  maxPressure: number;
  mode: 'peak' | 'mean';
  className?: string;
}

const PressureHeatMap: React.FC<PressureHeatMapProps> = ({
  dataPoint,
  side,
  maxPressure,
  mode,
  className = ''
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const sensorMap = side === 'left' ? SVG_TO_SENSOR_MAP_LEFT : SVG_TO_SENSOR_MAP_RIGHT;
  
  const loadSvg = useCallback(async () => {
    try {
      const svgPath = `/svg/${side === 'left' ? 'left_foot.svg' : 'right_foot.svg'}`;
      console.log(`Attempting to load SVG from: ${svgPath}`);
      
      const response = await fetch(svgPath);
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
      }
      
      const svgText = await response.text();
      
      // Check if the response is actually an SVG file and not an HTML document
      if (svgText.includes('<!DOCTYPE html>')) {
        throw new Error('Received HTML instead of SVG content');
      }
      
      console.log(`SVG loaded successfully (${svgText.length} characters)`);
      setSvgContent(svgText);
      setError(null);
    } catch (error) {
      console.error("Error loading SVG:", error);
      setError(`Failed to load foot SVG: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [side]);
  
  useEffect(() => {
    loadSvg();
  }, [loadSvg]);
  
  const updateSvgColors = useCallback(() => {
    if (!svgContent || !dataPoint) return null;
    
    let modifiedSvg = svgContent;
    
    // For each sensor path in the SVG
    const prefix = side === 'left' ? 'R_' : 'L_';
    for (let i = 1; i <= 99; i++) {
      const sensorId = `${prefix}${String(i).padStart(2, '0')}`;
      const footSensors = side === 'left' ? dataPoint.leftFootSensors : dataPoint.rightFootSensors;
      const pressure = footSensors[sensorId] || 0;
      
      // Calculate color based on pressure value
      const color = getPressureColor(pressure, maxPressure);
      
      // Modify SVG to apply the color
      const pathRegex = new RegExp(`id="${sensorId}"[^>]*`, 'g');
      
      if (modifiedSvg.match(pathRegex)) {
        modifiedSvg = modifiedSvg.replace(
          pathRegex,
          `id="${sensorId}" fill="${color}" stroke="black" stroke-width="1"`
        );
      }
    }
    
    return modifiedSvg;
  }, [svgContent, dataPoint, maxPressure, side]);
  
  // Handle rendering the modified SVG
  const renderedSvg = updateSvgColors();
  
  if (error) {
    return (
      <div className={`relative flex flex-col items-center justify-center h-[400px] ${className} bg-card p-4 rounded-md shadow-sm`}>
        <div className="text-red-500 mb-2">{error}</div>
        <button 
          onClick={loadSvg}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }
  
  if (!dataPoint || !svgContent) {
    return (
      <div className={`relative flex items-center justify-center h-[400px] ${className}`}>
        <Skeleton className="h-[350px] w-[350px] rounded-md" />
      </div>
    );
  }
  
  return (
    <div className={`relative bg-card p-4 rounded-md shadow-sm ${className}`}>
      <h3 className="text-sm font-medium mb-2">
        {side === 'left' ? 'Left Foot' : 'Right Foot'} - {mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)
      </h3>
      
      <div 
        className="flex justify-center items-center min-h-[350px]"
        dangerouslySetInnerHTML={renderedSvg ? { __html: renderedSvg } : undefined}
      />
      
      {/* Pressure scale legend */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 kPa</span>
          <span>{Math.floor(maxPressure)} kPa</span>
        </div>
        <div className="h-2 w-full mt-1 rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500" />
      </div>
    </div>
  );
};

export default PressureHeatMap;
