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

export interface ProcessedData {
  timePoints: number[];
  pressureData: PressureDataPoint[];
  maxPeakPressure: number;
  maxMeanPressure: number;
  fileName?: string;
  participantId?: string;
  stancePhases?: StancePhase[]; // Added to fix type errors
}

// Add StancePhase interface to fix imports
export interface StancePhase {
  startTime: number;
  endTime: number;
  duration: number;
  foot: 'left' | 'right';
  meanCopX: number;
  meanCopY: number;
  apRange: number;
  mlRange: number;
  midstanceVariability: number;
  copTrajectory: {
    x: number;
    y: number;
    force: number;
    percentage: number;
  }[];
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
