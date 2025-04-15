
import React, { useState, useEffect, useRef } from 'react';
import PressureDataUploader from '@/components/PressureDataUploader';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureDataTable from '@/components/PressureDataTable';
import EnhancedPressureChart from '@/components/EnhancedPressureChart';
import AveragePressureHeatmap from '@/components/AveragePressureHeatmap';
import GaitEventAnalysis from '@/components/GaitEventAnalysis';
import VideoControls from '@/components/VideoControls';
import UserControlPanel from '@/components/UserControlPanel';
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalData, setOriginalData] = useState<ProcessedData | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRegion, setCurrentRegion] = useState('heel');
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  const [activeTab, setActiveTab] = useState<string>('visualization');
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  // Current data point based on time
  const getCurrentDataPoint = (): PressureDataPoint | null => {
    if (!data || !data.pressureData.length) return null;
    
    // Find the closest data point for the current time
    const index = data.pressureData.findIndex(point => point.time > currentTime);
    if (index <= 0) return data.pressureData[0];
    if (index >= data.pressureData.length) return data.pressureData[data.pressureData.length - 1];
    
    // Return the previous point (closest to current time)
    return data.pressureData[index - 1];
  };
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    setCurrentTime(prevTime => {
      const newTime = prevTime + (deltaTime * playbackSpeed);
      if (data && newTime >= data.pressureData[data.pressureData.length - 1].time) {
        setIsPlaying(false);
        return data.pressureData[data.pressureData.length - 1].time;
      }
      return newTime;
    });
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);
  
  // Play/pause handlers
  const handlePlay = () => {
    if (!data) return;
    
    // If we're at the end, restart
    if (currentTime >= data.pressureData[data.pressureData.length - 1].time) {
      setCurrentTime(0);
    }
    
    setIsPlaying(true);
    lastTimeRef.current = null;
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleStepBackward = () => {
    setCurrentTime(prevTime => Math.max(0, prevTime - 0.1));
  };
  
  const handleStepForward = () => {
    if (!data) return;
    setCurrentTime(prevTime => 
      Math.min(data.pressureData[data.pressureData.length - 1].time, prevTime + 0.1)
    );
  };
  
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  // Export data
  const handleExportData = () => {
    if (!data) return;
    
    const currentDataPoint = getCurrentDataPoint();
    if (!currentDataPoint) return;
    
    const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
    
    // Prepare data for export
    const exportData = [
      ['Region', 'Left Foot Peak (kPa)', 'Right Foot Peak (kPa)', 'Difference (kPa)', 
       'Left Foot Mean (kPa)', 'Right Foot Mean (kPa)', 'Difference (kPa)'],
      ...regions.map(region => {
        const leftPeak = currentDataPoint.leftFoot[region].peak;
        const rightPeak = currentDataPoint.rightFoot[region].peak;
        const peakDiff = leftPeak - rightPeak;
        
        const leftMean = currentDataPoint.leftFoot[region].mean;
        const rightMean = currentDataPoint.rightFoot[region].mean;
        const meanDiff = leftMean - rightMean;
        
        return [
          region,
          leftPeak.toFixed(2),
          rightPeak.toFixed(2),
          peakDiff.toFixed(2),
          leftMean.toFixed(2),
          rightMean.toFixed(2),
          meanDiff.toFixed(2)
        ];
      })
    ];
    
    // Create a worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pressure Data');
    
    // Generate filename with current time
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pressure_data_${currentTime.toFixed(2)}s_${timestamp}.xlsx`;
    
    // Trigger download
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "Export complete",
      description: `Data exported to ${filename}`,
      duration: 3000,
    });
  };
  
  // Handle data processing
  const handleDataProcessed = (processedData: ProcessedData) => {
    setData(processedData);
    setOriginalData(JSON.parse(JSON.stringify(processedData))); // Keep a deep copy of original data
    setCurrentTime(processedData.pressureData[0].time);
    toast({
      title: "Data loaded successfully",
      description: `Processed ${processedData.pressureData.length} data points`,
      duration: 3000,
    });
  };
  
  // Handle filter applied
  const handleFilterApplied = (filteredData: ProcessedData) => {
    setData(filteredData);
    toast({
      title: "Filter applied",
      description: "Data has been filtered",
      duration: 3000,
    });
  };
  
  // Handle reset to original data
  const handleResetData = () => {
    if (originalData) {
      setData(JSON.parse(JSON.stringify(originalData)));
      toast({
        title: "Data reset",
        description: "Returned to original unfiltered data",
        duration: 3000,
      });
    }
  };
  
  // Initialize to the start if data changes
  useEffect(() => {
    if (data) {
      setCurrentTime(data.pressureData[0].time);
    }
  }, [data]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Plantar Pressure Analysis</h1>
          <p className="text-gray-600 mt-2 text-center text-sm md:text-base">
            Upload and analyze pressure data from Pedar-X In-Shoe Pressure Measurement System
          </p>
        </header>
        
        {!data ? (
          <div className="max-w-xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <PressureDataUploader 
                  onDataProcessed={handleDataProcessed} 
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-md shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setData(null);
                      setOriginalData(null);
                    }}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload New Data</span>
                  </Button>
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {data.pressureData.length} Data Points
                  </Badge>
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {data.pressureData[data.pressureData.length - 1].time.toFixed(2)}s
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleExportData}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">Export Frame</span>
                  </Button>
                </div>
              </div>
              
              <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={data.pressureData[data.pressureData.length - 1].time}
                playbackSpeed={playbackSpeed}
                isMuted={isMuted}
                onPlay={handlePlay}
                onPause={handlePause}
                onReset={handleReset}
                onSeek={handleSeek}
                onSpeedChange={handleSpeedChange}
                onMuteToggle={handleMuteToggle}
                onStepBackward={handleStepBackward}
                onStepForward={handleStepForward}
              />
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="bg-white p-4 rounded-md shadow-md mb-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="gait-events">Gait Events</TabsTrigger>
                  <TabsTrigger value="control-panel">Control Panel</TabsTrigger>
                </TabsList>
                
                <UserControlPanel 
                  data={data}
                  currentTime={currentTime}
                  onFilter={handleFilterApplied}
                  onExport={handleExportData}
                  isProcessing={isProcessing}
                  onReset={handleResetData}
                />
              </div>
              
              <TabsContent value="visualization" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PressureHeatMap 
                    dataPoint={getCurrentDataPoint()} 
                    side="left"
                    maxPressure={pressureMode === 'peak' ? data.maxPeakPressure : data.maxMeanPressure}
                    mode={pressureMode}
                  />
                  
                  <PressureHeatMap 
                    dataPoint={getCurrentDataPoint()} 
                    side="right"
                    maxPressure={pressureMode === 'peak' ? data.maxPeakPressure : data.maxMeanPressure}
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
                    <EnhancedPressureChart 
                      data={data} 
                      currentTime={currentTime}
                      region={currentRegion}
                      mode={pressureMode}
                    />
                    <PressureDataTable 
                      dataPoint={getCurrentDataPoint()}
                      mode={pressureMode}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-6">
                <AveragePressureHeatmap 
                  data={data}
                  mode={pressureMode}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-md shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Pressure Distribution</h3>
                    <div className="h-[300px]">
                      {/* Additional charts and visualizations can be added here */}
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
                        <p className="text-gray-500">Additional analysis charts will be added in future updates</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-md shadow-md">
                    <h3 className="text-lg font-semibold mb-4">Left-Right Comparison</h3>
                    <div className="h-[300px]">
                      {/* Additional charts and visualizations can be added here */}
                      <div className="flex items-center justify-center h-full bg-gray-50 rounded-md">
                        <p className="text-gray-500">Additional analysis charts will be added in future updates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gait-events" className="space-y-6">
                <GaitEventAnalysis 
                  data={data}
                  currentTime={currentTime}
                />
              </TabsContent>
              
              <TabsContent value="control-panel" className="space-y-6">
                <div className="bg-white p-4 rounded-md shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Advanced Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-2">Data Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the Control Panel tab to apply filters, configure visualizations, and export data.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-2">Processing Settings</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Data sampled at 100Hz</li>
                        <li>Heel strike threshold: 25 kPa</li>
                        <li>Toe-off threshold: 20 kPa</li>
                        <li>Low-pass filter available for smoothing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
