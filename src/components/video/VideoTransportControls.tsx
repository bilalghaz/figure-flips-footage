
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, StepBack, StepForward } from 'lucide-react';

interface VideoTransportControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
}

export const VideoTransportControls = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  onStepBackward,
  onStepForward
}: VideoTransportControlsProps) => {
  // Handle direct play button click with cleaner state management
  const handlePlayClick = () => {
    // Simply call onPlay as any state management should be handled by parent
    onPlay();
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={isPlaying ? onPause : handlePlayClick}
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
    </>
  );
};
