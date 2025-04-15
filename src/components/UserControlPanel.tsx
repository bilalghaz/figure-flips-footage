
import React, { useState } from 'react';
import { ProcessedData, PressureDataPoint } from '@/utils/pressureDataProcessor';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileSpreadsheet,
  Filter,
  BarChart4,
  ArrowDownToLine,
  Settings,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from 'xlsx';

interface UserControlPanelProps {
  data: ProcessedData | null;
  currentTime: number;
  onFilter: (data: ProcessedData) => void;
  onExport: () => void;
  isProcessing: boolean;
  onReset: () => void;
}

const UserControlPanel: React.FC<UserControlPanelProps> = ({ 
  data, 
  currentTime,
  onFilter,
  onExport,
  isProcessing, 
  onReset
}) => {
  const [filterType, setFilterType] = useState<'none' | 'lowpass' | 'movingAvg'>('none');
  const [filterValue, setFilterValue] = useState<number>(5);
  const [applyingFilter, setApplyingFilter] = useState(false);
  const [showGaitEvents, setShowGaitEvents] = useState(true);
  const [showAsymmetry, setShowAsymmetry] = useState(true);
  
  if (!data) {
    return null;
  }
  
  // Apply low-pass filter to the data
  const applyLowPassFilter = () => {
    if (!data || applyingFilter) return;
    
    setApplyingFilter(true);
    
    // Create a copy of the data
    const filteredData: ProcessedData = {
      ...data,
      pressureData: JSON.parse(JSON.stringify(data.pressureData))
    };
    
    // Apply the selected filter
    if (filterType === 'lowpass') {
      // Simple low-pass filter with adjustable alpha (between 0 and 1)
      // Lower alpha = more smoothing
      const alpha = filterValue / 100; // Convert 0-10 to 0-0.1 range
      
      // For each data point except the first one
      for (let i = 1; i < filteredData.pressureData.length; i++) {
        const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
        
        regions.forEach(region => {
          // Apply to left foot
          filteredData.pressureData[i].leftFoot[region].peak = 
            alpha * filteredData.pressureData[i].leftFoot[region].peak + 
            (1 - alpha) * filteredData.pressureData[i-1].leftFoot[region].peak;
          
          filteredData.pressureData[i].leftFoot[region].mean = 
            alpha * filteredData.pressureData[i].leftFoot[region].mean + 
            (1 - alpha) * filteredData.pressureData[i-1].leftFoot[region].mean;
          
          // Apply to right foot
          filteredData.pressureData[i].rightFoot[region].peak = 
            alpha * filteredData.pressureData[i].rightFoot[region].peak + 
            (1 - alpha) * filteredData.pressureData[i-1].rightFoot[region].peak;
          
          filteredData.pressureData[i].rightFoot[region].mean = 
            alpha * filteredData.pressureData[i].rightFoot[region].mean + 
            (1 - alpha) * filteredData.pressureData[i-1].rightFoot[region].mean;
        });
      }
    } 
    else if (filterType === 'movingAvg') {
      // Moving average filter with window size
      const windowSize = Math.max(3, Math.min(21, filterValue * 2 + 1)); // Odd number between 3 and 21
      const halfWindow = Math.floor(windowSize / 2);
      
      const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
      const tempData: PressureDataPoint[] = JSON.parse(JSON.stringify(filteredData.pressureData));
      
      // For each data point
      for (let i = 0; i < filteredData.pressureData.length; i++) {
        regions.forEach(region => {
          let leftPeakSum = 0;
          let leftMeanSum = 0;
          let rightPeakSum = 0;
          let rightMeanSum = 0;
          let count = 0;
          
          // Calculate sum for the window
          for (let j = Math.max(0, i - halfWindow); j <= Math.min(tempData.length - 1, i + halfWindow); j++) {
            leftPeakSum += tempData[j].leftFoot[region].peak;
            leftMeanSum += tempData[j].leftFoot[region].mean;
            rightPeakSum += tempData[j].rightFoot[region].peak;
            rightMeanSum += tempData[j].rightFoot[region].mean;
            count++;
          }
          
          // Apply moving average
          if (count > 0) {
            filteredData.pressureData[i].leftFoot[region].peak = leftPeakSum / count;
            filteredData.pressureData[i].leftFoot[region].mean = leftMeanSum / count;
            filteredData.pressureData[i].rightFoot[region].peak = rightPeakSum / count;
            filteredData.pressureData[i].rightFoot[region].mean = rightMeanSum / count;
          }
        });
      }
    }
    
    // Recalculate max values
    let maxPeakPressure = 0;
    let maxMeanPressure = 0;
    
    filteredData.pressureData.forEach(point => {
      const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
      
      regions.forEach(region => {
        maxPeakPressure = Math.max(
          maxPeakPressure, 
          point.leftFoot[region].peak, 
          point.rightFoot[region].peak
        );
        
        maxMeanPressure = Math.max(
          maxMeanPressure, 
          point.leftFoot[region].mean, 
          point.rightFoot[region].mean
        );
      });
    });
    
    filteredData.maxPeakPressure = maxPeakPressure;
    filteredData.maxMeanPressure = maxMeanPressure;
    
    // Update the data
    onFilter(filteredData);
    setApplyingFilter(false);
  };
  
  // Export detailed data to Excel
  const exportDetailedData = () => {
    if (!data) return;
    
    // Get gait events
    const heelStrikes: {time: number, foot: 'left' | 'right'}[] = [];
    const toeOffs: {time: number, foot: 'left' | 'right'}[] = [];
    
    // Detect all gait events
    data.pressureData.forEach((point, index) => {
      if (index === 0) return;
      
      const prevPoint = data.pressureData[index - 1];
      
      // Heel strike detection
      if (point.leftFoot.heel.peak >= 25 && prevPoint.leftFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'left' });
      }
      if (point.rightFoot.heel.peak >= 25 && prevPoint.rightFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'right' });
      }
      
      // Toe off detection
      const leftToePeak = Math.max(point.leftFoot.toes.peak, point.leftFoot.hallux.peak);
      const prevLeftToePeak = Math.max(prevPoint.leftFoot.toes.peak, prevPoint.leftFoot.hallux.peak);
      
      const rightToePeak = Math.max(point.rightFoot.toes.peak, point.rightFoot.hallux.peak);
      const prevRightToePeak = Math.max(prevPoint.rightFoot.toes.peak, prevPoint.rightFoot.hallux.peak);
      
      if (leftToePeak >= 20 && prevLeftToePeak < 20) {
        toeOffs.push({ time: point.time, foot: 'left' });
      }
      if (rightToePeak >= 20 && prevRightToePeak < 20) {
        toeOffs.push({ time: point.time, foot: 'right' });
      }
    });
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Pressure data sheet
    const pressureDataRows = [
      ['Time (s)', 
       'Left Heel (kPa)', 'Left Medial Midfoot (kPa)', 'Left Lateral Midfoot (kPa)', 
       'Left Forefoot (kPa)', 'Left Toes (kPa)', 'Left Hallux (kPa)',
       'Right Heel (kPa)', 'Right Medial Midfoot (kPa)', 'Right Lateral Midfoot (kPa)', 
       'Right Forefoot (kPa)', 'Right Toes (kPa)', 'Right Hallux (kPa)']
    ];
    
    data.pressureData.forEach(point => {
      pressureDataRows.push([
        point.time,
        point.leftFoot.heel.peak,
        point.leftFoot.medialMidfoot.peak,
        point.leftFoot.lateralMidfoot.peak,
        point.leftFoot.forefoot.peak,
        point.leftFoot.toes.peak,
        point.leftFoot.hallux.peak,
        point.rightFoot.heel.peak,
        point.rightFoot.medialMidfoot.peak,
        point.rightFoot.lateralMidfoot.peak,
        point.rightFoot.forefoot.peak,
        point.rightFoot.toes.peak,
        point.rightFoot.hallux.peak
      ]);
    });
    
    const pressureWS = XLSX.utils.aoa_to_sheet(pressureDataRows);
    XLSX.utils.book_append_sheet(wb, pressureWS, 'Pressure Data');
    
    // Gait events sheet
    const gaitEventsRows = [
      ['Event Type', 'Time (s)', 'Foot']
    ];
    
    heelStrikes.forEach(event => {
      gaitEventsRows.push(['Heel Strike', event.time, event.foot]);
    });
    
    toeOffs.forEach(event => {
      gaitEventsRows.push(['Toe Off', event.time, event.foot]);
    });
    
    const gaitEventsWS = XLSX.utils.aoa_to_sheet(gaitEventsRows);
    XLSX.utils.book_append_sheet(wb, gaitEventsWS, 'Gait Events');
    
    // Summary sheet
    const summaryRows = [
      ['Metric', 'Left Foot', 'Right Foot', 'Difference (%)', 'Notes'],
      ['Number of Heel Strikes', 
       heelStrikes.filter(e => e.foot === 'left').length, 
       heelStrikes.filter(e => e.foot === 'right').length, 
       '', ''],
      ['Number of Toe Offs', 
       toeOffs.filter(e => e.foot === 'left').length, 
       toeOffs.filter(e => e.foot === 'right').length, 
       '', ''],
      ['Max Peak Pressure (kPa)', '', '', '', data.maxPeakPressure.toFixed(2)],
      ['Max Mean Pressure (kPa)', '', '', '', data.maxMeanPressure.toFixed(2)],
      ['Recording Duration (s)', '', '', '', data.pressureData[data.pressureData.length - 1].time.toFixed(2)],
      ['Current Time Position (s)', '', '', '', currentTime.toFixed(2)]
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pressure_data_detailed_${timestamp}.xlsx`;
    
    // Write to file and trigger download
    XLSX.writeFile(wb, filename);
  };
  
  return (
    <div className="bg-white rounded-md shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Analysis Control Panel</h2>
      
      <Tabs defaultValue="filters" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filters" className="text-xs md:text-sm">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </TabsTrigger>
          <TabsTrigger value="visualization" className="text-xs md:text-sm">
            <BarChart4 className="h-4 w-4 mr-2" /> Visualization
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs md:text-sm">
            <ArrowDownToLine className="h-4 w-4 mr-2" /> Export
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="filters" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="filter-none" 
                  value="none"
                  checked={filterType === 'none'} 
                  onChange={() => setFilterType('none')}
                  className="h-4 w-4"
                />
                <Label htmlFor="filter-none">No Filter</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="filter-lowpass" 
                  value="lowpass"
                  checked={filterType === 'lowpass'} 
                  onChange={() => setFilterType('lowpass')}
                  className="h-4 w-4"
                />
                <Label htmlFor="filter-lowpass">Low-Pass</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  id="filter-movingavg" 
                  value="movingAvg"
                  checked={filterType === 'movingAvg'} 
                  onChange={() => setFilterType('movingAvg')}
                  className="h-4 w-4"
                />
                <Label htmlFor="filter-movingavg">Moving Avg</Label>
              </div>
            </div>
            
            {filterType !== 'none' && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="filter-value">
                    {filterType === 'lowpass' ? 'Smoothing' : 'Window Size'}:
                  </Label>
                  <span className="text-sm font-medium">
                    {filterType === 'lowpass' ? 
                      `${filterValue}%` : 
                      `${filterValue * 2 + 1} frames`}
                  </span>
                </div>
                <Slider
                  id="filter-value"
                  min={1}
                  max={10}
                  step={1}
                  value={[filterValue]}
                  onValueChange={(value) => setFilterValue(value[0])}
                />
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Button 
                onClick={applyLowPassFilter} 
                disabled={filterType === 'none' || applyingFilter}
                variant="default"
                size="sm"
                className="mt-2"
              >
                {applyingFilter ? 'Applying...' : 'Apply Filter'}
              </Button>
              
              <Button 
                onClick={onReset} 
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Data
              </Button>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="filter-info">
              <AccordionTrigger className="text-sm">Filter Information</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>Low-Pass Filter:</strong> Smooths data by reducing high-frequency noise. Higher values give more smoothing.</p>
                  <p><strong>Moving Average:</strong> Averages data points within a window. Larger windows give more smoothing but may lose temporal details.</p>
                  <p><strong>Reset Data:</strong> Removes all filtering and returns to the original data.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="visualization" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-gait-events" 
                  checked={showGaitEvents}
                  onCheckedChange={setShowGaitEvents}
                />
                <Label htmlFor="show-gait-events">Gait Events</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-asymmetry" 
                  checked={showAsymmetry}
                  onCheckedChange={setShowAsymmetry}
                />
                <Label htmlFor="show-asymmetry">Asymmetry Indicators</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-settings" className="text-sm font-medium">
                  Event Detection Thresholds
                </Label>
                <div className="text-xs text-muted-foreground mt-1">
                  <p>Heel Strike: 25 kPa</p>
                  <p>Toe Off: 20 kPa</p>
                </div>
              </div>
              
              <div>
                <Label htmlFor="asymmetry-settings" className="text-sm font-medium">
                  Asymmetry Classification
                </Label>
                <div className="text-xs text-muted-foreground mt-1">
                  <p>Minimal: &lt;5%</p>
                  <p>Low: 5-15%</p>
                  <p>Moderate: 15-25%</p>
                  <p>High: &gt;25%</p>
                </div>
              </div>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="vis-info">
              <AccordionTrigger className="text-sm">Visualization Guide</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>Gait Events:</strong> Shows heel strike and toe-off events detected using pressure thresholds.</p>
                  <p><strong>Asymmetry Indicators:</strong> Highlights differences between left and right foot pressure patterns.</p>
                  <p><strong>Color Coding:</strong> Blue represents right foot dominance, red represents left foot dominance.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={onExport}
                variant="outline"
                className="w-full"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Current Frame
              </Button>
              
              <Button 
                onClick={exportDetailedData}
                variant="outline"
                className="w-full"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Detailed Report
              </Button>
            </div>
            
            <div className="p-3 bg-muted rounded-md text-sm">
              <h4 className="font-medium mb-1">Detailed Report Contents:</h4>
              <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                <li>Raw pressure data for all regions</li>
                <li>Gait event timings (heel strikes and toe-offs)</li>
                <li>Asymmetry analysis between left and right feet</li>
                <li>Summary statistics for the recording</li>
                <li>Current view settings</li>
              </ul>
            </div>
          </div>
          
          <Accordion type="single" collapsible className="mt-4">
            <AccordionItem value="export-info">
              <AccordionTrigger className="text-sm">Export Options</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p><strong>Current Frame:</strong> Exports the pressure data for the current time point only.</p>
                  <p><strong>Detailed Report:</strong> Exports multiple worksheets with complete data and analysis.</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserControlPanel;
