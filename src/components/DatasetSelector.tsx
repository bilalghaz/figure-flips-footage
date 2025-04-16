
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DatasetSelectorProps {
  datasets: ProcessedData[];
  activeDatasetIndex: number;
  onDatasetChange: (index: number) => void;
  onRemoveDataset: (index: number) => void;
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  datasets,
  activeDatasetIndex,
  onDatasetChange,
  onRemoveDataset
}) => {
  if (datasets.length <= 1) return null;
  
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm">Dataset:</span>
      <Select
        value={activeDatasetIndex.toString()}
        onValueChange={(value) => onDatasetChange(parseInt(value))}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select Dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets.map((dataset, index) => (
            <SelectItem key={index} value={index.toString()}>
              {dataset.fileName || `Dataset ${index + 1}`}
              {dataset.participantId && ` (${dataset.participantId})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onRemoveDataset(activeDatasetIndex)}
        title="Remove current dataset"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DatasetSelector;
