
import React from 'react';
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
  dataPoint: PressureDataPoint | null;
  getCurrentDataPoint: () => PressureDataPoint | null;
  onFilter: (filteredData: ProcessedData) => void;
  onExport: () => void;
  onReset: () => void;
  onUploadNewData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabContainer: React.FC<TabContainerProps> = ({
  data,
  datasets,
  currentTime,
  isProcessing,
  dataPoint,
  getCurrentDataPoint,
  onFilter,
  onExport,
  onReset,
  onUploadNewData,
  activeTab,
  setActiveTab
}) => {
  if (!data) return null;
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'visualization':
        return (
          <VisualizationTab 
            data={data}
            currentTime={currentTime}
            currentDataPoint={dataPoint}
            getCurrentDataPoint={getCurrentDataPoint}
          />
        );
      case 'analysis':
        return (
          <AnalysisTab 
            data={data}
            pressureMode="peak"
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
  };
  
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
      
      <TabsContent value={activeTab} className="focus:outline-none mt-0">
        {renderTabContent()}
      </TabsContent>
    </Tabs>
  );
};

export default TabContainer;
