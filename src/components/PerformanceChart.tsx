
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceData {
  date: string;
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  title?: string;
  description?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  title = "Speaking Performance", 
  description = "Your progress over time" 
}) => {
  return (
    <Card className="glass-panel overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888888" fontSize={12} tickMargin={10} />
              <YAxis stroke="#888888" fontSize={12} tickMargin={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  borderRadius: '0.5rem',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend verticalAlign="bottom" height={36} />
              <Line 
                type="monotone" 
                dataKey="pronunciation" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="fluency" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="vocabulary" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 2 }} 
              />
              <Line 
                type="monotone" 
                dataKey="grammar" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
