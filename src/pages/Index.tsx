
import React, { useState, useEffect, useRef } from 'react';
import PressureDataUploader from '@/components/PressureDataUploader';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureDataTable from '@/components/PressureDataTable';
import PressureChart from '@/components/PressureChart';
import VideoControls from '@/components/VideoControls';
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentRegion, setCurrentRegion] = useState('heel');
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  
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
    const filename = `pressure_data_${currentTime.toFixed(2)}s.xlsx`;
    
    // Trigger download
    XLSX.writeFile(wb, filename);
  };
  
  // Initialize to the start if data changes
  useEffect(() => {
    if (data) {
      setCurrentTime(data.pressureData[0].time);
    }
  }, [data]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-center">Plantar Pressure Analysis</h1>
          <p className="text-gray-600 mt-2 text-center">
            Upload and analyze pressure data from Pedar-X In-Shoe Pressure Measurement System
          </p>
        </header>
        
        {!data ? (
          <div className="max-w-xl mx-auto">
            <PressureDataUploader 
              onDataProcessed={setData} 
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-4 rounded-md shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Pressure Data Visualization</h2>
                <div className="flex items-center space-x-4">
                  <Button 
                    onClick={handleExportData}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Current Frame
                  </Button>
                  <Button 
                    onClick={() => setData(null)}
                    variant="outline"
                  >
                    Upload New Data
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded-md shadow-md flex justify-center">
                <PressureHeatMap 
                  dataPoint={getCurrentDataPoint()} 
                  side="left"
                  maxPressure={pressureMode === 'peak' ? data.maxPeakPressure : data.maxMeanPressure}
                  mode={pressureMode}
                />
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-md flex justify-center">
                <PressureHeatMap 
                  dataPoint={getCurrentDataPoint()} 
                  side="right"
                  maxPressure={pressureMode === 'peak' ? data.maxPeakPressure : data.maxMeanPressure}
                  mode={pressureMode}
                />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-md shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Pressure Analysis</h2>
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PressureChart 
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
