
import { PressureDataPoint } from '@/utils/pressureDataProcessor';
import * as XLSX from 'xlsx';

export const exportDataPoint = (dataPoint: PressureDataPoint | null) => {
  if (!dataPoint) return;
  
  const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  const exportData = [
    ['Region', 'Left Foot Peak (kPa)', 'Right Foot Peak (kPa)', 'Difference (kPa)', 
     'Left Foot Mean (kPa)', 'Right Foot Mean (kPa)', 'Difference (kPa)'],
    ...regions.map(region => {
      const leftPeak = dataPoint.leftFoot[region].peak;
      const rightPeak = dataPoint.rightFoot[region].peak;
      const peakDiff = leftPeak - rightPeak;
      
      const leftMean = dataPoint.leftFoot[region].mean;
      const rightMean = dataPoint.rightFoot[region].mean;
      const meanDiff = leftMean - rightMean;
      
      return [
        region,
        leftPeak.toFixed(2),
        rightPeak.toFixed(2),
        peakDiff.toFixed(2),
        leftMean.toFixed(2),
        rightMean.toFixed(2),
        meanDiff.toFixed(2)
      ];
    })
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pressure Data');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `pressure_data_${dataPoint.time.toFixed(2)}s_${timestamp}.xlsx`;
  
  XLSX.writeFile(wb, filename);
  
  return filename;
};
