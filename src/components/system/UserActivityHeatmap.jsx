import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function UserActivityHeatmap({ logs, users }) {
  // Générer une heatmap d'activité par heure et jour de la semaine
  const generateHeatmapData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const heatmapData = days.map((day, dayIndex) => ({
      day,
      hours: hours.map(hour => {
        // Simuler des données d'activité
        const activity = Math.floor(Math.random() * 10);
        return {
          hour,
          activity,
          intensity: activity / 10
        };
      })
    }));
    
    return heatmapData;
  };

  const heatmapData = generateHeatmapData();
  
  // Top utilisateurs actifs
  const topActiveUsers = users.slice(0, 5).map(user => ({
    ...user,
    activity: Math.floor(Math.random() * 50) + 10,
    lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
  }));

  const getIntensityColor = (intensity) => {
    if (intensity > 0.8) return 'bg-green-600';
    if (intensity > 0.6) return 'bg-green-500';
    if (intensity > 0.4) return 'bg-green-400';
    if (intensity > 0.2) return 'bg-green-300';
    if (intensity > 0) return 'bg-green-200';
    return 'bg-gray-100';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Heatmap d'Activité Utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heatmap */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Clock className="w-4 h-4" />
            <span>Activité par heure et jour de la semaine</span>
          </div>
          
          {/* Hours header */}
          <div className="flex items-center gap-1">
            <div className="w-12"></div>
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="w-4 text-xs text-gray-500 text-center">
                {i % 4 === 0 ? i : ''}
              </div>
            ))}
          </div>
          
          {/* Heatmap grid */}
          {heatmapData.map((dayData) => (
            <div key={dayData.day} className="flex items-center gap-1">
              <div className="w-12 text-xs text-gray-600 font-medium">
                {dayData.day}
              </div>
              {dayData.hours.map((hourData) => (
                <div
                  key={hourData.hour}
                  className={`w-4 h-4 rounded-sm ${getIntensityColor(hourData.intensity)} 
                    hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer`}
                  title={`${dayData.day} ${hourData.hour}:00 - ${hourData.activity} activités`}
                />
              ))}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-gray-500">Moins</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded-sm" />
              <div className="w-3 h-3 bg-green-200 rounded-sm" />
              <div className="w-3 h-3 bg-green-300 rounded-sm" />
              <div className="w-3 h-3 bg-green-400 rounded-sm" />
              <div className="w-3 h-3 bg-green-500 rounded-sm" />
              <div className="w-3 h-3 bg-green-600 rounded-sm" />
            </div>
            <span className="text-xs text-gray-500">Plus</span>
          </div>
        </div>

        {/* Top Active Users */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-gray-900">Utilisateurs les Plus Actifs</h4>
          </div>
          <div className="space-y-2">
            {topActiveUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.full_name?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dernière activité: {format(user.lastActive, 'HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {user.activity} actions
                  </Badge>
                  <div className="text-lg font-bold text-gray-700">
                    #{index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}