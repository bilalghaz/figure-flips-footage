
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import GaitEventAnalysis from '@/components/GaitEventAnalysis';

interface GaitEventsTabProps {
  data: ProcessedData | null;
  currentTime: number;
}

const GaitEventsTab: React.FC<GaitEventsTabProps> = ({ data, currentTime }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <GaitEventAnalysis 
        data={data}
        currentTime={currentTime}
      />
    </div>
  );
};

export default GaitEventsTab;
