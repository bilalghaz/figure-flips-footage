
import { useMemo, useCallback } from 'react';
import { StancePhase } from '@/utils/pressureDataProcessor';

export const useCopData = (
  stancePhases: StancePhase[],
  currentTime: number,
  footView: 'combined' | 'left' | 'right'
) => {
  // Filter phases by foot - memoized for performance
  const leftFootPhases = useMemo(() => 
    stancePhases.filter(phase => phase.foot === 'left'),
  [stancePhases]);
  
  const rightFootPhases = useMemo(() => 
    stancePhases.filter(phase => phase.foot === 'right'),
  [stancePhases]);

  // Find the current stance phase - memoized for performance
  const currentStancePhase = useMemo(() => {
    if (!stancePhases || stancePhases.length === 0) return null;
    
    return stancePhases.find(phase => 
      currentTime >= phase.startTime && currentTime <= phase.endTime
    );
  }, [stancePhases, currentTime]);
  
  // Calculate percentage through current stance - memoized for performance
  const stancePercentage = useMemo(() => {
    if (!currentStancePhase) return null;
    
    const elapsedTime = currentTime - currentStancePhase.startTime;
    return Math.round((elapsedTime / currentStancePhase.duration) * 100);
  }, [currentStancePhase, currentTime]);
  
  // Find the current position in the trajectory - memoized for performance
  const currentPosition = useMemo(() => {
    if (!currentStancePhase || !stancePercentage) return null;
    
    return currentStancePhase.copTrajectory.find(p => p.percentage === stancePercentage) || 
           currentStancePhase.copTrajectory[0];
  }, [currentStancePhase, stancePercentage]);
  
  // Get the phase to display based on active view - memoized with useCallback
  const getDisplayPhases = useCallback(() => {
    if (footView === 'left') return leftFootPhases;
    if (footView === 'right') return rightFootPhases;
    return stancePhases;
  }, [footView, leftFootPhases, rightFootPhases, stancePhases]);
  
  // Memoize display phases to prevent recalculation
  const displayPhases = useMemo(() => getDisplayPhases(), [getDisplayPhases]);

  // Prepare bar chart data - now with both feet correctly processed
  const barChartData = useMemo(() => {
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

  // Group bar chart data by condition - memoized for performance
  const groupedBarData = useMemo(() => {
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
    groupedBarData,
    getDisplayPhases
  };
};
