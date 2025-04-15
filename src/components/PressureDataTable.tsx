
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
      <div className="bg-white rounded-md shadow p-4">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  const getDisplayName = (region: string) => {
    switch (region) {
      case 'heel': return 'Heel';
      case 'medialMidfoot': return 'Medial Midfoot';
      case 'lateralMidfoot': return 'Lateral Midfoot';
      case 'forefoot': return 'Forefoot';
      case 'toes': return 'Toes';
      case 'hallux': return 'Hallux';
      default: return region;
    }
  };
  
  return (
    <div className="bg-white rounded-md shadow">
      <Table>
        <TableCaption>
          {mode === 'peak' ? 'Peak Pressure (kPa)' : 'Mean Pressure (kPa)'} at {dataPoint.time.toFixed(2)}s
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead className="text-right">Left Foot</TableHead>
            <TableHead className="text-right">Right Foot</TableHead>
            <TableHead className="text-right">Difference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => {
            const leftValue = dataPoint.leftFoot[region][mode];
            const rightValue = dataPoint.rightFoot[region][mode];
            const difference = leftValue - rightValue;
            const absPercentDiff = Math.abs(difference) / Math.max(leftValue, rightValue, 0.001) * 100;
            
            return (
              <TableRow key={region}>
                <TableCell className="font-medium">{getDisplayName(region)}</TableCell>
                <TableCell className="text-right">{leftValue.toFixed(2)}</TableCell>
                <TableCell className="text-right">{rightValue.toFixed(2)}</TableCell>
                <TableCell 
                  className={`text-right ${difference > 0 ? 'text-red-500' : difference < 0 ? 'text-blue-500' : ''}`}
                >
                  {difference.toFixed(2)} ({absPercentDiff.toFixed(1)}%)
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PressureDataTable;
