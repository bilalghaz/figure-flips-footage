
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Trash2 } from 'lucide-react';

interface DatasetSelectorProps {
  datasets: ProcessedData[];
  activeDatasetIndex: number;
  onDatasetChange: (index: number) => void;
  onRemoveDataset: (index: number) => void;
  onCompareDatasets: () => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  activeDatasetIndex,
  onDatasetChange,
  onRemoveDataset,
  onCompareDatasets
}) => {
  if (datasets.length <= 1) return null;
  
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {datasets.map((dataset, index) => (
        <Badge 
          key={index}
          variant={index === activeDatasetIndex ? "default" : "outline"}
          className="cursor-pointer flex items-center gap-1"
          onClick={() => onDatasetChange(index)}
        >
          <Database className="h-3 w-3 mr-1" />
          {dataset.participantId || dataset.fileName || `Dataset ${index + 1}`}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 ml-1 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveDataset(index);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs"
        onClick={onCompareDatasets}
      >
        Compare Datasets
      </Button>
    </div>
  );
};

export default DatasetSelector;
