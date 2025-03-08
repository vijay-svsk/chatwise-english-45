
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ActivityDay {
  date: string;
  count: number;
}

interface ActivityCalendarProps {
  data: ActivityDay[];
  title?: string;
  description?: string;
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ 
  data,
  title = "Activity Calendar",
  description = "Your daily learning streak"
}) => {
  const getDayColor = (count: number) => {
    if (count === 0) return 'bg-muted';
    if (count < 30) return 'bg-primary/30';
    if (count < 60) return 'bg-primary/60';
    return 'bg-primary';
  };

  // Generate 7 rows (days of week) and 12 columns (weeks)
  const days = Array.from({ length: 7 });
  const weeks = Array.from({ length: 12 });

  // Map data to a lookup object for easier access
  const activityMap = data.reduce((acc, day) => {
    acc[day.date] = day.count;
    return acc;
  }, {} as Record<string, number>);

  // Current date to highlight today
  const today = new Date().toISOString().split('T')[0];

  // Generate dates for the last 84 days (12 weeks)
  const generateDates = () => {
    const result = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 84; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      result.push(date.toISOString().split('T')[0]);
    }
    
    return result.reverse();
  };
  
  const dates = generateDates();

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-12 gap-2">
          {weeks.map((_, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-2">
              {days.map((_, dayIndex) => {
                const dateIndex = weekIndex * 7 + dayIndex;
                const date = dates[dateIndex];
                const count = activityMap[date] || 0;
                
                return (
                  <div 
                    key={`day-${dayIndex}`}
                    className={cn(
                      "w-4 h-4 rounded-sm transition-all duration-200",
                      getDayColor(count),
                      date === today && "ring-2 ring-primary",
                    )}
                    title={`${date}: ${count} minutes`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end mt-4 space-x-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm bg-muted" />
            <span>0 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <span>&lt;30 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <span>&lt;60 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span>60+ min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCalendar;
