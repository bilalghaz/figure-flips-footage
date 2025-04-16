
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle } from "lucide-react";
import { StancePhase } from '@/utils/pressureDataProcessor';
import { useCopData } from './hooks/useCopData';
import CopTrajectoryView from './CopTrajectoryView';
import CopBarChartView from './CopBarChartView';
import CopInfoPanel from './CopInfoPanel';

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
  const [chartOpacity, setChartOpacity] = useState(0);
  const [dataReady, setDataReady] = useState(false);
  
  // Performance optimization: Limit stancePhases to the most relevant ones
  const optimizedStancePhases = useMemo(() => {
    if (!stancePhases || stancePhases.length === 0) return [];
    
    // If we have a very large dataset, only process phases around the current time
    // and limit the total number to improve performance on large files
    if (stancePhases.length > 500) {
      const timeWindow = 10; // 10 seconds around current time
      const nearbyPhases = stancePhases.filter(
        phase => Math.abs(phase.startTime - currentTime) < timeWindow
      );
      
      // If we still have too many phases, sample them
      if (nearbyPhases.length > 50) {
        const samplingRate = Math.ceil(nearbyPhases.length / 50);
        return nearbyPhases.filter((_, index) => index % samplingRate === 0);
      }
      
      return nearbyPhases;
    }
    
    return stancePhases;
  }, [stancePhases, currentTime]);
  
  const {
    leftFootPhases,
    rightFootPhases,
    displayPhases,
    currentStancePhase,
    stancePercentage,
    currentPosition,
    barChartData,
    groupedBarData
  } = useCopData(optimizedStancePhases, currentTime, footView);
  
  useEffect(() => {
    if (!stancePhases || stancePhases.length === 0) {
      setDataReady(false);
      return;
    }
    
    setIsLoading(true);
    setChartOpacity(0);
    
    const loadingTimer = setTimeout(() => {
      setDataReady(true);
      requestAnimationFrame(() => {
        setIsLoading(false);
        
        requestAnimationFrame(() => {
          setChartOpacity(1);
        });
      });
    }, 200);
    
    return () => clearTimeout(loadingTimer);
  }, [stancePhases, footView]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <CardTitle className="text-lg">Center of Pressure Analysis</CardTitle>
            <div className="flex items-center animate-pulse">
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              <span>Processing COP data...</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
              <div className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
            </div>
            <div className="h-[350px] w-full bg-muted animate-pulse rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!dataReady || !stancePhases || stancePhases.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <CardTitle className="text-lg">Center of Pressure Analysis</CardTitle>
            <div className="flex items-center">
              <span>No COP data available</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-md">
            <p className="text-gray-500">No stance phase detected at current time point</p>
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
        <div 
          className="space-y-4" 
          style={{ 
            opacity: chartOpacity,
            transition: 'opacity 0.3s ease-in-out',
            willChange: 'opacity, transform' // Optimize for animations
          }}
        >
          {displayPhases.length > 0 ? (
            <>
              {(activeView === 'trajectory' || activeView === 'combined') && (
                <CopTrajectoryView 
                  currentStancePhase={currentStancePhase} 
                  displayPhases={displayPhases}
                  currentPosition={currentPosition}
                />
              )}
              
              {(activeView === 'barChart' || activeView === 'combined') && (
                <CopBarChartView groupedBarData={groupedBarData} />
              )}
              
              <CopInfoPanel />
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
