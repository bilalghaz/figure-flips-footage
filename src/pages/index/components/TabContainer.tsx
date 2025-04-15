
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';
import UserControlPanel from '@/components/UserControlPanel';
import VisualizationTab from './VisualizationTab';
import AnalysisTab from './AnalysisTab';
import GaitEventsTab from './GaitEventsTab';
import CopAnalysisTab from './CopAnalysisTab';
import ComparisonTab from './ComparisonTab';

interface TabContainerProps {
  data: ProcessedData | null;
  datasets: ProcessedData[];
  currentTime: number;
  isProcessing: boolean;
  cachedDataPoint: PressureDataPoint | null;
  getCurrentDataPoint: () => PressureDataPoint | null;
  onFilter: (filteredData: ProcessedData) => void;
  onExport: () => void;
  onReset: () => void;
  onUploadNewData: () => void;
}

const TabContainer: React.FC<TabContainerProps> = ({
  data,
  datasets,
  currentTime,
  isProcessing,
  cachedDataPoint,
  getCurrentDataPoint,
  onFilter,
  onExport,
  onReset,
  onUploadNewData
}) => {
  const [activeTab, setActiveTab] = useState<string>('visualization');
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  const [showTabs, setShowTabs] = useState<boolean>(false);
  
  // Show tab after initial render to improve initial load time
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowTabs(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Memoize the active tab content for better performance
  const memoizedTabContent = useMemo(() => {
    if (!data) return null;
    
    switch (activeTab) {
      case 'visualization':
        return (
          <VisualizationTab 
            data={data}
            currentTime={currentTime}
            currentDataPoint={cachedDataPoint}
            getCurrentDataPoint={getCurrentDataPoint}
          />
        );
      case 'analysis':
        return (
          <AnalysisTab 
            data={data}
            pressureMode={pressureMode}
          />
        );
      case 'gait-events':
        return (
          <GaitEventsTab 
            data={data}
            currentTime={currentTime}
          />
        );
      case 'cop-analysis':
        return (
          <CopAnalysisTab 
            data={data}
            currentTime={currentTime}
            onUploadNewData={onUploadNewData}
          />
        );
      case 'comparison':
        return (
          <ComparisonTab datasets={datasets} />
        );
      default:
        return null;
    }
  }, [activeTab, data, currentTime, cachedDataPoint, getCurrentDataPoint, datasets, pressureMode, onUploadNewData]);
  
  if (!showTabs || !data) return null;
  
  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="gait-events">Gait Events</TabsTrigger>
          <TabsTrigger value="cop-analysis">COP Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <UserControlPanel 
          data={data}
          currentTime={currentTime}
          onFilter={onFilter}
          onExport={onExport}
          isProcessing={isProcessing}
          onReset={onReset}
        />
      </div>
      
      {/* Only render the active tab content for better performance */}
      <TabsContent value={activeTab} className="focus:outline-none mt-0">
        {memoizedTabContent}
      </TabsContent>
    </Tabs>
  );
};

export default TabContainer;
