
import React, { useMemo } from 'react';
import { PressureDataPoint } from '@/utils/pressureDataProcessor';

interface PressureHeatMapProps {
  dataPoint: PressureDataPoint | null;
  side: 'left' | 'right';
  maxPressure: number;
  mode: 'peak' | 'mean';
}

const PressureHeatMap: React.FC<PressureHeatMapProps> = ({ 
  dataPoint, 
  side, 
  maxPressure,
  mode
}) => {
  // Handle empty data
  if (!dataPoint) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-background border rounded-md p-4">
        <p className="text-muted-foreground text-center">No data available</p>
      </div>
    );
  }
  
  // Get foot data based on selected side
  const footData = side === 'left' ? dataPoint.leftFoot : dataPoint.rightFoot;

  // Calculate colors for each region
  const regionColors = useMemo(() => {
    const regions = ['heel', 'midfoot', 'forefoot', 'toes'];
    const colors: Record<string, string> = {};

    regions.forEach(region => {
      const pressure = footData[region][mode];
      const normalizedPressure = Math.min(pressure / maxPressure, 1);
      
      // Rainbow color gradient (blue -> cyan -> green -> yellow -> red)
      let r, g, b;
      
      if (normalizedPressure < 0.25) {
        // Blue to cyan
        r = 0;
        g = Math.round((normalizedPressure * 4) * 255);
        b = 255;
      } else if (normalizedPressure < 0.5) {
        // Cyan to green
        r = 0;
        g = 255;
        b = Math.round((1 - (normalizedPressure - 0.25) * 4) * 255);
      } else if (normalizedPressure < 0.75) {
        // Green to yellow
        r = Math.round(((normalizedPressure - 0.5) * 4) * 255);
        g = 255;
        b = 0;
      } else {
        // Yellow to red
        r = 255;
        g = Math.round((1 - (normalizedPressure - 0.75) * 4) * 255);
        b = 0;
      }
      
      colors[region] = `rgb(${r}, ${g}, ${b})`;
    });
    
    return colors;
  }, [footData, maxPressure, mode]);
  
  // Format a pressure value for display
  const formatPressure = (value: number) => {
    return value.toFixed(1);
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 bg-card rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-medium">
        {side === 'left' ? 'Left' : 'Right'} Foot
      </h3>
      
      <div className="relative w-[220px] h-[400px]">
        {/* Foot outline - flipped horizontally for right foot */}
        <svg 
          viewBox="0 0 250 450" 
          className={`w-full h-full ${side === 'right' ? 'scale-x-[-1]' : ''}`}
        >
          {/* Foot outline - updated to match the provided Pedar layout image */}
          <path 
            d="M60,30 Q100,15 160,30 Q215,55 215,120 Q215,180 195,260 Q185,300 160,360 Q140,410 120,430 L100,430 Q80,410 60,360 Q40,300 30,260 Q10,180 10,120 Q10,55 60,30 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3"
            className="text-muted-foreground"
          />
          
          {/* Heel region (orange 1-26) */}
          <path 
            d="M100,430 Q80,410 60,360 Q40,300 30,260 L160,260 Q140,300 120,360 Q100,400 100,430 Z" 
            fill={regionColors.heel}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="1"
          >
            <title>{`Heel: ${formatPressure(footData.heel[mode])} kPa`}</title>
          </path>
          
          {/* Midfoot region (light blue 27-54) */}
          <path 
            d="M30,260 Q10,180 10,120 Q10,80 30,60 Q60,40 80,50 L160,50 Q190,60 215,80 Q215,120 215,180 Q210,220 195,260 L30,260 Z" 
            fill={regionColors.midfoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="1"
          >
            <title>{`Midfoot: ${formatPressure(footData.midfoot[mode])} kPa`}</title>
          </path>
          
          {/* Forefoot region (green 55-82) */}
          <path 
            d="M80,50 L160,50 Q140,40 120,30 Q90,20 70,30 Q60,35 55,40 Q60,40 80,50 Z" 
            fill={regionColors.forefoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="1"
          >
            <title>{`Forefoot: ${formatPressure(footData.forefoot[mode])} kPa`}</title>
          </path>
          
          {/* Toes region (purple 83-99) */}
          <path 
            d="M70,30 Q80,20 120,30 L160,50 Q180,45 190,50 L215,80 Q195,65 180,60 Q150,50 120,50 Q90,50 70,60 Q60,65 55,70 Q55,50 70,30 Z" 
            fill={regionColors.toes}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="1"
          >
            <title>{`Toes: ${formatPressure(footData.toes[mode])} kPa`}</title>
          </path>
          
          {/* Add the reference image as a background with low opacity to verify accuracy */}
          <image 
            href="/lovable-uploads/16d9810a-189a-4c5f-a8f3-dcec5e653b4d.png" 
            x="10" 
            y="30" 
            width="200" 
            height="400"
            opacity="0.1"
          />
          
          {/* Labels - only show on left foot to avoid mirrored text */}
          {side === 'left' && (
            <>
              <text x="95" y="380" fontSize="16" textAnchor="middle" fill="white" fontWeight="bold">Heel</text>
              <text x="110" y="210" fontSize="16" textAnchor="middle" fill="white" fontWeight="bold">Midfoot</text>
              <text x="110" y="80" fontSize="16" textAnchor="middle" fill="white" fontWeight="bold">Forefoot</text>
              <text x="110" y="40" fontSize="16" textAnchor="middle" fill="white" fontWeight="bold">Toes</text>
            </>
          )}
        </svg>
      </div>
      
      <div className="w-full">
        <div className="h-4 w-full rounded-md bg-gradient-to-r from-blue-600 via-green-500 to-red-600"></div>
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>0</span>
          <span>{(maxPressure * 0.5).toFixed(0)}</span>
          <span>{maxPressure.toFixed(0)} kPa</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 w-full text-sm">
        {Object.entries(footData).map(([region, data]) => {
          const displayNames: Record<string, string> = {
            heel: 'Heel',
            midfoot: 'Midfoot',
            forefoot: 'Forefoot',
            toes: 'Toes'
          };
          
          return (
            <div key={region} className="flex justify-between">
              <span>{displayNames[region] || region}</span>
              <span className="font-mono">{formatPressure(data[mode])}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PressureHeatMap;
