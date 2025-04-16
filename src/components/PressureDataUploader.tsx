
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');
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
    setUploadProgress(0);
    setProcessingStage('Reading file');
    
    try {
      // Simulate progress updates
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressTimer);
            return prev;
          }
          return prev + 5;
        });
      }, 300);
      
      // Process the file in chunks using a Web Worker if available
      // This uses setTimeout to allow the UI to update during processing
      setTimeout(async () => {
        try {
          setProcessingStage('Processing pressure data');
          const processedData = await processPressureData(file);
          
          clearInterval(progressTimer);
          setUploadProgress(100);
          setProcessingStage('Finalizing');
          
          // Short delay before completing to show 100% progress
          setTimeout(() => {
            onDataProcessed(processedData);
            toast({
              title: "Data Processed Successfully",
              description: `Loaded ${processedData.pressureData.length} data points`,
            });
            setProcessingStage('');
            setUploadProgress(0);
          }, 500);
        } catch (innerError) {
          console.error('Error in async processing:', innerError);
          clearInterval(progressTimer);
          handleProcessingError(innerError);
        }
      }, 100);
    } catch (error) {
      console.error('Error processing file:', error);
      handleProcessingError(error);
    }
  };
  
  const handleProcessingError = (error: any) => {
    setIsProcessing(false);
    setProcessingStage('');
    setUploadProgress(0);
    
    toast({
      title: "Processing Error",
      description: "There was an error processing your file. Please check the format and try again.",
      variant: "destructive"
    });
    
    console.error('Detailed error:', error);
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
          <p className="text-xs text-primary">
            Your M3 Pro MacBook is capable of processing large files efficiently
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
          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{processingStage}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
              <span>Processing may take longer for large files...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PressureDataUploader;
