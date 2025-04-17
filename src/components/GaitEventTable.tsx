
import React, { useMemo } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { GaitEventThresholds, GaitEvent, detectGaitEvents } from '@/utils/gaitEventDetector';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GaitEventTableProps {
  data: ProcessedData | null;
  thresholds: GaitEventThresholds;
}

const GaitEventTable: React.FC<GaitEventTableProps> = ({ data, thresholds }) => {
  const gaitEvents = useMemo(() => {
    if (!data) return [];
    return detectGaitEvents(data.pressureData, thresholds);
  }, [data, thresholds]);

  // Calculate gait parameters
  const gaitParameters = useMemo(() => {
    if (!gaitEvents.length) return null;

    // Sort events by time
    const sortedEvents = [...gaitEvents].sort((a, b) => a.time - b.time);
    
    // Filter events by type and foot
    const leftInitialContacts = sortedEvents.filter(event => 
      event.type === 'initialContact' && event.foot === 'left'
    );
    const rightInitialContacts = sortedEvents.filter(event => 
      event.type === 'initialContact' && event.foot === 'right'
    );
    const leftToeOffs = sortedEvents.filter(event => 
      event.type === 'toeOff' && event.foot === 'left'
    );
    const rightToeOffs = sortedEvents.filter(event => 
      event.type === 'toeOff' && event.foot === 'right'
    );

    // Calculate step times (time between consecutive heel strikes of opposite feet)
    const leftStepTimes: number[] = [];
    const rightStepTimes: number[] = [];
    
    // Get all initial contacts sorted by time
    const allInitialContacts = [...leftInitialContacts, ...rightInitialContacts].sort((a, b) => a.time - b.time);
    
    for (let i = 1; i < allInitialContacts.length; i++) {
      const current = allInitialContacts[i];
      const previous = allInitialContacts[i-1];
      
      if (current.foot !== previous.foot) {
        const stepTime = current.time - previous.time;
        if (current.foot === 'left') {
          leftStepTimes.push(stepTime);
        } else {
          rightStepTimes.push(stepTime);
        }
      }
    }
    
    // Calculate stride times (time between consecutive heel strikes of same foot)
    const leftStrideTimes: number[] = [];
    const rightStrideTimes: number[] = [];
    
    for (let i = 1; i < leftInitialContacts.length; i++) {
      leftStrideTimes.push(leftInitialContacts[i].time - leftInitialContacts[i-1].time);
    }
    
    for (let i = 1; i < rightInitialContacts.length; i++) {
      rightStrideTimes.push(rightInitialContacts[i].time - rightInitialContacts[i-1].time);
    }
    
    // Calculate stance times (time from initial contact to toe off of same foot)
    const leftStanceTimes: number[] = [];
    const rightStanceTimes: number[] = [];
    
    // For each initial contact, find the next toe off for the same foot
    leftInitialContacts.forEach(ic => {
      const nextToeOff = leftToeOffs.find(to => to.time > ic.time);
      if (nextToeOff) {
        leftStanceTimes.push(nextToeOff.time - ic.time);
      }
    });
    
    rightInitialContacts.forEach(ic => {
      const nextToeOff = rightToeOffs.find(to => to.time > ic.time);
      if (nextToeOff) {
        rightStanceTimes.push(nextToeOff.time - ic.time);
      }
    });
    
    // Calculate average and standard deviation
    const getAverage = (values: number[]) => {
      if (values.length === 0) return 0;
      return values.reduce((sum, val) => sum + val, 0) / values.length;
    };
    
    const getStdDev = (values: number[], avg: number) => {
      if (values.length <= 1) return 0;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
      return Math.sqrt(variance);
    };
    
    const avgLeftStepTime = getAverage(leftStepTimes);
    const stdLeftStepTime = getStdDev(leftStepTimes, avgLeftStepTime);
    
    const avgRightStepTime = getAverage(rightStepTimes);
    const stdRightStepTime = getStdDev(rightStepTimes, avgRightStepTime);
    
    const avgLeftStrideTime = getAverage(leftStrideTimes);
    const stdLeftStrideTime = getStdDev(leftStrideTimes, avgLeftStrideTime);
    
    const avgRightStrideTime = getAverage(rightStrideTimes);
    const stdRightStrideTime = getStdDev(rightStrideTimes, avgRightStrideTime);
    
    const avgLeftStanceTime = getAverage(leftStanceTimes);
    const stdLeftStanceTime = getStdDev(leftStanceTimes, avgLeftStanceTime);
    
    const avgRightStanceTime = getAverage(rightStanceTimes);
    const stdRightStanceTime = getStdDev(rightStanceTimes, avgRightStanceTime);
    
    // Calculate asymmetry indices
    const stepAsymmetry = Math.abs(avgLeftStepTime - avgRightStepTime) / ((avgLeftStepTime + avgRightStepTime) / 2) * 100;
    const strideAsymmetry = Math.abs(avgLeftStrideTime - avgRightStrideTime) / ((avgLeftStrideTime + avgRightStrideTime) / 2) * 100;
    const stanceAsymmetry = Math.abs(avgLeftStanceTime - avgRightStanceTime) / ((avgLeftStanceTime + avgRightStanceTime) / 2) * 100;
    
    // Calculate cadence (steps per minute)
    const totalSteps = leftInitialContacts.length + rightInitialContacts.length;
    let cadence = 0;
    
    if (data && data.pressureData.length > 0) {
      const totalTime = data.pressureData[data.pressureData.length - 1].time - data.pressureData[0].time;
      cadence = (totalSteps / totalTime) * 60;
    }
    
    return {
      events: {
        leftInitialContacts: leftInitialContacts.length,
        rightInitialContacts: rightInitialContacts.length,
        leftToeOffs: leftToeOffs.length,
        rightToeOffs: rightToeOffs.length
      },
      stepTime: {
        left: { values: leftStepTimes, avg: avgLeftStepTime, std: stdLeftStepTime },
        right: { values: rightStepTimes, avg: avgRightStepTime, std: stdRightStepTime },
        asymmetry: stepAsymmetry
      },
      strideTime: {
        left: { values: leftStrideTimes, avg: avgLeftStrideTime, std: stdLeftStrideTime },
        right: { values: rightStrideTimes, avg: avgRightStrideTime, std: stdRightStrideTime },
        asymmetry: strideAsymmetry
      },
      stanceTime: {
        left: { values: leftStanceTimes, avg: avgLeftStanceTime, std: stdLeftStanceTime },
        right: { values: rightStanceTimes, avg: avgRightStanceTime, std: stdRightStanceTime },
        asymmetry: stanceAsymmetry
      },
      cadence
    };
  }, [gaitEvents, data]);

  if (!data || !gaitParameters) {
    return (
      <div className="text-center p-4 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No gait data available</p>
      </div>
    );
  }

  // Format time value to 2 decimal places
  const formatTime = (time: number) => `${time.toFixed(2)}s`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gait Event Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-md text-center">
              <p className="text-2xl font-bold text-blue-700">{gaitParameters.events.leftInitialContacts}</p>
              <p className="text-sm text-blue-800">Left Initial Contacts</p>
            </div>
            <div className="bg-green-50 p-3 rounded-md text-center">
              <p className="text-2xl font-bold text-green-700">{gaitParameters.events.rightInitialContacts}</p>
              <p className="text-sm text-green-800">Right Initial Contacts</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-md text-center">
              <p className="text-2xl font-bold text-orange-700">{gaitParameters.events.leftToeOffs}</p>
              <p className="text-sm text-orange-800">Left Toe Offs</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-md text-center">
              <p className="text-2xl font-bold text-yellow-700">{gaitParameters.events.rightToeOffs}</p>
              <p className="text-sm text-yellow-800">Right Toe Offs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Gait Temporal Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parameter</TableHead>
                <TableHead>Left Foot</TableHead>
                <TableHead>Right Foot</TableHead>
                <TableHead>Asymmetry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Step Time</TableCell>
                <TableCell>
                  {formatTime(gaitParameters.stepTime.left.avg)} ± {gaitParameters.stepTime.left.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  {formatTime(gaitParameters.stepTime.right.avg)} ± {gaitParameters.stepTime.right.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    gaitParameters.stepTime.asymmetry < 3 ? "bg-green-100 text-green-800" :
                    gaitParameters.stepTime.asymmetry < 6 ? "bg-yellow-100 text-yellow-800" :
                    gaitParameters.stepTime.asymmetry < 10 ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {gaitParameters.stepTime.asymmetry.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stride Time</TableCell>
                <TableCell>
                  {formatTime(gaitParameters.strideTime.left.avg)} ± {gaitParameters.strideTime.left.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  {formatTime(gaitParameters.strideTime.right.avg)} ± {gaitParameters.strideTime.right.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    gaitParameters.strideTime.asymmetry < 3 ? "bg-green-100 text-green-800" :
                    gaitParameters.strideTime.asymmetry < 6 ? "bg-yellow-100 text-yellow-800" :
                    gaitParameters.strideTime.asymmetry < 10 ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {gaitParameters.strideTime.asymmetry.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stance Time</TableCell>
                <TableCell>
                  {formatTime(gaitParameters.stanceTime.left.avg)} ± {gaitParameters.stanceTime.left.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  {formatTime(gaitParameters.stanceTime.right.avg)} ± {gaitParameters.stanceTime.right.std.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    gaitParameters.stanceTime.asymmetry < 3 ? "bg-green-100 text-green-800" :
                    gaitParameters.stanceTime.asymmetry < 6 ? "bg-yellow-100 text-yellow-800" :
                    gaitParameters.stanceTime.asymmetry < 10 ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {gaitParameters.stanceTime.asymmetry.toFixed(1)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Cadence</TableCell>
                <TableCell colSpan={3}>{gaitParameters.cadence.toFixed(1)} steps/min</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GaitEventTable;
