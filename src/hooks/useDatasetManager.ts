import { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';

export const useDatasetManager = () => {
  const [datasets, setDatasets] = useState<ProcessedData[]>([]);
  const [activeDatasetIndex, setActiveDatasetIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Current active dataset
  const data = datasets.length > 0 ? datasets[activeDatasetIndex] : null;
  
  // Handle new data processed and added to datasets
  const handleDataProcessed = (newData: ProcessedData) => {
    setDatasets(prevDatasets => {
      const newDatasets = [...prevDatasets, newData];
      setActiveDatasetIndex(newDatasets.length - 1);
      return newDatasets;
    });
    setIsProcessing(false);
  };
  
  // Apply a filter to the current dataset
  const handleFilterApplied = (filteredData: ProcessedData) => {
    setDatasets(prevDatasets => {
      const newDatasets = [...prevDatasets];
      newDatasets[activeDatasetIndex] = filteredData;
      return newDatasets;
    });
  };
  
  // Reset the current active dataset to its original state
  const handleResetData = () => {
    // No-op in this version since we don't have filtering functionality
  };
  
  // Change the active dataset
  const handleDatasetChange = (index: number) => {
    if (index >= 0 && index < datasets.length) {
      setActiveDatasetIndex(index);
    }
  };
  
  // Remove a dataset
  const handleRemoveDataset = (index: number) => {
    setDatasets(prevDatasets => {
      const newDatasets = [...prevDatasets];
      newDatasets.splice(index, 1);
      
      // If no datasets left
      if (newDatasets.length === 0) {
        setActiveDatasetIndex(0);
        return [];
      }
      
      // Adjust active index if needed
      if (index <= activeDatasetIndex) {
        setActiveDatasetIndex(Math.max(0, activeDatasetIndex - 1));
      }
      
      return newDatasets;
    });
  };
  
  // Reset all data and start over
  const resetAllData = () => {
    setDatasets([]);
    setActiveDatasetIndex(0);
    setIsProcessing(false);
  };
  
  return {
    data,
    datasets,
    activeDatasetIndex,
    isProcessing,
    setIsProcessing,
    handleDataProcessed,
    handleFilterApplied,
    handleResetData,
    handleDatasetChange,
    handleRemoveDataset,
    resetAllData
  };
};
