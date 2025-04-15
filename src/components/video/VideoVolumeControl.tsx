
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface VideoVolumeControlProps {
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const VideoVolumeControl = ({
  isMuted,
  onMuteToggle
}: VideoVolumeControlProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onMuteToggle}
      className="h-10 w-10 ml-2"
    >
      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </Button>
  );
};
