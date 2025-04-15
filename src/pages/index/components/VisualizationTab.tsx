
import React from 'react';
import { PressureDataPoint, ProcessedData } from '@/utils/pressureDataProcessor';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureChart from '@/components/PressureChart';
import PressureDataTable from '@/components/PressureDataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisualizationTabProps {
  data: ProcessedData | null;
  currentTime: number;
  currentDataPoint: PressureDataPoint | null;
  getCurrentDataPoint: () => PressureDataPoint | null;
}

const VisualizationTab: React.FC<VisualizationTabProps> = ({
  data,
  currentTime,
  currentDataPoint,
  getCurrentDataPoint
}) => {
  const [currentRegion, setCurrentRegion] = React.useState('heel');
  const [pressureMode, setPressureMode] = React.useState<'peak' | 'mean'>('peak');
  
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PressureHeatMap 
          dataPoint={currentDataPoint || getCurrentDataPoint()} 
          side="left"
          maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
          mode={pressureMode}
        />
        
        <PressureHeatMap 
          dataPoint={currentDataPoint || getCurrentDataPoint()} 
          side="right"
          maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
          mode={pressureMode}
        />
      </div>
      
      <div className="bg-white p-4 rounded-md shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Pressure Analysis</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Region:</span>
              <Select
                value={currentRegion}
                onValueChange={setCurrentRegion}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heel">Heel</SelectItem>
                  <SelectItem value="medialMidfoot">Medial Midfoot</SelectItem>
                  <SelectItem value="lateralMidfoot">Lateral Midfoot</SelectItem>
                  <SelectItem value="forefoot">Forefoot</SelectItem>
                  <SelectItem value="toes">Toes</SelectItem>
                  <SelectItem value="hallux">Hallux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm">Mode:</span>
              <Tabs 
                value={pressureMode}
                onValueChange={(value) => setPressureMode(value as 'peak' | 'mean')}
                className="w-[200px]"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="peak">Peak Pressure</TabsTrigger>
                  <TabsTrigger value="mean">Mean Pressure</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PressureChart
            data={data} 
            currentTime={currentTime}
            region={currentRegion}
            mode={pressureMode}
          />
          <PressureDataTable 
            dataPoint={currentDataPoint || getCurrentDataPoint()}
            mode={pressureMode}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizationTab;
