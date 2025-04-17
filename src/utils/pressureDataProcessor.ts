import * as XLSX from 'xlsx';

// Define sensor regions based on the provided SVG layouts and specified sensor numbering
export const LEFT_FOOT_SENSORS = {
  heel: Array.from({length: 25}, (_, i) => `R_${String(i + 1).padStart(2, '0')}`),
  medialMidfoot: ['R_30', 'R_31', 'R_32', 'R_33', 'R_37', 'R_38', 'R_39', 'R_40', 'R_44', 'R_45', 'R_46', 'R_47', 'R_51', 'R_52', 'R_53', 'R_54'],
  lateralMidfoot: ['R_27', 'R_28', 'R_29', 'R_34', 'R_35', 'R_36', 'R_41', 'R_42', 'R_43', 'R_48', 'R_49', 'R_50'],
  forefoot: Array.from({length: 28}, (_, i) => `R_${String(i + 55).padStart(2, '0')}`),
  toes: ['R_85', 'R_86', 'R_87', 'R_88', 'R_89', 'R_92', 'R_93', 'R_94', 'R_95', 'R_97', 'R_98', 'R_99'],
  hallux: ['R_83', 'R_84', 'R_90', 'R_91', 'R_96'],
};

export const RIGHT_FOOT_SENSORS = {
  heel: Array.from({length: 25}, (_, i) => `L_${String(i + 1).padStart(2, '0')}`),
  medialMidfoot: ['L_30', 'L_31', 'L_32', 'L_33', 'L_37', 'L_38', 'L_39', 'L_40', 'L_44', 'L_45', 'L_46', 'L_47', 'L_51', 'L_52', 'L_53', 'L_54'],
  lateralMidfoot: ['L_27', 'L_28', 'L_29', 'L_34', 'L_35', 'L_36', 'L_41', 'L_42', 'L_43', 'L_48', 'L_49', 'L_50'],
  forefoot: Array.from({length: 28}, (_, i) => `L_${String(i + 55).padStart(2, '0')}`),
  toes: ['L_85', 'L_86', 'L_87', 'L_88', 'L_89', 'L_92', 'L_93', 'L_94', 'L_95', 'L_97', 'L_98', 'L_99'],
  hallux: ['L_83', 'L_84', 'L_90', 'L_91', 'L_96'],
};

// Direct mapping of SVG IDs to sensor numbers
export const SVG_TO_SENSOR_MAP_LEFT = {
  'R_01': 1, 'R_02': 2, 'R_03': 3, 'R_04': 4, 'R_05': 5, 'R_06': 6, 'R_07': 7, 'R_08': 8, 'R_09': 9, 'R_10': 10,
  'R_11': 11, 'R_12': 12, 'R_13': 13, 'R_14': 14, 'R_15': 15, 'R_16': 16, 'R_17': 17, 'R_18': 18, 'R_19': 19, 'R_20': 20,
  'R_21': 21, 'R_22': 22, 'R_23': 23, 'R_24': 24, 'R_25': 25, 'R_26': 26, 'R_27': 27, 'R_28': 28, 'R_29': 29, 'R_30': 30,
  'R_31': 31, 'R_32': 32, 'R_33': 33, 'R_34': 34, 'R_35': 35, 'R_36': 36, 'R_37': 37, 'R_38': 38, 'R_39': 39, 'R_40': 40,
  'R_41': 41, 'R_42': 42, 'R_43': 43, 'R_44': 44, 'R_45': 45, 'R_46': 46, 'R_47': 47, 'R_48': 48, 'R_49': 49, 'R_50': 50,
  'R_51': 51, 'R_52': 52, 'R_53': 53, 'R_54': 54, 'R_55': 55, 'R_56': 56, 'R_57': 57, 'R_58': 58, 'R_59': 59, 'R_60': 60,
  'R_61': 61, 'R_62': 62, 'R_63': 63, 'R_64': 64, 'R_65': 65, 'R_66': 66, 'R_67': 67, 'R_68': 68, 'R_69': 69, 'R_70': 70,
  'R_71': 71, 'R_72': 72, 'R_73': 73, 'R_74': 74, 'R_75': 75, 'R_76': 76, 'R_77': 77, 'R_78': 78, 'R_79': 79, 'R_80': 80,
  'R_81': 81, 'R_82': 82, 'R_83': 83, 'R_84': 84, 'R_85': 85, 'R_86': 86, 'R_87': 87, 'R_88': 88, 'R_89': 89, 'R_90': 90,
  'R_91': 91, 'R_92': 92, 'R_93': 93, 'R_94': 94, 'R_95': 95, 'R_96': 96, 'R_97': 97, 'R_98': 98, 'R_99': 99
};

