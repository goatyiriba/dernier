
import React, { useState, useEffect } from "react";
import { Employee, LeaveRequest, TimeEntry, Announcement, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  Activity,
  Target,
  Globe,
  Zap,
  BarChart3,
  ArrowUpRight,
  Eye,
  Database,
  UserPlus,
  Settings,
  Bell,
  ChevronDown,
  ChevronUp,
  Filter,
  Calendar as CalendarIcon,
  PieChart,
  LineChart,
  DollarSign,
  Briefcase,
  MapPin,
  Wifi,
  WifiOff,
  Timer,
  Award,
  Sparkles,
  Flame,
  Star,
  Plus,
  Trophy, // New import for Leaderboard
  Crown // New import for Top Performers
} from "lucide-react";
import { format, isToday, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { cachedApiCall, apiCache } from "../components/utils/apiCache";

import AdminStatsCard from "../components/admin/AdminStatsCard";
import RecentActivityFeed from "../components/admin/RecentActivityFeed";
import PendingApprovals from "../components/admin/PendingApprovals";
import { useTranslation } from "../components/utils/i18n";
import NotificationTestButton from "../components/notifications/NotificationTestButton";

// Nouveaux composants modernes
import ModernStatsGrid from "../components/admin/ModernStatsGrid";
import InteractiveChart from "../components/admin/InteractiveChart";
import TeamOverviewWidget from "../components/admin/TeamOverviewWidget";
import QuickActionCenter from "../components/admin/QuickActionCenter";
import AlertsAndNotifications from "../components/admin/AlertsAndNotifications";
import LiveActivityStream from "../components/admin/LiveActivityStream";
import PerformanceMetrics from "../components/admin/PerformanceMetrics";
import LocationHeatmap from "../components/admin/LocationHeatmap";

// Minimalist AvatarGenerator component for demo purposes
// In a real application, this component would typically be imported from a shared components directory.
const AvatarGenerator = ({ firstName, lastName, email, department, size = 'md', className = '' }) => {
  const getInitials = (first, last) => {
    return `${first ? first.charAt(0) : ''}${last ? last.charAt(0) : ''}`.toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'md': return 'w-10 h-10 text-sm';
      case 'lg': return 'w-16 h-16 text-lg';
      case 'xl': return 'w-20 h-20 text-xl';
      default: return 'w-10 h-10 text-sm';
    }
  };

  const bgColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`; // Simple random color

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold ${getSizeClasses()} ${className}`}
      style={{ backgroundColor: bgColor }}
      title={`${firstName} ${lastName} (${email || ''})`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
};


