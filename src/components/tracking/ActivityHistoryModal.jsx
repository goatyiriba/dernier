import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  MapPin,
  Activity,
  TrendingUp,
  BarChart3,
  Download
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import UserStatusIndicator from './UserStatusIndicator';
import { getUserActivityHistory } from '@/api/supabaseFunctions';

export default function ActivityHistoryModal({ employee, isOpen, onClose }) {
  const [activityData, setActivityData] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // 7 jours par défaut

  useEffect(() => {
    if (isOpen && employee) {
      loadActivityHistory();
    }
  }, [isOpen, employee, timeRange]);

  const loadActivityHistory = async () => {
    try {
      setIsLoading(true);
      const { data } = await getUserActivityHistory({
        employeeId: employee.id,
        days: timeRange
      });
      
      if (data.success) {
        setActivityData(data);
        processWeeklyData(data.activities);
        processDailyStats(data.activities);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processWeeklyData = (activities) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const weeklyStats = daysOfWeek.map(day => {
      const dayActivities = activities.filter(activity => {
        const activityDate = parseISO(activity.login_time);
        return format(activityDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const totalMinutes = dayActivities.reduce((sum, activity) => {
        return sum + (activity.total_active_time || 0);
      }, 0);

      const sessions = dayActivities.length;

      return {
        day: format(day, 'EEE', { locale: fr }),
        fullDate: format(day, 'yyyy-MM-dd'),
        minutes: totalMinutes,
        hours: Math.round(totalMinutes / 60 * 10) / 10,
        sessions
      };
    });

    setWeeklyData(weeklyStats);
  };

  const processDailyStats = (activities) => {
    const last7Days = activities
      .slice(0, 7)
      .map(activity => ({
        date: format(parseISO(activity.login_time), 'dd/MM'),
        fullDate: activity.login_time,
        activeTime: activity.total_active_time || 0,
        sessions: 1,
        status: activity.status,
        device: activity.is_mobile ? 'Mobile' : 'Desktop',
        location: activity.location?.city || 'Inconnue'
      }));

    setDailyStats(last7Days);
  };

  const getTotalStats = () => {
    if (!activityData) return {};

    const totalSessions = activityData.activities.length;
    const totalMinutes = activityData.activities.reduce((sum, activity) => {
      return sum + (activity.total_active_time || 0);
    }, 0);
    
    const avgSessionTime = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    return {
      totalSessions,
      totalMinutes,
      totalHours,
      avgSessionTime: Math.round(avgSessionTime)
    };
  };

  const getDeviceStats = () => {
    if (!activityData) return { mobile: 0, desktop: 0 };

    const mobileCount = activityData.activities.filter(a => a.is_mobile).length;
    const desktopCount = activityData.activities.length - mobileCount;

    return { mobile: mobileCount, desktop: desktopCount };
  };

  const stats = getTotalStats();
  const deviceStats = getDeviceStats();

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={employee.profile_picture} />
              <AvatarFallback>
                {employee.first_name?.[0]}{employee.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                {employee.first_name} {employee.last_name}
                <UserStatusIndicator 
                  status={employee.real_time_status}
                  lastActivity={employee.last_activity_formatted}
                  showLabel={true}
                />
              </div>
              <div className="text-sm text-gray-500 font-normal">
                {employee.position} • {employee.department}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contrôles de période */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[7, 14, 30].map(days => (
                <Button
                  key={days}
                  variant={timeRange === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(days)}
                >
                  {days} jours
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalHours}h</div>
                    <div className="text-sm text-gray-500">Temps total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <div className="text-sm text-gray-500">Sessions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.avgSessionTime}min</div>
                    <div className="text-sm text-gray-500">Moy./session</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {deviceStats.desktop}D / {deviceStats.mobile}M
                    </div>
                    <div className="text-sm text-gray-500">Appareils</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphique d'activité hebdomadaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Activité de la semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'hours' ? `${value}h` : value,
                      name === 'hours' ? 'Heures' : 'Sessions'
                    ]}
                  />
                  <Bar dataKey="hours" fill="#3B82F6" name="hours" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Historique détaillé */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Historique détaillé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {activityData?.activities.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {activity.is_mobile ? (
                          <Smartphone className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Monitor className="w-4 h-4 text-gray-500" />
                        )}
                        <UserStatusIndicator status={activity.status} size="sm" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {format(parseISO(activity.login_time), 'dd MMM yyyy', { locale: fr })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(parseISO(activity.login_time), 'HH:mm')} - 
                          {activity.logout_time ? format(parseISO(activity.logout_time), 'HH:mm') : 'En cours'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {Math.round((activity.total_active_time || 0) / 60 * 10) / 10}h
                      </div>
                      <div className="text-sm text-gray-500">
                        {activity.tab_count || 1} onglet{(activity.tab_count || 1) > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}