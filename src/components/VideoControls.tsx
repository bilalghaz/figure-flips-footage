
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
}

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onReset,
  onSeek
}: VideoControlsProps) => {
  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        
        <div className="flex-1 mx-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={(value) => onSeek(value[0])}
          />
        </div>
        
        <div className="text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
