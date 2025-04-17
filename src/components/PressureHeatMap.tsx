
import React, { useMemo } from 'react';
import { PressureDataPoint, SVG_TO_SENSOR_MAP_LEFT, SVG_TO_SENSOR_MAP_RIGHT } from '@/utils/pressureDataProcessor';

interface PressureHeatMapProps {
  dataPoint: PressureDataPoint | null;
  side: 'left' | 'right';
  maxPressure: number;
  mode: 'peak' | 'mean';
  editMode?: boolean;
  selectedSensor?: string | null;
  onSensorSelect?: (sensorId: string) => void;
  customSensorAssignments?: Record<string, string>;
}

const PressureHeatMap: React.FC<PressureHeatMapProps> = ({ 
  dataPoint, 
  side, 
  maxPressure,
  mode,
  editMode = false,
  selectedSensor = null,
  onSensorSelect,
  customSensorAssignments = {}
}) => {
  // Handle empty data
  if (!dataPoint) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-background border rounded-md p-4">
        <p className="text-muted-foreground text-center">No data available</p>
      </div>
    );
  }
  
  // Get the standard region definitions
  const defaultRegions = side === 'left' ? 
    {
      heel: ['R_01', 'R_02', 'R_03', 'R_04', 'R_05', 'R_06', 'R_07', 'R_08', 'R_09', 'R_10', 'R_11', 'R_12', 'R_13', 'R_14', 'R_15', 'R_16', 'R_17', 'R_18', 'R_19', 'R_20', 'R_21', 'R_22', 'R_23', 'R_24', 'R_25'],
      medialMidfoot: ['R_30', 'R_31', 'R_32', 'R_33', 'R_37', 'R_38', 'R_39', 'R_40', 'R_44', 'R_45', 'R_46', 'R_47', 'R_51', 'R_52', 'R_53', 'R_54'],
      lateralMidfoot: ['R_27', 'R_28', 'R_29', 'R_34', 'R_35', 'R_36', 'R_41', 'R_42', 'R_43', 'R_48', 'R_49', 'R_50'],
      forefoot: ['R_55', 'R_56', 'R_57', 'R_58', 'R_59', 'R_60', 'R_61', 'R_62', 'R_63', 'R_64', 'R_65', 'R_66', 'R_67', 'R_68', 'R_69', 'R_70', 'R_71', 'R_72', 'R_73', 'R_74', 'R_75', 'R_76', 'R_77', 'R_78', 'R_79', 'R_80', 'R_81', 'R_82'],
      toes: ['R_85', 'R_86', 'R_87', 'R_88', 'R_89', 'R_92', 'R_93', 'R_94', 'R_95', 'R_97', 'R_98', 'R_99'],
      hallux: ['R_83', 'R_84', 'R_90', 'R_91', 'R_96'],
    } : {
      heel: ['L_01', 'L_02', 'L_03', 'L_04', 'L_05', 'L_06', 'L_07', 'L_08', 'L_09', 'L_10', 'L_11', 'L_12', 'L_13', 'L_14', 'L_15', 'L_16', 'L_17', 'L_18', 'L_19', 'L_20', 'L_21', 'L_22', 'L_23', 'L_24', 'L_25'],
      medialMidfoot: ['L_30', 'L_31', 'L_32', 'L_33', 'L_37', 'L_38', 'L_39', 'L_40', 'L_44', 'L_45', 'L_46', 'L_47', 'L_51', 'L_52', 'L_53', 'L_54'],
      lateralMidfoot: ['L_27', 'L_28', 'L_29', 'L_34', 'L_35', 'L_36', 'L_41', 'L_42', 'L_43', 'L_48', 'L_49', 'L_50'],
      forefoot: ['L_55', 'L_56', 'L_57', 'L_58', 'L_59', 'L_60', 'L_61', 'L_62', 'L_63', 'L_64', 'L_65', 'L_66', 'L_67', 'L_68', 'L_69', 'L_70', 'L_71', 'L_72', 'L_73', 'L_74', 'L_75', 'L_76', 'L_77', 'L_78', 'L_79', 'L_80', 'L_81', 'L_82'],
      toes: ['L_85', 'L_86', 'L_87', 'L_88', 'L_89', 'L_92', 'L_93', 'L_94', 'L_95', 'L_97', 'L_98', 'L_99'],
      hallux: ['L_83', 'L_84', 'L_90', 'L_91', 'L_96'],
    };

  // Apply custom assignments to get the final region mapping
  const customizedRegions = useMemo(() => {
    const regions = { ...defaultRegions };
    
    // If there are custom assignments, we need to rebuild the region mappings
    if (Object.keys(customSensorAssignments).length > 0) {
      // Remove sensors from their default regions
      Object.entries(customSensorAssignments).forEach(([sensorId, _]) => {
        for (const region in regions) {
          regions[region] = regions[region].filter(id => id !== sensorId);
        }
      });
      
      // Add sensors to their assigned regions
      Object.entries(customSensorAssignments).forEach(([sensorId, region]) => {
        if (regions[region]) {
          regions[region].push(sensorId);
        }
      });
    }
    
    return regions;
  }, [defaultRegions, customSensorAssignments]);
  
  // Get foot data based on selected side
  const footData = useMemo(() => {
    // Start with empty region data
    const regionData: Record<string, { peak: number; mean: number; raw: number[] }> = {
      heel: { peak: 0, mean: 0, raw: [] },
      medialMidfoot: { peak: 0, mean: 0, raw: [] },
      lateralMidfoot: { peak: 0, mean: 0, raw: [] },
      forefoot: { peak: 0, mean: 0, raw: [] },
      toes: { peak: 0, mean: 0, raw: [] },
      hallux: { peak: 0, mean: 0, raw: [] },
    };
    
    // Get sensor data from dataPoint
    const sensorData = side === 'left' ? dataPoint.leftFootSensors : dataPoint.rightFootSensors;
    
    // Calculate region data based on customized regions
    for (const [region, sensorIds] of Object.entries(customizedRegions)) {
      const sensorValues = sensorIds
        .map(id => sensorData[id] || 0)
        .filter(value => !isNaN(value));
      
      if (sensorValues.length > 0) {
        const peak = Math.max(...sensorValues);
        const mean = sensorValues.reduce((sum, val) => sum + val, 0) / sensorValues.length;
        
        regionData[region] = {
          peak,
          mean,
          raw: sensorValues
        };
      }
    }
    
    return regionData;
  }, [dataPoint, side, customizedRegions]);
  
  // Get individual sensor data
  const sensorData = side === 'left' ? dataPoint.leftFootSensors : dataPoint.rightFootSensors;
  
  // Calculate colors for each region
  const regionColors = useMemo(() => {
    const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
    const colors: Record<string, string> = {};

    regions.forEach(region => {
      if (!footData[region]) return;
      
      const pressure = footData[region][mode];
      const normalizedPressure = Math.min(pressure / maxPressure, 1);
      
      // Rainbow color gradient (blue -> cyan -> green -> yellow -> red)
      let r, g, b;
      
      if (normalizedPressure < 0.25) {
        // Blue to cyan
        r = 0;
        g = Math.round((normalizedPressure * 4) * 255);
        b = 255;
      } else if (normalizedPressure < 0.5) {
        // Cyan to green
        r = 0;
        g = 255;
        b = Math.round((1 - (normalizedPressure - 0.25) * 4) * 255);
      } else if (normalizedPressure < 0.75) {
        // Green to yellow
        r = Math.round(((normalizedPressure - 0.5) * 4) * 255);
        g = 255;
        b = 0;
      } else {
        // Yellow to red
        r = 255;
        g = Math.round((1 - (normalizedPressure - 0.75) * 4) * 255);
        b = 0;
      }
      
      colors[region] = `rgb(${r}, ${g}, ${b})`;
    });
    
    return colors;
  }, [footData, maxPressure, mode]);
  
  // Calculate colors for each individual sensor
  const sensorColors = useMemo(() => {
    const colors: Record<string, string> = {};
    
    Object.entries(sensorData).forEach(([sensorId, pressure]) => {
      const normalizedPressure = Math.min(pressure / maxPressure, 1);
      
      // Rainbow color gradient (blue -> cyan -> green -> yellow -> red)
      let r, g, b;
      
      if (normalizedPressure < 0.25) {
        // Blue to cyan
        r = 0;
        g = Math.round((normalizedPressure * 4) * 255);
        b = 255;
      } else if (normalizedPressure < 0.5) {
        // Cyan to green
        r = 0;
        g = 255;
        b = Math.round((1 - (normalizedPressure - 0.25) * 4) * 255);
      } else if (normalizedPressure < 0.75) {
        // Green to yellow
        r = Math.round(((normalizedPressure - 0.5) * 4) * 255);
        g = 255;
        b = 0;
      } else {
        // Yellow to red
        r = 255;
        g = Math.round((1 - (normalizedPressure - 0.75) * 4) * 255);
        b = 0;
      }
      
      colors[sensorId] = `rgb(${r}, ${g}, ${b})`;
    });
    
    return colors;
  }, [sensorData, maxPressure]);
  
  // Format a pressure value for display
  const formatPressure = (value: number) => {
    return value.toFixed(1);
  };

  // Determine which sensor map to use
  const sensorMap = side === 'left' ? SVG_TO_SENSOR_MAP_LEFT : SVG_TO_SENSOR_MAP_RIGHT;
  
  // Get the region for a sensor (considering custom assignments)
  const getSensorRegion = (sensorId: string) => {
    if (customSensorAssignments[sensorId]) {
      return customSensorAssignments[sensorId];
    }
    
    // Check default regions
    for (const [region, sensorIds] of Object.entries(defaultRegions)) {
      if (sensorIds.includes(sensorId)) {
        return region;
      }
    }
    
    return 'unknown';
  };
  
  // Get display name for a region
  const getRegionDisplayName = (regionKey: string) => {
    const displayNames: Record<string, string> = {
      heel: 'Heel',
      medialMidfoot: 'Medial Midfoot',
      lateralMidfoot: 'Lateral Midfoot',
      forefoot: 'Forefoot',
      toes: 'Toes',
      hallux: 'Hallux'
    };
    
    return displayNames[regionKey] || regionKey;
  };
  
  // Handle sensor click in edit mode
  const handleSensorClick = (sensorId: string) => {
    if (editMode && onSensorSelect) {
      onSensorSelect(sensorId);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 bg-card rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-medium">
        {side === 'left' ? 'Left' : 'Right'} Foot
        {editMode && <span className="ml-2 text-sm font-normal text-muted-foreground">(Edit Mode)</span>}
      </h3>
      
      <div className="relative w-[220px] h-[400px]">
        {/* Foot with individual sensors */}
        <svg 
          viewBox="0 0 296 918" 
          className={`w-full h-full`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render all sensors */}
          {side === 'left' ? (
            Object.entries(sensorData).map(([sensorId, pressure]) => {
              if (!sensorId.startsWith('R_')) return null;
              
              const isSelected = sensorId === selectedSensor;
              const region = getSensorRegion(sensorId);
              
              return (
                <path 
                  key={sensorId}
                  id={sensorId}
                  d={getSensorPath(sensorId, side)}
                  fill={sensorColors[sensorId] || 'rgba(0,0,0,0.1)'}
                  stroke={isSelected ? "rgba(255,0,0,0.8)" : "rgba(0,0,0,0.2)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  onClick={() => handleSensorClick(sensorId)}
                  className={editMode ? "cursor-pointer hover:stroke-primary hover:stroke-2" : ""}
                  data-region={region}
                >
                  <title>{`Sensor ${sensorMap[sensorId]}: ${formatPressure(pressure)} kPa (${getRegionDisplayName(region)})`}</title>
                </path>
              );
            })
          ) : (
            Object.entries(sensorData).map(([sensorId, pressure]) => {
              if (!sensorId.startsWith('L_')) return null;
              
              const isSelected = sensorId === selectedSensor;
              const region = getSensorRegion(sensorId);
              
              return (
                <path 
                  key={sensorId}
                  id={sensorId}
                  d={getSensorPath(sensorId, side)}
                  fill={sensorColors[sensorId] || 'rgba(0,0,0,0.1)'}
                  stroke={isSelected ? "rgba(255,0,0,0.8)" : "rgba(0,0,0,0.2)"}
                  strokeWidth={isSelected ? "2" : "1"}
                  onClick={() => handleSensorClick(sensorId)}
                  className={editMode ? "cursor-pointer hover:stroke-primary hover:stroke-2" : ""}
                  data-region={region}
                >
                  <title>{`Sensor ${sensorMap[sensorId]}: ${formatPressure(pressure)} kPa (${getRegionDisplayName(region)})`}</title>
                </path>
              );
            })
          )}
        </svg>
      </div>
      
      <div className="w-full">
        <div className="h-4 w-full rounded-md bg-gradient-to-r from-blue-600 via-green-500 to-red-600"></div>
        <div className="flex justify-between text-xs mt-1 text-muted-foreground">
          <span>0</span>
          <span>{(maxPressure * 0.5).toFixed(0)}</span>
          <span>{maxPressure.toFixed(0)} kPa</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 w-full text-sm">
        {Object.entries(footData).map(([region, data]) => {
          const displayNames: Record<string, string> = {
            heel: 'Heel',
            medialMidfoot: 'Medial Midfoot',
            lateralMidfoot: 'Lateral Midfoot',
            forefoot: 'Forefoot',
            toes: 'Toes',
            hallux: 'Hallux'
          };
          
          // Skip if this region data is missing
          if (!data) return null;
          
          return (
            <div key={region} className="flex justify-between">
              <span>{displayNames[region] || region}</span>
              <span className="font-mono">{formatPressure(data[mode])}</span>
            </div>
          );
        })}
      </div>
      
      {editMode && selectedSensor && (
        <div className="w-full p-2 bg-muted rounded-md text-sm">
          <p className="font-medium">Selected: {selectedSensor}</p>
          <p>Current Region: {getRegionDisplayName(getSensorRegion(selectedSensor))}</p>
          <p>Pressure: {formatPressure(sensorData[selectedSensor] || 0)} kPa</p>
        </div>
      )}
    </div>
  );
};

// Function to get the SVG path for a specific sensor ID
const getSensorPath = (sensorId: string, side: 'left' | 'right'): string => {
  // These are the SVG paths from the provided SVG files
  // For left foot
  const leftFootPaths: Record<string, string> = {
    'R_01': 'M146.156 835.994L157.411 900.097L172.188 888.656L180.622 875.759L186.604 862.297L186.607 862.29L186.611 862.283L193.099 848.808L198.325 835.507L146.156 835.994Z',
    'R_02': 'M119.613 836L127.493 916.268L141.849 910.046L155.508 902.729L144.139 836H119.613Z',
    'R_03': 'M94.5524 836.489L93.071 917H109.046L124.515 916.516L117.106 836.01L94.5524 836.489Z',
    'R_04': 'M64.029 837.5L59.5817 903.72L74.2722 912.045L82.1931 915.016L90.0729 916.405L91.5515 837.5H64.029Z',
    'R_05': 'M14.0231 844.81L17.5231 853.31L21.0143 861.786L25.4899 870.24L32.9587 881.691L41.9128 891.642L47.8552 896.593L54.3229 900.574L54.3259 900.576L57.613 902.63L61.5309 837.489L10.7985 836.514L14.0231 844.81Z',
    'R_06': 'M186.505 755.5L177.125 833.5H199.195L211.577 794.374L213.572 784.897L215.565 774.936L217.022 755.5H186.505Z',
    'R_07': 'M156.002 755.5L146.129 833.5H175.115L184.001 755.5H156.002Z',
    'R_08': 'M129.503 756.491L119.63 833.5H144.118L153.497 756.011L129.503 756.491Z',
    'R_09': 'M97.0456 757L94.5778 833.5H117.619L126.997 757H97.0456Z',
    'R_10': 'M65.5524 757.491L64.072 833.99L91.5768 833.508L94.0446 757.009L65.5524 757.491Z',
    'R_11': 'M32.6091 758L39.5182 834H61.571L63.0515 758H32.6091Z',
    'R_12': 'M2.54169 758.5L5.55829 796.447L7.55731 815.438L10.488 833.507L37.0085 833.989L29.6071 758.5H2.54169Z',
    'R_13': 'M191.528 681.5L186.597 753H217.091L221.529 681.5H191.528Z',
    'R_14': 'M161.528 682L156.598 753.49L183.597 753.008L189.021 682H161.528Z',
    'R_15': 'M130.057 682.5L129.565 753.989L154.094 753.509L159.025 682.5H130.057Z',
    'R_16': 'M97.0651 754.5H127.061L127.061 683.735L97.5583 683.504L97.0651 754.5Z',
    'R_17': 'M63.9743 684L65.5505 754.5H94.0681L95.0544 684H63.9743Z',
    'R_18': 'M34.5544 685L33.5681 755H63.0466L61.0749 685H34.5544Z',
    'R_19': 'M0.514648 685L2.48633 755H30.5713L31.9893 685H0.514648Z',
    'R_20': 'M197.518 612.5L191.609 678.99L221.6 678.507L227.019 612.5H197.518Z',
    'R_21': 'M163.05 613.5L161.573 680H189.093L193.527 613.5H163.05Z',
    'R_22': 'M132.051 614.483L130.573 680H158.568L159.554 613.518L132.051 614.483Z',
    'R_23': 'M102.522 614.5L97.1032 681.5H127.076L129.046 614.5H102.522Z',
    'R_24': 'M69.5231 615.992L64.1052 681.99L94.1042 681.507L100.014 615.509L69.5231 615.992Z',
    'R_25': 'M36.0505 616L34.5729 683H61.1003L66.5192 616H36.0505Z',
    'R_26': 'M2.05042 616L0.572876 683H32.0719L33.5494 616H2.05042Z',
    'R_27': 'M227.061 594.484L228.062 578.469L228.063 578.455L229.563 561.955L229.564 561.939L229.567 561.925L231.979 546.009L201.525 546.492L196.6 610.5H227.061V594.484Z',
    'R_28': 'M167.028 547L162.598 610.991L193.094 610.507L197.525 547H167.028Z',
    'R_29': 'M136.032 547L132.093 611.49L159.594 611.008L164.025 547H136.032Z',
    'R_30': 'M103.557 548L103.065 611.5H129.08L131.541 548H103.557Z',
    'R_31': 'M71.0534 548.5L70.069 612.5H99.5612L99.5612 548.5H71.0534Z',
    'R_32': 'M38.5534 549.5L37.569 613.5H67.5612L67.5612 549.5H38.5534Z',
    'R_33': 'M3.54944 549.5L2.07288 613.5H34.5651L35.0573 549.5H3.54944Z',
    'R_34': 'M206.522 479.491L201.106 543.99L231.08 543.507L233.542 479.009L206.522 479.491Z',
    'R_35': 'M173.019 479.492L167.11 544.49L197.597 544.007L202.521 479.009L173.019 479.492Z',
    'R_36': 'M140.53 480.485L136.098 544.99L164.107 544.507L170.508 479.518L140.53 480.485Z',
    'R_37': 'M106.547 480.992L104.577 545H133.091L137.03 480.508L106.547 480.992Z',
    'R_38': 'M72.5533 482L71.569 546H101.061L101.061 482H72.5533Z',
    'R_39': 'M39.5534 482L38.569 546H68.5612L68.5612 482H39.5534Z',
    'R_40': 'M5.04944 482L3.57288 546H36.0651L36.5573 482H5.04944Z',
    'R_41': 'M208.532 419L205.092 476H233.591L237.03 419H208.532Z',
    'R_42': 'M176.541 419.991L174.084 476H202.091L205.53 419.509L176.541 419.991Z',
    'R_43': 'M142.049 421.478L140.576 477.475L171.087 476.022L174.034 420.023L142.049 421.478Z',
    'R_44': 'M110.536 421.5L107.589 478.481L136.574 477.516L138.048 421.5H110.536Z',
    'R_45': 'M75.5486 421.5L74.074 480H104.578L106.544 421.5H75.5486Z',
    'R_46': 'M41.5486 421.5L40.0739 480H70.5779L72.5437 421.5H41.5486Z',
    'R_47': 'M6.54846 421.5L5.07385 480H36.569L37.5524 421.5H6.54846Z',
    'R_48': 'M226.938 358L210.72 416H236.727L260.812 358H226.938Z',
    'R_49': 'M191.96 359L179.184 416H207.684L223.9 359H191.96Z',
    'R_50': 'M155.955 359L142.199 416.98L175.655 416.011L187.941 359H155.955Z',
    'R_51': 'M122.471 360L110.673 418.5H138.165L151.929 360H122.471Z',
    'R_52': 'M85.9891 360L76.6473 419H107.644L118.461 360H85.9891Z',
    'R_53': 'M46.0241 360.993L41.6013 419H72.6316L81.4792 360.508L46.0241 360.993Z',
    'R_54': 'M8.05049 361L7.07002 418.508L38.0983 418.992L42.5212 361H8.05049Z',
    'R_55': 'M243.445 307.5L230.71 355.5H262.675L275.409 307.5H243.445Z',
    'R_56': 'M204.955 307.5L193.691 355.5H226.171L238.416 307.5H204.955Z',
    'R_57': 'M163.985 307.5L156.148 355.991L189.658 355.505L200.435 307.5H163.985Z',
    'R_58': 'M127.521 307.5L123.602 356H152.134L159.973 307.5H127.521Z',
    'R_59': 'M89.5303 307.5L86.5918 356.983L119.093 356.012L122.523 307.5H89.5303Z',
    'R_60': 'M51.5095 307.497L46.1179 357.492L81.7937 357.003L85.7146 307.497H51.5095Z',
    'R_61': 'M9.55495 307.5L9.06569 357.992L43.093 357.506L46.5237 307.5H9.55495Z',
    'R_62': 'M252.978 256.484L244.165 302.5H276.666L287.922 255.027L252.978 256.484Z',
    'R_63': 'M211.988 256.5L204.647 302.5H240.148L248.957 256.5H211.988Z',
    'R_64': 'M172.986 258.477L165.16 303.974L200.64 302.516L208.956 256.532L172.986 258.477Z',
    'R_65': 'M133.488 259.488L126.151 304.491L161.635 304.005L168.971 258.516L133.488 259.488Z',
    'R_66': 'M90.715 259.5L89.5724 304.5H122.636L130.138 259.5H90.715Z',
    'R_67': 'M52.0544 260.5L51.5661 304.992L85.5622 304.507L85.7536 260.5H52.0544Z',
    'R_68': 'M10.5504 260.5L9.57088 305.49L47.0719 305.006L48.0504 260.5H10.5504Z',
    'R_69': 'M260.986 206.487L253.154 252.5H288.125L294.487 205.517L260.986 206.487Z',
    'R_70': 'M219.497 206.5L213.134 252.5H249.134L256.474 206.5H219.497Z',
    'R_71': 'M177.517 206.5L173.112 253.977L209.128 252.518L215.982 206.5H177.517Z',
    'R_72': 'M138.028 207.982L134.601 254.984L169.6 254.012L173.517 206.523L138.028 207.982Z',
    'R_73': 'M98.9838 209.483L90.8266 255.982L131.095 255.011L134.522 208.023L98.9838 209.483Z',
    'R_74': 'M59.9838 209.5L52.1518 255.997H87.143L95.4633 209.5H59.9838Z',
    'R_75': 'M20.0064 209.5L14.5523 232.598L10.649 256.5H48.1421L56.4654 209.5H20.0064Z',
    'R_76': 'M260.061 156.492V201.992L294.55 201.507L293.572 156.007L260.061 156.492Z',
    'R_77': 'M223.959 156.5L221.558 167.068L221.061 178.521V178.522L221.06 178.532L219.595 201H256.561V156.5H223.959Z',
    'R_78': 'M184.484 156.988L182.553 168.086L180.557 179.564L177.633 202.409L216.102 200.522L220.014 156.015L184.484 156.988Z',
    'R_79': 'M145.488 157L138.15 203.483L174.249 202.45L180.61 157H145.488Z',
    'R_80': 'M108.468 159.98L103.552 182.593V182.594L99.1654 205.5H134.628L141.479 158.526L108.468 159.98Z',
    'R_81': 'M72.9238 159.997L65.5458 182.624L60.1884 206H97.1405L105.162 159.997H72.9238Z',
    'R_82': 'M33.912 159.5L25.5399 182.648L19.701 206H57.1747L69.2616 159.5H33.912Z',
    'R_83': 'M259.072 105L260.051 152.5H293.495L292.068 141.082L290.068 129.082L288.072 117.101L285.167 105H259.072Z',
    'R_84': 'M223.061 105V152.5H256.561V105H223.061Z',
    'R_85': 'M188.522 106.492L184.606 153.485L220.061 152.513V106.008L188.522 106.492Z',
    'R_86': 'M171.336 107.249L156.96 107.98L145.7 154.49L180.732 154.006L185.506 106.528L171.336 107.249Z',
    'R_87': 'M122.439 108.983L108.733 155.489L141.665 155.005L152.922 108.021L122.439 108.983Z',
    'R_88': 'M87.432 108.995L73.2338 156H105.384L119.39 108.995H87.432Z',
    'R_89': 'M57.3735 109.5L46.0102 132.72L35.8257 156H70.6792L83.4057 109.5H57.3735Z',
    'R_90': 'M242.177 57L251.466 101H283.467L281.575 90.1191L278.081 78.1396L278.082 78.1386L274.582 66.6455L271.207 57L242.177 57Z',
    'R_91': 'M213.544 57.7031L211.956 101.985L247.461 101.016L239.149 57.0107L213.544 57.7031Z',
    'R_92': 'M181.642 57.9948L177.61 102.983L209.081 102.014L210.916 57.7204L181.642 57.9948Z',
    'R_93': 'M146.488 58.0001L139.151 103.984L174.606 103.012L179.009 58.0001L146.488 58.0001Z',
    'R_94': 'M115.438 59.5L102.724 104H135.141L142.965 59.5H115.438Z',
    'R_95': 'M92.3207 59.5L76.9701 81.2881L60.517 105H98.6928L112.881 59.5H92.3207Z',
    'R_96': 'M213.165 55.5L269.207 55.5L260.651 40.2881L249.679 27.3232L249.68 27.3223L244.691 21.8359L244.692 21.835L239.226 15.875L222.908 4.35547L213.165 55.5Z',
    'R_97': 'M199.582 0.5L192.976 0.97168L181.797 55.5L211.019 55.5L220.484 2.8877L213.975 1.49219L209.998 0.996094L209.991 0.995117L206.525 0.5L199.582 0.5Z',
    'R_98': 'M181.22 1L173.654 1.99219L165.735 3.97168L159.994 6.84277L148.197 55.5L178.647 55.5L188.957 1L181.22 1Z',
    'R_99': 'M137.294 16.9424L126.347 23.4111L118.398 29.8701L111.914 36.3535L105.455 43.3105L96.0346 56.7012L143.173 56.0049L155.796 7.4541L137.294 16.9424Z'
  };

  // For right foot
  const rightFootPaths: Record<string, string> = {
    'L_01': 'M148.905 835.994L137.65 900.097L122.873 888.656L114.439 875.759L108.457 862.297L108.454 862.29L108.45 862.283L101.962 848.808L96.7362 835.507L148.905 835.994Z',
    'L_02': 'M175.448 836L167.568 916.268L153.212 910.046L139.553 902.729L150.922 836H175.448Z',
    'L_03': 'M200.509 836.489L201.99 917H186.016L170.546 916.516L177.955 836.01L200.509 836.489Z',
    'L_04': 'M231.032 837.5L235.479 903.72L220.789 912.045L212.868 915.016L204.988 916.405L203.51 837.5H231.032Z',
    'L_05': 'M281.038 844.81L277.538 853.31L274.047 861.786L269.571 870.24L262.102 881.691L253.148 891.642L247.206 896.593L240.738 900.574L240.735 900.576L237.448 902.63L233.53 837.489L284.263 836.514L281.038 844.81Z',
    'L_06': 'M108.557 755.5L117.936 833.5H95.8661L83.4843 794.374L81.4891 784.897L79.496 774.936L78.0389 755.5H108.557Z',
    'L_07': 'M139.059 755.5L148.932 833.5H119.946L111.06 755.5H139.059Z',
    'L_08': 'M165.558 756.491L175.432 833.5H150.943L141.564 756.011L165.558 756.491Z',
    'L_09': 'M198.016 757L200.483 833.5H177.442L168.064 757H198.016Z',
    'L_10': 'M229.509 757.491L230.989 833.99L203.484 833.508L201.016 757.009L229.509 757.491Z',
    'L_11': 'M262.452 758L255.543 834H233.49L232.01 758H262.452Z',
    'L_12': 'M292.519 758.5L289.503 796.447L287.504 815.438L284.573 833.507L258.053 833.989L265.454 758.5H292.519Z',
    'L_13': 'M103.533 681.5L108.464 753H77.9696L73.5321 681.5H103.533Z',
    'L_14': 'M133.533 682L138.463 753.49L111.464 753.008L106.04 682H133.533Z',
    'L_15': 'M165.004 682.5L165.496 753.989L140.967 753.509L136.036 682.5H165.004Z',
    'L_16': 'M197.996 754.5H168V683.735L197.503 683.504L197.996 754.5Z',
    'L_17': 'M231.087 684L229.511 754.5H200.993L200.007 684H231.087Z',
    'L_18': 'M260.507 685L261.493 755H232.015L233.986 685H260.507Z',
    'L_19': 'M294.546 685L292.575 755H264.49L263.072 685H294.546Z',
    'L_20': 'M97.5428 612.5L103.452 678.99L73.4608 678.507L68.0419 612.5H97.5428Z',
    'L_21': 'M132.011 613.5L133.488 680H105.968L101.534 613.5H132.011Z',
    'L_22': 'M163.01 614.483L164.488 680H136.493L135.507 613.518L163.01 614.483Z',
    'L_23': 'M192.539 614.5L197.958 681.5H167.985L166.016 614.5H192.539Z',
    'L_24': 'M225.538 615.992L230.956 681.99L200.957 681.507L195.047 615.509L225.538 615.992Z',
    'L_25': 'M259.011 616L260.488 683H233.961L228.542 616H259.011Z',
    'L_26': 'M293.011 616L294.488 683H262.989L261.512 616H293.011Z',
    'L_27': 'M67.9999 594.484L66.9989 578.469L66.9979 578.455L65.4979 561.955L65.4969 561.939L65.494 561.925L63.0819 546.009L93.536 546.492L98.4608 610.5H67.9999V594.484Z',
    'L_28': 'M128.033 547L132.463 610.991L101.967 610.507L97.536 547H128.033Z',
    'L_29': 'M159.029 547L162.968 611.49L135.467 611.008L131.036 547H159.029Z',
    'L_30': 'M191.504 548L191.996 611.5H165.981L163.52 548H191.504Z',
    'L_31': 'M224.008 548.5L224.992 612.5H195.5V548.5H224.008Z',
    'L_32': 'M256.508 549.5L257.492 613.5H227.5V549.5H256.508Z',
    'L_33': 'M291.512 549.5L292.988 613.5H260.496L260.004 549.5H291.512Z',
    'L_34': 'M88.5389 479.491L93.955 543.99L63.9813 543.507L61.5194 479.009L88.5389 479.491Z',
    'L_35': 'M122.042 479.492L127.951 544.49L97.4637 544.007L92.5399 479.009L122.042 479.492Z',
    'L_36': 'M154.531 480.485L158.963 544.99L130.954 544.507L124.554 479.518L154.531 480.485Z',
    'L_37': 'M188.515 480.992L190.484 545H161.971L158.031 480.508L188.515 480.992Z',
    'L_38': 'M222.508 482L223.492 546H194V482H222.508Z',
    'L_39': 'M255.508 482L256.492 546H226.5V482H255.508Z',
    'L_40': 'M290.012 482L291.488 546H258.996L258.504 482H290.012Z',
    'L_41': 'M86.5292 419L89.9686 476H61.4706L58.0311 419H86.5292Z',
    'L_42': 'M118.52 419.991L120.977 476H92.9706L89.5311 419.509L118.52 419.991Z',
    'L_43': 'M153.012 421.478L154.485 477.475L123.974 476.022L121.027 420.023L153.012 421.478Z',
    'L_44': 'M184.525 421.5L187.472 478.481L158.487 477.516L157.013 421.5H184.525Z',
    'L_45': 'M219.512 421.5L220.987 480H190.483L188.517 421.5H219.512Z',
    'L_46': 'M253.513 421.5L254.987 480H224.483L222.517 421.5H253.513Z',
    'L_47': 'M288.513 421.5L289.987 480H258.492L257.509 421.5H288.513Z',
    'L_48': 'M68.1228 358L84.3406 416H58.3337L34.2488 358H68.1228Z',
    'L_49': 'M103.101 359L115.877 416H87.3767L71.1609 359H103.101Z',
    'L_50': 'M139.106 359L152.862 416.98L119.406 416.011L107.12 359H139.106Z',
    'L_51': 'M172.59 360L184.388 418.5H156.896L143.132 360H172.59Z',
    'L_52': 'M209.072 360L218.414 419H187.417L176.6 360H209.072Z',
    'L_53': 'M249.037 360.993L253.46 419H222.43L213.582 360.508L249.037 360.993Z',
    'L_54': 'M287.011 361L287.991 418.508L256.963 418.992L252.54 361H287.011Z',
    'L_55': 'M51.6166 307.5L64.351 355.5H32.3861L19.6517 307.5H51.6166Z',
    'L_56': 'M90.106 307.5L101.371 355.5H68.8901L56.645 307.5H90.106Z',
    'L_57': 'M131.076 307.5L138.913 355.991L105.403 355.505L94.6265 307.5H131.076Z',
    'L_58': 'M167.541 307.5L171.459 356H142.927L135.088 307.5H167.541Z',
    'L_59': 'M205.531 307.5L208.469 356.983L175.968 356.012L172.539 307.5H205.531Z',
    'L_60': 'M243.552 307.497L248.943 357.492L213.267 357.003L209.347 307.497H243.552Z',
    'L_61': 'M285.506 307.5L285.995 357.992L251.968 357.506L248.537 307.5H285.506Z',
    'L_62': 'M42.083 256.484L50.8965 302.5H18.3955L7.13867 255.027L42.083 256.484Z',
    'L_63': 'M83.0734 256.5L90.4142 302.5H54.9132L46.1046 256.5H83.0734Z',
    'L_64': 'M122.075 258.477L129.902 303.974L94.4211 302.516L86.1047 256.532L122.075 258.477Z',
    'L_65': 'M161.573 259.488L168.91 304.491L133.427 304.005L126.09 258.516L161.573 259.488Z',
    'L_66': 'M204.346 259.5L205.489 304.5H172.425L164.923 259.5H204.346Z',
    'L_67': 'M243.007 260.5L243.495 304.992L209.499 304.507L209.307 260.5H243.007Z',
    'L_68': 'M284.511 260.5L285.49 305.49L247.989 305.006L247.011 260.5H284.511Z',
    'L_69': 'M34.0752 206.487L41.9072 252.5H6.93652L0.574219 205.517L34.0752 206.487Z',
    'L_70': 'M75.5646 206.5L81.9269 252.5H45.9269L38.587 206.5H75.5646Z',
    'L_71': 'M117.544 206.5L121.949 253.977L85.9329 252.518L79.0793 206.5H117.544Z',
    'L_72': 'M157.033 207.982L160.46 254.984L125.461 254.012L121.544 206.523L157.033 207.982Z',
    'L_73': 'M196.077 209.483L204.234 255.982L163.966 255.011L160.539 208.023L196.077 209.483Z',
    'L_74': 'M235.077 209.5L242.909 255.997H207.918L199.598 209.5H235.077Z',
    'L_75': 'M275.055 209.5L280.509 232.598L284.412 256.5H246.919L238.596 209.5H275.055Z',
    'L_76': 'M35 156.492V201.992L0.510742 201.507L1.48926 156.007L35 156.492Z',
    'L_77': 'M71.1017 156.5L73.5031 167.068L74.0001 178.521V178.522L74.0011 178.532L75.4659 201H38.5001V156.5H71.1017Z',
    'L_78': 'M110.577 156.988L112.508 168.086L114.504 179.564L117.428 202.409L78.9591 200.522L75.047 156.015L110.577 156.988Z',
    'L_79': 'M149.573 157L156.911 203.483L120.812 202.45L114.452 157H149.573Z',
    'L_80': 'M186.593 159.98L191.509 182.593V182.594L195.896 205.5H160.433L153.582 158.526L186.593 159.98Z',
    'L_81': 'M222.137 159.997L229.515 182.624L234.873 206H197.921L189.899 159.997H222.137Z',
    'L_82': 'M261.149 159.5L269.521 182.648L275.36 206H237.886L225.8 159.5H261.149Z',
    'L_83': 'M35.9893 105L35.0098 152.5H1.56641L2.99316 141.082L4.99316 129.082L6.98926 117.101L9.89453 105H35.9893Z',
    'L_84': 'M72.0001 105V152.5H38.5001V105H72.0001Z',
    'L_85': 'M106.539 106.492L110.455 153.485L75.0001 152.513V106.008L106.539 106.492Z',
    'L_86': 'M123.725 107.249L138.101 107.98L149.361 154.49L114.329 154.006L109.555 106.528L123.725 107.249Z',
    'L_87': 'M172.622 108.983L186.328 155.489L153.396 155.005L142.139 108.021L172.622 108.983Z',
    'L_88': 'M207.629 108.995L221.827 156H189.677L175.671 108.995H207.629Z',
    'L_89': 'M237.688 109.5L249.051 132.72L259.235 156H224.382L211.655 109.5H237.688Z',
    'L_90': 'M52.8839 57L43.5948 101H11.5939L13.4865 90.1191L16.9806 78.1396L16.9796 78.1386L20.4786 66.6455L23.8546 57H52.8839Z',
    'L_91': 'M81.5167 57.7031L83.1046 101.985L47.5997 101.016L55.9122 57.0107L81.5167 57.7031Z',
    'L_92': 'M113.419 57.9948L117.451 102.983L85.9803 102.014L84.1454 57.7204L113.419 57.9948Z',
    'L_93': 'M148.573 58.0001L155.91 103.984L120.455 103.012L116.052 58.0001H148.573Z',
    'L_94': 'M179.623 59.5L192.337 104H159.92L152.096 59.5H179.623Z',
    'L_95': 'M202.74 59.5L218.091 81.2881L234.544 105H196.368L182.18 59.5H202.74Z',
    'L_96': 'M81.8956 55.5H25.8546L34.4103 40.2881L45.382 27.3232L45.381 27.3223L50.3702 21.8359L50.3693 21.835L55.8351 15.875L72.1534 4.35547L81.8956 55.5Z',
    'L_97': 'M95.4786 0.5L102.085 0.97168L113.264 55.5H84.0421L74.5773 2.8877L81.0861 1.49219L85.0626 0.996094L85.0704 0.995117L88.5363 0.5H95.4786Z',
    'L_98': 'M113.841 1L121.407 1.99219L129.326 3.97168L135.068 6.84277L146.864 55.5H116.414L106.104 1H113.841Z',
    'L_99': 'M157.767 16.9424L168.714 23.4111L176.663 29.8701L183.147 36.3535L189.607 43.3105L199.026 56.7012L151.888 56.0049L139.265 7.4541L157.767 16.9424Z'
  };

  // Determine which set of paths to use based on the foot side
  const paths = side === 'left' ? leftFootPaths : rightFootPaths;
  
  // Return the path for the specified sensor ID
  return paths[sensorId] || '';
};

export default PressureHeatMap;
