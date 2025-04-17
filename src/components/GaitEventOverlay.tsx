import React, { useMemo } from 'react';
import { GaitEvent, GaitEventThresholds, detectGaitEvents, getActiveEvents } from '@/utils/gaitEventDetector';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Footprints, Shoe } from 'lucide-react';

interface GaitEventOverlayProps {
  data: ProcessedData | null;
  currentTime: number;
  thresholds: GaitEventThresholds;
  showEvents: boolean;
}

const GaitEventOverlay: React.FC<GaitEventOverlayProps> = ({
  data,
  currentTime,
  thresholds,
  showEvents
}) => {
  const gaitEvents = useMemo(() => {
    if (!data || !showEvents) return [];
    return detectGaitEvents(data.pressureData, thresholds);
  }, [data, thresholds, showEvents]);
  
  const activeEvents = useMemo(() => {
    return getActiveEvents(gaitEvents, currentTime);
  }, [gaitEvents, currentTime]);
  
  if (!showEvents || !data || activeEvents.length === 0) {
    return null;
  }
  
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
      {activeEvents.map((event, index) => (
        <div 
          key={`${event.type}-${event.foot}-${index}`}
          className={`absolute top-1/2 ${event.foot === 'left' ? 'left-4' : 'right-4'} transform -translate-y-1/2`}
        >
          {event.type === 'initialContact' ? (
            <div className={`flex items-center ${event.foot === 'left' ? 'text-blue-500' : 'text-green-500'}`}>
              <Shoe size={24} className="animate-pulse" />
              <span className="ml-1 font-bold">IC</span>
            </div>
          ) : (
            <div className={`flex items-center ${event.foot === 'left' ? 'text-orange-500' : 'text-yellow-500'}`}>
              <Footprints size={24} className="animate-pulse" />
              <span className="ml-1 font-bold">TO</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GaitEventOverlay;
