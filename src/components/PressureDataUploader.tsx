
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { processPressureData, ProcessedData } from '@/utils/pressureDataProcessor';
import { useToast } from '@/hooks/use-toast';

interface PressureDataUploaderProps {
  onDataProcessed: (data: ProcessedData) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const PressureDataUploader: React.FC<PressureDataUploaderProps> = ({ 
  onDataProcessed, 
  isProcessing,
  setIsProcessing
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = async (file: File) => {
    // Check if the file is an Excel file
    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an .xlsx file",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const processedData = await processPressureData(file);
      onDataProcessed(processedData);
      toast({
        title: "Data Processed Successfully",
        description: `Loaded ${processedData.pressureData.length} data points`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? 'border-primary bg-primary/10' : 'border-border'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadCloud className="h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload Plantar Pressure Data</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop your .xlsx file or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            File should be exported from Pedar-X In-Shoe Pressure Measurement System
          </p>
        </div>
        <div className="grid w-full max-w-sm gap-2">
          <Input
            id="file-upload"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="hidden"
          />
          <Button
            asChild
            variant="outline"
            disabled={isProcessing}
            className="w-full"
          >
            <label htmlFor="file-upload">
              {isProcessing ? "Processing..." : "Select File"}
            </label>
          </Button>
        </div>
        
        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground animate-pulse">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <span>Processing data...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressureDataUploader;
