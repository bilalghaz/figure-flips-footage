
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ErrorBar } from 'recharts';
import { ChartContainer } from "@/components/ui/chart";

interface GroupedBarChartData {
  condition: string;
  apPosition: number;
  error: number;
  foot: string;
  color: string;
}

interface CopBarChartViewProps {
  groupedBarData: GroupedBarChartData[];
}

const CopBarChartView: React.FC<CopBarChartViewProps> = ({ groupedBarData }) => {
  return (
    <div className="bg-white border rounded-md p-4">
      <h3 className="text-base font-medium mb-2">Anteroposterior (Y) COP Position by Foot</h3>
      <div className="h-[350px]">
        <ChartContainer 
          className="w-full h-full"
          config={{
            left: { theme: { light: "#8884d8", dark: "#8884d8" } },
            right: { theme: { light: "#82ca9d", dark: "#82ca9d" } }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={groupedBarData}
              margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="condition" 
                label={{ value: 'Condition and Limb', position: 'bottom', offset: 0 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Anteroposterior Position (mm)', angle: -90, position: 'left' }}
                domain={[0, 'dataMax + 50']}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white border p-2 rounded-md shadow-sm text-xs">
                        <p className="font-medium">{data.condition}</p>
                        <p>AP Position: {data.apPosition.toFixed(1)} mm</p>
                        <p>Standard Error: ±{data.error.toFixed(1)} mm</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar 
                dataKey="apPosition" 
                name="AP Position" 
                fill="#8884d8"
                isAnimationActive={false} // Disable animations for better performance
              >
                <ErrorBar dataKey="error" width={4} strokeWidth={1} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
};

export default CopBarChartView;
