
import React from 'react';
import { GaitEventThresholds } from '@/utils/gaitEventDetector';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

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
  // Handle direct input change for initial contact threshold
  const handleICInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onThresholdsChange({ ...thresholds, initialContact: value });
    }
  };

  // Handle direct input change for toe-off threshold
  const handleTOInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onThresholdsChange({ ...thresholds, toeOff: value });
    }
  };

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
            <Label htmlFor="ic-threshold">Initial Contact Threshold (kPa)</Label>
            <div className="w-20">
              <Input
                id="ic-threshold-input"
                type="number"
                min="0"
                step="0.5"
                value={thresholds.initialContact}
                onChange={handleICInputChange}
                className="h-8"
              />
            </div>
          </div>
          <Slider
            id="ic-threshold"
            min={0}
            max={100}
            step={0.5}
            value={[thresholds.initialContact]}
            onValueChange={(values) => 
              onThresholdsChange({ ...thresholds, initialContact: values[0] })
            }
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="to-threshold">Toe-Off Threshold (kPa)</Label>
            <div className="w-20">
              <Input
                id="to-threshold-input"
                type="number"
                min="0"
                step="0.5"
                value={thresholds.toeOff}
                onChange={handleTOInputChange}
                className="h-8"
              />
            </div>
          </div>
          <Slider
            id="to-threshold"
            min={0}
            max={100}
            step={0.5}
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
