
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PressureDataPoint } from '@/utils/pressureDataProcessor';

interface PressureDataTableProps {
  dataPoint: PressureDataPoint | null;
  mode: 'peak' | 'mean';
}

const PressureDataTable: React.FC<PressureDataTableProps> = ({ dataPoint, mode }) => {
  if (!dataPoint) {
    return (
      <div className="bg-card rounded-md shadow-sm p-4">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  const regions = ['fullFoot', 'heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  const getDisplayName = (region: string) => {
    switch (region) {
      case 'fullFoot': return 'Full Foot';
      case 'heel': return 'Heel';
      case 'medialMidfoot': return 'Medial Midfoot';
      case 'lateralMidfoot': return 'Lateral Midfoot';
      case 'forefoot': return 'Forefoot';
      case 'toes': return 'Toes';
      case 'hallux': return 'Hallux';
      default: return region;
    }
  };

  // Calculate full foot pressure for both feet
  const calculateFullFootPressure = (foot: Record<string, any>) => {
    let totalPressure = 0;
    for (const regionKey in foot) {
      if (foot[regionKey] && foot[regionKey][mode] !== undefined) {
        totalPressure += foot[regionKey][mode];
      }
    }
    return totalPressure;
  };
  
  return (
    <div className="bg-card rounded-md shadow-sm overflow-hidden">
      <Table>
        <TableCaption>
          {mode === 'peak' ? 'Peak Pressure (kPa)' : 'Mean Pressure (kPa)'} at {dataPoint.time.toFixed(2)}s
        </TableCaption>
        <TableHeader className="bg-muted/20">
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Left Foot</TableHead>
            <TableHead className="text-right">Right Foot</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => {
            let leftValue, rightValue;
            
            if (region === 'fullFoot') {
              leftValue = calculateFullFootPressure(dataPoint.leftFoot);
              rightValue = calculateFullFootPressure(dataPoint.rightFoot);
            } else {
              // Add safety checks to handle missing regions in the data
              const leftFootRegion = dataPoint.leftFoot[region];
              const rightFootRegion = dataPoint.rightFoot[region];
              
              // Skip this region if it doesn't exist in either foot
              if (!leftFootRegion || !rightFootRegion) {
                return null;
              }
              
              leftValue = leftFootRegion[mode] || 0;
              rightValue = rightFootRegion[mode] || 0;
            }
            
            return (
              <TableRow key={region} className="hover:bg-muted/10">
                <TableCell className="font-medium">{getDisplayName(region)}</TableCell>
                <TableCell className="text-right">{leftValue.toFixed(2)}</TableCell>
                <TableCell className="text-right">{rightValue.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PressureDataTable;
