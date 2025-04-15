
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StancePhase } from '@/utils/pressureDataProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CopTrajectoryVisualizationProps {
  stancePhases: StancePhase[];
  currentTime: number;
}

const CopTrajectoryVisualization: React.FC<CopTrajectoryVisualizationProps> = ({ 
  stancePhases, 
  currentTime 
}) => {
  // Find the current stance phase
  const currentStancePhase = useMemo(() => {
    if (!stancePhases || stancePhases.length === 0) return null;
    
    return stancePhases.find(phase => 
      currentTime >= phase.startTime && currentTime <= phase.endTime
    );
  }, [stancePhases, currentTime]);
  
  // Calculate percentage through current stance
  const stancePercentage = useMemo(() => {
    if (!currentStancePhase) return null;
    
    const elapsedTime = currentTime - currentStancePhase.startTime;
    return Math.round((elapsedTime / currentStancePhase.duration) * 100);
  }, [currentStancePhase, currentTime]);
  
  // Find the current position in the trajectory
  const currentPosition = useMemo(() => {
    if (!currentStancePhase || !stancePercentage) return null;
    
    return currentStancePhase.copTrajectory.find(p => p.percentage === stancePercentage) || 
           currentStancePhase.copTrajectory[0];
  }, [currentStancePhase, stancePercentage]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Center of Pressure Trajectory</CardTitle>
          {currentStancePhase && (
            <Badge variant="outline" className="ml-2">
              {currentStancePhase.foot === 'left' ? 'Left' : 'Right'} Foot - {stancePercentage}% of Stance
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentStancePhase ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">AP Range:</span>
                    <span>{currentStancePhase.apRange.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">ML Range:</span>
                    <span>{currentStancePhase.mlRange.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mean Position:</span>
                    <span>X: {currentStancePhase.meanCopX.toFixed(1)} mm, Y: {currentStancePhase.meanCopY.toFixed(1)} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Midstance Variability:</span>
                    <span>{currentStancePhase.midstanceVariability.toFixed(2)} mm</span>
                  </div>
                </div>
                <div className="border rounded-md p-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Stance Duration:</span>
                    <span>{currentStancePhase.duration.toFixed(2)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Start Time:</span>
                    <span>{currentStancePhase.startTime.toFixed(2)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">End Time:</span>
                    <span>{currentStancePhase.endTime.toFixed(2)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Current:</span>
                    <span>{currentTime.toFixed(2)} s ({stancePercentage}%)</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="AP Position" 
                      unit="mm" 
                      domain={['dataMin - 10', 'dataMax + 10']}
                      label={{ value: 'Anterior-Posterior', position: 'bottom' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="ML Position" 
                      unit="mm" 
                      domain={['dataMin - 10', 'dataMax + 10']}
                      label={{ value: 'Medio-Lateral', angle: -90, position: 'left' }}
                    />
                    <ZAxis range={[40, 100]} />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toFixed(1)} mm`, '']}
                      labelFormatter={(value) => `Stance: ${value}%`}
                    />
                    <ReferenceLine x={currentStancePhase.meanCopX} stroke="#666" strokeDasharray="3 3" />
                    <ReferenceLine y={currentStancePhase.meanCopY} stroke="#666" strokeDasharray="3 3" />
                    <Legend />
                    <Scatter 
                      name="Full Trajectory" 
                      data={currentStancePhase.copTrajectory.map(point => ({
                        ...point,
                        size: 3
                      }))} 
                      fill="#8884d8"
                      opacity={0.3}
                    />
                    {currentPosition && (
                      <Scatter 
                        name="Current Position" 
                        data={[{
                          ...currentPosition,
                          size: 10
                        }]}
                        fill="#ff7300"
                      />
                    )}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
              <p className="text-gray-500">No stance phase detected at current time point</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CopTrajectoryVisualization;
