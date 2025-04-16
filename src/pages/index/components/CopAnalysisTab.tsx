
import React from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import CopTrajectoryVisualization from '@/components/CopTrajectoryVisualization';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart2, AlertTriangle } from 'lucide-react';

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
  
  // Check if COP data is available
  if (!data.stancePhases || data.stancePhases.length === 0) {
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

  // Check if there are too many stance phases for efficient rendering
  const hasTooManyPhases = data.stancePhases.length > 1000;
  
  return (
    <div className="space-y-6">
      {hasTooManyPhases && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Large Dataset Detected</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Your dataset contains a large number of stance phases ({data.stancePhases.length}). 
                  For better performance, only phases close to the current time will be displayed.
                  Use the time slider to navigate through your data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <CopTrajectoryVisualization 
        stancePhases={data.stancePhases}
        currentTime={currentTime}
      />
    </div>
  );
};

export default CopAnalysisTab;
