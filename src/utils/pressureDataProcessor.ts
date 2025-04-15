
import * as XLSX from 'xlsx';

// Define sensor regions based on the provided specification
const REGIONS = {
  heel: Array.from({ length: 25 }, (_, i) => i + 1),
  medialMidfoot: [30, 31, 32, 33, 37, 38, 39, 40, 44, 45, 46, 47, 51, 52, 53, 54],
  lateralMidfoot: [27, 28, 29, 34, 35, 36, 41, 42, 43, 48, 49, 50],
  forefoot: Array.from({ length: 28 }, (_, i) => i + 55),
  toes: [85, 86, 87, 88, 89, 92, 93, 94, 95, 97, 98, 99],
  hallux: [83, 84, 90, 91, 96]
};

export interface PressureSensorData {
  peak: number;
  mean: number;
  raw: number[];
}

export interface FootRegionData {
  [region: string]: PressureSensorData;
}

export interface PressureDataPoint {
  time: number;
  leftFoot: FootRegionData;
  rightFoot: FootRegionData;
}

export interface CopForceDataPoint {
  time: number;
  leftForce: number;   // in Newtons
  leftCopX: number;    // in mm (anterior-posterior)
  leftCopY: number;    // in mm (medio-lateral)
  rightForce: number;  // in Newtons
  rightCopX: number;   // in mm
  rightCopY: number;   // in mm
}

export interface StancePhase {
  foot: 'left' | 'right';
  startTime: number;
  endTime: number;
  duration: number;
  copTrajectory: { x: number, y: number, force: number, percentage: number }[];
  mlRange: number;  // medio-lateral range
  apRange: number;  // anterio-posterior range
  meanCopX: number; // mean COP X position
  meanCopY: number; // mean COP Y position
  midstanceVariability: number; // variability during midstance
}

export interface ProcessedData {
  timePoints: number[];
  pressureData: PressureDataPoint[];
  maxPeakPressure: number;
  maxMeanPressure: number;
  copForceData?: CopForceDataPoint[];
  maxForce?: number;
  stancePhases?: StancePhase[];
  participantId?: string;
  fileName?: string;
}

/**
 * Processes raw XLSX data from Pedar-X system
 */
