
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
          {/* Foot outline */}
          <path 
            d="M30,10 C45,10 65,15 75,25 C85,35 90,50 90,70 C90,100 85,130 75,150 C65,170 55,175 50,175 C45,175 35,170 25,150 C15,130 10,100 10,70 C10,50 15,35 25,25 C35,15 50,10 30,10 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="text-muted-foreground"
          />
          
          {/* Heel region */}
          <path 
            d="M30,150 C40,165 60,165 70,150 C75,130 75,110 75,110 L25,110 C25,110 25,130 30,150 Z" 
            fill={regionColors.heel}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Heel: ${formatPressure(footData.heel[mode])} kPa`}</title>
          </path>
          
          {/* Lateral midfoot */}
          <path 
            d="M25,110 L25,65 L40,65 L45,110 Z" 
            fill={regionColors.lateralMidfoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Lateral Midfoot: ${formatPressure(footData.lateralMidfoot[mode])} kPa`}</title>
          </path>
          
          {/* Medial midfoot */}
          <path 
            d="M45,110 L40,65 L75,65 L75,110 Z" 
            fill={regionColors.medialMidfoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Medial Midfoot: ${formatPressure(footData.medialMidfoot[mode])} kPa`}</title>
          </path>
          
          {/* Forefoot */}
          <path 
            d="M25,65 L25,40 C25,40 35,30 50,30 C65,30 75,40 75,40 L75,65 L40,65 Z" 
            fill={regionColors.forefoot}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Forefoot: ${formatPressure(footData.forefoot[mode])} kPa`}</title>
          </path>
          
          {/* Toes */}
          <path 
            d="M33,40 C33,40 35,25 50,25 C65,25 67,40 67,40 C67,40 60,30 50,30 C40,30 33,40 33,40 Z" 
            fill={regionColors.toes}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Toes: ${formatPressure(footData.toes[mode])} kPa`}</title>
          </path>
          
          {/* Hallux (big toe) */}
          <circle 
            cx="37" 
            cy="30" 
            r="8" 
            fill={regionColors.hallux}
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="0.5"
          >
            <title>{`Hallux: ${formatPressure(footData.hallux[mode])} kPa`}</title>
          </circle>
          
          {/* Labels - only show on left foot to avoid mirrored text */}
          {side === 'left' && (
            <>
              <text x="50" y="140" fontSize="8" textAnchor="middle" fill="white">Heel</text>
              <text x="35" y="90" fontSize="6" textAnchor="middle" fill="white">Lat Mid</text>
              <text x="60" y="90" fontSize="6" textAnchor="middle" fill="white">Med Mid</text>
              <text x="50" y="50" fontSize="8" textAnchor="middle" fill="white">Forefoot</text>
              <text x="50" y="30" fontSize="6" textAnchor="middle" fill="white">Toes</text>
              <text x="37" y="30" fontSize="6" textAnchor="middle" fill="white">H</text>
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
