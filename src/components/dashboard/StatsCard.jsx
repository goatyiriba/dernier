import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const colorMap = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    icon: "text-blue-600",
    accent: "border-l-blue-500"
  },
  green: {
    gradient: "from-emerald-500 to-green-600", 
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    accent: "border-l-emerald-500"
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50", 
    icon: "text-amber-600",
    accent: "border-l-amber-500"
  },
  purple: {
    gradient: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
    icon: "text-purple-600", 
    accent: "border-l-purple-500"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, trend, subtitle }) {
  const colors = colorMap[color] || colorMap.blue;
  
  return (
    <Card className="gemini-stats-card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 lg:space-y-3 min-w-0 flex-1">
            <p className="text-xs lg:text-sm font-medium text-gray-600 gemini-subtitle uppercase tracking-wide truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {value}
              </p>
              {trend && (
                <div className="flex items-center gap-1 min-w-0">
                  <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs lg:text-sm text-emerald-600 font-medium truncate">{trend}</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-2xl ${colors.bg} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`}></div>
            <Icon className={`w-6 h-6 lg:w-8 lg:h-8 ${colors.icon} relative z-10`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}