export const processPressureData = async (file: File): Promise<ProcessedData> => {
  console.log('Processing pressure data file...', file.name);
  
  // Read the XLSX file
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  // Get the first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to JSON, skipping the first 9 rows (metadata)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 9 });
  
  console.log('Data loaded, processing...');
  
  // Extract column headers
  const headers = jsonData[0] as string[];
  // Remove the headers row from the data
  const data = jsonData.slice(1) as any[][];
  
  // Find the index of the time column
  const timeColumnIndex = headers.findIndex(header => header.includes('time'));
  
  if (timeColumnIndex === -1) {
    throw new Error('Time column not found in the data');
  }
  
  // Process the data
  const pressureData: PressureDataPoint[] = [];
  const timePoints: number[] = [];
  let maxPeakPressure = 0;
  let maxMeanPressure = 0;
  
  // Process each row of data
  data.forEach((row) => {
    if (!row[timeColumnIndex]) return; // Skip rows without time data
    
    const time = parseFloat(row[timeColumnIndex]);
    timePoints.push(time);
    
    const dataPoint: PressureDataPoint = {
      time,
      leftFoot: {},
      rightFoot: {}
    };
    
    // Process each region for left foot
    Object.entries(REGIONS).forEach(([region, sensors]) => {
      const regionData = sensors.map(sensor => {
        // Convert from Pa to kPa (divide by 1000)
        const value = parseFloat(row[sensor]) || 0;
        return value / 1000;
      }).filter(value => !isNaN(value));
      
      const peak = Math.max(...regionData, 0);
      const mean = regionData.length > 0 
        ? regionData.reduce((sum, val) => sum + val, 0) / regionData.length 
        : 0;
      
      dataPoint.leftFoot[region] = { peak, mean, raw: regionData };
      
      // Update max values
      maxPeakPressure = Math.max(maxPeakPressure, peak);
      maxMeanPressure = Math.max(maxMeanPressure, mean);
    });
    
    // Process each region for right foot
    Object.entries(REGIONS).forEach(([region, sensors]) => {
      const regionData = sensors.map(sensor => {
        // Right foot sensors are 99 columns after left foot
        // Convert from Pa to kPa
        const value = parseFloat(row[sensor + 99]) || 0;
        return value / 1000;
      }).filter(value => !isNaN(value));
      
      const peak = Math.max(...regionData, 0);
      const mean = regionData.length > 0 
        ? regionData.reduce((sum, val) => sum + val, 0) / regionData.length 
        : 0;
      
      dataPoint.rightFoot[region] = { peak, mean, raw: regionData };
      
      // Update max values
      maxPeakPressure = Math.max(maxPeakPressure, peak);
      maxMeanPressure = Math.max(maxMeanPressure, mean);
    });
    
    pressureData.push(dataPoint);
  });
  
  console.log(`Processed ${pressureData.length} data points`);
  console.log(`Max peak pressure: ${maxPeakPressure.toFixed(2)} kPa`);
  console.log(`Max mean pressure: ${maxMeanPressure.toFixed(2)} kPa`);
  
  // Filter out any extremely large outliers (more than 3x the average of the top 10%)
  const sortedPeakPressures = [...pressureData].sort((a, b) => {
    const aMax = Math.max(
      ...Object.values(a.leftFoot).map(r => r.peak),
      ...Object.values(a.rightFoot).map(r => r.peak)
    );
    const bMax = Math.max(
      ...Object.values(b.leftFoot).map(r => r.peak),
      ...Object.values(b.rightFoot).map(r => r.peak)
    );
    return bMax - aMax;
  });
  
  // Calculate average of top 10% values
  const top10Percent = sortedPeakPressures.slice(0, Math.max(1, Math.floor(pressureData.length * 0.1)));
  const avgTop10 = top10Percent.reduce((sum, point) => {
    const maxVal = Math.max(
      ...Object.values(point.leftFoot).map(r => r.peak),
      ...Object.values(point.rightFoot).map(r => r.peak)
    );
    return sum + maxVal;
  }, 0) / top10Percent.length;
  
  // Cap max pressure at 3x the average of top 10% to prevent outliers from skewing color scale
  const adjustedMaxPeakPressure = Math.min(maxPeakPressure, avgTop10 * 3);
  
  return {
    timePoints,
    pressureData,
    maxPeakPressure: adjustedMaxPeakPressure,
    maxMeanPressure: maxMeanPressure,
    fileName: file.name,
    participantId: extractParticipantId(file.name)
  };
};

/**
 * Processes FGT.xlsx data from Pedar-X system (CoP and Force data)
 */
export const processCopForceData = async (file: File): Promise<CopForceDataPoint[]> => {
  console.log('Processing COP and force data file...', file.name);
  
  // Read the XLSX file
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  
  // Get the first sheet
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Convert to JSON, skipping the first 9 rows (metadata)
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 9 });
  
  // Extract column headers
  const headers = jsonData[0] as string[];
  // Remove the headers row from the data
  const data = jsonData.slice(1) as any[][];
  
  // Expected columns
  // A: time[secs]
  // B: left_force[N]
  // C: left_x[mm]
  // D: left_y[mm]
  // E: right_force[N]
  // F: right_x[mm]
  // G: right_y[mm]
  
  // Find the column indices
  const timeColumnIndex = headers.findIndex(header => header.includes('time'));
  const leftForceIndex = headers.findIndex(header => header.includes('left_force'));
  const leftXIndex = headers.findIndex(header => header.includes('left_x'));
  const leftYIndex = headers.findIndex(header => header.includes('left_y'));
  const rightForceIndex = headers.findIndex(header => header.includes('right_force'));
  const rightXIndex = headers.findIndex(header => header.includes('right_x'));
  const rightYIndex = headers.findIndex(header => header.includes('right_y'));
  
  if (timeColumnIndex === -1) {
    throw new Error('Time column not found in the data');
  }
  
  // Process the data
  const copForceData: CopForceDataPoint[] = [];
  
  // Process each row of data
  data.forEach((row) => {
    if (!row[timeColumnIndex]) return; // Skip rows without time data
    
    const time = parseFloat(row[timeColumnIndex]);
    
    const dataPoint: CopForceDataPoint = {
      time,
      leftForce: parseFloat(row[leftForceIndex] || 0),
      leftCopX: parseFloat(row[leftXIndex] || 0),
      leftCopY: parseFloat(row[leftYIndex] || 0),
      rightForce: parseFloat(row[rightForceIndex] || 0),
      rightCopX: parseFloat(row[rightXIndex] || 0),
      rightCopY: parseFloat(row[rightYIndex] || 0)
    };
    
    copForceData.push(dataPoint);
  });
  
  console.log(`Processed ${copForceData.length} COP & force data points`);
  
  return copForceData;
};

