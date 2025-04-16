
import { useState, useRef, useCallback, useEffect } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface TimeRange {
  start: number;
  end: number | null;
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
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: 0,
    end: null
  });
  
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  
  // Update current time (with optional callback)
  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  }, [onTimeChange]);
  
  // Animation function for playback
  const animate = useCallback((timestamp: number) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const deltaTime = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;
    
    if (data) {
      // Calculate new time
      const newTime = currentTime + (deltaTime * playbackSpeed);
      
      // Get maximum time
      const maxTime = timeRange.end !== null ? 
        Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
        data.pressureData[data.pressureData.length - 1].time;
      
      // Check if playback should stop
      if (newTime >= maxTime) {
        setIsPlaying(false);
        handleTimeChange(maxTime);
      } else {
        handleTimeChange(newTime);
      }
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [currentTime, data, isPlaying, playbackSpeed, timeRange, handleTimeChange]);
  
  // Start/stop animation loop based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
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
  }, [isPlaying, animate]);
  
  // Play function
  const handlePlay = useCallback(() => {
    if (!data) return;
    
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    // If at the end, start from beginning
    if (currentTime >= maxTime) {
      handleTimeChange(timeRange.start);
    }
    
    setIsPlaying(true);
  }, [data, currentTime, timeRange, handleTimeChange]);
  
  // Core playback functions
  const handlePause = useCallback(() => setIsPlaying(false), []);
  
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    handleTimeChange(timeRange.start);
  }, [timeRange.start, handleTimeChange]);
  
  const handleSeek = useCallback((time: number) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    handleTimeChange(time);
  }, [isPlaying, handleTimeChange]);
  
  const handleStepBackward = useCallback(() => {
    const newTime = Math.max(timeRange.start, currentTime - 0.1);
    handleTimeChange(newTime);
  }, [currentTime, timeRange.start, handleTimeChange]);
  
  const handleStepForward = useCallback(() => {
    if (!data) return;
    
    const maxTime = timeRange.end !== null ? 
      Math.min(timeRange.end, data.pressureData[data.pressureData.length - 1].time) : 
      data.pressureData[data.pressureData.length - 1].time;
    
    const newTime = Math.min(maxTime, currentTime + 0.1);
    handleTimeChange(newTime);
  }, [data, currentTime, timeRange.end, handleTimeChange]);
  
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
  }, []);
  
  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  const handleTimeRangeChange = useCallback((startTime: number, endTime: number) => {
    setTimeRange({
      start: startTime,
      end: endTime
    });
    
    // Reset to start of new range
    handleTimeChange(startTime);
  }, [handleTimeChange]);
  
  // Init time range when data changes
  useEffect(() => {
    if (data && data.pressureData.length > 0) {
      const start = data.pressureData[0].time;
      const end = data.pressureData[data.pressureData.length - 1].time;
      
      setTimeRange({
        start: start,
        end: end
      });
      
      handleTimeChange(start);
    }
  }, [data, handleTimeChange]);
  
  return {
    isPlaying,
    currentTime,
    playbackSpeed,
    isMuted,
    timeRange,
    setTimeRange,
    handlePlay,
    handlePause,
    handleReset,
    handleSeek,
    handleStepBackward,
    handleStepForward,
    handleSpeedChange,
    handleMuteToggle,
    handleTimeRangeChange
  };
};
