import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color, delay = 0 }) => {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'from-blue-50 to-blue-100',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700'
    },
    green: {
      bg: 'from-emerald-500 to-green-600',
      light: 'from-emerald-50 to-green-100',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    purple: {
      bg: 'from-purple-500 to-indigo-600',
      light: 'from-purple-50 to-indigo-100',
      text: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700'
    },
    orange: {
      bg: 'from-orange-500 to-red-500',
      light: 'from-orange-50 to-red-100',
      text: 'text-orange-600',
      badge: 'bg-orange-100 text-orange-700'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-50`}></div>
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">
                {value}
              </p>
              {subtitle && (
                <Badge className={`${colors.badge} text-xs px-2 py-1`}>
                  {subtitle}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ModernStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Employés Actifs"
        value={stats.employees.active}
        subtitle={`sur ${stats.employees.total}`}
        trend={stats.employees.newThisWeek > 0 ? 'up' : 'stable'}
        trendValue={stats.employees.growthRate}
        icon={Users}
        color="blue"
        delay={0.1}
      />
      
      <StatCard
        title="Présence Aujourd'hui"
        value={`${stats.attendance.rate}%`}
        subtitle={`${stats.attendance.todayClockIns} pointés`}
        trend={stats.attendance.trend}
        trendValue={stats.attendance.trend === 'up' ? '+5%' : stats.attendance.trend === 'down' ? '-3%' : '0%'}
        icon={Clock}
        color="green"
        delay={0.2}
      />
      
      <StatCard
        title="Congés en Attente"
        value={stats.leaves.pending}
        subtitle={`${stats.leaves.approvalRate}% approuvés`}
        trend={stats.leaves.pending > 5 ? 'up' : 'stable'}
        trendValue={stats.leaves.pending > 0 ? 'Action requise' : 'Tout traité'}
        icon={Calendar}
        color="purple"
        delay={0.3}
      />
      
      <StatCard
        title="Alertes Système"
        value={stats.attendance.incompleteEntries + stats.announcements.urgent}
        subtitle={stats.system.dataHealth === 'healthy' ? 'Système OK' : 'Attention'}
        trend={stats.attendance.incompleteEntries > 0 ? 'up' : 'stable'}
        trendValue={stats.system.uptime}
        icon={stats.system.dataHealth === 'healthy' ? CheckCircle : AlertTriangle}
        color="orange"
        delay={0.4}
      />
    </div>
  );
}