/**
 * Merges pressure data with COP/force data
 */
export const mergeData = (pressureData: ProcessedData, copForceData: CopForceDataPoint[]): ProcessedData => {
  const merged = { ...pressureData, copForceData };
  
  // Calculate maximum force
  const maxForce = Math.max(
    ...copForceData.map(point => Math.max(point.leftForce, point.rightForce))
  );
  
  merged.maxForce = maxForce;
  
  // Detect stance phases based on force threshold (10% of max force)
  const forceThreshold = maxForce * 0.1;
  const stancePhases: StancePhase[] = [];
  
  let leftStanceStart: number | null = null;
  let rightStanceStart: number | null = null;
  
  // Detect stance phases
  copForceData.forEach((point, index) => {
    // Left foot stance detection
    if (point.leftForce > forceThreshold && leftStanceStart === null) {
      leftStanceStart = point.time;
    } else if (point.leftForce <= forceThreshold && leftStanceStart !== null) {
      // End of left stance
      const startTime = leftStanceStart;
      const endTime = point.time;
      const duration = endTime - startTime;
      
      // Only include stances longer than 0.1 seconds (to filter out noise)
      if (duration > 0.1) {
        // Extract COP trajectory during this stance
        const stanceCopData = copForceData.filter(p => p.time >= startTime && p.time <= endTime);
        
        // Calculate COP trajectory with percentage
        const copTrajectory = stanceCopData.map((p, i) => ({
          x: p.leftCopX,
          y: p.leftCopY,
          force: p.leftForce,
          percentage: Math.round((i / (stanceCopData.length - 1)) * 100)
        }));
        
        // Resample to 101 points (0-100%)
        const resampledCop = resampleCopTrajectory(copTrajectory);
        
        // Calculate range and mean values
        const xValues = resampledCop.map(p => p.x);
        const yValues = resampledCop.map(p => p.y);
        
        const apRange = Math.max(...xValues) - Math.min(...xValues);
        const mlRange = Math.max(...yValues) - Math.min(...yValues);
        const meanCopX = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
        const meanCopY = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
        
        // Calculate midstance variability (standard deviation during 30-70% of stance)
        const midstanceCop = resampledCop.filter(p => p.percentage >= 30 && p.percentage <= 70);
        const midstanceXValues = midstanceCop.map(p => p.x);
        const midstanceYValues = midstanceCop.map(p => p.y);
        
        const midstanceXMean = midstanceXValues.reduce((sum, val) => sum + val, 0) / midstanceXValues.length;
        const midstanceYMean = midstanceYValues.reduce((sum, val) => sum + val, 0) / midstanceYValues.length;
        
        const midstanceVariability = Math.sqrt(
          midstanceXValues.reduce((sum, val) => sum + Math.pow(val - midstanceXMean, 2), 0) / midstanceXValues.length +
          midstanceYValues.reduce((sum, val) => sum + Math.pow(val - midstanceYMean, 2), 0) / midstanceYValues.length
        );
        
        stancePhases.push({
          foot: 'left',
          startTime,
          endTime,
          duration,
          copTrajectory: resampledCop,
          apRange,
          mlRange,
          meanCopX,
          meanCopY,
          midstanceVariability
        });
      }
      
      leftStanceStart = null;
    }
    
    // Right foot stance detection
    if (point.rightForce > forceThreshold && rightStanceStart === null) {
      rightStanceStart = point.time;
    } else if (point.rightForce <= forceThreshold && rightStanceStart !== null) {
      // End of right stance
      const startTime = rightStanceStart;
      const endTime = point.time;
      const duration = endTime - startTime;
      
      // Only include stances longer than 0.1 seconds (to filter out noise)
      if (duration > 0.1) {
        // Extract COP trajectory during this stance
        const stanceCopData = copForceData.filter(p => p.time >= startTime && p.time <= endTime);
        
        // Calculate COP trajectory with percentage
        const copTrajectory = stanceCopData.map((p, i) => ({
          x: p.rightCopX,
          y: p.rightCopY,
          force: p.rightForce,
          percentage: Math.round((i / (stanceCopData.length - 1)) * 100)
        }));
        
        // Resample to 101 points (0-100%)
        const resampledCop = resampleCopTrajectory(copTrajectory);
        
        // Calculate range and mean values
        const xValues = resampledCop.map(p => p.x);
        const yValues = resampledCop.map(p => p.y);
        
        const apRange = Math.max(...xValues) - Math.min(...xValues);
        const mlRange = Math.max(...yValues) - Math.min(...yValues);
        const meanCopX = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
        const meanCopY = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
        
        // Calculate midstance variability
        const midstanceCop = resampledCop.filter(p => p.percentage >= 30 && p.percentage <= 70);
        const midstanceXValues = midstanceCop.map(p => p.x);
        const midstanceYValues = midstanceCop.map(p => p.y);
        
        const midstanceXMean = midstanceXValues.reduce((sum, val) => sum + val, 0) / midstanceXValues.length;
        const midstanceYMean = midstanceYValues.reduce((sum, val) => sum + val, 0) / midstanceYValues.length;
        
        const midstanceVariability = Math.sqrt(
          midstanceXValues.reduce((sum, val) => sum + Math.pow(val - midstanceXMean, 2), 0) / midstanceXValues.length +
          midstanceYValues.reduce((sum, val) => sum + Math.pow(val - midstanceYMean, 2), 0) / midstanceYValues.length
        );
        
        stancePhases.push({
          foot: 'right',
          startTime,
          endTime,
          duration,
          copTrajectory: resampledCop,
          apRange,
          mlRange,
          meanCopX,
          meanCopY,
          midstanceVariability
        });
      }
      
      rightStanceStart = null;
    }
  });
  
  // Sort by start time
  stancePhases.sort((a, b) => a.startTime - b.startTime);
  
  merged.stancePhases = stancePhases;
  
  return merged;
};

