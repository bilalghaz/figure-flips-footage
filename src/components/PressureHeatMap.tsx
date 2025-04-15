
import React, { useState, useEffect } from 'react';
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
  const [footImage, setFootImage] = useState<string>('');
  
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
    // Color scale from green (low) to yellow (medium) to red (high)
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
  
  return (
    <div className="relative h-[600px] w-[300px]">
      {/* Foot background */}
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
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('heel'),
            width: '120px',
            height: '120px',
            bottom: '40px',
            left: side === 'left' ? '90px' : '90px'
          }}
        />
        
        {/* Medial midfoot */}
        <div 
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('medialMidfoot'),
            width: '100px',
            height: '180px',
            bottom: '130px',
            left: side === 'left' ? '140px' : '60px'
          }}
        />
        
        {/* Lateral midfoot */}
        <div 
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('lateralMidfoot'),
            width: '100px',
            height: '180px',
            bottom: '130px',
            left: side === 'left' ? '60px' : '140px'
          }}
        />
        
        {/* Forefoot */}
        <div 
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('forefoot'),
            width: '140px',
            height: '140px',
            bottom: '280px',
            left: '80px'
          }}
        />
        
        {/* Toes */}
        <div 
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('toes'),
            width: '120px',
            height: '80px',
            bottom: '400px',
            left: '90px'
          }}
        />
        
        {/* Hallux */}
        <div 
          className="absolute rounded-full" 
          style={{
            ...getRegionStyle('hallux'),
            width: '60px',
            height: '70px',
            bottom: '460px',
            left: side === 'left' ? '150px' : '90px'
          }}
        />
      </div>
      
      {/* Foot labels */}
      <div className="absolute top-0 left-0 w-full text-center font-semibold">
        {side === 'left' ? 'Left Foot' : 'Right Foot'}
      </div>
      
      {/* Pressure value */}
      {dataPoint && (
        <div className="absolute bottom-2 left-0 w-full text-center text-sm">
          Time: {dataPoint.time.toFixed(2)}s
        </div>
      )}
    </div>
  );
};

export default PressureHeatMap;
