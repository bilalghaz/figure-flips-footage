
import React from 'react';
import { VideoTimeDisplay } from './VideoTimeDisplay';
import { VideoTransportControls } from './VideoTransportControls';
import { VideoTimeSlider } from './VideoTimeSlider';
import { VideoSpeedSelector } from './VideoSpeedSelector';
import { VideoTimeRangeSelector } from './VideoTimeRangeSelector';
import { VideoVolumeControl } from './VideoVolumeControl';

interface VideoControlsContainerProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onMuteToggle: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onTimeRangeChange?: (startTime: number, endTime: number) => void;
}

const VideoControlsContainer = ({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  isMuted,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSpeedChange,
  onMuteToggle,
  onStepBackward,
  onStepForward,
  onTimeRangeChange
}: VideoControlsContainerProps) => {
  // Prevent negative or NaN values
  const sanitizedDuration = isNaN(duration) || duration < 0 ? 0 : duration;
  const sanitizedCurrentTime = isNaN(currentTime) || currentTime < 0 ? 0 : 
    (currentTime > sanitizedDuration ? sanitizedDuration : currentTime);

  return (
    <div className="flex flex-col w-full gap-2 bg-white p-4 rounded-md shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <VideoTransportControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          onReset={onReset}
          onStepBackward={onStepBackward}
          onStepForward={onStepForward}
        />
        
        <div className="flex-1 flex items-center min-w-[200px]">
          <VideoTimeSlider
            currentTime={sanitizedCurrentTime}
            duration={sanitizedDuration}
            isPlaying={isPlaying}
            onSeek={onSeek}
            onPause={onPause}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <VideoTimeDisplay
            currentTime={sanitizedCurrentTime}
            duration={sanitizedDuration}
          />

          <VideoVolumeControl
            isMuted={isMuted}
            onMuteToggle={onMuteToggle}
          />

          <VideoSpeedSelector
            playbackSpeed={playbackSpeed}
            onSpeedChange={onSpeedChange}
          />
          
          {onTimeRangeChange && (
            <VideoTimeRangeSelector
              duration={sanitizedDuration}
              onTimeRangeChange={onTimeRangeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoControlsContainer;
