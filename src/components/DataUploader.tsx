
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PressureDataUploader from '@/components/PressureDataUploader';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface DataUploaderProps {
  onDataProcessed: (data: ProcessedData) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({
  onDataProcessed,
  isProcessing,
  setIsProcessing
}) => {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="p-6">
        <PressureDataUploader
          onDataProcessed={onDataProcessed}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
        />
      </CardContent>
    </Card>
  );
};

export default DataUploader;
