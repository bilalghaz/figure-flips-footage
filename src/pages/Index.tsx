
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { usePlayback } from './index/hooks/usePlayback';
import { useDatasetManager } from './index/hooks/useDatasetManager';
import { useCurrentDataPoint } from './index/hooks/useCurrentDataPoint';
import { exportDataPoint } from './index/utils/dataExport';
import DataUploader from './index/components/DataUploader';
import DataControls from './index/components/DataControls';
import TabContainer from './index/components/TabContainer';

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('visualization');
  
  // Dataset management
  const {
    data,
    datasets,
    activeDatasetIndex,
    isProcessing,
    setIsProcessing,
    copFile,
    handleDataProcessed,
    handleCopFileSelected,
    handleFilterApplied,
    handleResetData,
    handleDatasetChange,
    handleRemoveDataset,
    resetAllData
  } = useDatasetManager();
  
  // Playback controls
  const {
    isPlaying,
    currentTime,
    playbackSpeed,
    isMuted,
    timeRange,
    setTimeRange,
    handlePlay,
    handlePause,
    handleReset,
    handleSeek,
    handleStepBackward,
    handleStepForward,
    handleSpeedChange,
    handleMuteToggle,
    handleTimeRangeChange
  } = usePlayback({ 
    data,
    onTimeChange: (time) => console.log(`Time changed to ${time}`)
  });
  
  // Current data point
  const {
    cachedDataPoint,
    getCurrentDataPoint
  } = useCurrentDataPoint(data, currentTime);
  
  // Data export
  const handleExportData = () => {
    try {
      const currentDataPoint = cachedDataPoint || getCurrentDataPoint();
      if (!currentDataPoint) {
        toast({
          title: "Export failed",
          description: "No data available to export",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      const filename = exportDataPoint(currentDataPoint);
      
      if (filename) {
        toast({
          title: "Export complete",
          description: `Data exported to ${filename}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Set time range when data changes
  useEffect(() => {
    if (data && data.pressureData.length > 0) {
      setTimeRange({
        start: data.pressureData[0].time,
        end: data.pressureData[data.pressureData.length - 1].time
      });
    }
  }, [data, setTimeRange]);
  
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
          <DataUploader 
            onDataProcessed={handleDataProcessed}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            copFile={copFile}
            onCopFileSelected={handleCopFileSelected}
          />
        ) : (
          <div className="space-y-6">
            <DataControls 
              data={data}
              datasets={datasets}
              activeDatasetIndex={activeDatasetIndex}
              currentTime={currentTime}
              timeRange={timeRange}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              isMuted={isMuted}
              onUploadNewData={resetAllData}
              onExportData={handleExportData}
              onDatasetChange={handleDatasetChange}
              onRemoveDataset={handleRemoveDataset}
              onCompareDatasets={() => setActiveTab('comparison')}
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
            
            <TabContainer 
              data={data}
              datasets={datasets}
              currentTime={currentTime}
              isProcessing={isProcessing}
              cachedDataPoint={cachedDataPoint}
              getCurrentDataPoint={getCurrentDataPoint}
              onFilter={handleFilterApplied}
              onExport={handleExportData}
              onReset={handleResetData}
              onUploadNewData={resetAllData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
