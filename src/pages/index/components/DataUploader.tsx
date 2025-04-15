
import React, { useState } from 'react';
import PressureDataUploader from '@/components/PressureDataUploader';
import { FileBarChart2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProcessedData } from '@/utils/pressureDataProcessor';

interface DataUploaderProps {
  onDataProcessed: (data: ProcessedData) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  copFile: File | null;
  onCopFileSelected: (file: File) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({
  onDataProcessed,
  isProcessing,
  setIsProcessing,
  copFile,
  onCopFileSelected
}) => {
  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">COP/Force File (Optional)</h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload an FGT.xlsx file containing COP and force data for enhanced analysis.
              The file should have columns for time, left/right force, and left/right COP X/Y coordinates.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
              {copFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileBarChart2 className="h-6 w-6 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium">{copFile.name}</p>
                      <p className="text-xs text-gray-500">COP/Force file selected</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCopFileSelected(null as any)} // Clearing the file
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-1">Remove</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FileBarChart2 className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Drag and drop an FGT.xlsx file or click to browse</p>
                  <p className="text-xs text-gray-500 mb-2">
                    File should contain columns for time, left/right force, and left/right COP X/Y coordinates
                  </p>
                  <input
                    type="file"
                    accept=".xlsx"
                    className="hidden"
                    id="cop-file-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        onCopFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="cop-file-input">
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <span>Select COP File</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <PressureDataUploader 
            onDataProcessed={onDataProcessed} 
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DataUploader;
