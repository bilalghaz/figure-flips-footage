
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepBack, StepForward, Volume2, VolumeX } from 'lucide-react';

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
  // Format time as MM:SS.ms
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Available playback speeds
  const speeds = [0.25, 0.5, 1, 1.5, 2];

  // Handle slider change with debouncing to prevent excessive re-renders
  const handleSliderChange = (value: number[]) => {
    // Only call onSeek when slider is released or clicked
    onSeek(value[0]);
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
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.01}
            onValueChange={handleSliderChange}
          />
        </div>
        
        <div className="text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
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
