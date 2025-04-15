
import { useState, useCallback } from 'react';
import { ProcessedData, processCopForceData, mergeData } from '@/utils/pressureDataProcessor';
import { useToast } from "@/hooks/use-toast";

export const useDatasetManager = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalData, setOriginalData] = useState<ProcessedData | null>(null);
  const [data, setData] = useState<ProcessedData | null>(null);
  const [datasets, setDatasets] = useState<ProcessedData[]>([]);
  const [activeDatasetIndex, setActiveDatasetIndex] = useState<number>(0);
  const [copFile, setCopFile] = useState<File | null>(null);
  
  const handleDataProcessed = useCallback(async (processedData: ProcessedData) => {
    if (copFile) {
      try {
        setIsProcessing(true);
        
        const copForceData = await processCopForceData(copFile);
        
        const mergedData = mergeData(processedData, copForceData);
        
        setDatasets(prev => [...prev, mergedData]);
        setActiveDatasetIndex(datasets.length);
        
        setData(mergedData);
        setOriginalData(JSON.parse(JSON.stringify(mergedData)));
        
        toast({
          title: "Data loaded successfully",
          description: `Processed ${mergedData.pressureData.length} data points with COP data`,
          duration: 3000,
        });
        
        setCopFile(null);
      } catch (error) {
        console.error('Error processing COP data:', error);
        toast({
          title: "Error processing COP data",
          description: String(error),
          variant: "destructive",
          duration: 5000,
        });
        
        setDatasets(prev => [...prev, processedData]);
        setActiveDatasetIndex(datasets.length);
        setData(processedData);
        setOriginalData(JSON.parse(JSON.stringify(processedData)));
      } finally {
        setIsProcessing(false);
      }
    } else {
      setDatasets(prev => [...prev, processedData]);
      setActiveDatasetIndex(datasets.length);
      setData(processedData);
      setOriginalData(JSON.parse(JSON.stringify(processedData)));
      
      toast({
        title: "Data loaded successfully",
        description: `Processed ${processedData.pressureData.length} data points`,
        duration: 3000,
      });
    }
  }, [copFile, datasets.length, toast]);
  
  const handleCopFileSelected = useCallback((file: File) => {
    if (file.name.toLowerCase().includes('fgt') || file.name.toLowerCase().includes('cop')) {
      setCopFile(file);
      toast({
        title: "COP/Force file selected",
        description: `File "${file.name}" will be processed with the next pressure data file`,
        duration: 3000,
      });
    } else {
      toast({
        title: "Invalid COP/Force file",
        description: "The file doesn't appear to be a FGT/COP data file. The filename should contain 'FGT' or 'COP'.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);
  
  const handleFilterApplied = useCallback((filteredData: ProcessedData) => {
    setData(filteredData);
    
    setDatasets(prev => {
      const newDatasets = [...prev];
      newDatasets[activeDatasetIndex] = filteredData;
      return newDatasets;
    });
    
    toast({
      title: "Filter applied",
      description: "Data has been filtered",
      duration: 3000,
    });
  }, [activeDatasetIndex, toast]);
  
  const handleResetData = useCallback(() => {
    if (originalData) {
      const resetData = JSON.parse(JSON.stringify(originalData));
      setData(resetData);
      
      setDatasets(prev => {
        const newDatasets = [...prev];
        newDatasets[activeDatasetIndex] = resetData;
        return newDatasets;
      });
      
      toast({
        title: "Data reset",
        description: "Returned to original unfiltered data",
        duration: 3000,
      });
    }
  }, [originalData, activeDatasetIndex, toast]);
  
  const handleDatasetChange = useCallback((index: number) => {
    if (index >= 0 && index < datasets.length) {
      setActiveDatasetIndex(index);
      setData(datasets[index]);
      setOriginalData(JSON.parse(JSON.stringify(datasets[index])));
    }
  }, [datasets]);
  
  const handleRemoveDataset = useCallback((index: number) => {
    if (datasets.length <= 1) {
      setDatasets([]);
      setData(null);
      setOriginalData(null);
      setActiveDatasetIndex(0);
      return;
    }
    
    const newDatasets = datasets.filter((_, i) => i !== index);
    setDatasets(newDatasets);
    
    if (index === activeDatasetIndex) {
      const newIndex = Math.max(0, index - 1);
      setActiveDatasetIndex(newIndex);
      setData(newDatasets[newIndex]);
      setOriginalData(JSON.parse(JSON.stringify(newDatasets[newIndex])));
    } else if (index < activeDatasetIndex) {
      setActiveDatasetIndex(activeDatasetIndex - 1);
    }
  }, [datasets, activeDatasetIndex]);
  
  const resetAllData = useCallback(() => {
    setDatasets([]);
    setData(null);
    setOriginalData(null);
    setCopFile(null);
  }, []);
  
  return {
    data,
    datasets,
    activeDatasetIndex,
    isProcessing,
    setIsProcessing,
    copFile,
    handleDataProcessed,
    handleCopFileSelected,
    handleFilterApplied,
    handleResetData,
    handleDatasetChange,
    handleRemoveDataset,
    resetAllData
  };
};
