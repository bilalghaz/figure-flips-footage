
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
import { Badge } from "@/components/ui/badge";

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

  // Function to determine asymmetry level
  const getAsymmetryLevel = (percentDiff: number) => {
    if (percentDiff < 5) return { label: 'Minimal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (percentDiff < 15) return { label: 'Low', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    if (percentDiff < 25) return { label: 'Moderate', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return { label: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
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
            <TableHead className="text-right">Difference</TableHead>
            <TableHead className="text-right">Asymmetry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => {
            // Add safety checks to handle missing regions in the data
            const leftFootRegion = dataPoint.leftFoot[region];
            const rightFootRegion = dataPoint.rightFoot[region];
            
            // Skip this region if it doesn't exist in either foot
            if (!leftFootRegion || !rightFootRegion) {
              return null;
            }
            
            const leftValue = leftFootRegion[mode] || 0;
            const rightValue = rightFootRegion[mode] || 0;
            const difference = leftValue - rightValue;
            const absPercentDiff = Math.abs(difference) / Math.max(leftValue, rightValue, 0.001) * 100;
            const asymmetry = getAsymmetryLevel(absPercentDiff);
            
            return (
              <TableRow key={region} className="hover:bg-muted/10">
                <TableCell className="font-medium">{getDisplayName(region)}</TableCell>
                <TableCell className="text-right">{leftValue.toFixed(2)}</TableCell>
                <TableCell className="text-right">{rightValue.toFixed(2)}</TableCell>
                <TableCell 
                  className={`text-right ${difference > 0 ? 'text-red-500 dark:text-red-400' : difference < 0 ? 'text-blue-500 dark:text-blue-400' : ''}`}
                >
                  {difference.toFixed(2)} ({absPercentDiff.toFixed(1)}%)
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={`${asymmetry.color}`}>
                    {asymmetry.label}
                  </Badge>
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
