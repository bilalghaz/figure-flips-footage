import React, { useState, useMemo } from 'react';
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
  Label,
  ReferenceArea
} from 'recharts';
import { PressureDataPoint, ProcessedData } from '@/utils/pressureDataProcessor';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label as UILabel } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface EnhancedPressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
}

const EnhancedPressureChart: React.FC<EnhancedPressureChartProps> = ({ 
  data, 
  currentTime, 
  region,
  mode 
}) => {
  const [showGaitEvents, setShowGaitEvents] = useState(true);
  const [showAsymmetry, setShowAsymmetry] = useState(false);
  const [chartTimeWindow, setChartTimeWindow] = useState<'full' | 'window'>('window');
  
  if (!data || !data.pressureData.length) {
    return (
      <div className="h-[450px] flex items-center justify-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  // Get gait events - memoized for performance
  const { heelStrikes, toeOffs } = useMemo(() => {
    const heelStrikes: {time: number, foot: 'left' | 'right'}[] = [];
    const toeOffs: {time: number, foot: 'left' | 'right'}[] = [];
    
    // Detect gait events more efficiently with stride
    const stride = Math.max(1, Math.floor(data.pressureData.length / 1000)); // Sample at most 1000 points
    
    for (let i = stride; i < data.pressureData.length; i += stride) {
      const point = data.pressureData[i];
      const prevPoint = data.pressureData[i - stride];
      
      // Heel strike detection (threshold crossing: 25 kPa)
      if (point.leftFoot.heel.peak >= 25 && prevPoint.leftFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'left' });
      }
      if (point.rightFoot.heel.peak >= 25 && prevPoint.rightFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'right' });
      }
      
      // Toe off detection (threshold crossing: 20 kPa)
      const leftToePeak = Math.max(point.leftFoot.toes.peak, point.leftFoot.hallux.peak);
      const prevLeftToePeak = Math.max(prevPoint.leftFoot.toes.peak, prevPoint.leftFoot.hallux.peak);
      
      const rightToePeak = Math.max(point.rightFoot.toes.peak, point.rightFoot.hallux.peak);
      const prevRightToePeak = Math.max(prevPoint.rightFoot.toes.peak, prevPoint.rightFoot.hallux.peak);
      
      if (leftToePeak >= 20 && prevLeftToePeak < 20) {
        toeOffs.push({ time: point.time, foot: 'left' });
      }
      if (rightToePeak >= 20 && prevRightToePeak < 20) {
        toeOffs.push({ time: point.time, foot: 'right' });
      }
    }
    
    return { heelStrikes, toeOffs };
  }, [data.pressureData]);
  
  // Get asymmetry areas - memoized for performance
  const asymmetryAreas = useMemo(() => {
    if (!showAsymmetry) return [];
    
    const areas: {start: number, end: number, value: number}[] = [];
    let currentArea: {start: number, end: number, values: number[]} | null = null;
    
    // Sample data points for better performance
    const stride = Math.max(1, Math.floor(data.pressureData.length / 500)); // Sample at most 500 points
    
    for (let i = 0; i < data.pressureData.length; i += stride) {
      const point = data.pressureData[i];
      const leftValue = point.leftFoot[region][mode];
      const rightValue = point.rightFoot[region][mode];
      const difference = Math.abs(leftValue - rightValue);
      const asymmetryPercent = difference / Math.max(leftValue, rightValue, 0.001) * 100;
      
      // Define significant asymmetry as > 15%
      if (asymmetryPercent > 15) {
        if (!currentArea) {
          currentArea = { start: point.time, end: point.time, values: [asymmetryPercent] };
        } else {
          currentArea.end = point.time;
          currentArea.values.push(asymmetryPercent);
        }
      } else if (currentArea) {
        // Area must be at least 0.1s long to be considered
        if (currentArea.end - currentArea.start >= 0.1) {
          const avgValue = currentArea.values.reduce((sum, val) => sum + val, 0) / currentArea.values.length;
          areas.push({
            start: currentArea.start,
            end: currentArea.end,
            value: avgValue
          });
        }
        currentArea = null;
      }
    }
    
    // Don't forget the last area if we're still in one
    if (currentArea && currentArea.end - currentArea.start >= 0.1) {
      const avgValue = currentArea.values.reduce((sum, val) => sum + val, 0) / currentArea.values.length;
      areas.push({
        start: currentArea.start,
        end: currentArea.end,
        value: avgValue
      });
    }
    
    return areas;
  }, [showAsymmetry, data.pressureData, region, mode]);
  
  // Format data for recharts - efficiently handle large datasets
  const chartData = useMemo(() => {
    // Sample data points for better performance
    const maxPoints = 500; // Limit to maximum 500 points for better performance
    const stride = Math.max(1, Math.floor(data.pressureData.length / maxPoints));
    
    const sampledData = [];
    for (let i = 0; i < data.pressureData.length; i += stride) {
      const point = data.pressureData[i];
      sampledData.push({
        time: point.time,
        left: point.leftFoot[region][mode],
        right: point.rightFoot[region][mode],
        current: point.time <= currentTime
      });
    }
    
    // Always include the current time point for accurate display
    const currentIndex = data.pressureData.findIndex(point => point.time > currentTime);
    if (currentIndex > 0) {
      const currentPoint = data.pressureData[currentIndex - 1];
      sampledData.push({
        time: currentPoint.time,
        left: currentPoint.leftFoot[region][mode],
        right: currentPoint.rightFoot[region][mode],
        current: true
      });
    }
    
    // Sort to ensure correct order
    return sampledData.sort((a, b) => a.time - b.time);
  }, [data.pressureData, region, mode, currentTime]);
  
  // Calculate window for view
  const { startTime, endTime, windowedData } = useMemo(() => {
    const timeWindow = 5; // 5 seconds window
    let startTime = Math.max(0, currentTime - (timeWindow / 2));
    let endTime = Math.min(data.pressureData[data.pressureData.length - 1].time, startTime + timeWindow);
    
    // Adjust if we're near the end
    if (endTime === data.pressureData[data.pressureData.length - 1].time) {
      startTime = Math.max(0, endTime - timeWindow);
    }
    
    // Filtered data for windowed view
    const windowedData = chartTimeWindow === 'window' ? 
      chartData.filter(point => point.time >= startTime && point.time <= endTime) : 
      chartData;
    
    return { startTime, endTime, windowedData };
  }, [chartData, chartTimeWindow, currentTime, data.pressureData]);
  
  // In the existing code, update the getRegionName function to match our new regions:
  const getRegionName = (region: string) => {
    switch (region) {
      case 'heel': return 'Heel';
      case 'midfoot': return 'Midfoot';
      case 'forefoot': return 'Forefoot';
      case 'toes': return 'Toes';
      default: return region;
    }
  };
  
  // Find relevant gait events for the current window - memoized
  const { visibleHeelStrikes, visibleToeOffs, visibleAsymmetryAreas } = useMemo(() => {
    const visibleHeelStrikes = heelStrikes.filter(event => 
      chartTimeWindow === 'full' || (event.time >= startTime && event.time <= endTime)
    );
    
    const visibleToeOffs = toeOffs.filter(event => 
      chartTimeWindow === 'full' || (event.time >= startTime && event.time <= endTime)
    );
    
    const visibleAsymmetryAreas = asymmetryAreas.filter(area => 
      chartTimeWindow === 'full' || (area.start <= endTime && area.end >= startTime)
    );
    
    return { visibleHeelStrikes, visibleToeOffs, visibleAsymmetryAreas };
  }, [heelStrikes, toeOffs, asymmetryAreas, chartTimeWindow, startTime, endTime]);
  
  // Calculate max Y value for the chart - memoized
  const maxValue = useMemo(() => {
    return Math.max(
      ...windowedData.map(d => Math.max(d.left, d.right)),
      mode === 'peak' ? data.maxPeakPressure * 0.5 : data.maxMeanPressure * 0.5
    ) * 1.1;
  }, [windowedData, mode, data.maxPeakPressure, data.maxMeanPressure]);
  
  return (
    <div className="h-[450px] bg-white p-4 rounded-md shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium">
          {getRegionName(region)} {mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)
        </h3>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Switch 
              id="gait-events" 
              checked={showGaitEvents} 
              onCheckedChange={setShowGaitEvents} 
            />
            <UILabel htmlFor="gait-events">Gait Events</UILabel>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="asymmetry" 
              checked={showAsymmetry} 
              onCheckedChange={setShowAsymmetry}
            />
            <UILabel htmlFor="asymmetry">Asymmetry</UILabel>
          </div>
          
          <Select
            value={chartTimeWindow}
            onValueChange={(value) => setChartTimeWindow(value as 'full' | 'window')}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Time Window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="window">Current Window</SelectItem>
              <SelectItem value="full">Full Recording</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={windowedData}
            margin={{
              top: 10,
              right: 30,
              left: 10,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }}
              domain={chartTimeWindow === 'window' ? [startTime, endTime] : ['dataMin', 'dataMax']}
              type="number"
              scale="linear"
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
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* Current time reference line */}
            <ReferenceLine 
              x={currentTime} 
              stroke="#ff0000" 
              strokeWidth={2} 
              strokeDasharray="3 3"
              label={{ 
                value: 'Current', 
                position: 'top', 
                fill: '#ff0000',
                fontSize: 12
              }}
            />
            
            {/* Threshold lines */}
            {region === 'heel' && (
              <ReferenceLine 
                y={25} 
                stroke="#0088FE" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Heel Strike Threshold', 
                  position: 'right', 
                  fill: '#0088FE',
                  fontSize: 10
                }}
              />
            )}
            
            {(region === 'toes' || region === 'hallux') && (
              <ReferenceLine 
                y={20} 
                stroke="#FF8042" 
                strokeDasharray="3 3"
                label={{ 
                  value: 'Toe Off Threshold', 
                  position: 'right', 
                  fill: '#FF8042',
                  fontSize: 10
                }}
              />
            )}
            
            {/* Gait event markers - limit number shown for performance */}
            {showGaitEvents && visibleHeelStrikes.slice(0, 10).map((event, i) => (
              <ReferenceLine 
                key={`hs-${i}`}
                x={event.time} 
                stroke={event.foot === 'left' ? '#8884d8' : '#82ca9d'} 
                strokeWidth={2}
                label={{ 
                  value: 'HS', 
                  position: 'top', 
                  fill: event.foot === 'left' ? '#8884d8' : '#82ca9d',
                  fontSize: 10
                }}
              />
            ))}
            
            {showGaitEvents && visibleToeOffs.slice(0, 10).map((event, i) => (
              <ReferenceLine 
                key={`to-${i}`}
                x={event.time} 
                stroke={event.foot === 'left' ? '#8884d8' : '#82ca9d'} 
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ 
                  value: 'TO', 
                  position: 'bottom', 
                  fill: event.foot === 'left' ? '#8884d8' : '#82ca9d',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* Asymmetry areas - limit number shown for performance */}
            {showAsymmetry && visibleAsymmetryAreas.slice(0, 5).map((area, i) => (
              <ReferenceArea 
                key={`asym-${i}`}
                x1={area.start} 
                x2={area.end}
                fill="#ff000033" 
                label={{ 
                  value: `${area.value.toFixed(0)}% Asymmetry`, 
                  position: 'insideTop',
                  fill: '#d32f2f',
                  fontSize: 10
                }}
              />
            ))}
            
            <Line 
              type="monotone" 
              dataKey="left" 
              name="Left Foot" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animations for better performance
            />
            <Line 
              type="monotone" 
              dataKey="right" 
              name="Right Foot" 
              stroke="#82ca9d" 
              activeDot={{ r: 8 }}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animations for better performance
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Gait event summary */}
      {showGaitEvents && (
        <div className="flex flex-wrap gap-2 mt-2 text-xs">
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {visibleHeelStrikes.filter(e => e.foot === 'left').length} Left HS
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            {visibleHeelStrikes.filter(e => e.foot === 'right').length} Right HS
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {visibleToeOffs.filter(e => e.foot === 'left').length} Left TO
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {visibleToeOffs.filter(e => e.foot === 'right').length} Right TO
          </Badge>
          {showAsymmetry && visibleAsymmetryAreas.length > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              {visibleAsymmetryAreas.length} Asymmetry Region{visibleAsymmetryAreas.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(EnhancedPressureChart); // Add memo to prevent unnecessary re-renders
