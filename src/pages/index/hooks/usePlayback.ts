
import { useState, useRef, useCallback, useEffect } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  isMuted: boolean;
  timeRange: {
    start: number;
    end: number | null;
  };
}

interface UsePlaybackProps {
  data: ProcessedData | null;
  onTimeChange?: (time: number) => void;
}

export const usePlayback = ({ data, onTimeChange }: UsePlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRange, setTimeRange] = useState<{start: number; end: number | null}>({
    start: 0,
    end: null
  });
  
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  const handleTimeChange = useCallback((time: number) => {
    setCurrentTime(time);
    if (onTimeChange) {
      onTimeChange(time);
    }
  }, [onTimeChange]);
  
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;
    
    if (deltaTime > 0.05) {
      // Calculate new time first, then pass the calculated value
      const prevTime = currentTime;
      const newTime = prevTime + (Math.min(deltaTime, 0.1) * playbackSpeed);
      
      if (data) {
        const maxTime = timeRange.end !== null ? 
          Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
          data.pressureData[data.pressureData.length - 1].time;
          
        if (newTime >= maxTime) {
          setIsPlaying(false);
          handleTimeChange(maxTime);
        } else {
          handleTimeChange(newTime);
        }
      } else {
        handleTimeChange(newTime);
      }
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [data, currentTime, isPlaying, playbackSpeed, timeRange.end, handleTimeChange]);
  
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, animate]);
  
  const handlePlay = useCallback(() => {
    if (!data) return;
    
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    if (currentTime >= maxTime) {
      handleTimeChange(timeRange.start || 0);
    }
    
    setIsPlaying(true);
    lastTimeRef.current = null;
  }, [data, currentTime, timeRange, handleTimeChange]);
  
  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);
  
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    handleTimeChange(timeRange.start || 0);
  }, [timeRange.start, handleTimeChange]);
  
  const handleSeek = useCallback((time: number) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    handleTimeChange(time);
  }, [isPlaying, handleTimeChange]);
  
  const handleStepBackward = useCallback(() => {
    // Calculate the new time value first, then pass it
    const newTime = Math.max(timeRange.start || 0, currentTime - 0.1);
    handleTimeChange(newTime);
  }, [timeRange.start, currentTime, handleTimeChange]);
  
  const handleStepForward = useCallback(() => {
    if (!data) return;
    
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    // Calculate the new time value first, then pass it
    const newTime = Math.min(maxTime, currentTime + 0.1);
    handleTimeChange(newTime);
  }, [data, timeRange.end, currentTime, handleTimeChange]);
  
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);
  
  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);
  
  const handleTimeRangeChange = useCallback((startTime: number, endTime: number) => {
    setTimeRange({
      start: startTime,
      end: endTime
    });
    
    // Set current time to start of range
    handleTimeChange(startTime);
  }, [handleTimeChange]);
  
  // Reset currentTime when timeRange changes
  useEffect(() => {
    if (data) {
      handleTimeChange(timeRange.start || data.pressureData[0].time);
    }
  }, [data, timeRange.start, handleTimeChange]);
  
  return {
    isPlaying,
    currentTime,
    playbackSpeed,
    isMuted,
    timeRange,
    handlePlay,
    handlePause,
    handleReset,
    handleSeek,
    handleStepBackward,
    handleStepForward,
    handleSpeedChange,
    handleMuteToggle,
    handleTimeRangeChange,
    setTimeRange
  };
};
