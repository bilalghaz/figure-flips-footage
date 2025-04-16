
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import VideoControls from '@/components/VideoControls';
import DatasetSelector from './DatasetSelector';

interface DataControlsProps {
  data: ProcessedData | null;
  datasets: ProcessedData[];
  activeDatasetIndex: number;
  currentTime: number;
  timeRange: { start: number; end: number | null };
  isPlaying: boolean;
  playbackSpeed: number;
  isMuted: boolean;
  onUploadNewData: () => void;
  onExportData: () => void;
  onDatasetChange: (index: number) => void;
  onRemoveDataset: (index: number) => void;
  onCompareDatasets: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onMuteToggle: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onTimeRangeChange: (startTime: number, endTime: number) => void;
}

const DataControls: React.FC<DataControlsProps> = ({
  data,
  datasets,
  activeDatasetIndex,
  currentTime,
  timeRange,
  isPlaying,
  playbackSpeed,
  isMuted,
  onUploadNewData,
  onExportData,
  onDatasetChange,
  onRemoveDataset,
  onCompareDatasets,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSpeedChange,
  onMuteToggle,
  onStepBackward,
  onStepForward,
  onTimeRangeChange
}) => {
  if (!data) return null;
  
  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onUploadNewData}
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
          
          {(timeRange.start !== 0 || timeRange.end !== null) && (
            <Badge variant="outline" className="bg-green-50 text-green-800">
              Range: {timeRange.start.toFixed(1)}s - {timeRange.end?.toFixed(1) || 'End'}s
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onExportData}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Export Frame</span>
          </Button>
        </div>
      </div>
      
      <DatasetSelector 
        datasets={datasets}
        activeDatasetIndex={activeDatasetIndex}
        onDatasetChange={onDatasetChange}
        onRemoveDataset={onRemoveDataset}
        onCompareDatasets={onCompareDatasets}
      />
      
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={data?.pressureData[data.pressureData.length - 1].time || 0}
        playbackSpeed={playbackSpeed}
        isMuted={isMuted}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        onSeek={onSeek}
        onSpeedChange={onSpeedChange}
        onMuteToggle={onMuteToggle}
        onStepBackward={onStepBackward}
        onStepForward={onStepForward}
        onTimeRangeChange={onTimeRangeChange}
      />
    </div>
  );
};

export default DataControls;