export default function AdminDashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("grid"); // grid, list, cards
  const [timeFilter, setTimeFilter] = useState("today"); // today, week, month
  const { t, formatNumber, formatDate } = useTranslation();

  useEffect(() => {
    loadDashboardData();
    const intervalId = setInterval(loadDashboardData, 30000); // Plus fréquent
    return () => clearInterval(intervalId);
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log("Loading modern dashboard data...");

      const employeeData = await cachedApiCall(Employee, 'list', { sortBy: '-created_date', limit: 200 });
      setEmployees(employeeData);

      if (employeeData && employeeData.length > 0) {
        setCurrentUser({
          id: 'admin-user',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@flowhr.com',
          role: 'Admin',
        });
      }

      const leaveData = await cachedApiCall(LeaveRequest, 'list', { sortBy: '-created_date', limit: 100 });
      setLeaveRequests(leaveData);

      const timeData = await cachedApiCall(TimeEntry, 'list', { sortBy: '-created_date', limit: 300 });
      setTimeEntries(timeData);

      const announcementData = await cachedApiCall(Announcement, 'list', { sortBy: '-created_date', limit: 50 });
      setAnnouncements(announcementData);

      setLastUpdated(new Date());
      console.log("Modern dashboard data loaded successfully");

    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRefresh = () => {
    apiCache.clearEntity('Employee');
    apiCache.clearEntity('LeaveRequest');
    apiCache.clearEntity('TimeEntry');
    apiCache.clearEntity('Announcement');
    loadDashboardData();
  };

  // CORRECTION: Fonction getAdvancedStats mise à jour pour cohérence
  const getAdvancedStats = () => {
    const today = new Date();
    const weekStart = startOfWeek(today);
    const monthStart = startOfMonth(today);
    const yesterdayDate = subDays(today, 1);

    // Employés
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "Active").length;
    const newThisWeek = employees.filter(e => {
      if (!e.start_date) return false;
      const startDate = new Date(e.start_date);
      return startDate >= weekStart;
    }).length;

    // Congés
    const pendingLeaves = leaveRequests.filter(r => r.status === "Pending").length;
    const approvedThisMonth = leaveRequests.filter(r =>
      r.status === "Approved" && new Date(r.approval_date) >= monthStart
    ).length;

    // Pointages
    const todayClockIns = timeEntries.filter(t =>
      t.date === format(today, 'yyyy-MM-dd') && t.status !== 'incomplete'
    ).length;
    const incompleteEntries = timeEntries.filter(t => t.status === "incomplete").length;

    // Calculs de tendances
    const yesterdayClockIns = timeEntries.filter(t =>
      t.date === format(yesterdayDate, 'yyyy-MM-dd') && t.status !== 'incomplete'
    ).length;

    const attendanceTrend = todayClockIns > yesterdayClockIns ? "up" :
                          todayClockIns < yesterdayClockIns ? "down" : "stable";

    // Annonces
    const activeAnnouncements = announcements.filter(a => a.is_published).length;
    const urgentAnnouncements = announcements.filter(a => a.is_published && a.priority === "urgent").length;

    // Métriques de performance
    const attendanceRate = activeEmployees > 0 ? Math.round((todayClockIns / activeEmployees) * 100) : 0;
    const leaveApprovalRate = leaveRequests.length > 0 ?
      Math.round((leaveRequests.filter(r => r.status === "Approved").length / leaveRequests.length) * 100) : 0;

    // Mock employee points for gamification
    const employeePoints = employees.map(emp => ({
      employee_id: emp.id,
      total_points: Math.floor(Math.random() * 1000) + 100,
      streak_days: Math.floor(Math.random() * 30),
      level: Math.floor(Math.random() * 5) + 1,
      points_this_week: Math.floor(Math.random() * 200) + 50,
      badges_count: Math.floor(Math.random() * 10)
    }));

    const badges = [
      { id: 'b1', name: 'Early Bird', icon: 'Sunrise' },
      { id: 'b2', name: 'Team Player', icon: 'Users' },
      { id: 'b3', name: 'Innovator', icon: 'Lightbulb' },
      { id: 'b4', name: 'Productivity Pro', icon: 'Zap' },
      { id: 'b5', name: 'Problem Solver', icon: 'Target' },
    ];

    // CORRECTION: Amélioration employé du jour/semaine avec système de nomination
    const getEmployeeOfTheDay = () => {
      if (!employees || employees.length === 0 || !employeePoints || employeePoints.length === 0) {
        return null;
      }

      console.log('🏆 Calculating employee of the day...');

      const sortedByPoints = [...employeePoints].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

      if (sortedByPoints.length === 0) {
        return null;
      }

      const topEmployee = sortedByPoints[0];
      const employee = employees.find(emp => emp.id === topEmployee.employee_id);

      if (!employee) {
        return null;
      }

      return {
        ...employee,
        score: topEmployee.total_points || 0,
        total_points: topEmployee.total_points || 0,
        level: topEmployee.level || 1,
        points: topEmployee.points_this_week || 0,
        points_this_week: topEmployee.points_this_week || 0,
        streak_days: topEmployee.streak_days || 0,
        badges_count: topEmployee.badges_count || 0,
        full_name: `${employee.first_name} ${employee.last_name}`,
        rank_position: 1,
        nomination_reason: "Performance exceptionnelle cette semaine"
      };
    };

    const getEmployeeOfTheWeek = () => {
      if (!employees || employees.length === 0 || !employeePoints || employeePoints.length === 0) {
        return null;
      }

      console.log('🏆 Calculating employee of the week...');

      const sortedByWeeklyPoints = [...employeePoints].sort((a, b) => (b.points_this_week || 0) - (a.points_this_week || 0));

      if (sortedByWeeklyPoints.length === 0) {
        return null;
      }

      let weeklyEmployee = sortedByWeeklyPoints[0];

      const dailyEmployee = getEmployeeOfTheDay();
      if (dailyEmployee && weeklyEmployee.employee_id === dailyEmployee.id) {
        weeklyEmployee = sortedByWeeklyPoints[1] || weeklyEmployee;
      }

      const employee = employees.find(emp => emp.id === weeklyEmployee.employee_id);

      if (!employee) {
        return null;
      }

      return {
        ...employee,
        score: weeklyEmployee.points_this_week || 0,
        total_points: weeklyEmployee.total_points || 0,
        level: weeklyEmployee.level || 1,
        points: weeklyEmployee.points_this_week || 0,
        points_this_week: weeklyEmployee.points_this_week || 0,
        streak_days: weeklyEmployee.streak_days || 0,
        badges_count: weeklyEmployee.badges_count || 0,
        full_name: `${employee.first_name} ${employee.last_name}`,
        rank_position: weeklyEmployee === sortedByWeeklyPoints[0] ? 1 : 2,
        nomination_reason: `Excellente performance cette semaine avec ${weeklyEmployee.points_this_week} points`,
        achievements: [
          "Performance constante",
          "Collaboration exemplaire",
          "Innovation dans les processus"
        ],
        performance_score: Math.min((weeklyEmployee.points_this_week || 0) / 10, 100)
      };
    };

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        newThisWeek,
        inactiveCount: totalEmployees - activeEmployees,
        growthRate: newThisWeek > 0 ? `+${newThisWeek}` : "0",
        employeeOfTheDay: getEmployeeOfTheDay(),
        employeeOfTheWeek: getEmployeeOfTheWeek()
      },
      attendance: {
        todayClockIns,
        yesterdayClockIns,
        trend: attendanceTrend,
        rate: attendanceRate,
        incompleteEntries
      },
      leaves: {
        pending: pendingLeaves,
        approvedThisMonth,
        approvalRate: leaveApprovalRate,
        totalRequests: leaveRequests.length
      },
      announcements: {
        active: activeAnnouncements,
        urgent: urgentAnnouncements,
        totalPublished: announcements.filter(a => a.is_published).length
      },
      system: {
        lastUpdated,
        dataHealth: error ? "warning" : "healthy",
        uptime: "99.9%"
      },
      gamification: {
        badges: badges,
        employeePoints: employeePoints,
        totalBadgesCount: badges.length,
        totalPointsDistributed: employeePoints.reduce((sum, emp) => sum + (emp.total_points || 0), 0)
      }
    };
  };

  const stats = getAdvancedStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement du dashboard moderne...</p>
        </div>
      </div>
    );
  }

  // Logic to determine unique top 3 performers for the Leaderboard display
  const rankedTopPerformers = [];
  const addedIds = new Set();

  if (stats.employees.employeeOfTheWeek) {
    rankedTopPerformers.push(stats.employees.employeeOfTheWeek);
    addedIds.add(stats.employees.employeeOfTheWeek.id);
  }

  if (stats.employees.employeeOfTheDay && !addedIds.has(stats.employees.employeeOfTheDay.id)) {
    rankedTopPerformers.push(stats.employees.employeeOfTheDay);
    addedIds.add(stats.employees.employeeOfTheDay.id);
  }

  // Fill up to 3 slots with null if not enough unique top performers
  while (rankedTopPerformers.length < 3) {
    rankedTopPerformers.push(null);
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6 space-y-6">

        {/* Header Hero Moderne */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-6 lg:p-8 text-white shadow-2xl"
        >
          {/* Éléments décoratifs */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full translate-y-48 -translate-x-48"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                    Dashboard Administrateur
                  </h1>
                  <p className="text-lg text-blue-100">
                    Vue d'overview intelligente et moderne
                  </p>
                </div>
              </div>

              {/* Métriques rapides dans le header */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{stats.employees.active}</span>
                  <span className="text-sm text-blue-100">actifs</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">{stats.attendance.rate}%</span>
                  <span className="text-sm text-blue-100">présence</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span className="font-semibold">{stats.leaves.pending}</span>
                  <span className="text-sm text-blue-100">en attente</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold text-green-300">{stats.system.uptime}</span>
                  <span className="text-sm text-blue-100">uptime</span>
                </div>
                {stats.employees.employeeOfTheDay && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span className="font-semibold">{stats.employees.employeeOfTheDay.full_name}</span>
                    <span className="text-sm text-blue-100">Employé du jour</span>
                  </div>
                )}
                 {stats.employees.employeeOfTheWeek && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-300" />
                    <span className="font-semibold">{stats.employees.employeeOfTheWeek.full_name}</span>
                    <span className="text-sm text-blue-100">Employé de la semaine</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Live • {format(lastUpdated || new Date(), 'HH:mm:ss')}</span>
              </div>

              <Button
                onClick={handleManualRefresh}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* CORRECTION: Ajout section Leaderboard dans le dashboard admin */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0 p-1 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2"
              >
                <BarChart3 className="w-4 h-4" />
                Vue d'overview
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2"
              >
                <Users className="w-4 h-4" />
                Équipe
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2"
              >
                <Trophy className="w-4 h-4" />
                Classement
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2"
              >
                <TrendingUp className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-2"
              >
                <AlertCircle className="w-4 h-4" />
                Alertes
                {(stats.leaves.pending + stats.attendance.incompleteEntries + stats.announcements.urgent) > 0 && (
                  <Badge className="bg-red-500 text-white ml-1 px-1 py-0 text-xs">
                    {stats.leaves.pending + stats.attendance.incompleteEntries + stats.announcements.urgent}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Filtres et options d'affichage */}
            <div className="flex items-center gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-sm"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>

              <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded ${viewMode === "cards" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}
                >
                  <Target className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenu des onglets */}
          <TabsContent value="overview" className="space-y-6">
            {/* Grille de statistiques moderne */}
            <ModernStatsGrid stats={stats} />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Graphiques interactifs */}
              <div className="lg:col-span-2 space-y-6">
                <InteractiveChart
                  data={timeEntries}
                  employees={employees}
                  type="attendance"
                  timeFilter={timeFilter}
                />
                <LiveActivityStream
                  activities={[
                    ...timeEntries.slice(0, 5).map(entry => ({
                      type: 'clock',
                      title: 'Pointage employé',
                      description: `${entry.check_in_time} - ${entry.status}`,
                      time: entry.created_date,
                      status: entry.status
                    })),
                    ...leaveRequests.slice(0, 3).map(leave => ({
                      type: 'leave',
                      title: 'Demande de congé',
                      description: `${leave.leave_type} - ${leave.days_requested} jours`,
                      time: leave.created_date,
                      status: leave.status
                    }))
                  ]}
                />
              </div>

              {/* Panneau de contrôle */}
              <div className="space-y-6">
                <QuickActionCenter stats={stats} />
                <AlertsAndNotifications
                  pendingLeaves={stats.leaves.pending}
                  incompleteEntries={stats.attendance.incompleteEntries}
                  urgentAnnouncements={stats.announcements.urgent}
                />
                {currentUser && <NotificationTestButton currentUser={currentUser} compact />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <TeamOverviewWidget
              employees={employees}
              timeEntries={timeEntries}
              viewMode={viewMode}
            />
          </TabsContent>

          {/* Nouvel onglet Leaderboard */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Top 3 Performers */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <Crown className="w-6 h-6" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {rankedTopPerformers.map((employee, index) => (
                        <div key={index} className="text-center">
                          {employee ? (
                            <>
                              <div className="relative w-16 h-16 mx-auto mb-3">
                                <AvatarGenerator
                                  firstName={employee.first_name}
                                  lastName={employee.last_name}
                                  email={employee.email}
                                  department={employee.department}
                                  size="lg"
                                  className={`ring-2 ${index === 0 ? 'ring-yellow-400' : index === 1 ? 'ring-gray-400' : 'ring-orange-400'}`}
                                />
                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-500' :
                                  index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                                }`}>
                                  {index + 1}
                                </div>
                              </div>
                              <h3 className="font-semibold text-sm">{employee.full_name}</h3>
                              <p className="text-xs text-gray-600">{employee.total_points} points</p>
                              <Badge className="mt-1 text-xs">
                                Niveau {employee.level}
                              </Badge>
                            </>
                          ) : (
                            <div className="opacity-50">
                              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-400">Position #{index + 1}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link to={createPageUrl("Leaderboard")}>
                        <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0">
                          <Trophy className="w-4 h-4 mr-2" />
                          Voir Classement Complet
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Statistiques Gamification */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Statistiques Gamification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Badges</span>
                      <Badge variant="outline">{stats.gamification.totalBadgesCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Points Distribués</span>
                      <Badge variant="outline">
                        {stats.gamification.totalPointsDistributed}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Employés Actifs</span>
                      <Badge variant="outline">{stats.employees.active}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Actions Rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to={createPageUrl("GamificationAdmin")}>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Gérer Gamification
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Leaderboard")}>
                      <Button variant="outline" className="w-full justify-start">
                        <Trophy className="w-4 h-4 mr-2" />
                        Voir Classement
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <PerformanceMetrics
                employees={employees}
                timeEntries={timeEntries}
                leaveRequests={leaveRequests}
              />
              <LocationHeatmap employees={employees} />
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsAndNotifications
              pendingLeaves={stats.leaves.pending}
              incompleteEntries={stats.attendance.incompleteEntries}
              urgentAnnouncements={stats.announcements.urgent}
              detailed={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
