
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
  const [comparisonType, setComparisonType] = useState<'peak-pressure' | 'mean-pressure' | 'stance-duration' | 'cop-range'>('peak-pressure');
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
    
    // For stance duration comparison
    if (comparisonType === 'stance-duration' && dataset.stancePhases) {
      const leftStances = dataset.stancePhases.filter(phase => phase.foot === 'left');
      const rightStances = dataset.stancePhases.filter(phase => phase.foot === 'right');
      
      const leftAvgDuration = leftStances.length > 0 
        ? leftStances.reduce((sum, phase) => sum + phase.duration, 0) / leftStances.length
        : 0;
        
      const rightAvgDuration = rightStances.length > 0
        ? rightStances.reduce((sum, phase) => sum + phase.duration, 0) / rightStances.length
        : 0;
        
      return {
        name: dataset.participantId || dataset.fileName || 'Unknown',
        left: parseFloat(leftAvgDuration.toFixed(2)),
        right: parseFloat(rightAvgDuration.toFixed(2)),
        asymmetry: parseFloat((Math.abs(leftAvgDuration - rightAvgDuration) / ((leftAvgDuration + rightAvgDuration) / 2) * 100).toFixed(1))
      };
    }
    
    // For COP range comparison
    if (comparisonType === 'cop-range' && dataset.stancePhases) {
      const leftStances = dataset.stancePhases.filter(phase => phase.foot === 'left');
      const rightStances = dataset.stancePhases.filter(phase => phase.foot === 'right');
      
      const leftMLRange = leftStances.length > 0
        ? leftStances.reduce((sum, phase) => sum + phase.mlRange, 0) / leftStances.length
        : 0;
        
      const rightMLRange = rightStances.length > 0
        ? rightStances.reduce((sum, phase) => sum + phase.mlRange, 0) / rightStances.length
        : 0;
        
      const leftAPRange = leftStances.length > 0
        ? leftStances.reduce((sum, phase) => sum + phase.apRange, 0) / leftStances.length
        : 0;
        
      const rightAPRange = rightStances.length > 0
        ? rightStances.reduce((sum, phase) => sum + phase.apRange, 0) / rightStances.length
        : 0;
        
      return {
        name: dataset.participantId || dataset.fileName || 'Unknown',
        'left-ml': parseFloat(leftMLRange.toFixed(1)),
        'right-ml': parseFloat(rightMLRange.toFixed(1)),
        'left-ap': parseFloat(leftAPRange.toFixed(1)),
        'right-ap': parseFloat(rightAPRange.toFixed(1))
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
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
                <TabsTrigger value="peak-pressure">Peak Pressure</TabsTrigger>
                <TabsTrigger value="mean-pressure">Mean Pressure</TabsTrigger>
                <TabsTrigger value="stance-duration">Stance Duration</TabsTrigger>
                <TabsTrigger value="cop-range">COP Range</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {(comparisonType === 'peak-pressure' || comparisonType === 'mean-pressure') && (
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
            )}
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
              
              {comparisonType === 'cop-range' ? (
                <>
                  <YAxis label={{ value: 'Range (mm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => [`${value} mm`, '']} />
                  <Legend />
                  <Bar dataKey="left-ml" name="Left ML Range" fill="#8884d8" />
                  <Bar dataKey="right-ml" name="Right ML Range" fill="#82ca9d" />
                  <Bar dataKey="left-ap" name="Left AP Range" fill="#ff7300" />
                  <Bar dataKey="right-ap" name="Right AP Range" fill="#0088fe" />
                </>
              ) : comparisonType.includes('pressure') ? (
                <>
                  <YAxis label={{ value: 'Pressure (kPa)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => [`${value} kPa`, '']} />
                  <Legend />
                  <Bar dataKey="left" name="Left Foot" fill="#8884d8" />
                  <Bar dataKey="right" name="Right Foot" fill="#82ca9d" />
                  <Bar dataKey="asymmetry" name="Asymmetry (%)" fill="#ff7300" />
                </>
              ) : (
                <>
                  <YAxis label={{ value: 'Duration (s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => [`${value} s`, '']} />
                  <Legend />
                  <Bar dataKey="left" name="Left Foot" fill="#8884d8" />
                  <Bar dataKey="right" name="Right Foot" fill="#82ca9d" />
                  <Bar dataKey="asymmetry" name="Asymmetry (%)" fill="#ff7300" />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatasetComparison;
