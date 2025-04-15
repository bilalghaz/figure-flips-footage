
import React from 'react';

interface VideoTimeDisplayProps {
  currentTime: number;
  duration: number;
}

export const VideoTimeDisplay = ({ currentTime, duration }: VideoTimeDisplayProps) => {
  // Format time as MM:SS.ms
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-sm font-mono">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  );
};
