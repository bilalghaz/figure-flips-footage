
import React, { memo } from 'react';
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

// Memoize individual control components for better performance
const MemoizedTransportControls = memo(VideoTransportControls);
const MemoizedTimeSlider = memo(VideoTimeSlider);
const MemoizedTimeDisplay = memo(VideoTimeDisplay);
const MemoizedVolumeControl = memo(VideoVolumeControl);
const MemoizedSpeedSelector = memo(VideoSpeedSelector);

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
  return (
    <div className="flex flex-col w-full gap-2 bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <MemoizedTransportControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          onReset={onReset}
          onStepBackward={onStepBackward}
          onStepForward={onStepForward}
        />
        
        <MemoizedTimeSlider
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={onSeek}
          onPause={onPause}
        />
        
        <MemoizedTimeDisplay
          currentTime={currentTime}
          duration={duration}
        />

        <MemoizedVolumeControl
          isMuted={isMuted}
          onMuteToggle={onMuteToggle}
        />

        <MemoizedSpeedSelector
          playbackSpeed={playbackSpeed}
          onSpeedChange={onSpeedChange}
        />
        
        {onTimeRangeChange && (
          <VideoTimeRangeSelector
            duration={duration}
            onTimeRangeChange={onTimeRangeChange}
          />
        )}
      </div>
    </div>
  );
};

// Export a memoized version of the component to prevent unnecessary re-renders
export default memo(VideoControlsContainer);
