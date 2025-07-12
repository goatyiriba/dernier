import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    hover: "hover:bg-blue-100"
  },
  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
    hover: "hover:bg-green-100"
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    hover: "hover:bg-amber-100"
  },
  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
    hover: "hover:bg-purple-100"
  }
};

export default function AdminStatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  linkTo, 
  alert, 
  trend 
}) {
  const colors = colorMap[color] || colorMap.blue;
  
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };
  
  const CardBody = (
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex items-center gap-2">
          {alert && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
          {trend && getTrendIcon()}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </CardContent>
  );

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${colors.hover}`}>
      {linkTo ? (
        <Link to={linkTo} className="block">
          {CardBody}
        </Link>
      ) : (
        <div>{CardBody}</div>
      )}
    </Card>
  );
}