
import React from 'react';
import VideoControlsContainer from './video/VideoControlsContainer';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  isMuted: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onMuteToggle: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onTimeRangeChange?: (startTime: number, endTime: number) => void;
}

const VideoControls = (props: VideoControlsProps) => {
  return <VideoControlsContainer {...props} />;
};

export default VideoControls;
