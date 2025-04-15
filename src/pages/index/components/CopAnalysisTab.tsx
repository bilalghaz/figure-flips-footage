
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import CopTrajectoryVisualization from '@/components/CopTrajectoryVisualization';
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
  
  if (!data.stancePhases) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center text-center">
              <FileBarChart2 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">COP Data Not Available</h3>
              <p className="text-gray-500 mb-4 max-w-lg">
                To analyze Center of Pressure (COP) trajectories, you need to upload both a pressure data file and a corresponding FGT.xlsx file containing COP and force data.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onUploadNewData}
              >
                Upload New Data With COP File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <CopTrajectoryVisualization 
        stancePhases={data.stancePhases}
        currentTime={currentTime}
      />
    </div>
  );
};

export default CopAnalysisTab;
