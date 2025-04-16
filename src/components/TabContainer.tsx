
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';
import UserControlPanel from '@/components/UserControlPanel';
import VisualizationTab from '@/components/VisualizationTab';
import AnalysisTab from '@/components/AnalysisTab';
import ComparisonTab from '@/components/ComparisonTab';

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
      <div className="bg-card p-4 rounded-md shadow-sm mb-6">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
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
