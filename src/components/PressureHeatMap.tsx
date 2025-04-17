import React, { useMemo } from 'react';
import { PressureDataPoint, SVG_TO_SENSOR_MAP_LEFT, SVG_TO_SENSOR_MAP_RIGHT } from '@/utils/pressureDataProcessor';

interface PressureHeatMapProps {
  dataPoint: PressureDataPoint | null;
  side: 'left' | 'right';
  maxPressure: number;
  mode: 'peak' | 'mean';
}

const PressureHeatMap: React.FC<PressureHeatMapProps> = ({ 
  dataPoint, 
  side, 
  maxPressure,
  mode
}) => {
  // Handle empty data
  if (!dataPoint) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] bg-background border rounded-md p-4">
        <p className="text-muted-foreground text-center">No data available</p>
      </div>
    );
  }
  
  // Get foot data based on selected side
  const footData = side === 'left' ? dataPoint.leftFoot : dataPoint.rightFoot;
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
  
  return (
    <div className="flex flex-col items-center space-y-4 bg-card rounded-md p-4 shadow-sm">
      <h3 className="text-lg font-medium">
        {side === 'left' ? 'Left' : 'Right'} Foot
      </h3>
      
      <div className="relative w-[220px] h-[400px]">
        {/* Foot with individual sensors */}
        <svg 
          viewBox="0 0 296 918" 
          className={`w-full h-full`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Remove all text labels */}
          
          {/* Keep existing sensor rendering code */}
          {side === 'left' ? (
            Object.entries(sensorData).map(([sensorId, pressure]) => {
              if (!sensorId.startsWith('R_')) return null;
              
              return (
                <path 
                  key={sensorId}
                  id={sensorId}
                  d={getSensorPath(sensorId, side)}
                  fill={sensorColors[sensorId] || 'rgba(0,0,0,0.1)'}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                >
                  <title>{`Sensor ${sensorMap[sensorId]}: ${formatPressure(pressure)} kPa`}</title>
                </path>
              );
            })
          ) : (
            Object.entries(sensorData).map(([sensorId, pressure]) => {
              if (!sensorId.startsWith('L_')) return null;
              
              return (
                <path 
                  key={sensorId}
                  id={sensorId}
                  d={getSensorPath(sensorId, side)}
                  fill={sensorColors[sensorId] || 'rgba(0,0,0,0.1)'}
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="1"
                >
                  <title>{`Sensor ${sensorMap[sensorId]}: ${formatPressure(pressure)} kPa`}</title>
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
    'R_76': 'M260.061 156.492V201.992L294.55 201.507L293.572 156.007L260.061 156.
