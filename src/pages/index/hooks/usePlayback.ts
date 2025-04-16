
import { useState, useRef, useEffect } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface TimeRange {
  start: number;
  end: number;
}

interface UsePlaybackProps {
  data: ProcessedData | null;
  onTimeChange?: (time: number) => void;
}

export const usePlayback = ({ data, onTimeChange }: UsePlaybackProps) => {
  // Basic playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: 0,
    end: 100
  });
  
  // Animation frame reference for smooth playback
  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  
  // Get duration from data
  const duration = data?.pressureData.length ? 
    data.pressureData[data.pressureData.length - 1].time : 
    100;
  
  // Update time and call onChange callback
  const updateTime = (newTime: number) => {
    setCurrentTime(newTime);
    if (onTimeChange) {
      onTimeChange(newTime);
    }
  };
  
  // Animation function for playback
  const animate = (timestamp: number) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    // Calculate delta time in seconds
    const deltaTime = (timestamp - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = timestamp;
    
    if (data) {
      // Calculate new time with playback speed
      let newTime = currentTime + (deltaTime * playbackSpeed);
      
      // Check if we've reached the end of the range
      if (newTime >= timeRange.end || newTime >= duration) {
        setIsPlaying(false);
        newTime = Math.min(timeRange.end, duration);
      }
      
      // Update time
      updateTime(newTime);
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Start/stop animation based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = null;
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);
  
  // Initialize time range when data changes
  useEffect(() => {
    if (data && data.pressureData.length > 0) {
      const start = data.pressureData[0].time;
      const end = data.pressureData[data.pressureData.length - 1].time;
      
      setTimeRange({
        start: start,
        end: end
      });
      
      // Reset to start time when data changes
      updateTime(start);
    }
  }, [data]);
  
  // Playback control functions
  const handlePlay = () => {
    if (!data) return;
    
    // If at the end, start from beginning
    if (currentTime >= timeRange.end || currentTime >= duration) {
      updateTime(timeRange.start);
    }
    
    setIsPlaying(true);
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    updateTime(timeRange.start);
  };
  
  const handleSeek = (time: number) => {
    if (isPlaying) {
      setIsPlaying(false);
    }
    updateTime(time);
  };
  
  const handleStepBackward = () => {
    const newTime = Math.max(timeRange.start, currentTime - 0.1);
    updateTime(newTime);
  };
  
  const handleStepForward = () => {
    if (!data) return;
    const maxTime = Math.min(timeRange.end, duration);
    const newTime = Math.min(maxTime, currentTime + 0.1);
    updateTime(newTime);
  };
  
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  };
  
  const handleTimeRangeChange = (start: number, end: number) => {
    setTimeRange({
      start,
      end
    });
    
    // Reset to start of new range
    updateTime(start);
  };
  
  return {
    isPlaying,
    currentTime,
    playbackSpeed,
    isMuted,
    timeRange,
    duration,
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
