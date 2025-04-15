
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import DatasetComparison from '@/components/DatasetComparison';

interface ComparisonTabProps {
  datasets: ProcessedData[];
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ datasets }) => {
  return (
    <div className="space-y-6">
      <DatasetComparison datasets={datasets} />
    </div>
  );
};

export default ComparisonTab;
