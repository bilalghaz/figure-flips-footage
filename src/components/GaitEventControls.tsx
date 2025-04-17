
import React from 'react';
import { GaitEventThresholds } from '@/utils/gaitEventDetector';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface GaitEventControlsProps {
  thresholds: GaitEventThresholds;
  onThresholdsChange: (thresholds: GaitEventThresholds) => void;
  showEvents: boolean;
  onShowEventsChange: (show: boolean) => void;
}

const GaitEventControls: React.FC<GaitEventControlsProps> = ({
  thresholds,
  onThresholdsChange,
  showEvents,
  onShowEventsChange
}) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Gait Event Detection</h3>
        <div className="flex items-center space-x-2">
          <Switch 
            id="show-events" 
            checked={showEvents}
            onCheckedChange={onShowEventsChange} 
          />
          <Label htmlFor="show-events">Show Events</Label>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ic-threshold">Initial Contact Threshold: {thresholds.initialContact} kPa</Label>
          </div>
          <Slider
            id="ic-threshold"
            min={5}
            max={30}
            step={1}
            value={[thresholds.initialContact]}
            onValueChange={(values) => 
              onThresholdsChange({ ...thresholds, initialContact: values[0] })
            }
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="to-threshold">Toe-Off Threshold: {thresholds.toeOff} kPa</Label>
          </div>
          <Slider
            id="to-threshold"
            min={1}
            max={20}
            step={1}
            value={[thresholds.toeOff]}
            onValueChange={(values) => 
              onThresholdsChange({ ...thresholds, toeOff: values[0] })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default GaitEventControls;
