
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface SkillData {
  skill: string;
  value: number;
  fullMark: number;
}

interface SkillRadarProps {
  data: SkillData[];
  title?: string;
  description?: string;
}

const SkillRadar: React.FC<SkillRadarProps> = ({ 
  data, 
  title = "English Proficiency", 
  description = "Your current skill levels" 
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
            <RadarChart outerRadius={90} data={data}>
              <PolarGrid stroke="#f0f0f0" />
              <PolarAngleAxis dataKey="skill" fontSize={12} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Current Level"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillRadar;
