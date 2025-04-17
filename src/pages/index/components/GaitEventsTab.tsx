
import React, { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import GaitEventAnalysis from '@/components/GaitEventAnalysis';
import GaitEventTable from '@/components/GaitEventTable';
import GaitEventControls from '@/components/GaitEventControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GaitEventThresholds } from '@/utils/gaitEventDetector';

interface GaitEventsTabProps {
  data: ProcessedData | null;
  currentTime: number;
}

const GaitEventsTab: React.FC<GaitEventsTabProps> = ({ data, currentTime }) => {
  const [gaitEventThresholds, setGaitEventThresholds] = useState<GaitEventThresholds>({
    initialContact: 15,
    toeOff: 10
  });
  const [showEvents, setShowEvents] = useState(true);

  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <GaitEventControls
        thresholds={gaitEventThresholds}
        onThresholdsChange={setGaitEventThresholds}
        showEvents={showEvents}
        onShowEventsChange={setShowEvents}
      />
      
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="table">Event Table</TabsTrigger>
          <TabsTrigger value="chart">Event Analysis Chart</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-4">
          <GaitEventTable 
            data={data} 
            thresholds={gaitEventThresholds}
          />
        </TabsContent>
        <TabsContent value="chart" className="mt-4">
          <GaitEventAnalysis 
            data={data}
            currentTime={currentTime}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GaitEventsTab;
