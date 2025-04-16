
import React, { useState } from 'react';
import { ProcessedData } from '@/utils/pressureDataProcessor';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DatasetComparisonProps {
  datasets: ProcessedData[];
}

const DatasetComparison: React.FC<DatasetComparisonProps> = ({ datasets }) => {
  const [comparisonType, setComparisonType] = useState<'peak-pressure' | 'mean-pressure'>('peak-pressure');
  const [region, setRegion] = useState<string>('heel');
  
  if (datasets.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dataset Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] bg-gray-50 rounded-md">
            <p className="text-gray-500">At least two datasets are required for comparison</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare comparison data
  const comparisonData = datasets.map(dataset => {
    // For peak and mean pressure comparison
    if (comparisonType === 'peak-pressure' || comparisonType === 'mean-pressure') {
      const mode = comparisonType === 'peak-pressure' ? 'peak' : 'mean';
      
      // Calculate average pressure for the selected region
      const leftSum = dataset.pressureData.reduce((sum, point) => 
        sum + point.leftFoot[region][mode], 0
      );
      const rightSum = dataset.pressureData.reduce((sum, point) => 
        sum + point.rightFoot[region][mode], 0
      );
      
      const leftAvg = leftSum / dataset.pressureData.length;
      const rightAvg = rightSum / dataset.pressureData.length;
      
      return {
        name: dataset.participantId || dataset.fileName || 'Unknown',
        left: parseFloat(leftAvg.toFixed(2)),
        right: parseFloat(rightAvg.toFixed(2)),
        asymmetry: parseFloat((Math.abs(leftAvg - rightAvg) / ((leftAvg + rightAvg) / 2) * 100).toFixed(1))
      };
    }
    
    return {
      name: dataset.participantId || dataset.fileName || 'Unknown',
      left: 0,
      right: 0,
      asymmetry: 0
    };
  });
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <CardTitle>Dataset Comparison</CardTitle>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs 
              value={comparisonType}
              onValueChange={(value) => setComparisonType(value as any)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="peak-pressure">Peak Pressure</TabsTrigger>
                <TabsTrigger value="mean-pressure">Mean Pressure</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select
              value={region}
              onValueChange={setRegion}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heel">Heel</SelectItem>
                <SelectItem value="medialMidfoot">Medial Midfoot</SelectItem>
                <SelectItem value="lateralMidfoot">Lateral Midfoot</SelectItem>
                <SelectItem value="forefoot">Forefoot</SelectItem>
                <SelectItem value="toes">Toes</SelectItem>
                <SelectItem value="hallux">Hallux</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0}
                height={70} 
              />
              <YAxis label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: any) => [`${value} kPa`, '']} />
              <Legend />
              <Bar dataKey="left" name="Left Foot" fill="#8884d8" />
              <Bar dataKey="right" name="Right Foot" fill="#82ca9d" />
              <Bar dataKey="asymmetry" name="Asymmetry (%)" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetComparison;
