
import React, { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import GaitEventAnalysis from '@/components/GaitEventAnalysis';
import GaitEventTable from '@/components/GaitEventTable';
import GaitEventControls from '@/components/GaitEventControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GaitEventThresholds } from '@/utils/gaitEventDetector';
import { Button } from '@/components/ui/button';
import { Table, List } from 'lucide-react';

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
  const [activeView, setActiveView] = useState<'table' | 'chart'>('table');

  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <GaitEventControls
        thresholds={gaitEventThresholds}
        onThresholdsChange={setGaitEventThresholds}
        showEvents={showEvents}
        onShowEventsChange={setShowEvents}
      />
      
      <div className="flex justify-end mb-4">
        <div className="bg-muted rounded-md p-1 flex">
          <Button
            variant={activeView === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('table')}
            className="flex items-center gap-1"
          >
            <Table size={16} />
            <span>Table</span>
          </Button>
          <Button
            variant={activeView === 'chart' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('chart')}
            className="flex items-center gap-1"
          >
            <List size={16} />
            <span>Chart</span>
          </Button>
        </div>
      </div>
      
      {activeView === 'table' && (
        <GaitEventTable 
          data={data} 
          thresholds={gaitEventThresholds}
        />
      )}
      
      {activeView === 'chart' && (
        <GaitEventAnalysis 
          data={data}
          currentTime={currentTime}
        />
      )}
    </div>
  );
};

export default GaitEventsTab;
