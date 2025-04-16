
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserControlPanelProps {
  data: ProcessedData | null;
  currentTime: number;
  onFilter: (filteredData: ProcessedData) => void;
  onExport: () => void;
  isProcessing: boolean;
  onReset: () => void;
}

const UserControlPanel: React.FC<UserControlPanelProps> = ({
  data,
  currentTime,
  onFilter,
  onExport,
  isProcessing,
  onReset
}) => {
  if (!data) return null;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          Time: {currentTime.toFixed(2)}s
        </Badge>
        
        {data?.fileName && (
          <Badge variant="outline">
            File: {data.fileName}
          </Badge>
        )}
        
        {data?.participantId && (
          <Badge variant="outline">
            ID: {data.participantId}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={isProcessing}
        >
          Export Current Frame
        </Button>
      </div>
    </div>
  );
};

export default UserControlPanel;
