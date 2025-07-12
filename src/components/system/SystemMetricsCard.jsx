import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const colorMap = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    icon: "text-blue-600",
    pulse: "animate-pulse"
  },
  green: {
    gradient: "from-emerald-500 to-green-600", 
    bg: "bg-emerald-50",
    icon: "text-emerald-600",
    pulse: "animate-pulse"
  },
  amber: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50", 
    icon: "text-amber-600",
    pulse: "animate-pulse"
  },
  purple: {
    gradient: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50",
    icon: "text-purple-600", 
    pulse: "animate-pulse"
  },
  red: {
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50",
    icon: "text-red-600", 
    pulse: "animate-pulse"
  }
};

export default function SystemMetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend,
  realTime = false 
}) {
  const colors = colorMap[color] || colorMap.blue;
  const isPositiveTrend = trend && (trend.startsWith('+') || trend.includes('↑'));
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
        <div className={`h-1 w-full bg-gradient-to-r ${colors.gradient}`} />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {title}
                </p>
                {realTime && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${colors.icon}`}>
                  {value}
                </p>
                {trend && (
                  <div className="flex items-center gap-1">
                    {isPositiveTrend ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      isPositiveTrend ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {trend}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-10`}></div>
              <Icon className={`w-8 h-8 ${colors.icon} relative z-10 ${realTime ? 'animate-pulse' : ''}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}