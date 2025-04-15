
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PressureDataUploader from '@/components/PressureDataUploader';
import PressureHeatMap from '@/components/PressureHeatMap';
import PressureDataTable from '@/components/PressureDataTable';
import PressureChart from '@/components/PressureChart';
import AveragePressureHeatmap from '@/components/AveragePressureHeatmap';
import GaitEventAnalysis from '@/components/GaitEventAnalysis';
import VideoControls from '@/components/VideoControls';
import UserControlPanel from '@/components/UserControlPanel';
import CopTrajectoryVisualization from '@/components/CopTrajectoryVisualization';
import DatasetComparison from '@/components/DatasetComparison';
import { ProcessedData, PressureDataPoint, processPressureData, processCopForceData, mergeData } from '@/utils/pressureDataProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, ArrowLeft, Trash2, Database, FileBarChart2 } from 'lucide-react';
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
  
  const [datasets, setDatasets] = useState<ProcessedData[]>([]);
  const [activeDatasetIndex, setActiveDatasetIndex] = useState<number>(0);
  const [copFile, setCopFile] = useState<File | null>(null);
  
  // Time range filtering
  const [timeRange, setTimeRange] = useState<{start: number; end: number | null}>({
    start: 0,
    end: null
  });
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const activeTabRef = useRef<string>(activeTab);
  
  // Update the ref when activeTab changes to avoid closure issues
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);
  
  const getCurrentDataPoint = useCallback((): PressureDataPoint | null => {
    if (!data || !data.pressureData.length) return null;
    
    const index = data.pressureData.findIndex(point => point.time > currentTime);
    if (index <= 0) return data.pressureData[0];
    if (index >= data.pressureData.length) return data.pressureData[data.pressureData.length - 1];
    
    return data.pressureData[index - 1];
  }, [data, currentTime]);
  
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    if (deltaTime > 0.05) {
      setCurrentTime(prevTime => {
        const newTime = prevTime + (Math.min(deltaTime, 0.1) * playbackSpeed);
        
        if (data) {
          const maxTime = timeRange.end !== null ? 
            Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
            data.pressureData[data.pressureData.length - 1].time;
            
          if (newTime >= maxTime) {
            setIsPlaying(false);
            return maxTime;
          }
        }
        return newTime;
      });
    }
    
    if (isPlaying) {
      // Only use requestAnimationFrame when tab is visible to improve performance
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [data, isPlaying, playbackSpeed, timeRange.end]);
  
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
  }, [isPlaying, playbackSpeed, animate]);
  
  const handlePlay = () => {
    if (!data) return;
    
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    if (currentTime >= maxTime) {
      setCurrentTime(timeRange.start || 0);
    }
    
    setIsPlaying(true);
    lastTimeRef.current = null;
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(timeRange.start || 0);
  };
  
  const handleSeek = (time: number) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    setCurrentTime(time);
  };
  
  const handleStepBackward = () => {
    setCurrentTime(prevTime => Math.max(timeRange.start || 0, prevTime - 0.1));
  };
  
  const handleStepForward = () => {
    if (!data) return;
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    setCurrentTime(prevTime => Math.min(maxTime, prevTime + 0.1));
  };
  
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handleTimeRangeChange = (startTime: number, endTime: number) => {
    setTimeRange({
      start: startTime,
      end: endTime
    });
    
    // Set current time to start of range
    setCurrentTime(startTime);
    
    toast({
      title: "Time range set",
      description: `Analysis range set from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s`,
      duration: 3000,
    });
  };
  
  const handleExportData = () => {
    if (!data) return;
    
    const currentDataPoint = getCurrentDataPoint();
    if (!currentDataPoint) return;
    
    const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
    
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
    
    const ws = XLSX.utils.aoa_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pressure Data');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pressure_data_${currentTime.toFixed(2)}s_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    
    toast({
      title: "Export complete",
      description: `Data exported to ${filename}`,
      duration: 3000,
    });
  };
  
  const handleDataProcessed = async (processedData: ProcessedData) => {
    if (copFile) {
      try {
        setIsProcessing(true);
        
        const copForceData = await processCopForceData(copFile);
        
        const mergedData = mergeData(processedData, copForceData);
        
        setDatasets(prev => [...prev, mergedData]);
        setActiveDatasetIndex(datasets.length);
        
        setData(mergedData);
        setOriginalData(JSON.parse(JSON.stringify(mergedData)));
        setCurrentTime(mergedData.pressureData[0].time);
        
        // Reset time range for new data
        setTimeRange({
          start: mergedData.pressureData[0].time,
          end: mergedData.pressureData[mergedData.pressureData.length - 1].time
        });
        
        toast({
          title: "Data loaded successfully",
          description: `Processed ${mergedData.pressureData.length} data points with COP data`,
          duration: 3000,
        });
        
        setCopFile(null);
      } catch (error) {
        console.error('Error processing COP data:', error);
        toast({
          title: "Error processing COP data",
          description: String(error),
          variant: "destructive",
          duration: 5000,
        });
        
        setDatasets(prev => [...prev, processedData]);
        setActiveDatasetIndex(datasets.length);
        setData(processedData);
        setOriginalData(JSON.parse(JSON.stringify(processedData)));
        setCurrentTime(processedData.pressureData[0].time);
        
        // Reset time range for new data
        setTimeRange({
          start: processedData.pressureData[0].time,
          end: processedData.pressureData[processedData.pressureData.length - 1].time
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      setDatasets(prev => [...prev, processedData]);
      setActiveDatasetIndex(datasets.length);
      setData(processedData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)));
      setCurrentTime(processedData.pressureData[0].time);
      
      // Reset time range for new data
      setTimeRange({
        start: processedData.pressureData[0].time,
        end: processedData.pressureData[processedData.pressureData.length - 1].time
      });
      
      toast({
        title: "Data loaded successfully",
        description: `Processed ${processedData.pressureData.length} data points`,
        duration: 3000,
      });
    }
  };
  
  const handleCopFileSelected = (file: File) => {
    if (file.name.toLowerCase().includes('fgt') || file.name.toLowerCase().includes('cop')) {
      setCopFile(file);
      toast({
        title: "COP/Force file selected",
        description: `File "${file.name}" will be processed with the next pressure data file`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Invalid COP/Force file",
        description: "The file doesn't appear to be a FGT/COP data file. The filename should contain 'FGT' or 'COP'.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleFilterApplied = (filteredData: ProcessedData) => {
    setData(filteredData);
    
    setDatasets(prev => {
      const newDatasets = [...prev];
      newDatasets[activeDatasetIndex] = filteredData;
      return newDatasets;
    });
    
    toast({
      title: "Filter applied",
      description: "Data has been filtered",
      duration: 3000,
    });
  };
  
  const handleResetData = () => {
    if (originalData) {
      const resetData = JSON.parse(JSON.stringify(originalData));
      setData(resetData);
      
      setDatasets(prev => {
        const newDatasets = [...prev];
        newDatasets[activeDatasetIndex] = resetData;
        return newDatasets;
      });
      
      // Reset time range
      setTimeRange({
        start: resetData.pressureData[0].time,
        end: resetData.pressureData[resetData.pressureData.length - 1].time
      });
      
      setCurrentTime(resetData.pressureData[0].time);
      
      toast({
        title: "Data reset",
        description: "Returned to original unfiltered data",
        duration: 3000,
      });
    }
  };
  
  const handleDatasetChange = (index: number) => {
    if (index >= 0 && index < datasets.length) {
      setActiveDatasetIndex(index);
      setData(datasets[index]);
      setOriginalData(JSON.parse(JSON.stringify(datasets[index])));
      setCurrentTime(datasets[index].pressureData[0].time);
      
      // Reset time range for the selected dataset
      setTimeRange({
        start: datasets[index].pressureData[0].time,
        end: datasets[index].pressureData[datasets[index].pressureData.length - 1].time
      });
      
      setIsPlaying(false);
    }
  };
  
  const handleRemoveDataset = (index: number) => {
    if (datasets.length <= 1) {
      setDatasets([]);
      setData(null);
      setOriginalData(null);
      setActiveDatasetIndex(0);
      return;
    }
    
    const newDatasets = datasets.filter((_, i) => i !== index);
    setDatasets(newDatasets);
    
    if (index === activeDatasetIndex) {
      const newIndex = Math.max(0, index - 1);
      setActiveDatasetIndex(newIndex);
      setData(newDatasets[newIndex]);
      setOriginalData(JSON.parse(JSON.stringify(newDatasets[newIndex])));
      setCurrentTime(newDatasets[newIndex].pressureData[0].time);
      
      // Reset time range
      setTimeRange({
        start: newDatasets[newIndex].pressureData[0].time,
        end: newDatasets[newIndex].pressureData[newDatasets[newIndex].pressureData.length - 1].time
      });
    } else if (index < activeDatasetIndex) {
      setActiveDatasetIndex(activeDatasetIndex - 1);
    }
  };
  
  // For performance optimization, conditionally render active tab content only
  const renderActiveTabContent = () => {
    if (!data) return null;
    
    switch (activeTab) {
      case 'visualization':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PressureHeatMap 
                dataPoint={getCurrentDataPoint()} 
                side="left"
                maxPressure={pressureMode === 'peak' ? data?.maxPeakPressure || 0 : data?.maxMeanPressure || 0}
                mode={pressureMode}
              />
              
              <PressureHeatMap 
                dataPoint={getCurrentDataPoint()} 
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
                  dataPoint={getCurrentDataPoint()}
                  mode={pressureMode}
                />
              </div>
            </div>
          </div>
        );
      
      case 'analysis':
        return (
          <div className="space-y-6">
            <AveragePressureHeatmap 
              data={data}
              mode={pressureMode}
            />
          </div>
        );
        
      case 'gait-events':
        return (
          <div className="space-y-6">
            <GaitEventAnalysis 
              data={data}
              currentTime={currentTime}
            />
          </div>
        );
        
      case 'cop-analysis':
        return (
          <div className="space-y-6">
            {data?.stancePhases ? (
              <CopTrajectoryVisualization 
                stancePhases={data.stancePhases}
                currentTime={currentTime}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileBarChart2 className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">COP Data Not Available</h3>
                    <p className="text-gray-500 mb-4 max-w-lg">
                      To analyze Center of Pressure (COP) trajectories, you need to upload both a pressure data file and a corresponding FGT.xlsx file containing COP and force data.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setDatasets([]);
                        setData(null);
                        setOriginalData(null);
                      }}
                    >
                      Upload New Data With COP File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
        
      case 'comparison':
        return (
          <div className="space-y-6">
            <DatasetComparison datasets={datasets} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  useEffect(() => {
    if (data) {
      setCurrentTime(timeRange.start || data.pressureData[0].time);
    }
  }, [data, timeRange.start]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-center">Plantar Pressure Analysis</h1>
          <p className="text-gray-600 mt-2 text-center text-sm md:text-base">
            Upload and analyze pressure data from Pedar-X In-Shoe Pressure Measurement System
          </p>
        </header>
        
        {datasets.length === 0 ? (
          <div className="max-w-xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">COP/Force File (Optional)</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload an FGT.xlsx file containing COP and force data for enhanced analysis.
                    The file should have columns for time, left/right force, and left/right COP X/Y coordinates.
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                    {copFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileBarChart2 className="h-6 w-6 text-blue-500 mr-2" />
                          <div>
                            <p className="font-medium">{copFile.name}</p>
                            <p className="text-xs text-gray-500">COP/Force file selected</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setCopFile(null)}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="ml-1">Remove</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FileBarChart2 className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-1">Drag and drop an FGT.xlsx file or click to browse</p>
                        <p className="text-xs text-gray-500 mb-2">
                          File should contain columns for time, left/right force, and left/right COP X/Y coordinates
                        </p>
                        <input
                          type="file"
                          accept=".xlsx"
                          className="hidden"
                          id="cop-file-input"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleCopFileSelected(e.target.files[0]);
                            }
                          }}
                        />
                        <label htmlFor="cop-file-input">
                          <Button variant="outline" size="sm" className="mt-2" asChild>
                            <span>Select COP File</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
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
                      setDatasets([]);
                      setData(null);
                      setOriginalData(null);
                      setCopFile(null);
                    }}
                    className="flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload New Data</span>
                  </Button>
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {data?.pressureData.length || 0} Data Points
                  </Badge>
                  
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {data?.pressureData[data.pressureData.length - 1].time.toFixed(2) || 0}s
                  </Badge>
                  
                  {timeRange.start !== 0 || timeRange.end !== null && (
                    <Badge variant="outline" className="bg-green-50 text-green-800">
                      Range: {timeRange.start.toFixed(1)}s - {timeRange.end?.toFixed(1) || 'End'}s
                    </Badge>
                  )}
                  
                  {data?.copForceData && (
                    <Badge variant="outline" className="bg-green-50 text-green-800">
                      COP Data Available
                    </Badge>
                  )}
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
              
              {datasets.length > 1 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {datasets.map((dataset, index) => (
                    <Badge 
                      key={index}
                      variant={index === activeDatasetIndex ? "default" : "outline"}
                      className="cursor-pointer flex items-center gap-1"
                      onClick={() => handleDatasetChange(index)}
                    >
                      <Database className="h-3 w-3 mr-1" />
                      {dataset.participantId || dataset.fileName || `Dataset ${index + 1}`}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDataset(index);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => setActiveTab('comparison')}
                  >
                    Compare Datasets
                  </Button>
                </div>
              )}
              
              <VideoControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={data?.pressureData[data.pressureData.length - 1].time || 0}
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
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>
            
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
                  onFilter={handleFilterApplied}
                  onExport={handleExportData}
                  isProcessing={isProcessing}
                  onReset={handleResetData}
                />
              </div>
              
              {/* Only render the active tab content for better performance */}
              <TabsContent value={activeTab} className="focus:outline-none">
                {renderActiveTabContent()}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
