
import React, { useState, useEffect } from 'react';
import { PressureDataPoint, ProcessedData, SVG_TO_SENSOR_MAP_LEFT, SVG_TO_SENSOR_MAP_RIGHT } from '@/utils/pressureDataProcessor';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureChart from '@/components/PressureChart';
import PressureDataTable from '@/components/PressureDataTable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Pencil, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VisualizationTabProps {
  data: ProcessedData | null;
  currentTime: number;
  currentDataPoint: PressureDataPoint | null;
  getCurrentDataPoint: () => PressureDataPoint | null;
}

// Interface for custom sensor assignments
interface CustomSensorAssignments {
  left: Record<string, string>;  // sensorId -> region
  right: Record<string, string>; // sensorId -> region
}

const VisualizationTab: React.FC<VisualizationTabProps> = ({
  data,
  currentTime,
  currentDataPoint,
  getCurrentDataPoint
}) => {
  const { toast } = useToast();
  const [currentRegion, setCurrentRegion] = useState('heel');
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  const [sensorAssignments, setSensorAssignments] = useState<CustomSensorAssignments>({
    left: {},
    right: {}
  });
  
  // Load custom assignments from localStorage on component mount
  useEffect(() => {
    const savedAssignments = localStorage.getItem('sensorAssignments');
    if (savedAssignments) {
      try {
        setSensorAssignments(JSON.parse(savedAssignments));
      } catch (error) {
        console.error("Failed to load saved sensor assignments:", error);
      }
    }
  }, []);
  
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
      
      <div className="bg-card p-4 rounded-md shadow-sm">
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
          </div>
        </div>
        
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
              customSensorAssignments={sensorAssignments.left}
            />
            
            <PressureChart
              data={data} 
              currentTime={currentTime}
              region={currentRegion}
              mode={pressureMode}
              side="right"
              className="h-[500px]"
              enableZoom={true}
              customSensorAssignments={sensorAssignments.right}
            />
          </div>
          
          <PressureDataTable 
            dataPoint={currentDataPoint || getCurrentDataPoint()}
            mode={pressureMode}
            customSensorAssignments={{
              left: sensorAssignments.left,
              right: sensorAssignments.right
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizationTab;
