
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
  return (
    <div className="flex flex-col w-full gap-2 bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <VideoTransportControls
          isPlaying={isPlaying}
          onPlay={onPlay}
          onPause={onPause}
          onReset={onReset}
          onStepBackward={onStepBackward}
          onStepForward={onStepForward}
        />
        
        <VideoTimeSlider
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={onSeek}
          onPause={onPause}
        />
        
        <VideoTimeDisplay
          currentTime={currentTime}
          duration={duration}
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
            duration={duration}
            onTimeRangeChange={onTimeRangeChange}
          />
        )}
      </div>
    </div>
  );
};

export default VideoControlsContainer;
