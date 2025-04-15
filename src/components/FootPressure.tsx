
import React, { useEffect, useState, useRef } from 'react';

interface Datapoint {
  time: number;
  heelPressure: number;
  toePressure: number;
}

interface FootPressureProps {
  title: string;
  data: Datapoint[];
  maxPressure: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  startTime: number;
  endTime: number;
}

const FootPressure = ({
  title,
  data,
  maxPressure,
  isPlaying,
  currentTime,
  duration,
  startTime,
  endTime
}: FootPressureProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [displayedData, setDisplayedData] = useState<Datapoint[]>([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  
  // Calculate the time window displayed on the chart (seconds)
  const timeWindow = endTime - startTime;
  
  useEffect(() => {
    if (!isPlaying) return;
    
    // Calculate the progress proportionally
    const progress = currentTime / duration;
    const dataLength = data.length;
    
    // Calculate how many data points to show based on progress
    const pointsToShow = Math.floor(progress * dataLength);
    
    // Update the displayed data and current index
    setDisplayedData(data.slice(0, pointsToShow));
    setCurrentDataIndex(pointsToShow > 0 ? pointsToShow - 1 : 0);
    
  }, [isPlaying, currentTime, duration, data]);

  // Function to convert data points to SVG path
  const createPath = (dataPoints: Datapoint[], accessor: (d: Datapoint) => number): string => {
    if (!dataPoints.length) return '';
    
    const svgWidth = 1000; // SVG coordinate system width
    const svgHeight = 400; // SVG coordinate system height
    
    return dataPoints.map((point, i) => {
      // Map time to x coordinate
      const x = ((point.time - startTime) / timeWindow) * svgWidth;
      
      // Map pressure to y coordinate (inverted, since SVG y increases downward)
      const normalizedPressure = accessor(point) / maxPressure;
      const y = svgHeight - (normalizedPressure * svgHeight);
      
      // Start with M (move to) for the first point, otherwise L (line to)
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    }).join(' ');
  };

  // Create separate paths for heel and toe pressure
  const heelPath = createPath(displayedData, d => d.heelPressure);
  const toePath = createPath(displayedData, d => d.toePressure);
  
  // Get current values for display
  const currentPoint = displayedData[currentDataIndex] || { time: 0, heelPressure: 0, toePressure: 0 };

  return (
    <div className="flex flex-col w-full h-full bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold text-center">{title}</h2>
      
      <div className="relative flex-1 mt-4">
        {/* Y-axis label */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 transform -rotate-90 text-sm">
          Pressure (kPa)
        </div>
        
        {/* Chart area */}
        <div className="relative h-full w-full">
          <svg ref={svgRef} className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            {/* Grid lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <line 
                key={`y-grid-${i}`}
                x1="0" 
                y1={(i / 5) * 400} 
                x2="1000" 
                y2={(i / 5) * 400}
                stroke="#e5e7eb" 
                strokeWidth="1"
              />
            ))}
            
            {/* Time markers */}
            {Array.from({ length: 11 }).map((_, i) => {
              const time = startTime + (i / 10) * timeWindow;
              return (
                <React.Fragment key={`time-${i}`}>
                  <line 
                    x1={(i / 10) * 1000} 
                    y1="0" 
                    x2={(i / 10) * 1000} 
                    y2="400"
                    stroke="#e5e7eb" 
                    strokeWidth="1"
                  />
                  <text 
                    x={(i / 10) * 1000} 
                    y="425" 
                    fontSize="12" 
                    textAnchor="middle"
                  >
                    {time.toFixed(1)}
                  </text>
                </React.Fragment>
              );
            })}
            
            {/* Pressure value markers */}
            {Array.from({ length: 6 }).map((_, i) => {
              const pressure = (i / 5) * maxPressure;
              return (
                <text 
                  key={`pressure-${i}`}
                  x="-30" 
                  y={400 - (i / 5) * 400 + 5} 
                  fontSize="12" 
                  textAnchor="end"
                >
                  {pressure.toFixed(0)}
                </text>
              );
            })}
                
            {/* Heel pressure path (blue) */}
            <path 
              d={heelPath} 
              fill="none" 
              stroke="#1E40AF" 
              strokeWidth="2"
              className="transition-all duration-300"
            />
            
            {/* Toe pressure path (red) */}
            <path 
              d={toePath} 
              fill="none" 
              stroke="#DC2626" 
              strokeWidth="2"
              className="transition-all duration-300"
            />
            
            {/* Current Heel Strike point */}
            {displayedData.length > 0 && (
              <circle 
                cx={((currentPoint.time - startTime) / timeWindow) * 1000} 
                cy={400 - (currentPoint.heelPressure / maxPressure) * 400}
                r="5" 
                fill="#1E40AF"
                className="animate-pulse-point"
              />
            )}
            
            {/* Current Toe Off point */}
            {displayedData.length > 0 && (
              <circle 
                cx={((currentPoint.time - startTime) / timeWindow) * 1000} 
                cy={400 - (currentPoint.toePressure / maxPressure) * 400}
                r="5" 
                fill="#DC2626"
                className="animate-pulse-point"
              />
            )}
          </svg>
        </div>
      </div>
      
      {/* X-axis label */}
      <div className="text-center py-4 text-sm font-medium">Time (s)</div>
      
      {/* Legend */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center mr-6">
          <div className="w-4 h-1 bg-heel mr-1"></div>
          <span className="text-xs">Heel</span>
        </div>
        <div className="flex items-center mr-6">
          <div className="w-4 h-1 bg-toe mr-1"></div>
          <span className="text-xs">Toe</span>
        </div>
        <div className="flex items-center mr-6">
          <div className="w-3 h-3 rounded-full bg-heel mr-1"></div>
          <span className="text-xs">HS</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-toe mr-1"></div>
          <span className="text-xs">TO</span>
        </div>
      </div>
    </div>
  );
};

export default FootPressure;
