
import { PressureDataPoint } from '@/utils/pressureDataProcessor';
import * as XLSX from 'xlsx';

/**
 * Exports a single data point to an Excel file
 */
export const exportDataPoint = (dataPoint: PressureDataPoint): string => {
  const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  // Create worksheet data
  const wsData = [
    ['Plantar Pressure Data Export'],
    ['Time (s)', dataPoint.time.toFixed(3)],
    [''],
    ['', 'Left Foot', '', '', 'Right Foot', ''],
    ['Region', 'Peak (kPa)', 'Mean (kPa)', '', 'Peak (kPa)', 'Mean (kPa)']
  ];
  
  // Add data for each region
  regions.forEach(region => {
    const displayName = region.charAt(0).toUpperCase() + region.slice(1);
    
    wsData.push([
      displayName,
      dataPoint.leftFoot[region].peak.toFixed(2),
      dataPoint.leftFoot[region].mean.toFixed(2),
      '',
      dataPoint.rightFoot[region].peak.toFixed(2),
      dataPoint.rightFoot[region].mean.toFixed(2)
    ]);
  });
  
  // Create a worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  const wscols = [
    { wch: 15 }, // Region
    { wch: 10 }, // Left Peak
    { wch: 10 }, // Left Mean
    { wch: 5 },  // Spacer
    { wch: 10 }, // Right Peak
    { wch: 10 }, // Right Mean
  ];
  ws['!cols'] = wscols;
  
  // Create workbook and add the worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pressure Data');
  
  // Generate filename
  const filename = `pressure_data_${dataPoint.time.toFixed(2)}s.xlsx`;
  
  // Write file
  XLSX.writeFile(wb, filename);
  
  return filename;
};
