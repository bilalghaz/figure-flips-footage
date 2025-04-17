
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
  editMode?: boolean;
  selectedSensor?: string | null;
  onSensorSelect?: (sensorId: string) => void;
  customSensorAssignments?: Record<string, string>;
}

const PressureHeatMap: React.FC<PressureHeatMapProps> = ({
  dataPoint,
  side,
  maxPressure,
  mode,
  className = '',
  editMode = false,
  selectedSensor = null,
  onSensorSelect,
  customSensorAssignments = {}
}) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  
  const sensorMap = side === 'left' ? SVG_TO_SENSOR_MAP_LEFT : SVG_TO_SENSOR_MAP_RIGHT;
  
  const loadSvg = useCallback(async () => {
    try {
      const svgPath = `/svg/${side === 'left' ? 'left_foot.svg' : 'right_foot.svg'}`;
      const response = await fetch(svgPath);
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status} ${response.statusText}`);
      }
      const svgText = await response.text();
      setSvgContent(svgText);
    } catch (error) {
      console.error("Error loading SVG:", error);
    }
  }, [side]);
  
  useEffect(() => {
    loadSvg();
  }, [loadSvg]);
  
  const updateSvgColors = useCallback(() => {
    if (!svgContent || !dataPoint) return null;
    
    let modifiedSvg = svgContent;
    
    // For each SVG element that corresponds to a sensor
    Object.entries(sensorMap).forEach(([svgId, sensorId]) => {
      const footSensors = side === 'left' ? dataPoint.leftFootSensors : dataPoint.rightFootSensors;
      const pressure = footSensors[sensorId] || 0;
      
      // Calculate color based on pressure value
      const color = getPressureColor(pressure, maxPressure);
      
      // Is this sensor currently selected?
      const isSelected = selectedSensor === sensorId;
      
      // Is this sensor custom assigned to a region?
      const hasCustomAssignment = sensorId in customSensorAssignments;
      
      // Modify SVG to apply the color
      const fillRegex = new RegExp(`id="${svgId}"[^>]*fill="[^"]*"`, 'g');
      const strokeRegex = new RegExp(`id="${svgId}"[^>]*stroke="[^"]*"`, 'g');
      const idRegex = new RegExp(`id="${svgId}"`, 'g');
      
      // Determine the appropriate styles based on state
      let fill = color;
      let stroke = 'none';
      let strokeWidth = '0';
      
      if (isSelected) {
        // Selected sensor styling
        stroke = '#ff0000';
        strokeWidth = '1.5';
      } else if (hasCustomAssignment && editMode) {
        // Custom assigned sensor styling in edit mode
        stroke = '#00ff00';
        strokeWidth = '1';
      }
      
      // Update the SVG element with new styles
      if (modifiedSvg.match(fillRegex)) {
        modifiedSvg = modifiedSvg.replace(
          fillRegex,
          `id="${svgId}" fill="${fill}"`
        );
      } else if (modifiedSvg.match(idRegex)) {
        modifiedSvg = modifiedSvg.replace(
          idRegex,
          `id="${svgId}" fill="${fill}"`
        );
      }
      
      // Add stroke style if needed
      if (stroke !== 'none') {
        if (modifiedSvg.match(strokeRegex)) {
          modifiedSvg = modifiedSvg.replace(
            strokeRegex,
            `id="${svgId}" stroke="${stroke}" stroke-width="${strokeWidth}"`
          );
        } else {
          // Add stroke attribute if it doesn't exist
          modifiedSvg = modifiedSvg.replace(
            new RegExp(`id="${svgId}"([^>]*)>`, 'g'),
            `id="${svgId}"$1 stroke="${stroke}" stroke-width="${strokeWidth}">`
          );
        }
      }
      
      // Add click event handler for edit mode
      if (editMode) {
        // Add pointer events and cursor style for clickable areas
        modifiedSvg = modifiedSvg.replace(
          new RegExp(`id="${svgId}"([^>]*)>`, 'g'),
          `id="${svgId}"$1 style="cursor: pointer;" data-sensor-id="${sensorId}">`
        );
      }
    });
    
    return modifiedSvg;
  }, [svgContent, dataPoint, maxPressure, sensorMap, side, selectedSensor, customSensorAssignments, editMode]);
  
  // Handle click events on sensors
  const handleSvgClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode || !onSensorSelect) return;
    
    // Find the clicked element
    const target = e.target as HTMLElement;
    const sensorId = target.getAttribute('data-sensor-id');
    
    if (sensorId) {
      onSensorSelect(sensorId);
    }
  }, [editMode, onSensorSelect]);
  
  // Handle rendering the modified SVG
  const renderedSvg = updateSvgColors();
  
  if (!dataPoint) {
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
      
      {editMode && (
        <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs py-1 px-2 rounded-full">
          {selectedSensor ? `Sensor ${selectedSensor} selected` : 'Click on a sensor'}
        </div>
      )}
      
      <div 
        className="flex justify-center items-center min-h-[350px]"
        onClick={handleSvgClick}
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
