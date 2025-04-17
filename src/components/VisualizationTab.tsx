
import React, { useState } from 'react';
import { PressureDataPoint, ProcessedData } from '@/utils/pressureDataProcessor';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureChart from '@/components/PressureChart';
import PressureDataTable from '@/components/PressureDataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GaitEventControls from '@/components/GaitEventControls';
import GaitEventOverlay from '@/components/GaitEventOverlay';
import { GaitEventThresholds } from '@/utils/gaitEventDetector';
import { Button } from "@/components/ui/button";
import { Table, BarChart2 } from "lucide-react";
import GaitEventTable from '@/components/GaitEventTable';

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
  const [currentRegion, setCurrentRegion] = useState('heel');
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  const [showGaitEvents, setShowGaitEvents] = useState(true);
  const [gaitEventThresholds, setGaitEventThresholds] = useState<GaitEventThresholds>({
    initialContact: 15,
    toeOff: 10
  });
  const [viewMode, setViewMode] = useState<'pressure' | 'gaitTable'>('pressure');
  
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      {viewMode === 'pressure' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <PressureHeatMap 
              dataPoint={currentDataPoint || getCurrentDataPoint()} 
              side="left"
              maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
              mode={pressureMode}
            />
            <GaitEventOverlay 
              data={data}
              currentTime={currentTime}
              thresholds={gaitEventThresholds}
              showEvents={showGaitEvents}
            />
          </div>
          
          <div className="relative">
            <PressureHeatMap 
              dataPoint={currentDataPoint || getCurrentDataPoint()} 
              side="right"
              maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
              mode={pressureMode}
            />
            <GaitEventOverlay 
              data={data}
              currentTime={currentTime}
              thresholds={gaitEventThresholds}
              showEvents={showGaitEvents}
            />
          </div>
        </div>
      )}
      
      {viewMode === 'gaitTable' && (
        <GaitEventTable 
          data={data} 
          thresholds={gaitEventThresholds}
        />
      )}
      
      <GaitEventControls
        thresholds={gaitEventThresholds}
        onThresholdsChange={setGaitEventThresholds}
        showEvents={showGaitEvents}
        onShowEventsChange={setShowGaitEvents}
      />
      
      <div className="bg-card p-4 rounded-md shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Pressure Analysis</h2>
          <div className="flex items-center space-x-4">
            <div className="bg-muted rounded-md p-1 flex">
              <Button
                variant={viewMode === 'pressure' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('pressure')}
                className="flex items-center gap-1"
              >
                <BarChart2 size={16} />
                <span>Pressure</span>
              </Button>
              <Button
                variant={viewMode === 'gaitTable' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('gaitTable')}
                className="flex items-center gap-1"
              >
                <Table size={16} />
                <span>Gait Table</span>
              </Button>
            </div>
            
            {viewMode === 'pressure' && (
              <>
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
                      <SelectItem value="fullFoot">Full Foot</SelectItem>
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
              </>
            )}
          </div>
        </div>
        
        {viewMode === 'pressure' && (
          <div className="grid grid-cols-1 gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PressureChart
                data={data} 
                currentTime={currentTime}
                region={currentRegion}
                mode={pressureMode}
                side="left"
                className="h-[500px]"
                enableZoom={true}
              />
              
              <PressureChart
                data={data} 
                currentTime={currentTime}
                region={currentRegion}
                mode={pressureMode}
                side="right"
                className="h-[500px]"
                enableZoom={true}
              />
            </div>
            
            <PressureDataTable 
              dataPoint={currentDataPoint || getCurrentDataPoint()}
              mode={pressureMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationTab;
