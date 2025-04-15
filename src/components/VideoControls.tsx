
import React, { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepBack, StepForward, Volume2, VolumeX } from 'lucide-react';
import { debounce } from 'lodash';

interface VideoControlsProps {
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
}

const VideoControls = ({
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
  onStepForward
}: VideoControlsProps) => {
  const [localTime, setLocalTime] = useState(currentTime);
  const [isDragging, setIsDragging] = useState(false);
  
  // Update local time when currentTime changes (but not during dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Format time as MM:SS.ms
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Available playback speeds
  const speeds = [0.25, 0.5, 1, 1.5, 2];

  // Create a debounced seek function to reduce the number of updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSeek = useCallback(
    debounce((value: number) => {
      onSeek(value);
      setIsDragging(false);
    }, 50),
    [onSeek]
  );

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setLocalTime(value[0]);
    setIsDragging(true);
    debouncedSeek(value[0]);
  };
  
  // Handle when user starts dragging slider
  const handleSliderDragStart = () => {
    if (isPlaying) {
      onPause();
    }
    setIsDragging(true);
  };

  return (
    <div className="flex flex-col w-full gap-2 bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? onPause : onPlay}
          className="h-10 w-10"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-10 w-10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStepBackward}
          className="h-10 w-10"
        >
          <StepBack className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStepForward}
          className="h-10 w-10"
        >
          <StepForward className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 mx-2">
          <Slider
            value={[localTime]}
            min={0}
            max={duration}
            step={0.01}
            onValueChange={handleSliderChange}
            onValueCommit={value => {
              onSeek(value[0]);
              setIsDragging(false);
            }}
            onMouseDown={handleSliderDragStart}
            onTouchStart={handleSliderDragStart}
          />
        </div>
        
        <div className="text-sm font-mono">
          {formatTime(localTime)} / {formatTime(duration)}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onMuteToggle}
          className="h-10 w-10 ml-2"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>

        <select 
          className="h-10 px-2 border rounded-md bg-background text-sm"
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        >
          {speeds.map(speed => (
            <option key={speed} value={speed}>
              {speed}x
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VideoControls;
