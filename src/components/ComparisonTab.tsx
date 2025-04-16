
import React, { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparisonTabProps {
  datasets: ProcessedData[];
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({ datasets }) => {
  const [dataset1Index, setDataset1Index] = useState<number>(0);
  const [dataset2Index, setDataset2Index] = useState<number>(Math.min(1, datasets.length - 1));
  const [pressureMode, setPressureMode] = useState<'peak' | 'mean'>('peak');
  
  if (datasets.length < 2) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Comparison</h2>
            <p className="text-muted-foreground">
              Upload at least two datasets to compare them.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const dataset1 = datasets[dataset1Index];
  const dataset2 = datasets[dataset2Index];
  
  // Calculate average values for each region for both datasets
  const regions = ['heel', 'medialMidfoot', 'lateralMidfoot', 'forefoot', 'toes', 'hallux'];
  
  const calculateDatasetAverages = (dataset: ProcessedData) => {
    const leftAverages: Record<string, number> = {};
    const rightAverages: Record<string, number> = {};
    
    regions.forEach(region => {
      let leftSum = 0;
      let rightSum = 0;
      
      dataset.pressureData.forEach(point => {
        leftSum += point.leftFoot[region][pressureMode];
        rightSum += point.rightFoot[region][pressureMode];
      });
      
      leftAverages[region] = leftSum / dataset.pressureData.length;
      rightAverages[region] = rightSum / dataset.pressureData.length;
    });
    
    return { leftAverages, rightAverages };
  };
  
  const dataset1Averages = calculateDatasetAverages(dataset1);
  const dataset2Averages = calculateDatasetAverages(dataset2);
  
  // Calculate differences between the datasets
  const calculateDifferences = () => {
    const leftDifferences: Record<string, number> = {};
    const rightDifferences: Record<string, number> = {};
    const leftPercentDiff: Record<string, number> = {};
    const rightPercentDiff: Record<string, number> = {};
    
    regions.forEach(region => {
      leftDifferences[region] = dataset1Averages.leftAverages[region] - dataset2Averages.leftAverages[region];
      rightDifferences[region] = dataset1Averages.rightAverages[region] - dataset2Averages.rightAverages[region];
      
      // Percent differences (avoid division by zero)
      const leftAvg = (dataset1Averages.leftAverages[region] + dataset2Averages.leftAverages[region]) / 2;
      const rightAvg = (dataset1Averages.rightAverages[region] + dataset2Averages.rightAverages[region]) / 2;
      
      leftPercentDiff[region] = leftAvg > 0 ? (leftDifferences[region] / leftAvg) * 100 : 0;
      rightPercentDiff[region] = rightAvg > 0 ? (rightDifferences[region] / rightAvg) * 100 : 0;
    });
    
    return { leftDifferences, rightDifferences, leftPercentDiff, rightPercentDiff };
  };
  
  const differences = calculateDifferences();
  
  const getRegionName = (region: string) => {
    switch (region) {
      case 'heel': return 'Heel';
      case 'medialMidfoot': return 'Medial Midfoot';
      case 'lateralMidfoot': return 'Lateral Midfoot';
      case 'forefoot': return 'Forefoot';
      case 'toes': return 'Toes';
      case 'hallux': return 'Hallux';
      default: return region;
    }
  };
  
  // Function to get color based on difference value
  const getDifferenceColor = (value: number) => {
    // Normalize to a percentage
    const absValue = Math.abs(value);
    const opacity = Math.min(absValue / 30, 1);
    
    if (value > 0) {
      // Positive (red)
      return `rgba(220, 38, 38, ${opacity})`;
    } else {
      // Negative (blue)
      return `rgba(37, 99, 235, ${opacity})`;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dataset 1:</span>
            <Select
              value={dataset1Index.toString()}
              onValueChange={(value) => setDataset1Index(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {dataset.fileName || `Dataset ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Dataset 2:</span>
            <Select
              value={dataset2Index.toString()}
              onValueChange={(value) => setDataset2Index(parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map((dataset, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {dataset.fileName || `Dataset ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs 
          value={pressureMode}
          onValueChange={(value) => setPressureMode(value as 'peak' | 'mean')}
          className="w-[200px]"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="peak">Peak Pressure</TabsTrigger>
            <TabsTrigger value="mean">Mean Pressure</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Left Foot Comparison</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Region</th>
                <th className="text-right py-2">{dataset1.participantId || 'Dataset 1'}</th>
                <th className="text-right py-2">{dataset2.participantId || 'Dataset 2'}</th>
                <th className="text-right py-2">Difference</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(region => (
                <tr key={region} className="border-b">
                  <td className="py-2">{getRegionName(region)}</td>
                  <td className="text-right py-2">{dataset1Averages.leftAverages[region].toFixed(1)}</td>
                  <td className="text-right py-2">{dataset2Averages.leftAverages[region].toFixed(1)}</td>
                  <td 
                    className="text-right py-2" 
                    style={{ backgroundColor: getDifferenceColor(differences.leftPercentDiff[region]) }}
                  >
                    {differences.leftDifferences[region].toFixed(1)} ({differences.leftPercentDiff[region].toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-card p-4 rounded-md shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Right Foot Comparison</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Region</th>
                <th className="text-right py-2">{dataset1.participantId || 'Dataset 1'}</th>
                <th className="text-right py-2">{dataset2.participantId || 'Dataset 2'}</th>
                <th className="text-right py-2">Difference</th>
              </tr>
            </thead>
            <tbody>
              {regions.map(region => (
                <tr key={region} className="border-b">
                  <td className="py-2">{getRegionName(region)}</td>
                  <td className="text-right py-2">{dataset1Averages.rightAverages[region].toFixed(1)}</td>
                  <td className="text-right py-2">{dataset2Averages.rightAverages[region].toFixed(1)}</td>
                  <td 
                    className="text-right py-2" 
                    style={{ backgroundColor: getDifferenceColor(differences.rightPercentDiff[region]) }}
                  >
                    {differences.rightDifferences[region].toFixed(1)} ({differences.rightPercentDiff[region].toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Comparison Summary</h2>
        <div className="space-y-4">
          <p className="text-sm">
            <strong>Dataset 1:</strong> {dataset1.fileName} ({dataset1.pressureData.length} data points)
            {dataset1.participantId && ` - Participant: ${dataset1.participantId}`}
          </p>
          <p className="text-sm">
            <strong>Dataset 2:</strong> {dataset2.fileName} ({dataset2.pressureData.length} data points)
            {dataset2.participantId && ` - Participant: ${dataset2.participantId}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTab;
