import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Calendar,
  Users,
  Clock,
  TrendingUp
} from "lucide-react";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";

export default function InteractiveChart({ data, employees, type, timeFilter }) {
  const [chartType, setChartType] = useState('bar'); // bar, line, pie
  const [activeMetric, setActiveMetric] = useState('attendance');

  // Générer des données pour le graphique
  const generateChartData = () => {
    const today = new Date();
    let days = [];
    
    switch(timeFilter) {
      case 'week':
        const weekStart = startOfWeek(today);
        days = eachDayOfInterval({ start: weekStart, end: today });
        break;
      case 'month':
        days = Array.from({ length: 30 }, (_, i) => subDays(today, 29 - i));
        break;
      default: // today
        days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));
    }

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEntries = data.filter(entry => entry.date === dayStr);
      
      return {
        date: format(day, 'dd/MM'),
        fullDate: day,
        clockIns: dayEntries.filter(e => e.status !== 'incomplete').length,
        incomplete: dayEntries.filter(e => e.status === 'incomplete').length,
        total: dayEntries.length,
        rate: employees.length > 0 ? Math.round((dayEntries.length / employees.length) * 100) : 0
      };
    });
  };

  const chartData = generateChartData();
  const maxValue = Math.max(...chartData.map(d => d.clockIns));

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Analyse de Présence
            <Badge className="bg-blue-100 text-blue-700">
              {timeFilter === 'today' ? '7 derniers jours' : 
               timeFilter === 'week' ? 'Cette semaine' : 
               'Ce mois'}
            </Badge>
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={chartType === 'line' ? 'default' : 'outline'}
              onClick={() => setChartType('line')}
            >
              <LineChart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Chart visualization */}
        <div className="h-64 flex items-end justify-between gap-2 bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4">
          {chartData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="relative w-full flex flex-col justify-end h-48">
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 group cursor-pointer relative"
                  style={{ height: `${maxValue > 0 ? (day.clockIns / maxValue) * 100 : 0}%` }}
                >
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <div className="font-semibold">{day.date}</div>
                    <div>Pointages: {day.clockIns}</div>
                    <div>Incomplets: {day.incomplete}</div>
                    <div>Taux: {day.rate}%</div>
                  </div>
                </div>
                
                {/* Incomplete entries indicator */}
                {day.incomplete > 0 && (
                  <div 
                    className="bg-red-400 rounded-t-lg"
                    style={{ height: `${(day.incomplete / maxValue) * 20}%` }}
                  />
                )}
              </div>
              
              {/* Date label */}
              <span className="text-xs text-gray-600 font-medium">
                {day.date}
              </span>
            </div>
          ))}
        </div>
        
        {/* Metrics summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {chartData.reduce((sum, day) => sum + day.clockIns, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Pointages</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(chartData.reduce((sum, day) => sum + day.rate, 0) / chartData.length)}%
            </div>
            <div className="text-xs text-gray-600">Taux Moyen</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {chartData.reduce((sum, day) => sum + day.incomplete, 0)}
            </div>
            <div className="text-xs text-gray-600">Incomplets</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5" />
              +12%
            </div>
            <div className="text-xs text-gray-600">Évolution</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}