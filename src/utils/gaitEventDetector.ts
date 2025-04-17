
import { PressureDataPoint } from './pressureDataProcessor';

export interface GaitEventThresholds {
  initialContact: number;
  toeOff: number;
}

export interface GaitEvent {
  time: number;
  type: 'initialContact' | 'toeOff';
  foot: 'left' | 'right';
}

/**
 * Detect gait events (Initial Contact and Toe-Off) from pressure data
 * 
 * @param dataPoints Array of pressure data points
 * @param thresholds Threshold values for detecting gait events
 * @returns Array of detected gait events
 */
export const detectGaitEvents = (
  dataPoints: PressureDataPoint[],
  thresholds: GaitEventThresholds = { initialContact: 15, toeOff: 10 }
): GaitEvent[] => {
  if (!dataPoints || dataPoints.length < 2) {
    return [];
  }
  
  const events: GaitEvent[] = [];
  
  // Initialize previous values
  let prevLeftHeelPressure = 0;
  let prevRightHeelPressure = 0;
  let prevLeftToePressure = 0;
  let prevRightToePressure = 0;
  
  // Loop through data points to detect transitions
  for (let i = 1; i < dataPoints.length; i++) {
    const prevPoint = dataPoints[i - 1];
    const currentPoint = dataPoints[i];
    
    // Get current values
    const leftHeelPressure = currentPoint.leftFoot.heel?.peak || 0;
    const rightHeelPressure = currentPoint.rightFoot.heel?.peak || 0;
    
    // For toe-off, we'll use the maximum pressure from hallux or toes
    const leftHalluxPressure = currentPoint.leftFoot.hallux?.peak || 0;
    const leftToesPressure = currentPoint.leftFoot.toes?.peak || 0;
    const leftToePressure = Math.max(leftHalluxPressure, leftToesPressure);
    
    const rightHalluxPressure = currentPoint.rightFoot.hallux?.peak || 0;
    const rightToesPressure = currentPoint.rightFoot.toes?.peak || 0;
    const rightToePressure = Math.max(rightHalluxPressure, rightToesPressure);
    
    // Initial Contact (IC) detection - crossing above threshold
    if (prevLeftHeelPressure < thresholds.initialContact && leftHeelPressure >= thresholds.initialContact) {
      events.push({
        time: currentPoint.time,
        type: 'initialContact',
        foot: 'left'
      });
    }
    
    if (prevRightHeelPressure < thresholds.initialContact && rightHeelPressure >= thresholds.initialContact) {
      events.push({
        time: currentPoint.time,
        type: 'initialContact',
        foot: 'right'
      });
    }
    
    // Toe-Off (TO) detection - crossing below threshold
    // For toe-off, we check that we were above threshold and are now below
    if (prevLeftToePressure >= thresholds.toeOff && leftToePressure < thresholds.toeOff) {
      events.push({
        time: currentPoint.time,
        type: 'toeOff',
        foot: 'left'
      });
    }
    
    if (prevRightToePressure >= thresholds.toeOff && rightToePressure < thresholds.toeOff) {
      events.push({
        time: currentPoint.time,
        type: 'toeOff',
        foot: 'right'
      });
    }
    
    // Update previous values
    prevLeftHeelPressure = leftHeelPressure;
    prevRightHeelPressure = rightHeelPressure;
    prevLeftToePressure = leftToePressure;
    prevRightToePressure = rightToePressure;
  }
  
  return events;
};

/**
 * Get active gait events for the current time
 * 
 * @param events Array of gait events
 * @param currentTime Current playback time
 * @param timeWindow Time window to consider events active (in seconds)
 * @returns Array of active events
 */
export const getActiveEvents = (
  events: GaitEvent[],
  currentTime: number,
  timeWindow: number = 0.2
): GaitEvent[] => {
  return events.filter(event => 
    Math.abs(event.time - currentTime) <= timeWindow
  );
};
