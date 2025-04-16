
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface VideoTimeSliderProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onPause: () => void;
}

export const VideoTimeSlider = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onPause
}: VideoTimeSliderProps) => {
  const [sliderValue, setSliderValue] = useState(currentTime);
  const [isDragging, setIsDragging] = useState(false);
  
  // Update slider value when currentTime changes (but not while dragging)
  useEffect(() => {
    if (!isDragging) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isDragging]);
  
  const handleDragStart = () => {
    setIsDragging(true);
    if (isPlaying) {
      onPause();
    }
  };
  
  const handleValueChange = (values: number[]) => {
    setSliderValue(values[0]);
  };
  
  const handleValueCommit = (values: number[]) => {
    const newTime = values[0];
    onSeek(newTime);
    setIsDragging(false);
  };

  return (
    <div className="flex-1 mx-2">
      <Slider
        value={[sliderValue]}
        min={0}
        max={duration || 100}
        step={0.01}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        aria-label="Playback time slider"
        className="w-full"
      />
    </div>
  );
};
