
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DataPoint {
  group: string;
  value: number;
  error: number;
}

interface BarChartProps {
  title: string;
  yAxisTitle: string;
  data: {
    walking: DataPoint[];
    jogging: DataPoint[];
  };
  maxValue: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const BarChart = ({ 
  title, 
  yAxisTitle, 
  data, 
  maxValue, 
  isPlaying, 
  currentTime, 
  duration 
}: BarChartProps) => {
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const progress = Math.min(1, currentTime / duration);
      setAnimationProgress(progress);
    }
  }, [isPlaying, currentTime, duration]);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  const getAnimatedHeight = (value: number) => {
    const fullHeight = getBarHeight(value);
    return fullHeight * animationProgress;
  };

  return (
    <div className="flex flex-col w-full h-full bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold text-center">{title}</h2>
      
      <div className="flex flex-1 mt-4">
        {/* Y-axis label */}
        <div className="flex items-center justify-center w-10 mr-2">
          <div className="transform -rotate-90 whitespace-nowrap">{yAxisTitle}</div>
        </div>
        
        {/* Chart content */}
        <div className="flex flex-1 flex-col">
          {/* Chart grid */}
          <div className="relative flex-1 border-l border-b border-gray-300">
            {/* Grid lines */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute left-0 right-0 border-t border-gray-200"
                style={{ bottom: `${(i / 5) * 100}%` }}
              >
                <span className="absolute -left-8 -translate-y-1/2 text-xs text-gray-500">
                  {((i / 5) * maxValue).toFixed(1)}
                </span>
              </div>
            ))}
            
            {/* Bar groups */}
            <div className="absolute inset-0 flex">
              {/* Walking */}
              <div className="flex-1 flex justify-center items-end">
                <div className="w-full px-6 flex justify-around items-end h-full">
                  {data.walking.map((item, index) => (
                    <div key={`walking-${index}`} className="flex flex-col items-center justify-end w-20">
                      <div className="relative w-12 flex justify-center">
                        {/* Error bar top */}
                        <div 
                          className="absolute w-8 border-t border-black"
                          style={{ 
                            bottom: `${getAnimatedHeight(item.value + item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Error bar vertical line */}
                        <div 
                          className="absolute w-0.5 bg-black"
                          style={{ 
                            height: `${getAnimatedHeight(item.error * 2)}%`,
                            bottom: `${getAnimatedHeight(item.value - item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Error bar bottom */}
                        <div 
                          className="absolute w-8 border-t border-black"
                          style={{ 
                            bottom: `${getAnimatedHeight(item.value - item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Actual bar */}
                        <div 
                          className={cn(
                            "w-12 transition-all duration-300",
                            item.group === 'Flatfeet' ? "bg-flatfeet" : "bg-normalarch"
                          )}
                          style={{ 
                            height: `${getAnimatedHeight(item.value)}%` 
                          }}
                        ></div>
                      </div>
                      
                      {/* Group label */}
                      <div className="text-xs mt-1 font-medium h-4">
                        {item.group}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Condition label */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-6 font-medium">
                  Walking
                </div>
              </div>
              
              {/* Jogging */}
              <div className="flex-1 flex justify-center items-end">
                <div className="w-full px-6 flex justify-around items-end h-full">
                  {data.jogging.map((item, index) => (
                    <div key={`jogging-${index}`} className="flex flex-col items-center justify-end w-20">
                      <div className="relative w-12 flex justify-center">
                        {/* Error bar top */}
                        <div 
                          className="absolute w-8 border-t border-black"
                          style={{ 
                            bottom: `${getAnimatedHeight(item.value + item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Error bar vertical line */}
                        <div 
                          className="absolute w-0.5 bg-black"
                          style={{ 
                            height: `${getAnimatedHeight(item.error * 2)}%`,
                            bottom: `${getAnimatedHeight(item.value - item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Error bar bottom */}
                        <div 
                          className="absolute w-8 border-t border-black"
                          style={{ 
                            bottom: `${getAnimatedHeight(item.value - item.error)}%`,
                            opacity: animationProgress
                          }}
                        ></div>
                        
                        {/* Actual bar */}
                        <div 
                          className={cn(
                            "w-12 transition-all duration-300",
                            item.group === 'Flatfeet' ? "bg-flatfeet" : "bg-normalarch"
                          )}
                          style={{ 
                            height: `${getAnimatedHeight(item.value)}%` 
                          }}
                        ></div>
                      </div>
                      
                      {/* Group label */}
                      <div className="text-xs mt-1 font-medium h-4">
                        {item.group}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Condition label */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-6 font-medium">
                  Jogging
                </div>
              </div>
            </div>
          </div>
          
          {/* X-axis label */}
          <div className="text-center py-8 text-sm font-medium">Condition</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-end mt-2 px-4">
        <div className="flex items-center">
          <div className="text-sm mr-4">Group:</div>
          <div className="flex items-center mr-4">
            <div className="w-4 h-4 bg-flatfeet mr-1"></div>
            <span className="text-xs">Flatfeet</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-normalarch mr-1"></div>
            <span className="text-xs">NormalArch</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChart;
