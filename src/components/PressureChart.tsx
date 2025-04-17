
import React, { memo, useState, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Brush
} from 'recharts';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer } from './ui/chart';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
  side: 'left' | 'right';
  className?: string;
  enableZoom?: boolean;
}

const PressureChart: React.FC<PressureChartProps> = ({ 
  data, 
  currentTime, 
  region, 
  mode,
  side,
  className,
  enableZoom = false
}) => {
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [timeRange, setTimeRange] = useState<[number, number] | null>(null);
  
  if (!data) {
    return (
      <div className={`relative h-[400px] w-full flex items-center justify-center ${className || ''}`}>
        <Skeleton className="h-[350px] w-full rounded-md" />
      </div>
    );
  }
  
  // Sample data points for better performance
  const maxPoints = 200; // Limit to maximum 200 points for better performance
  const stride = Math.max(1, Math.floor(data.pressureData.length / maxPoints));
  
  const chartData = [];
  for (let i = 0; i < data.pressureData.length; i += stride) {
    const point = data.pressureData[i];
    
    // Check if the region exists in the data
    let pressureValue = 0;
    
    if (region === 'fullFoot') {
      // Calculate total foot pressure by summing all regions
      const footData = side === 'left' ? point.leftFoot : point.rightFoot;
      let totalPressure = 0;
      for (const regionKey in footData) {
        if (footData[regionKey] && footData[regionKey][mode]) {
          totalPressure += footData[regionKey][mode];
        }
      }
      pressureValue = totalPressure;
    } else {
      // Get specific region pressure
      const footData = side === 'left' ? point.leftFoot : point.rightFoot;
      if (footData[region] && footData[region][mode] !== undefined) {
        pressureValue = footData[region][mode];
      }
    }
    
    chartData.push({
      time: point.time,
      pressure: pressureValue,
      current: point.time <= currentTime
    });
  }
  
  // Always include the current time point for accurate display
  const currentIndex = data.pressureData.findIndex(point => point.time > currentTime);
  if (currentIndex > 0) {
    const currentPoint = data.pressureData[currentIndex - 1];
    let pressureValue = 0;
    
    if (region === 'fullFoot') {
      // Calculate total foot pressure
      const footData = side === 'left' ? currentPoint.leftFoot : currentPoint.rightFoot;
      let totalPressure = 0;
      for (const regionKey in footData) {
        if (footData[regionKey] && footData[regionKey][mode]) {
          totalPressure += footData[regionKey][mode];
        }
      }
      pressureValue = totalPressure;
    } else {
      const footData = side === 'left' ? currentPoint.leftFoot : currentPoint.rightFoot;
      if (footData[region] && footData[region][mode] !== undefined) {
        pressureValue = footData[region][mode];
      }
    }
    
    chartData.push({
      time: currentPoint.time,
      pressure: pressureValue,
      current: true
    });
  }
  
  // Sort to ensure correct order
  chartData.sort((a, b) => a.time - b.time);
  
  // Calculate max Y value for the chart
  const maxValue = Math.max(
    ...chartData.map(d => d.pressure),
    mode === 'peak' ? data.maxPeakPressure * 0.5 : data.maxMeanPressure * 0.5
  ) * 1.1;
  
  const getRegionName = (region: string) => {
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
  
  const getSideName = (side: 'left' | 'right') => {
    return side === 'left' ? 'Left Foot' : 'Right Foot';
  };
  
  // Zoom functionality
  const handleMouseDown = (e: any) => {
    if (!enableZoom) return;
    if (e && e.activeLabel) {
      setRefAreaLeft(e.activeLabel);
    }
  };
  
  const handleMouseMove = (e: any) => {
    if (!enableZoom) return;
    if (refAreaLeft && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel);
    }
  };
  
  const handleMouseUp = () => {
    if (!enableZoom) return;
    if (refAreaLeft && refAreaRight) {
      // Convert string time labels to numbers for the time range
      const left = parseFloat(refAreaLeft);
      const right = parseFloat(refAreaRight);
      
      // Ensure left is less than right
      if (left < right) {
        setTimeRange([left, right]);
      } else {
        setTimeRange([right, left]);
      }
      
      // Reset the reference areas
      setRefAreaLeft('');
      setRefAreaRight('');
    }
  };
  
  const handleZoomOut = () => {
    setTimeRange(null);
  };
  
  // Calculate the domain for X-axis based on zoom
  const xDomain = timeRange ? 
    [timeRange[0], timeRange[1]] : 
    [0, chartData[chartData.length - 1]?.time || 0];
  
  const lineColor = side === 'left' ? "#8884d8" : "#82ca9d";
  
  return (
    <div className={`bg-card p-4 rounded-md shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">
          {getSideName(side)} - {getRegionName(region)} {mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)
        </h3>
        {enableZoom && timeRange && (
          <button 
            onClick={handleZoomOut}
            className="text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80"
          >
            Reset Zoom
          </button>
        )}
      </div>
      
      <div className="relative h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }}
              type="number"
              scale="linear"
              domain={xDomain}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis 
              label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft', offset: 0 }}
              domain={[0, maxValue]}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip 
              formatter={(value: number) => [value.toFixed(2) + ' kPa']}
              labelFormatter={(time) => `Time: ${Number(time).toFixed(2)}s`}
              contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* Current time reference line */}
            <ReferenceLine 
              x={currentTime} 
              stroke="var(--destructive)" 
              strokeWidth={2} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Current', 
                position: 'top', 
                fill: 'var(--destructive)',
                fontSize: 12
              }}
            />
            
            {/* Display the zooming area */}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea 
                x1={parseFloat(refAreaLeft)} 
                x2={parseFloat(refAreaRight)} 
                strokeOpacity={0.3} 
                fill="#8884d8" 
                fillOpacity={0.2} 
              />
            )}
            
            <Line 
              type="monotone" 
              dataKey="pressure" 
              name={getSideName(side)} 
              stroke={lineColor}
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animations for better performance
            />
            
            {/* Add brush component for easier navigation */}
            <Brush 
              dataKey="time" 
              height={30} 
              stroke={lineColor}
              tickFormatter={(value) => value.toFixed(1)} 
              startIndex={0}
              endIndex={chartData.length > 50 ? 50 : chartData.length - 1}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default memo(PressureChart);
