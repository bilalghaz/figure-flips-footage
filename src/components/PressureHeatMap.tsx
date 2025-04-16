
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
    const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
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
          viewBox="0 0 100 180" 
          className={`w-full h-full ${side === 'right' ? 'scale-x-[-1]' : ''}`}
        >
          {/* Foot outline - updated to match Pedar layout */}
          <path 
            d="M25,10 C35,10 65,15 75,25 C83,35 85,60 83,85 C80,120 75,140 65,155 C55,170 45,175 40,175 C35,175 25,170 15,155 C5,140 0,120 0,85 C0,60 5,35 15,25 C25,15 45,10 25,10 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="text-muted-foreground"
          />
          
          {/* Heel region (1-26) */}
          <path 
            d="M15,155 C25,170 55,170 65,155 C70,140 72,125 72,115 L8,115 C8,125 10,140 15,155 Z" 
            fill={regionColors.heel}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Heel: ${formatPressure(footData.heel[mode])} kPa`}</title>
          </path>
          
          {/* Lateral midfoot (27-30, 35-38, 43-46, 51-53) */}
          <path 
            d="M8,115 L8,75 L25,75 L30,115 Z" 
            fill={regionColors.lateralMidfoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Lateral Midfoot: ${formatPressure(footData.lateralMidfoot[mode])} kPa`}</title>
          </path>
          
          {/* Medial midfoot (31-34, 39-42, 47-50, 54-57) */}
          <path 
            d="M30,115 L25,75 L72,75 L72,115 Z" 
            fill={regionColors.medialMidfoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Medial Midfoot: ${formatPressure(footData.medialMidfoot[mode])} kPa`}</title>
          </path>
          
          {/* Forefoot (58-82) */}
          <path 
            d="M8,75 L8,40 C15,28 30,20 50,20 C70,20 83,30 83,40 L83,75 L25,75 Z" 
            fill={regionColors.forefoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Forefoot: ${formatPressure(footData.forefoot[mode])} kPa`}</title>
          </path>
          
          {/* Toes (86-90, 93-96, 98-99) */}
          <path 
            d="M30,40 C30,30 50,15 70,30 C70,35 60,25 50,23 C35,20 30,40 30,40 Z" 
            fill={regionColors.toes}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Toes: ${formatPressure(footData.toes[mode])} kPa`}</title>
          </path>
          
          {/* Hallux/big toe (83-85, 91-92, 97) */}
          <path 
            d="M30,35 C25,25 20,20 15,22 C10,25 15,30 20,32 C25,34 30,35 30,35 Z" 
            fill={regionColors.hallux}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Hallux: ${formatPressure(footData.hallux[mode])} kPa`}</title>
          </path>
          
          {/* Labels - only show on left foot to avoid mirrored text */}
          {side === 'left' && (
            <>
              <text x="40" y="140" fontSize="8" textAnchor="middle" fill="white">Heel</text>
              <text x="18" y="95" fontSize="6" textAnchor="middle" fill="white">Lat Mid</text>
              <text x="50" y="95" fontSize="6" textAnchor="middle" fill="white">Med Mid</text>
              <text x="45" y="50" fontSize="8" textAnchor="middle" fill="white">Forefoot</text>
              <text x="50" y="25" fontSize="6" textAnchor="middle" fill="white">Toes</text>
              <text x="20" y="28" fontSize="6" textAnchor="middle" fill="white">Hallux</text>
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
            medialMidfoot: 'Medial Midfoot',
            lateralMidfoot: 'Lateral Midfoot',
            forefoot: 'Forefoot',
            toes: 'Toes',
            hallux: 'Hallux'
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