/**
 * Resamples COP trajectory to 101 points (0-100% of stance phase)
 */
const resampleCopTrajectory = (trajectory: { x: number, y: number, force: number, percentage: number }[]) => {
  const resampledTrajectory: { x: number, y: number, force: number, percentage: number }[] = [];
  
  // Create points for each percentage from 0 to 100
  for (let percentage = 0; percentage <= 100; percentage++) {
    // Find the closest points
    const closestLower = trajectory.filter(p => p.percentage <= percentage)
      .sort((a, b) => b.percentage - a.percentage)[0];
      
    const closestHigher = trajectory.filter(p => p.percentage >= percentage)
      .sort((a, b) => a.percentage - b.percentage)[0];
    
    // If no lower or higher point, use the available one
    if (!closestLower) {
      resampledTrajectory.push({
        ...closestHigher,
        percentage
      });
      continue;
    }
    
    if (!closestHigher) {
      resampledTrajectory.push({
        ...closestLower,
        percentage
      });
      continue;
    }
    
    // If same percentage, use that point
    if (closestLower.percentage === closestHigher.percentage) {
      resampledTrajectory.push({
        ...closestLower,
        percentage
      });
      continue;
    }
    
    // Linear interpolation between closest points
    const lowerWeight = (closestHigher.percentage - percentage) / 
                        (closestHigher.percentage - closestLower.percentage);
    const higherWeight = (percentage - closestLower.percentage) / 
                         (closestHigher.percentage - closestLower.percentage);
    
    const interpolatedPoint = {
      x: closestLower.x * lowerWeight + closestHigher.x * higherWeight,
      y: closestLower.y * lowerWeight + closestHigher.y * higherWeight,
      force: closestLower.force * lowerWeight + closestHigher.force * higherWeight,
      percentage
    };
    
    resampledTrajectory.push(interpolatedPoint);
  }
  
  return resampledTrajectory;
};

/**
 * Try to extract participant ID from filename
 */
const extractParticipantId = (filename: string): string => {
  // Remove extension
  const nameOnly = filename.split('.')[0];
  
  // Try to extract an ID pattern (common formats: P01, Subject_01, etc.)
  const idMatch = nameOnly.match(/(?:P|Subject|ID|Participant)[_-]?(\d+)/i);
  
  if (idMatch) {
    return idMatch[0];
  }
  
  // Fall back to the full filename without extension
  return nameOnly;
};
