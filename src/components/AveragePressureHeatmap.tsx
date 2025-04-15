
import React, { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AveragePressureHeatmapProps {
  data: ProcessedData | null;
  mode: 'peak' | 'mean';
}

const AveragePressureHeatmap: React.FC<AveragePressureHeatmapProps> = ({ 
  data,
  mode
}) => {
  const [timeRange, setTimeRange] = useState<'full' | 'custom'>('full');
  const [startPercent, setStartPercent] = useState(0);
  const [endPercent, setEndPercent] = useState(100);
  const [showDifference, setShowDifference] = useState(false);
  
  if (!data || !data.pressureData.length) {
    return (
      <div className="bg-white rounded-md shadow p-6">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  const getRegionName = (region: string) => {
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
  
  // Calculate data range based on selection
  const getDataSubset = () => {
    if (timeRange === 'full') {
      return data.pressureData;
    } else {
      const totalPoints = data.pressureData.length;
      const startIndex = Math.floor(totalPoints * (startPercent / 100));
      const endIndex = Math.floor(totalPoints * (endPercent / 100));
      return data.pressureData.slice(startIndex, endIndex + 1);
    }
  };
  
  const dataSubset = getDataSubset();
  
  // Calculate average values for each region
  const calculateAverages = () => {
    const leftAverages: Record<string, number> = {};
    const rightAverages: Record<string, number> = {};
    const differences: Record<string, number> = {};
    
    regions.forEach(region => {
      let leftSum = 0;
      let rightSum = 0;
      
      dataSubset.forEach(point => {
        leftSum += point.leftFoot[region][mode];
        rightSum += point.rightFoot[region][mode];
      });
      
      leftAverages[region] = leftSum / dataSubset.length;
      rightAverages[region] = rightSum / dataSubset.length;
      differences[region] = leftAverages[region] - rightAverages[region];
    });
    
    return { leftAverages, rightAverages, differences };
  };
  
  const { leftAverages, rightAverages, differences } = calculateAverages();
  
  // Find max value for color scaling
  const maxValue = Math.max(
    ...Object.values(leftAverages),
    ...Object.values(rightAverages)
  );
  
  // Find max absolute difference for difference color scaling
  const maxDiffValue = Math.max(
    ...Object.values(differences).map(val => Math.abs(val))
  );
  
  const getPressureColor = (pressure: number, max: number) => {
    // Color scale from blue (low) to red (high) through green, yellow
    const normalized = Math.min(pressure / max, 1);
    
    // RGB for gradient from blue (low) to red (high) through green, yellow
    let r, g, b;
    
    if (normalized < 0.25) {
      // Blue to cyan
      r = 0;
      g = Math.round(normalized * 4 * 255);
      b = 255;
    } else if (normalized < 0.5) {
      // Cyan to green
      r = 0;
      g = 255;
      b = Math.round(255 - ((normalized - 0.25) * 4 * 255));
    } else if (normalized < 0.75) {
      // Green to yellow
      r = Math.round((normalized - 0.5) * 4 * 255);
      g = 255;
      b = 0;
    } else {
      // Yellow to red
      r = 255;
      g = Math.round(255 - ((normalized - 0.75) * 4 * 255));
      b = 0;
    }
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  const getDifferenceColor = (diff: number, maxDiff: number) => {
    // Normalized absolute value (0 to 1)
    const normalizedAbs = Math.min(Math.abs(diff) / maxDiff, 1);
    
    // Red for positive (left > right), blue for negative (right > left)
    if (diff >= 0) {
      // Red scale (left > right)
      return `rgba(255, 0, 0, ${normalizedAbs})`;
    } else {
      // Blue scale (right > left)
      return `rgba(0, 0, 255, ${normalizedAbs})`;
    }
  };
  
  return (
    <div className="bg-white rounded-md shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Average Pressure Heatmap</h2>
        
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'full' | 'custom')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Recording</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeRange === 'custom' && (
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                min="0" 
                max="99" 
                value={startPercent} 
                onChange={(e) => setStartPercent(Number(e.target.value))}
                className="w-16 h-9 rounded-md border border-input bg-background px-3 py-1"
              />
              <span>-</span>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={endPercent} 
                onChange={(e) => setEndPercent(Number(e.target.value))}
                className="w-16 h-9 rounded-md border border-input bg-background px-3 py-1"
              />
              <span>%</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDifference(!showDifference)}
          >
            {showDifference ? 'Show Pressure' : 'Show Difference'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left foot summary */}
        <div className="p-4 border rounded-md">
          <h3 className="text-center font-medium mb-4">Left Foot</h3>
          <div className="grid grid-cols-2 gap-2">
            {regions.map(region => (
              <div 
                key={`left-${region}`}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  backgroundColor: showDifference 
                    ? getDifferenceColor(differences[region], maxDiffValue)
                    : getPressureColor(leftAverages[region], maxValue),
                  color: showDifference 
                    ? (Math.abs(differences[region]) > maxDiffValue * 0.5 ? 'white' : 'black') 
                    : (leftAverages[region] > maxValue * 0.5 ? 'white' : 'black')
                }}
              >
                <span className="font-medium">{getRegionName(region)}</span>
                <span className="font-mono">
                  {showDifference 
                    ? (differences[region] > 0 ? '+' : '') + differences[region].toFixed(1)
                    : leftAverages[region].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Color scale legend */}
        <div className="p-4 border rounded-md flex flex-col justify-center">
          <h3 className="text-center font-medium mb-2">
            {showDifference ? 'Left-Right Difference (kPa)' : `Average ${mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)`}
          </h3>
          
          {showDifference ? (
            // Difference color scale
            <>
              <div className="h-6 w-full my-2 flex rounded-sm overflow-hidden">
                <div 
                  className="h-full w-1/2 bg-gradient-to-r from-blue-100 to-blue-600"
                  style={{
                    background: 'linear-gradient(to left, rgba(0,0,255,1), rgba(0,0,255,0.1))'
                  }}
                />
                <div 
                  className="h-full w-1/2 bg-gradient-to-r from-red-100 to-red-600"
                  style={{
                    background: 'linear-gradient(to right, rgba(255,0,0,0.1), rgba(255,0,0,1))'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span>-{maxDiffValue.toFixed(0)}</span>
                <span>Right &gt; Left</span>
                <span>0</span>
                <span>Left &gt; Right</span>
                <span>+{maxDiffValue.toFixed(0)}</span>
              </div>
            </>
          ) : (
            // Pressure color scale
            <>
              <div className="h-6 w-full my-2 rounded-sm overflow-hidden">
                <div className="h-full w-full flex">
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-full flex-grow" 
                      style={{ backgroundColor: getPressureColor((i / 100) * maxValue, maxValue) }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span>0</span>
                <span>{(maxValue * 0.25).toFixed(0)}</span>
                <span>{(maxValue * 0.5).toFixed(0)}</span>
                <span>{(maxValue * 0.75).toFixed(0)}</span>
                <span>{maxValue.toFixed(0)}</span>
              </div>
            </>
          )}
          
          <div className="text-center text-xs mt-4">
            Based on {dataSubset.length} data points
            {timeRange === 'custom' && (
              <span> ({startPercent}% - {endPercent}%)</span>
            )}
          </div>
        </div>
        
        {/* Right foot summary */}
        <div className="p-4 border rounded-md">
          <h3 className="text-center font-medium mb-4">Right Foot</h3>
          <div className="grid grid-cols-2 gap-2">
            {regions.map(region => (
              <div 
                key={`right-${region}`}
                className="flex items-center justify-between p-2 rounded"
                style={{
                  backgroundColor: showDifference 
                    ? getDifferenceColor(-differences[region], maxDiffValue) // Invert for right foot 
                    : getPressureColor(rightAverages[region], maxValue),
                  color: showDifference 
                    ? (Math.abs(differences[region]) > maxDiffValue * 0.5 ? 'white' : 'black') 
                    : (rightAverages[region] > maxValue * 0.5 ? 'white' : 'black')
                }}
              >
                <span className="font-medium">{getRegionName(region)}</span>
                <span className="font-mono">
                  {showDifference 
                    ? (differences[region] < 0 ? '+' : '') + (-differences[region]).toFixed(1)
                    : rightAverages[region].toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Time range selector */}
      {timeRange === 'custom' && (
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setStartPercent(0);
              setEndPercent(33);
            }}
          >
            First Third
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => {
              setStartPercent(33);
              setEndPercent(66);
            }}
          >
            Middle Third
          </Button>
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => {
              setStartPercent(66);
              setEndPercent(100);
            }}
          >
            Last Third
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setStartPercent(0);
              setEndPercent(100);
            }}
          >
            Full Range
          </Button>
        </div>
      )}
    </div>
  );
};

export default AveragePressureHeatmap;
