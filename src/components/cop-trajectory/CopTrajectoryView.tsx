
import React from 'react';
import { ResponsiveContainer, ScatterChart, CartesianGrid, XAxis, YAxis, ZAxis, Tooltip, Legend, Scatter, ReferenceLine } from 'recharts';
import { StancePhase } from '@/utils/pressureDataProcessor';

interface CopTrajectoryViewProps {
  currentStancePhase: StancePhase | null;
  displayPhases: StancePhase[];
  currentPosition: { x: number, y: number, force: number, percentage: number } | null;
}

const CopTrajectoryView: React.FC<CopTrajectoryViewProps> = ({ 
  currentStancePhase, 
  displayPhases, 
  currentPosition 
}) => {
  return (
    <div className="bg-white border rounded-md p-4">
      <h3 className="text-base font-medium mb-2">COP Trajectory Path</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {currentStancePhase && (
          <>
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
            </div>
            <div className="border rounded-md p-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Stance Duration:</span>
                <span>{currentStancePhase.duration.toFixed(2)} s</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Current:</span>
                <span>{currentStancePhase.startTime.toFixed(2)} s ({currentPosition?.percentage || 0}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Midstance Variability:</span>
                <span>{currentStancePhase.midstanceVariability.toFixed(2)} mm</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 30, left: 40, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="AP Position" 
              unit="mm" 
              domain={['dataMin - 10', 'dataMax + 10']}
              label={{ value: 'Anterior-Posterior', position: 'bottom' }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="ML Position" 
              unit="mm" 
              domain={['dataMin - 10', 'dataMax + 10']}
              label={{ value: 'Medio-Lateral', angle: -90, position: 'left' }}
              tick={{ fontSize: 12 }}
            />
            <ZAxis range={[40, 100]} />
            <Tooltip 
              formatter={(value: any) => [`${value.toFixed(1)} mm`, '']}
              labelFormatter={(value) => `Stance: ${value}%`}
              cursor={{ strokeDasharray: '3 3' }}
            />
            
            {currentStancePhase && (
              <>
                <ReferenceLine x={currentStancePhase.meanCopX} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={currentStancePhase.meanCopY} stroke="#666" strokeDasharray="3 3" />
              </>
            )}
            
            <Legend />
            
            {/* Display trajectories based on active view - improved rendering */}
            {displayPhases.slice(0, 10).map((phase, index) => (
              <Scatter 
                key={`${phase.foot}-${phase.startTime}`}
                name={`${phase.foot === 'left' ? 'Left' : 'Right'} Foot - ${phase.startTime.toFixed(1)}s`} 
                data={phase.copTrajectory.filter((_, i) => i % 2 === 0)} // Sample every other point for performance
                fill={phase.foot === 'left' ? "#8884d8" : "#82ca9d"}
                fillOpacity={phase === currentStancePhase ? 0.8 : 0.3}
                stroke={phase === currentStancePhase ? (phase.foot === 'left' ? "#6a5acd" : "#2e8b57") : "none"}
                strokeWidth={1.5}
                line={phase === currentStancePhase}
                lineType="fitting" // Using "fitting" to fix TypeScript error
                isAnimationActive={false} // Disable animations for better performance
              />
            ))}
            
            {/* Highlight current position */}
            {currentPosition && currentStancePhase && (
              <Scatter 
                name="Current Position" 
                data={[{
                  ...currentPosition,
                  size: 10
                }]}
                fill="#ff7300"
                shape="cross"
                isAnimationActive={false}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CopTrajectoryView;
