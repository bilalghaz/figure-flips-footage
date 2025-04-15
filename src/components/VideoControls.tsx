
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepBack, StepForward, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { debounce } from 'lodash';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

// Schema for time range form validation
const timeRangeSchema = z.object({
  startTime: z.coerce.number().min(0).optional().default(0),
  endTime: z.coerce.number().min(0).optional()
}).refine((data) => {
  if (data.startTime !== undefined && data.endTime !== undefined) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: "Start time must be less than end time",
  path: ["startTime"]
});

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  playbackSpeed,
  isMuted,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onSpeedChange,
  onMuteToggle,
  onStepBackward,
  onStepForward,
  onTimeRangeChange
}: VideoControlsProps) => {
  const [localTime, setLocalTime] = useState(currentTime);
  const [isDragging, setIsDragging] = useState(false);
  const sliderDragStartedRef = useRef(false);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Setup form for time range selection
  const form = useForm<z.infer<typeof timeRangeSchema>>({
    resolver: zodResolver(timeRangeSchema),
    defaultValues: {
      startTime: 0,
      endTime: duration
    },
  });
  
  // Update end time when duration changes
  useEffect(() => {
    form.setValue("endTime", duration);
  }, [duration, form]);
  
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
  
  // Format time as MM:SS.ms
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Available playback speeds
  const speeds = [0.25, 0.5, 1, 1.5, 2];

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
  
  // Handle direct play button click with cleaner state management
  const handlePlayClick = () => {
    if (isDragging) {
      // If we're currently dragging, first commit the current position
      onSeek(localTime);
      setIsDragging(false);
      sliderDragStartedRef.current = false;
    }
    
    // Then trigger play after a small delay to allow state to settle
    setTimeout(() => {
      onPlay();
    }, 50);
  };
  
  // Handle time range form submission
  const onTimeRangeSubmit = (values: z.infer<typeof timeRangeSchema>) => {
    if (onTimeRangeChange && values.startTime !== undefined && values.endTime !== undefined) {
      onTimeRangeChange(values.startTime, values.endTime);
      onSeek(values.startTime); // Seek to start time
    }
  };

  return (
    <div className="flex flex-col w-full gap-2 bg-white p-4 rounded-md shadow-md">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={isPlaying ? onPause : handlePlayClick}
          className="h-10 w-10"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-10 w-10"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStepBackward}
          className="h-10 w-10"
        >
          <StepBack className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onStepForward}
          className="h-10 w-10"
        >
          <StepForward className="h-5 w-5" />
        </Button>
        
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
        
        <div className="text-sm font-mono">
          {formatTime(localTime)} / {formatTime(duration)}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onMuteToggle}
          className="h-10 w-10 ml-2"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>

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
        
        {onTimeRangeChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-2">
                Set Range <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onTimeRangeSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max={duration}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time (s)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max={duration}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm">Apply Range</Button>
                  </div>
                </form>
              </Form>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default VideoControls;
