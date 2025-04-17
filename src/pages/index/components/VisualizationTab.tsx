
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
  const [editMode, setEditMode] = useState(false);
  const [selectedFoot, setSelectedFoot] = useState<'left' | 'right'>('left');
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [sensorAssignments, setSensorAssignments] = useState<CustomSensorAssignments>({
    left: {},
    right: {}
  });
  const [regionToAssign, setRegionToAssign] = useState('heel');
  
  // Get all valid sensors for the selected foot
  const getAllSensorIds = (side: 'left' | 'right') => {
    return Object.keys(side === 'left' ? SVG_TO_SENSOR_MAP_LEFT : SVG_TO_SENSOR_MAP_RIGHT);
  };
  
  // Handle selecting a sensor
  const handleSensorSelect = (sensorId: string) => {
    setSelectedSensor(sensorId === selectedSensor ? null : sensorId);
  };
  
  // Handle assigning selected sensor to a region
  const handleAssignSensor = () => {
    if (!selectedSensor) return;
    
    setSensorAssignments(prev => ({
      ...prev,
      [selectedFoot]: {
        ...prev[selectedFoot],
        [selectedSensor]: regionToAssign
      }
    }));
    
    toast({
      title: "Sensor assigned",
      description: `Sensor ${selectedSensor} assigned to ${regionToAssign}`,
      duration: 3000,
    });
  };
  
  // Reset selected sensor's assignment
  const handleResetSensor = () => {
    if (!selectedSensor) return;
    
    setSensorAssignments(prev => {
      const newAssignments = { ...prev };
      const footAssignments = { ...newAssignments[selectedFoot] };
      delete footAssignments[selectedSensor];
      newAssignments[selectedFoot] = footAssignments;
      return newAssignments;
    });
    
    toast({
      title: "Assignment reset",
      description: `Assignment for sensor ${selectedSensor} has been reset`,
      duration: 3000,
    });
  };
  
  // Reset all sensor assignments
  const handleResetAllAssignments = () => {
    setSensorAssignments({
      left: {},
      right: {}
    });
    
    toast({
      title: "All assignments reset",
      description: "All sensor assignments have been reset to default",
      duration: 3000,
    });
  };
  
  // Save custom assignments to localStorage
  const handleSaveAssignments = () => {
    localStorage.setItem('sensorAssignments', JSON.stringify(sensorAssignments));
    
    toast({
      title: "Assignments saved",
      description: "Your custom sensor assignments have been saved",
      duration: 3000,
    });
  };
  
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="edit-mode"
            checked={editMode}
            onCheckedChange={setEditMode}
          />
          <Label htmlFor="edit-mode" className="font-medium">
            Sensor Edit Mode {editMode ? 'On' : 'Off'}
          </Label>
        </div>
        
        {editMode && (
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveAssignments}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Layout
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetAllAssignments}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset All
            </Button>
          </div>
        )}
      </div>
      
      {editMode && (
        <div className="bg-card p-4 rounded-md shadow-sm mb-4">
          <h3 className="text-md font-medium mb-4">Sensor Assignment Tool</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="foot-selector" className="text-sm block mb-2">Select Foot</Label>
              <Select
                value={selectedFoot}
                onValueChange={(value) => {
                  setSelectedFoot(value as 'left' | 'right');
                  setSelectedSensor(null);
                }}
              >
                <SelectTrigger id="foot-selector" className="w-full">
                  <SelectValue placeholder="Select Foot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left Foot</SelectItem>
                  <SelectItem value="right">Right Foot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sensor-selector" className="text-sm block mb-2">
                Selected Sensor: {selectedSensor || 'None'}
              </Label>
              <p className="text-sm text-muted-foreground">
                Click on a sensor in the heatmap below to select it
              </p>
            </div>
            
            <div>
              <Label htmlFor="region-selector" className="text-sm block mb-2">Assign to Region</Label>
              <Select
                value={regionToAssign}
                onValueChange={setRegionToAssign}
              >
                <SelectTrigger id="region-selector" className="w-full">
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
            
            <div className="flex items-end space-x-2">
              <Button 
                disabled={!selectedSensor} 
                onClick={handleAssignSensor}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Assign
              </Button>
              <Button 
                variant="outline" 
                disabled={!selectedSensor} 
                onClick={handleResetSensor}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Instructions: Select a foot, click on a sensor, choose a region, and click "Assign" to customize the sensor layout.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PressureHeatMap 
          dataPoint={currentDataPoint || getCurrentDataPoint()} 
          side="left"
          maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
          mode={pressureMode}
          editMode={editMode && selectedFoot === 'left'}
          selectedSensor={selectedSensor}
          onSensorSelect={handleSensorSelect}
          customSensorAssignments={sensorAssignments.left}
        />
        
        <PressureHeatMap 
          dataPoint={currentDataPoint || getCurrentDataPoint()} 
          side="right"
          maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
          mode={pressureMode}
          editMode={editMode && selectedFoot === 'right'}
          selectedSensor={selectedSensor}
          onSensorSelect={handleSensorSelect}
          customSensorAssignments={sensorAssignments.right}
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