export const SVG_TO_SENSOR_MAP_RIGHT = {
  'L_01': 1, 'L_02': 2, 'L_03': 3, 'L_04': 4, 'L_05': 5, 'L_06': 6, 'L_07': 7, 'L_08': 8, 'L_09': 9, 'L_10': 10,
  'L_11': 11, 'L_12': 12, 'L_13': 13, 'L_14': 14, 'L_15': 15, 'L_16': 16, 'L_17': 17, 'L_18': 18, 'L_19': 19, 'L_20': 20,
  'L_21': 21, 'L_22': 22, 'L_23': 23, 'L_24': 24, 'L_25': 25, 'L_26': 26, 'L_27': 27, 'L_28': 28, 'L_29': 29, 'L_30': 30,
  'L_31': 31, 'L_32': 32, 'L_33': 33, 'L_34': 34, 'L_35': 35, 'L_36': 36, 'L_37': 37, 'L_38': 38, 'L_39': 39, 'L_40': 40,
  'L_41': 41, 'L_42': 42, 'L_43': 43, 'L_44': 44, 'L_45': 45, 'L_46': 46, 'L_47': 47, 'L_48': 48, 'L_49': 49, 'L_50': 50,
  'L_51': 51, 'L_52': 52, 'L_53': 53, 'L_54': 54, 'L_55': 55, 'L_56': 56, 'L_57': 57, 'L_58': 58, 'L_59': 59, 'L_60': 60,
  'L_61': 61, 'L_62': 62, 'L_63': 63, 'L_64': 64, 'L_65': 65, 'L_66': 66, 'L_67': 67, 'L_68': 68, 'L_69': 69, 'L_70': 70,
  'L_71': 71, 'L_72': 72, 'L_73': 73, 'L_74': 74, 'L_75': 75, 'L_76': 76, 'L_77': 77, 'L_78': 78, 'L_79': 79, 'L_80': 80,
  'L_81': 81, 'L_82': 82, 'L_83': 83, 'L_84': 84, 'L_85': 85, 'L_86': 86, 'L_87': 87, 'L_88': 88, 'L_89': 89, 'L_90': 90,
  'L_91': 91, 'L_92': 92, 'L_93': 93, 'L_94': 94, 'L_95': 95, 'L_96': 96, 'L_97': 97, 'L_98': 98, 'L_99': 99
};

export interface PressureSensorData {
  peak: number;
  mean: number;
  raw: number[];
}

export interface FootRegionData {
  [region: string]: PressureSensorData;
}

export interface FootSensorData {
  [sensorId: string]: number; // Holds pressure value for each sensor
}

export interface PressureDataPoint {
  time: number;
  leftFoot: FootRegionData;
  rightFoot: FootRegionData;
  leftFootSensors: FootSensorData;
  rightFootSensors: FootSensorData;
}

export interface ProcessedData {
  timePoints: number[];
  pressureData: PressureDataPoint[];
  maxPeakPressure: number;
  maxMeanPressure: number;
  maxSensorPressure: number;
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
  let maxSensorPressure = 0;
  
  // Process each row of data
  data.forEach((row) => {
    if (!row[timeColumnIndex]) return; // Skip rows without time data
    
    const time = parseFloat(row[timeColumnIndex]);
    timePoints.push(time);
    
    const dataPoint: PressureDataPoint = {
      time,
      leftFoot: {},
      rightFoot: {},
      leftFootSensors: {},
      rightFootSensors: {}
    };
    
    // Process individual sensors for left foot
    for (let i = 1; i <= 99; i++) {
      // Convert from Pa to kPa (divide by 1000)
      const value = parseFloat(row[i]) || 0;
      const pressure = value / 1000;
      dataPoint.leftFootSensors[`R_${i.toString().padStart(2, '0')}`] = pressure;
      
      // Update max sensor pressure if this sensor has a higher value
      if (pressure > maxSensorPressure) {
        maxSensorPressure = pressure;
      }
    }
    
    // Process individual sensors for right foot
    for (let i = 1; i <= 99; i++) {
      // Right foot sensors are 99 columns after left foot
      // Convert from Pa to kPa
      const value = parseFloat(row[i + 99]) || 0;
      const pressure = value / 1000;
      dataPoint.rightFootSensors[`L_${i.toString().padStart(2, '0')}`] = pressure;
      
      // Update max sensor pressure if this sensor has a higher value
      if (pressure > maxSensorPressure) {
        maxSensorPressure = pressure;
      }
    }
    
    // Process each region for left foot
    Object.entries(LEFT_FOOT_SENSORS).forEach(([region, sensorIds]) => {
      const regionData = sensorIds.map(sensorId => {
        const actualSensorId = SVG_TO_SENSOR_MAP_LEFT[sensorId] || parseInt(sensorId.replace('R_', ''));
        return parseFloat(row[actualSensorId]) / 1000 || 0; // Convert from Pa to kPa
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
    Object.entries(RIGHT_FOOT_SENSORS).forEach(([region, sensorIds]) => {
      const regionData = sensorIds.map(sensorId => {
        const actualSensorId = SVG_TO_SENSOR_MAP_RIGHT[sensorId] || parseInt(sensorId.replace('L_', ''));
        return parseFloat(row[actualSensorId + 99]) / 1000 || 0; // Convert from Pa to kPa
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
  console.log(`Max sensor pressure: ${maxSensorPressure.toFixed(2)} kPa`);
  
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
    maxSensorPressure: maxSensorPressure,
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
