
import React from 'react';
import { PressureDataPoint } from '@/utils/pressureDataProcessor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PressureDataTableProps {
  dataPoint: PressureDataPoint | null;
  mode: 'peak' | 'mean';
  customSensorAssignments?: {
    left: Record<string, string>;
    right: Record<string, string>;
  };
}

const PressureDataTable: React.FC<PressureDataTableProps> = ({ 
  dataPoint, 
  mode,
  customSensorAssignments = { left: {}, right: {} }
}) => {
  if (!dataPoint) {
    return (
      <div className="flex justify-center items-center h-40 text-muted-foreground">
        No data available
      </div>
    );
  }
  
  // Get standard region definitions
  const getDefaultRegionSensors = (side: 'left' | 'right') => {
    const prefix = side === 'left' ? 'R_' : 'L_';
    
    return {
      heel: Array.from({length: 25}, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`),
      medialMidfoot: [`${prefix}30`, `${prefix}31`, `${prefix}32`, `${prefix}33`, `${prefix}37`, `${prefix}38`, `${prefix}39`, `${prefix}40`, `${prefix}44`, `${prefix}45`, `${prefix}46`, `${prefix}47`, `${prefix}51`, `${prefix}52`, `${prefix}53`, `${prefix}54`],
      lateralMidfoot: [`${prefix}27`, `${prefix}28`, `${prefix}29`, `${prefix}34`, `${prefix}35`, `${prefix}36`, `${prefix}41`, `${prefix}42`, `${prefix}43`, `${prefix}48`, `${prefix}49`, `${prefix}50`],
      forefoot: Array.from({length: 28}, (_, i) => `${prefix}${String(i + 55).padStart(2, '0')}`),
      toes: [`${prefix}85`, `${prefix}86`, `${prefix}87`, `${prefix}88`, `${prefix}89`, `${prefix}92`, `${prefix}93`, `${prefix}94`, `${prefix}95`, `${prefix}97`, `${prefix}98`, `${prefix}99`],
      hallux: [`${prefix}83`, `${prefix}84`, `${prefix}90`, `${prefix}91`, `${prefix}96`],
    };
  };
  
  // Apply custom assignments to get the final region mapping
  const getCustomizedRegionSensors = (side: 'left' | 'right') => {
    const defaultRegions = getDefaultRegionSensors(side);
    const regions = { ...defaultRegions };
    const assignments = side === 'left' ? customSensorAssignments.left : customSensorAssignments.right;
    
    // If there are custom assignments, we need to rebuild the region mappings
    if (Object.keys(assignments).length > 0) {
      // Remove sensors from their default regions
      Object.entries(assignments).forEach(([sensorId, _]) => {
        for (const region in regions) {
          regions[region] = regions[region].filter(id => id !== sensorId);
        }
      });
      
      // Add sensors to their assigned regions
      Object.entries(assignments).forEach(([sensorId, region]) => {
        if (regions[region]) {
          regions[region].push(sensorId);
        }
      });
    }
    
    return regions;
  };
  
  // Calculate custom region values
  const calculateRegionData = (side: 'left' | 'right') => {
    const regionSensors = getCustomizedRegionSensors(side);
    const footSensors = side === 'left' ? dataPoint.leftFootSensors : dataPoint.rightFootSensors;
    const result: Record<string, { peak: number; mean: number }> = {};
    
    // Process each region
    for (const [region, sensorIds] of Object.entries(regionSensors)) {
      const sensorValues = sensorIds
        .map(id => footSensors[id] || 0)
        .filter(value => !isNaN(value));
      
      if (sensorValues.length > 0) {
        const peak = Math.max(...sensorValues);
        const mean = sensorValues.reduce((sum, val) => sum + val, 0) / sensorValues.length;
        
        result[region] = { peak, mean };
      } else {
        result[region] = { peak: 0, mean: 0 };
      }
    }
    
    // Add fullFoot calculation
    const allValues = Object.values(footSensors).filter(value => !isNaN(value));
    if (allValues.length > 0) {
      const peak = Math.max(...allValues);
      const mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
      result.fullFoot = { peak, mean };
    } else {
      result.fullFoot = { peak: 0, mean: 0 };
    }
    
    return result;
  };
  
  const leftFootData = calculateRegionData('left');
  const rightFootData = calculateRegionData('right');
  
  // Display names for regions
  const regionDisplayNames: Record<string, string> = {
    fullFoot: 'Full Foot',
    heel: 'Heel',
    medialMidfoot: 'Medial Midfoot',
    lateralMidfoot: 'Lateral Midfoot',
    forefoot: 'Forefoot',
    toes: 'Toes',
    hallux: 'Hallux'
  };
  
  // Format pressure values
  const formatPressure = (value: number) => {
    return value.toFixed(1);
  };
  
  // Regions to display in order
  const regionsInOrder = ['fullFoot', 'heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Region</TableHead>
            <TableHead className="text-right">Left Foot (kPa)</TableHead>
            <TableHead className="text-right">Right Foot (kPa)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regionsInOrder.map((region) => (
            <TableRow key={region}>
              <TableCell className="font-medium">{regionDisplayNames[region]}</TableCell>
              <TableCell className="text-right">{formatPressure(leftFootData[region]?.[mode] || 0)}</TableCell>
              <TableCell className="text-right">{formatPressure(rightFootData[region]?.[mode] || 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PressureDataTable;
