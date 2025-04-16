
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
  
  // Update local time when currentTime changes (but not while dragging)
  useEffect(() => {
    if (!isDragging) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
  };
  
  // Handle when user starts dragging slider
  const handleSliderDragStart = () => {
    setIsDragging(true);
    
    if (isPlaying) {
      onPause();
    }
  };
  
  // Handle when user stops dragging slider
  const handleSliderDragEnd = (value: number[]) => {
    const newTime = value[0];
    onSeek(newTime);
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
