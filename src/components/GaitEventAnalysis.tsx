
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Scatter
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GaitEventAnalysisProps {
  data: ProcessedData | null;
  currentTime: number;
}

const GaitEventAnalysis: React.FC<GaitEventAnalysisProps> = ({ 
  data,
  currentTime
}) => {
  if (!data || !data.pressureData.length) {
    return (
      <div className="bg-white rounded-md shadow p-6">
        <p className="text-center text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  // Get gait events
  const getGaitEvents = () => {
    const heelStrikes: {time: number, foot: 'left' | 'right'}[] = [];
    const toeOffs: {time: number, foot: 'left' | 'right'}[] = [];
    
    // Detect all gait events
    data.pressureData.forEach((point, index) => {
      // Skip the first point
      if (index === 0) return;
      
      const prevPoint = data.pressureData[index - 1];
      
      // Heel strike detection (threshold crossing: 25 kPa)
      if (point.leftFoot.heel.peak >= 25 && prevPoint.leftFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'left' });
      }
      if (point.rightFoot.heel.peak >= 25 && prevPoint.rightFoot.heel.peak < 25) {
        heelStrikes.push({ time: point.time, foot: 'right' });
      }
      
      // Toe off detection (threshold crossing: 20 kPa)
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
    
    return { heelStrikes, toeOffs };
  };
  
  const { heelStrikes, toeOffs } = getGaitEvents();
  
  // Sort all events by time for timeline display
  const allEvents = [
    ...heelStrikes.map(event => ({ ...event, type: 'heelStrike' as const })),
    ...toeOffs.map(event => ({ ...event, type: 'toeOff' as const }))
  ].sort((a, b) => a.time - b.time);
  
  // Calculate gait phases and parameters
  const calculateGaitParameters = () => {
    const leftStancePhases: {start: number, end: number}[] = [];
    const rightStancePhases: {start: number, end: number}[] = [];
    
    // Sort events by time and foot
    const leftEvents = allEvents
      .filter(event => event.foot === 'left')
      .sort((a, b) => a.time - b.time);
      
    const rightEvents = allEvents
      .filter(event => event.foot === 'right')
      .sort((a, b) => a.time - b.time);
    
    // Find stance phases (heel strike to toe off)
    let lastLeftHS: number | null = null;
    let lastRightHS: number | null = null;
    
    // Process left foot events
    leftEvents.forEach(event => {
      if (event.type === 'heelStrike') {
        lastLeftHS = event.time;
      } else if (event.type === 'toeOff' && lastLeftHS !== null) {
        leftStancePhases.push({
          start: lastLeftHS,
          end: event.time
        });
        lastLeftHS = null;
      }
    });
    
    // Process right foot events
    rightEvents.forEach(event => {
      if (event.type === 'heelStrike') {
        lastRightHS = event.time;
      } else if (event.type === 'toeOff' && lastRightHS !== null) {
        rightStancePhases.push({
          start: lastRightHS,
          end: event.time
        });
        lastRightHS = null;
      }
    });
    
    // Calculate stance time
    const leftStanceTimes = leftStancePhases.map(phase => phase.end - phase.start);
    const rightStanceTimes = rightStancePhases.map(phase => phase.end - phase.start);
    
    // Calculate step time (time between consecutive heel strikes of opposite feet)
    const stepTimes: {left: number[], right: number[]} = { left: [], right: [] };
    
    // Get sorted heel strikes by time
    const sortedHS = heelStrikes.sort((a, b) => a.time - b.time);
    
    for (let i = 1; i < sortedHS.length; i++) {
      const current = sortedHS[i];
      const previous = sortedHS[i-1];
      
      if (current.foot !== previous.foot) {
        const stepTime = current.time - previous.time;
        if (current.foot === 'left') {
          stepTimes.left.push(stepTime);
        } else {
          stepTimes.right.push(stepTime);
        }
      }
    }
    
    // Calculate stride time (time between consecutive heel strikes of same foot)
    const strideTimes: {left: number[], right: number[]} = { left: [], right: [] };
    
    // Left foot stride times
    const leftHS = sortedHS.filter(hs => hs.foot === 'left').sort((a, b) => a.time - b.time);
    for (let i = 1; i < leftHS.length; i++) {
      strideTimes.left.push(leftHS[i].time - leftHS[i-1].time);
    }
    
    // Right foot stride times
    const rightHS = sortedHS.filter(hs => hs.foot === 'right').sort((a, b) => a.time - b.time);
    for (let i = 1; i < rightHS.length; i++) {
      strideTimes.right.push(rightHS[i].time - rightHS[i-1].time);
    }
    
    // Calculate cadence (steps per minute)
    const totalTime = data.pressureData[data.pressureData.length - 1].time - data.pressureData[0].time;
    const totalSteps = heelStrikes.length;
    const cadence = (totalSteps / totalTime) * 60;
    
    // Calculate symmetry index for stance time
    const avgLeftStance = leftStanceTimes.length > 0 ? 
      leftStanceTimes.reduce((sum, val) => sum + val, 0) / leftStanceTimes.length : 0;
    const avgRightStance = rightStanceTimes.length > 0 ? 
      rightStanceTimes.reduce((sum, val) => sum + val, 0) / rightStanceTimes.length : 0;
    
    const stanceSymmetryIndex = avgLeftStance > 0 && avgRightStance > 0 ? 
      Math.abs(avgLeftStance - avgRightStance) / ((avgLeftStance + avgRightStance) / 2) * 100 : 0;
    
    return {
      leftStancePhases,
      rightStancePhases,
      leftStanceTimes,
      rightStanceTimes,
      stepTimes,
      strideTimes,
      cadence,
      stanceSymmetryIndex
    };
  };
  
  const gaitParameters = calculateGaitParameters();
  
  // Prepare timeline data for visualization
  const timelineData = data.pressureData.map(point => ({
    time: point.time,
    leftHeel: point.leftFoot.heel.peak,
    rightHeel: point.rightFoot.heel.peak,
    leftToes: Math.max(point.leftFoot.toes.peak, point.leftFoot.hallux.peak),
    rightToes: Math.max(point.rightFoot.toes.peak, point.rightFoot.hallux.peak),
  }));
  
  // Calculate average values for summary
  const getAverageValue = (values: number[]) => {
    return values.length > 0 ? 
      values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  };
  
  const getStandardDeviation = (values: number[], mean: number) => {
    if (values.length <= 1) return 0;
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };
  
  const leftStanceAvg = getAverageValue(gaitParameters.leftStanceTimes);
  const rightStanceAvg = getAverageValue(gaitParameters.rightStanceTimes);
  const leftStanceStd = getStandardDeviation(gaitParameters.leftStanceTimes, leftStanceAvg);
  const rightStanceStd = getStandardDeviation(gaitParameters.rightStanceTimes, rightStanceAvg);
  
  const leftStepAvg = getAverageValue(gaitParameters.stepTimes.left);
  const rightStepAvg = getAverageValue(gaitParameters.stepTimes.right);
  const leftStepStd = getStandardDeviation(gaitParameters.stepTimes.left, leftStepAvg);
  const rightStepStd = getStandardDeviation(gaitParameters.stepTimes.right, rightStepAvg);
  
  const leftStrideAvg = getAverageValue(gaitParameters.strideTimes.left);
  const rightStrideAvg = getAverageValue(gaitParameters.strideTimes.right);
  const leftStrideStd = getStandardDeviation(gaitParameters.strideTimes.left, leftStrideAvg);
  const rightStrideStd = getStandardDeviation(gaitParameters.strideTimes.right, rightStrideAvg);
  
  // Format time value to 2 decimal places with unit
  const formatTime = (time: number) => `${time.toFixed(2)}s`;
  
  // Get asymmetry level
  const getAsymmetryLevel = (percent: number) => {
    if (percent < 3) return { level: 'Minimal', color: 'bg-green-100 text-green-800' };
    if (percent < 6) return { level: 'Low', color: 'bg-yellow-100 text-yellow-800' };
    if (percent < 10) return { level: 'Moderate', color: 'bg-orange-100 text-orange-800' };
    return { level: 'High', color: 'bg-red-100 text-red-800' };
  };
  
  const stanceAsymmetry = getAsymmetryLevel(gaitParameters.stanceSymmetryIndex);
  
  // Step time asymmetry
  const stepTimeAsymmetry = Math.abs(leftStepAvg - rightStepAvg) / ((leftStepAvg + rightStepAvg) / 2) * 100;
  const stepAsymmetry = getAsymmetryLevel(stepTimeAsymmetry);
  
  // Stride time asymmetry
  const strideTimeAsymmetry = Math.abs(leftStrideAvg - rightStrideAvg) / ((leftStrideAvg + rightStrideAvg) / 2) * 100;
  const strideAsymmetry = getAsymmetryLevel(strideTimeAsymmetry);
  
  return (
    <div className="bg-white rounded-md shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Gait Event Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Stance Time Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stance Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Left Foot:</p>
                <p className="font-medium">{formatTime(leftStanceAvg)} ± {leftStanceStd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Right Foot:</p>
                <p className="font-medium">{formatTime(rightStanceAvg)} ± {rightStanceStd.toFixed(2)}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-muted-foreground">Asymmetry:</p>
                <div className="flex items-center gap-2">
                  <span>{gaitParameters.stanceSymmetryIndex.toFixed(1)}%</span>
                  <Badge variant="outline" className={stanceAsymmetry.color}>
                    {stanceAsymmetry.level}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Step Time Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Step Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Left Foot:</p>
                <p className="font-medium">{formatTime(leftStepAvg)} ± {leftStepStd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Right Foot:</p>
                <p className="font-medium">{formatTime(rightStepAvg)} ± {rightStepStd.toFixed(2)}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-muted-foreground">Asymmetry:</p>
                <div className="flex items-center gap-2">
                  <span>{stepTimeAsymmetry.toFixed(1)}%</span>
                  <Badge variant="outline" className={stepAsymmetry.color}>
                    {stepAsymmetry.level}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stride Time Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stride Time & Cadence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Left Stride:</p>
                <p className="font-medium">{formatTime(leftStrideAvg)} ± {leftStrideStd.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Right Stride:</p>
                <p className="font-medium">{formatTime(rightStrideAvg)} ± {rightStrideStd.toFixed(2)}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-muted-foreground">Cadence:</p>
                <p className="font-medium">{gaitParameters.cadence.toFixed(1)} steps/min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Gait timeline */}
      <div className="h-[350px] mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timelineData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -10 }}
            />
            <YAxis 
              label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)} kPa`, '']}
              labelFormatter={(time) => `Time: ${Number(time).toFixed(2)}s`}
            />
            <Legend />
            
            {/* Reference threshold lines */}
            <ReferenceLine y={25} stroke="#0088FE" strokeDasharray="3 3" label={{ 
              value: 'Heel Strike Threshold', position: 'right', fontSize: 10 
            }} />
            <ReferenceLine y={20} stroke="#FF8042" strokeDasharray="3 3" label={{ 
              value: 'Toe Off Threshold', position: 'right', fontSize: 10 
            }} />
            
            {/* Current time reference line */}
            <ReferenceLine 
              x={currentTime} 
              stroke="#ff0000" 
              strokeWidth={2} 
              label={{ value: 'Current', position: 'top', fontSize: 10 }}
            />
            
            {/* Left stance phases */}
            {gaitParameters.leftStancePhases.map((phase, i) => (
              <ReferenceArea 
                key={`left-stance-${i}`}
                x1={phase.start} 
                x2={phase.end}
                y1={0}
                y2={5}
                fill="#8884d833"
                fillOpacity={0.3}
                label={{ 
                  value: 'L', 
                  position: 'insideBottom',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* Right stance phases */}
            {gaitParameters.rightStancePhases.map((phase, i) => (
              <ReferenceArea 
                key={`right-stance-${i}`}
                x1={phase.start} 
                x2={phase.end}
                y1={0}
                y2={5}
                fill="#82ca9d33"
                fillOpacity={0.3}
                label={{ 
                  value: 'R', 
                  position: 'insideBottom',
                  fontSize: 10
                }}
              />
            ))}
            
            {/* Heel and toe pressure lines */}
            <Line 
              type="monotone" 
              dataKey="leftHeel" 
              name="Left Heel" 
              stroke="#8884d8" 
              dot={false}
              strokeWidth={1.5}
            />
            <Line 
              type="monotone" 
              dataKey="rightHeel" 
              name="Right Heel" 
              stroke="#82ca9d" 
              dot={false}
              strokeWidth={1.5}
            />
            <Line 
              type="monotone" 
              dataKey="leftToes" 
              name="Left Toes" 
              stroke="#8884d8" 
              strokeDasharray="3 3"
              dot={false}
              strokeWidth={1.5}
            />
            <Line 
              type="monotone" 
              dataKey="rightToes" 
              name="Right Toes" 
              stroke="#82ca9d" 
              strokeDasharray="3 3"
              dot={false}
              strokeWidth={1.5}
            />
            
            {/* Heel strike markers */}
            <Scatter
              name="Heel Strikes"
              data={heelStrikes.map(hs => ({
                time: hs.time,
                pressure: hs.foot === 'left' ? 25 : 25,
                foot: hs.foot
              }))}
              fill={point => point.foot === 'left' ? '#8884d8' : '#82ca9d'}
              shape="circle"
              legendType="none"
            />
            
            {/* Toe off markers */}
            <Scatter
              name="Toe Offs"
              data={toeOffs.map(to => ({
                time: to.time,
                pressure: to.foot === 'left' ? 20 : 20,
                foot: to.foot
              }))}
              fill={point => point.foot === 'left' ? '#8884d8' : '#82ca9d'}
              shape="cross"
              legendType="none"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Event summary */}
      <div className="flex flex-wrap gap-2 mt-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {heelStrikes.filter(e => e.foot === 'left').length} Left Heel Strikes
        </Badge>
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {heelStrikes.filter(e => e.foot === 'right').length} Right Heel Strikes
        </Badge>
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          {toeOffs.filter(e => e.foot === 'left').length} Left Toe Offs
        </Badge>
        <Badge variant="outline" className="bg-orange-100 text-orange-800">
          {toeOffs.filter(e => e.foot === 'right').length} Right Toe Offs
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          {gaitParameters.leftStancePhases.length} Left Stance Phases
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-800">
          {gaitParameters.rightStancePhases.length} Right Stance Phases
        </Badge>
      </div>
    </div>
  );
};

export default GaitEventAnalysis;
