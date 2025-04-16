
import { useMemo } from 'react';
import { StancePhase } from '@/utils/pressureDataProcessor';

export const useCopData = (
  stancePhases: StancePhase[],
  currentTime: number,
  footView: 'combined' | 'left' | 'right'
) => {
  // Filter phases by foot
  const leftFootPhases = useMemo(() => 
    stancePhases?.filter(phase => phase.foot === 'left') || [],
  [stancePhases]);
  
  const rightFootPhases = useMemo(() => 
    stancePhases?.filter(phase => phase.foot === 'right') || [],
  [stancePhases]);

  // Find the current stance phase
  const currentStancePhase = useMemo(() => {
    if (!stancePhases || stancePhases.length === 0) return null;
    
    return stancePhases.find(phase => 
      currentTime >= phase.startTime && currentTime <= phase.endTime
    ) || null;
  }, [stancePhases, currentTime]);
  
  // Calculate percentage through current stance
  const stancePercentage = useMemo(() => {
    if (!currentStancePhase) return null;
    
    const elapsedTime = currentTime - currentStancePhase.startTime;
    const percentage = Math.round((elapsedTime / currentStancePhase.duration) * 100);
    
    // Ensure percentage is between 0 and 100
    return Math.max(0, Math.min(100, percentage));
  }, [currentStancePhase, currentTime]);
  
  // Find the current position in the trajectory
  const currentPosition = useMemo(() => {
    if (!currentStancePhase || stancePercentage === null) return null;
    
    // Find closest position by percentage
    return currentStancePhase.copTrajectory.find(p => p.percentage === stancePercentage) || 
           currentStancePhase.copTrajectory[0];
  }, [currentStancePhase, stancePercentage]);
  
  // Get the phases to display based on active view
  const displayPhases = useMemo(() => {
    if (!stancePhases || stancePhases.length === 0) return [];
    
    switch (footView) {
      case 'left': return leftFootPhases;
      case 'right': return rightFootPhases;
      default: return stancePhases;
    }
  }, [footView, leftFootPhases, rightFootPhases, stancePhases]);

  // Prepare bar chart data
  const barChartData = useMemo(() => {
    if (!leftFootPhases.length && !rightFootPhases.length) return [];
    
    const leftData = leftFootPhases.map(phase => ({
      id: `left-${phase.startTime.toFixed(1)}`,
      condition: 'Left Foot',
      apPosition: phase.meanCopX,
      error: phase.apRange / 4, // Standard deviation approximation
      foot: 'Left',
      color: '#8884d8'
    }));

    const rightData = rightFootPhases.map(phase => ({
      id: `right-${phase.startTime.toFixed(1)}`,
      condition: 'Right Foot',
      apPosition: phase.meanCopX,
      error: phase.apRange / 4,
      foot: 'Right',
      color: '#82ca9d'
    }));

    return [...leftData, ...rightData];
  }, [leftFootPhases, rightFootPhases]);

  // Group bar chart data by condition
  const groupedBarData = useMemo(() => {
    if (!barChartData.length) return [];
    
    // Group by foot condition
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

    // Process grouped data
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

  return {
    leftFootPhases,
    rightFootPhases,
    displayPhases,
    currentStancePhase,
    stancePercentage,
    currentPosition,
    barChartData,
    groupedBarData
  };
};
