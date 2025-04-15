
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
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

interface VideoTimeRangeSelectorProps {
  duration: number;
  onTimeRangeChange: (startTime: number, endTime: number) => void;
}

export const VideoTimeRangeSelector = ({
  duration,
  onTimeRangeChange
}: VideoTimeRangeSelectorProps) => {
  // Setup form for time range selection
  const form = useForm<z.infer<typeof timeRangeSchema>>({
    resolver: zodResolver(timeRangeSchema),
    defaultValues: {
      startTime: 0,
      endTime: duration
    },
  });
  
  // Update end time when duration changes
  React.useEffect(() => {
    form.setValue("endTime", duration);
  }, [duration, form]);
  
  // Handle time range form submission
  const onTimeRangeSubmit = (values: z.infer<typeof timeRangeSchema>) => {
    if (values.startTime !== undefined && values.endTime !== undefined) {
      onTimeRangeChange(values.startTime, values.endTime);
    }
  };

  return (
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
  );
};
