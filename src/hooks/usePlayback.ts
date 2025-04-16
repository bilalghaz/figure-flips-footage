
import { useState, useEffect, useRef } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface UsePlaybackProps {
  data: ProcessedData | null;
  onTimeChange?: (time: number) => void;
}

export const usePlayback = ({ data, onTimeChange }: UsePlaybackProps = { data: null }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRange, setTimeRange] = useState<{start: number, end: number | null}>({ start: 0, end: null });
  
  // Store the animation frame ID for cleanup
  const animationRef = useRef<number>(0);
  // Store the last timestamp to calculate delta time
  const lastTimeRef = useRef<number>(0);
  
  // Duration of the recording
  const duration = data ? data.pressureData[data.pressureData.length - 1]?.time || 0 : 0;
  
  // Reset playback when data changes
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  
  // Animation loop for playback
  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      // Calculate time difference
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      
      // Update current time with speed factor
      const newTime = currentTime + (deltaTime * playbackSpeed);
      
      // Check if we've reached the end of the range or recording
      const endTime = timeRange.end !== null ? timeRange.end : duration;
      
      if (newTime >= endTime) {
        setCurrentTime(endTime);
        setIsPlaying(false);
        return;
      }
      
      setCurrentTime(newTime);
      if (onTimeChange) onTimeChange(newTime);
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying && data) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, data, playbackSpeed, currentTime, duration]);
  
  // Playback control functions
  const handlePlay = () => {
    // If at the end, restart from beginning
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    
    // If we're in a custom range and current time is outside or at the end, reset to start of range
    if (timeRange.start !== 0 || timeRange.end !== null) {
      if (currentTime < timeRange.start || currentTime >= (timeRange.end || duration)) {
        setCurrentTime(timeRange.start);
      }
    }
    
    setIsPlaying(true);
    lastTimeRef.current = 0; // Reset the time reference
  };
  
  const handlePause = () => {
    setIsPlaying(false);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(timeRange.start || 0);
    if (onTimeChange) onTimeChange(timeRange.start || 0);
  };
  
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (onTimeChange) onTimeChange(time);
  };
  
  const handleStepBackward = () => {
    const newTime = Math.max(timeRange.start || 0, currentTime - 0.1);
    setCurrentTime(newTime);
    if (onTimeChange) onTimeChange(newTime);
  };
  
  const handleStepForward = () => {
    const newTime = Math.min(timeRange.end || duration, currentTime + 0.1);
    setCurrentTime(newTime);
    if (onTimeChange) onTimeChange(newTime);
  };
  
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handleTimeRangeChange = (startTime: number, endTime: number) => {
    setTimeRange({ start: startTime, end: endTime });
    
    // Set current time to start of range
    setCurrentTime(startTime);
    if (onTimeChange) onTimeChange(startTime);
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
