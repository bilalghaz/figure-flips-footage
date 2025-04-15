
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ErrorBar, ReferenceLine } from 'recharts';
import { ScatterChart, Scatter, ZAxis } from 'recharts';
import { StancePhase } from '@/utils/pressureDataProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LoaderCircle } from "lucide-react";

interface CopTrajectoryVisualizationProps {
  stancePhases: StancePhase[];
  currentTime: number;
}

const CopTrajectoryVisualization: React.FC<CopTrajectoryVisualizationProps> = ({ 
  stancePhases, 
  currentTime 
}) => {
  const [activeView, setActiveView] = useState<'trajectory' | 'barChart' | 'combined'>('trajectory');
  const [footView, setFootView] = useState<'combined' | 'left' | 'right'>('combined');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading to ensure visualization renders properly
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [stancePhases]);
  
  // Filter phases by foot
  const leftFootPhases = useMemo(() => 
    stancePhases.filter(phase => phase.foot === 'left'),
  [stancePhases]);
  
  const rightFootPhases = useMemo(() => 
    stancePhases.filter(phase => phase.foot === 'right'),
  [stancePhases]);

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
  
  // Get the phase to display based on active view
  const getDisplayPhases = () => {
    if (footView === 'left') return leftFootPhases;
    if (footView === 'right') return rightFootPhases;
    return stancePhases;
  };
  
  const displayPhases = getDisplayPhases();

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    const leftData = leftFootPhases.map(phase => ({
      id: `left-${phase.startTime.toFixed(1)}`,
      condition: 'Walking - Left',
      apPosition: phase.meanCopX,
      error: phase.apRange / 4, // Standard deviation approximation
      foot: 'Left',
      color: '#8884d8'
    }));

    const rightData = rightFootPhases.map(phase => ({
      id: `right-${phase.startTime.toFixed(1)}`,
      condition: 'Walking - Right',
      apPosition: phase.meanCopX,
      error: phase.apRange / 4,
      foot: 'Right',
      color: '#82ca9d'
    }));

    return [...leftData, ...rightData];
  }, [leftFootPhases, rightFootPhases]);

  // Group bar chart data by condition
  const groupedBarData = useMemo(() => {
    const grouped = barChartData.reduce((acc, item) => {
      const existingGroup = acc.find(g => g.condition === item.condition);
      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        acc.push({
          condition: item.condition,
          items: [item]
        });
      }
      return acc;
    }, [] as any[]);

    return grouped.map(group => {
      const items = group.items;
      return {
        condition: group.condition,
        apPosition: items.reduce((sum: number, item: any) => sum + item.apPosition, 0) / items.length,
        error: items.reduce((sum: number, item: any) => sum + item.error, 0) / items.length,
        foot: items[0].foot,
        color: items[0].color
      };
    });
  }, [barChartData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <CardTitle className="text-lg">Center of Pressure Analysis</CardTitle>
            <div className="flex items-center animate-pulse">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading COP data...</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-[350px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <CardTitle className="text-lg">Center of Pressure Analysis</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'trajectory' | 'barChart' | 'combined')}>
              <TabsList className="grid grid-cols-3 w-[280px]">
                <TabsTrigger value="trajectory">Trajectory</TabsTrigger>
                <TabsTrigger value="barChart">Position Chart</TabsTrigger>
                <TabsTrigger value="combined">Combined</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Tabs value={footView} onValueChange={(v) => setFootView(v as 'combined' | 'left' | 'right')}>
              <TabsList className="grid grid-cols-3 w-[280px]">
                <TabsTrigger value="combined">Both Feet</TabsTrigger>
                <TabsTrigger value="left">Left Foot</TabsTrigger>
                <TabsTrigger value="right">Right Foot</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {currentStancePhase && (
              <Badge variant="outline" className="ml-2">
                {currentStancePhase.foot === 'left' ? 'Left' : 'Right'} Foot - {stancePercentage}% of Stance
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayPhases.length > 0 ? (
            <>
              {(activeView === 'trajectory' || activeView === 'combined') && (
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
                            <span>{currentTime.toFixed(2)} s ({stancePercentage}%)</span>
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
                        
                        {/* Display trajectories based on active view */}
                        {displayPhases.map((phase, index) => (
                          <Scatter 
                            key={`${phase.foot}-${phase.startTime}`}
                            name={`${phase.foot === 'left' ? 'Left' : 'Right'} Foot - ${phase.startTime.toFixed(1)}s`} 
                            data={phase.copTrajectory.map(point => ({
                              ...point,
                              size: phase === currentStancePhase ? 5 : 3
                            }))} 
                            fill={phase.foot === 'left' ? "#8884d8" : "#82ca9d"}
                            fillOpacity={phase === currentStancePhase ? 0.8 : 0.3}
                            stroke={phase === currentStancePhase ? (phase.foot === 'left' ? "#6a5acd" : "#2e8b57") : "none"}
                            strokeWidth={1.5}
                            line={phase === currentStancePhase}
                            lineType="joint"
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
                          />
                        )}
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              
              {(activeView === 'barChart' || activeView === 'combined') && (
                <div className="bg-white border rounded-md p-4">
                  <h3 className="text-base font-medium mb-2">Anteroposterior (Y) COP Position by Foot</h3>
                  <div className="h-[350px]">
                    <ChartContainer 
                      className="w-full h-full"
                      config={{
                        left: { theme: { light: "#8884d8", dark: "#8884d8" } },
                        right: { theme: { light: "#82ca9d", dark: "#82ca9d" } }
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={groupedBarData}
                          margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="condition" 
                            label={{ value: 'Condition and Limb', position: 'bottom', offset: 0 }}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            label={{ value: 'Anteroposterior Position (mm)', angle: -90, position: 'left' }}
                            domain={[0, 'dataMax + 50']}
                            tick={{ fontSize: 12 }}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white border p-2 rounded-md shadow-sm text-xs">
                                    <p className="font-medium">{data.condition}</p>
                                    <p>AP Position: {data.apPosition.toFixed(1)} mm</p>
                                    <p>Standard Error: ±{data.error.toFixed(1)} mm</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="apPosition" 
                            name="AP Position" 
                            fill={String("#1f77b4")}
                          >
                            <ErrorBar dataKey="error" width={4} strokeWidth={1} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-muted rounded-md text-sm">
                <h4 className="font-medium mb-1">COP Analysis:</h4>
                <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                  <li>The COP trajectory shows the path of pressure center during stance phase</li>
                  <li>Anteroposterior (AP) position indicates forward-backward movement</li>
                  <li>Mediolateral (ML) position indicates side-to-side movement</li>
                  <li>Error bars represent variation across multiple steps</li>
                  <li>Compare left and right foot patterns to assess gait symmetry</li>
                </ul>
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
