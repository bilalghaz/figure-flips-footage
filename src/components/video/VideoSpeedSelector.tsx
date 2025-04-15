
import React from 'react';

interface VideoSpeedSelectorProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

export const VideoSpeedSelector = ({
  playbackSpeed,
  onSpeedChange
}: VideoSpeedSelectorProps) => {
  // Available playback speeds
  const speeds = [0.25, 0.5, 1, 1.5, 2];

  return (
    <select 
      className="h-10 px-2 border rounded-md bg-background text-sm"
      value={playbackSpeed}
      onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
    >
      {speeds.map(speed => (
        <option key={speed} value={speed}>
          {speed}x
        </option>
      ))}
    </select>
  );
};
