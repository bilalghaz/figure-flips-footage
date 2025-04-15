
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { debounce } from 'lodash';

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
  const sliderDragStartedRef = useRef(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update local time when currentTime changes (but not during dragging)
  useEffect(() => {
    if (!isDragging && !sliderDragStartedRef.current) {
      setLocalTime(currentTime);
    }
  }, [currentTime, isDragging]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, []);
  
  // Create a debounced seek function to reduce the number of updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSeek = useCallback(
    debounce((value: number) => {
      onSeek(value);
      setIsDragging(false);
      sliderDragStartedRef.current = false;
    }, 20), // Reduced debounce time for more responsive seeking
    [onSeek]
  );

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const newTime = value[0];
    setLocalTime(newTime);
    
    // Only set isDragging to true if the change is user-initiated
    if (sliderDragStartedRef.current) {
      setIsDragging(true);
      
      // Clear any pending seek operations
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
      
      // Schedule new seek operation with a minimal delay
      seekTimeoutRef.current = setTimeout(() => {
        onSeek(newTime);
        setIsDragging(false);
        sliderDragStartedRef.current = false;
      }, 20);
    }
  };
  
  // Handle when user starts dragging slider
  const handleSliderDragStart = () => {
    sliderDragStartedRef.current = true;
    setIsDragging(true);
    
    if (isPlaying) {
      onPause();
    }
  };

  return (
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
          sliderDragStartedRef.current = false;
        }}
        onMouseDown={handleSliderDragStart}
        onTouchStart={handleSliderDragStart}
      />
    </div>
  );
};
