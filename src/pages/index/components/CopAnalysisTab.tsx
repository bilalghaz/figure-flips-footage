
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart2 } from 'lucide-react';

interface CopAnalysisTabProps {
  data: ProcessedData | null;
  currentTime: number;
  onUploadNewData: () => void;
}

const CopAnalysisTab: React.FC<CopAnalysisTabProps> = ({ 
  data, 
  currentTime,
  onUploadNewData
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <FileBarChart2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Advanced Analysis</h3>
            <p className="text-gray-500 mb-4 max-w-lg">
              This feature has been simplified to focus on core plantar pressure visualization and analysis.
              COP (Center of Pressure) analysis is not available in this version.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onUploadNewData}
            >
              Upload New Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CopAnalysisTab;
