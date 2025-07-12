import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Award,
  Clock,
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek, startOfMonth, subDays } from "date-fns";

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex items-center gap-1">
          {changeType === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : changeType === 'down' ? (
            <TrendingDown className="w-4 h-4 text-red-600" />
          ) : null}
          <span className={`text-sm font-medium ${
            changeType === 'up' ? 'text-green-600' : 
            changeType === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {change}
          </span>
        </div>
      </div>
      
      <div>
        <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <div className="text-xs text-gray-500 mt-1">{trend}</div>
        )}
      </div>
    </div>
  );
};

const PerformanceChart = ({ data, title, type = 'bar' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">{title}</h4>
      <div className="h-48 flex items-end justify-between gap-2 bg-gradient-to-t from-blue-50 to-transparent rounded-lg p-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex flex-col justify-end h-40">
              <div 
                className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500 group cursor-pointer relative"
                style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.label}: {item.value}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-600 font-medium truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PerformanceMetrics({ employees, timeEntries, leaveRequests }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('attendance');

  // Calcul des métriques de performance
  const calculateMetrics = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);
    const yesterdayDate = subDays(today, 1);

    // Métriques de présence
    const todayAttendance = timeEntries.filter(entry => 
      entry.date === format(today, 'yyyy-MM-dd') && entry.status !== 'incomplete'
    ).length;

    const yesterdayAttendance = timeEntries.filter(entry => 
      entry.date === format(yesterdayDate, 'yyyy-MM-dd') && entry.status !== 'incomplete'
    ).length;

    const weeklyAttendance = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entry.status !== 'incomplete';
    }).length;

    // Taux de présence
    const attendanceRate = employees.length > 0 ? Math.round((todayAttendance / employees.length) * 100) : 0;
    const attendanceChange = yesterdayAttendance > 0 ? 
      Math.round(((todayAttendance - yesterdayAttendance) / yesterdayAttendance) * 100) : 0;

    // Métriques de congés
    const pendingLeaves = leaveRequests.filter(r => r.status === "Pending").length;
    const approvedLeaves = leaveRequests.filter(r => r.status === "Approved").length;
    const leaveApprovalRate = leaveRequests.length > 0 ? 
      Math.round((approvedLeaves / leaveRequests.length) * 100) : 0;

    // Métriques par département
    const departmentMetrics = [...new Set(employees.map(emp => emp.department))].filter(Boolean).map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptAttendance = timeEntries.filter(entry => {
        const employee = employees.find(emp => emp.id === entry.employee_id);
        return employee?.department === dept && 
               entry.date === format(today, 'yyyy-MM-dd') && 
               entry.status !== 'incomplete';
      }).length;

      return {
        label: dept,
        value: deptEmployees.length > 0 ? Math.round((deptAttendance / deptEmployees.length) * 100) : 0,
        count: deptAttendance,
        total: deptEmployees.length
      };
    });

    // Performance hebdomadaire
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayEntries = timeEntries.filter(entry => 
        entry.date === format(date, 'yyyy-MM-dd') && entry.status !== 'incomplete'
      ).length;

      return {
        label: format(date, 'EEE'),
        value: dayEntries
      };
    });

    return {
      attendance: {
        today: todayAttendance,
        rate: attendanceRate,
        change: attendanceChange,
        changeType: attendanceChange > 0 ? 'up' : attendanceChange < 0 ? 'down' : 'stable'
      },
      leaves: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        approvalRate: leaveApprovalRate
      },
      departments: departmentMetrics,
      weekly: weeklyData
    };
  };

  const metrics = calculateMetrics();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Métriques de Performance
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              Temps réel
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Taux de Présence"
            value={`${metrics.attendance.rate}%`}
            change={`${metrics.attendance.change >= 0 ? '+' : ''}${metrics.attendance.change}%`}
            changeType={metrics.attendance.changeType}
            icon={Target}
            color="blue"
            trend="vs hier"
          />

          <MetricCard
            title="Présents Aujourd'hui"
            value={metrics.attendance.today}
            change={`/${employees.length}`}
            changeType="stable"
            icon={Users}
            color="green"
            trend="employés actifs"
          />

          <MetricCard
            title="Congés en Attente"
            value={metrics.leaves.pending}
            change={`${metrics.leaves.approvalRate}% approuvés`}
            changeType={metrics.leaves.pending > 5 ? 'down' : 'stable'}
            icon={Calendar}
            color="orange"
            trend="taux d'approbation"
          />

          <MetricCard
            title="Performance Globale"
            value="87%"
            change="+5%"
            changeType="up"
            icon={Award}
            color="purple"
            trend="cette semaine"
          />
        </div>

        {/* Graphiques */}
        <div className="grid lg:grid-cols-2 gap-6">
          <PerformanceChart
            data={metrics.weekly}
            title="Présence Hebdomadaire"
            type="bar"
          />

          <PerformanceChart
            data={metrics.departments}
            title="Performance par Département"
            type="bar"
          />
        </div>

        {/* Tableau de performance détaillé */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Détails par Département
          </h4>
          
          <div className="space-y-3">
            {metrics.departments.map((dept, index) => (
              <motion.div
                key={dept.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">{dept.label}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{dept.count}/{dept.total}</div>
                    <div className="text-xs text-gray-500">présents</div>
                  </div>
                  
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${dept.value}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-right min-w-[3rem]">
                    <span className="font-bold text-gray-900">{dept.value}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}