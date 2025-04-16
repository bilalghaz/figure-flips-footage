
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
  const [localTime, setLocalTime] = useState(currentTime);
  const [isDragging, setIsDragging] = useState(false);
  
  // Simple effect to update local time when currentTime changes (but not while dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Handle slider drag start
  const handleSliderDragStart = () => {
    setIsDragging(true);
    if (isPlaying) {
      onPause();
    }
  };
  
  // Handle slider value change
  const handleSliderChange = (value: number[]) => {
    setLocalTime(value[0]);
  };
  
  // Handle slider drag end
  const handleSliderDragEnd = (value: number[]) => {
    onSeek(value[0]);
    setIsDragging(false);
  };

  return (
    <div className="flex-1 mx-2">
      <Slider
        value={[localTime]}
        min={0}
        max={duration || 100}
        step={0.01}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderDragEnd}
        onMouseDown={handleSliderDragStart}
        onTouchStart={handleSliderDragStart}
      />
    </div>
  );
};
