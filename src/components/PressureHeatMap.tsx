
import React, { useState, useEffect } from 'react';
import { PressureDataPoint } from '@/utils/pressureDataProcessor';
import { Badge } from "@/components/ui/badge";

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
  const [footImage, setFootImage] = useState<string>('');
  const [showLabels, setShowLabels] = useState(true);
  
  // This creates a simplified foot outline template
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a simple foot outline (reversed for right foot)
      ctx.fillStyle = '#f8f8f8';
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      if (side === 'left') {
        // Left foot outline
        ctx.moveTo(100, 500);
        ctx.quadraticCurveTo(120, 420, 130, 300);
        ctx.quadraticCurveTo(140, 200, 170, 120);
        ctx.quadraticCurveTo(200, 80, 220, 70);
        ctx.quadraticCurveTo(240, 80, 230, 150);
        ctx.quadraticCurveTo(200, 320, 180, 420);
        ctx.quadraticCurveTo(160, 480, 150, 520);
        ctx.quadraticCurveTo(120, 550, 100, 500);
      } else {
        // Right foot outline
        ctx.moveTo(200, 500);
        ctx.quadraticCurveTo(180, 420, 170, 300);
        ctx.quadraticCurveTo(160, 200, 130, 120);
        ctx.quadraticCurveTo(100, 80, 80, 70);
        ctx.quadraticCurveTo(60, 80, 70, 150);
        ctx.quadraticCurveTo(100, 320, 120, 420);
        ctx.quadraticCurveTo(140, 480, 150, 520);
        ctx.quadraticCurveTo(180, 550, 200, 500);
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      setFootImage(canvas.toDataURL());
    }
  }, [side]);
  
  const getPressureColor = (pressure: number) => {
    // Color scale from blue (low) to red (high) through green, yellow
    const normalized = Math.min(pressure / maxPressure, 1);
    
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
  
  const getPressureIntensity = (pressure: number) => {
    const normalized = Math.min(pressure / maxPressure, 1);
    if (normalized < 0.2) return 'Very Low';
    if (normalized < 0.4) return 'Low';
    if (normalized < 0.6) return 'Medium';
    if (normalized < 0.8) return 'High';
    return 'Very High';
  };
  
  const getRegionStyle = (region: string) => {
    if (!dataPoint) {
      return { backgroundColor: 'rgba(200, 200, 200, 0.2)' };
    }
    
    const regionData = dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'][region];
    const pressure = mode === 'peak' ? regionData.peak : regionData.mean;
    
    return {
      backgroundColor: getPressureColor(pressure),
      opacity: 0.8
    };
  };
  
  // Get gait event indicators
  const isHeelStrike = (dataPoint: PressureDataPoint | null) => {
    if (!dataPoint) return false;
    const heelPressure = dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].heel.peak;
    return heelPressure >= 25; // 25 kPa threshold
  };
  
  const isToeOff = (dataPoint: PressureDataPoint | null) => {
    if (!dataPoint) return false;
    const toesPressure = dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].toes.peak;
    const halluxPressure = dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].hallux.peak;
    return (toesPressure >= 20 || halluxPressure >= 20); // 20 kPa threshold
  };
  
  return (
    <div className="relative h-[600px] w-[300px] bg-white rounded-md shadow-md p-4">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={() => setShowLabels(!showLabels)}
          className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200"
        >
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </button>
      </div>
      
      {/* Foot title */}
      <div className="absolute top-0 left-0 w-full text-center font-semibold py-2">
        {side === 'left' ? 'Left Foot' : 'Right Foot'}
        {dataPoint && (
          <>
            {isHeelStrike(dataPoint) && (
              <Badge className="ml-2 bg-blue-500">Heel Strike</Badge>
            )}
            {isToeOff(dataPoint) && (
              <Badge className="ml-2 bg-red-500">Toe Off</Badge>
            )}
          </>
        )}
      </div>
      
      {/* Foot background */}
      <div className="relative mt-8 h-[550px] w-full">
        {footImage && (
          <img 
            src={footImage} 
            alt={`${side} foot outline`} 
            className="absolute top-0 left-0 w-full h-full"
          />
        )}
        
        {/* Overlaid pressure regions */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Heel region */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('heel'),
              width: '120px',
              height: '120px',
              bottom: '40px',
              left: side === 'left' ? '90px' : '90px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].heel[mode].toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Medial midfoot */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('medialMidfoot'),
              width: '100px',
              height: '180px',
              bottom: '130px',
              left: side === 'left' ? '140px' : '60px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].medialMidfoot[mode].toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Lateral midfoot */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('lateralMidfoot'),
              width: '100px',
              height: '180px',
              bottom: '130px',
              left: side === 'left' ? '60px' : '140px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].lateralMidfoot[mode].toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Forefoot */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('forefoot'),
              width: '140px',
              height: '140px',
              bottom: '280px',
              left: '80px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].forefoot[mode].toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Toes */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('toes'),
              width: '120px',
              height: '80px',
              bottom: '400px',
              left: '90px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].toes[mode].toFixed(1)}
              </span>
            )}
          </div>
          
          {/* Hallux */}
          <div 
            className="absolute rounded-full flex items-center justify-center"
            style={{
              ...getRegionStyle('hallux'),
              width: '60px',
              height: '70px',
              bottom: '460px',
              left: side === 'left' ? '150px' : '90px'
            }}
          >
            {showLabels && dataPoint && (
              <span className="text-xs font-bold text-white drop-shadow-md">
                {dataPoint[side === 'left' ? 'leftFoot' : 'rightFoot'].hallux[mode].toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Pressure color scale */}
      <div className="absolute bottom-2 left-0 w-full px-4">
        <div className="h-4 w-full flex rounded-sm overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i} 
              className="h-full flex-grow" 
              style={{ backgroundColor: getPressureColor((i / 100) * maxPressure) }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
          <span>0</span>
          <span>{(maxPressure * 0.25).toFixed(0)}</span>
          <span>{(maxPressure * 0.5).toFixed(0)}</span>
          <span>{(maxPressure * 0.75).toFixed(0)}</span>
          <span>{maxPressure.toFixed(0)} kPa</span>
        </div>
      </div>
    </div>
  );
};

export default PressureHeatMap;
