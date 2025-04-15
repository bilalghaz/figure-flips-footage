
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PressureDataPoint, ProcessedData } from '@/utils/pressureDataProcessor';

interface PressureChartProps {
  data: ProcessedData | null;
  currentTime: number;
  region: string;
  mode: 'peak' | 'mean';
}

const PressureChart: React.FC<PressureChartProps> = ({ 
  data, 
  currentTime, 
  region,
  mode 
}) => {
  if (!data || !data.pressureData.length) {
    return (
      <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  // Format data for recharts
  const chartData = data.pressureData.map(point => ({
    time: point.time,
    left: point.leftFoot[region][mode],
    right: point.rightFoot[region][mode],
    current: point.time <= currentTime
  }));
  
  // Find current data point index
  const currentIndex = chartData.findIndex(point => point.time > currentTime);
  const currentPoint = currentIndex > 0 ? chartData[currentIndex - 1] : chartData[0];

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
  
  return (
    <div className="h-[300px] bg-white p-4 rounded-md shadow">
      <h3 className="text-sm font-medium mb-2">
        {getRegionName(region)} {mode === 'peak' ? 'Peak' : 'Mean'} Pressure (kPa)
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }}
            domain={['dataMin', 'dataMax']}
          />
          <YAxis 
            label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }}
            domain={[0, data[mode === 'peak' ? 'maxPeakPressure' : 'maxMeanPressure'] * 1.1]}
          />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(2) + ' kPa']}
            labelFormatter={(time) => `Time: ${time}s`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="left" 
            name="Left Foot" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="right" 
            name="Right Foot" 
            stroke="#82ca9d" 
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          
          {/* Current time reference line */}
          {currentPoint && (
            <Line 
              type="monotone" 
              dataKey="time" 
              stroke="red" 
              strokeWidth={2} 
              dot={false}
              activeDot={false}
              hide={true}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PressureChart;
