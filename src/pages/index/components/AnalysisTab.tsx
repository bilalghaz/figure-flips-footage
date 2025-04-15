
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import AveragePressureHeatmap from '@/components/AveragePressureHeatmap';

interface AnalysisTabProps {
  data: ProcessedData | null;
  pressureMode: 'peak' | 'mean';
}

const AnalysisTab: React.FC<AnalysisTabProps> = ({ data, pressureMode }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <AveragePressureHeatmap 
        data={data}
        mode={pressureMode}
      />
    </div>
  );
};

export default AnalysisTab;
