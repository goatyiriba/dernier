import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Clock, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Coffee,
  Target,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Zap,
  Trophy,
  Crown,
  Timer,
  Globe,
  Smartphone,
  RefreshCw,
  Info,
  Loader
} from "lucide-react";
import { 
  TimeEntry, 
  Employee, 
  User as UserEntity, 
  LeaveRequest, 
  EmployeePoints, 
  Badge as BadgeEntity,
  Announcement,
  AnnouncementReadStatus
} from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, startOfWeek, endOfWeek, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import AvatarGenerator from "../components/ui/AvatarGenerator";

export default function EmployeeDashboard() {
  // États principaux
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeePoints, setEmployeePoints] = useState(null);
  const [employeeBadges, setEmployeeBadges] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [employeeOfTheDay, setEmployeeOfTheDay] = useState(null);
  const [employeeOfTheWeek, setEmployeeOfTheWeek] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // États calculés
  const [stats, setStats] = useState({
    hoursThisWeek: 0,
    hoursThisMonth: 0,
    averageHoursPerDay: 0,
    daysWorkedThisWeek: 0,
    punctualityRate: 100,
    attendanceRate: 100,
    leaveBalance: 0,
    pendingLeaves: 0,
    completedTasks: 0,
    unreadAnnouncements: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    console.log('🏠 EmployeeDashboard component mounted');
    initializeDashboard();
    
    // Actualisation automatique toutes les 5 minutes
    const interval = setInterval(() => {
      refreshDashboard();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    try {
      console.log('🚀 Initializing Employee Dashboard...');
      setIsLoading(true);
      setError(null);
      
      // Step 1: Authentification
      console.log('🔐 Step 1: Authenticating user...');
      const user = await UserEntity.me();
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        employee_id: user.employee_id
      });
      
      setCurrentUser(user);
      
      if (!user.is_active) {
        console.log('❌ User not active');
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // Step 2: Charger les données
      await loadDashboardData(user);
      
    } catch (error) {
      console.error('❌ Error initializing dashboard:', error);
      setError(`Erreur de connexion: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (user) => {
    try {
      console.log('📊 Loading dashboard data...');
      
      // Step 1: Trouver l'employé actuel
      console.log('👤 Step 1: Finding current employee...');
      let employee = null;
      
      if (user.employee_id) {
        console.log('🔍 Searching by employee_id:', user.employee_id);
        const employeeResults = await Employee.filter({ id: user.employee_id }).catch(err => {
          console.warn('Error filtering by employee_id:', err);
          return [];
        });
        if (employeeResults.length > 0) {
          employee = employeeResults[0];
          console.log('✅ Found employee by ID:', employee.first_name, employee.last_name);
        }
      }
      
      if (!employee && user.email) {
        console.log('🔍 Searching by email:', user.email);
        const employeeResults = await Employee.filter({ email: user.email }).catch(err => {
          console.warn('Error filtering by email:', err);
          return [];
        });
        if (employeeResults.length > 0) {
          employee = employeeResults[0];
          console.log('✅ Found employee by email:', employee.first_name, employee.last_name);
        }
      }

      if (!employee) {
        console.log('❌ No employee profile found');
        setError('Aucun profil employé trouvé. Contactez votre administrateur.');
        return;
      }

      setCurrentEmployee(employee);
      console.log('👤 Current employee set:', employee.id);

      // Step 2: Charger les données en parallèle
      console.log('📊 Step 2: Loading employee data...');
      await Promise.all([
        loadEmployeePoints(employee.id),
        loadEmployeeBadges(employee.id),
        loadTimeEntries(employee.id),
        loadLeaveRequests(employee.id),
        loadAnnouncements(employee),
        loadEmployeeOfTheDay(),
        loadEmployeeOfTheWeek()
      ]);

      console.log('✅ Dashboard data loaded successfully');
      setLastRefresh(new Date());
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      throw error;
    }
  };

  const loadEmployeePoints = async (employeeId) => {
    try {
      console.log('🏆 Loading employee points for:', employeeId);
      const pointsResults = await EmployeePoints.filter({ employee_id: employeeId }).catch(err => {
        console.warn('Error loading employee points:', err);
        return [];
      });
      
      if (pointsResults.length > 0) {
        const points = pointsResults[0];
        setEmployeePoints(points);
        console.log('✅ Employee points loaded:', points.total_points);
      } else {
        console.log('⚠️ No employee points found, creating default');
        // Créer un enregistrement par défaut
        const defaultPoints = {
          employee_id: employeeId,
          total_points: 0,
          level: 1,
          points_this_month: 0,
          points_this_week: 0,
          streak_days: 0,
          badges_count: 0
        };
        setEmployeePoints(defaultPoints);
      }
    } catch (error) {
      console.error('❌ Error loading employee points:', error);
    }
  };

  const loadEmployeeBadges = async (employeeId) => {
    try {
      console.log('🏅 Loading employee badges for:', employeeId);
      const badgesResults = await BadgeEntity.filter({ employee_id: employeeId }).catch(err => {
        console.warn('Error loading badges:', err);
        return [];
      });
      
      setEmployeeBadges(badgesResults || []);
      console.log('✅ Employee badges loaded:', badgesResults?.length || 0);
    } catch (error) {
      console.error('❌ Error loading employee badges:', error);
    }
  };

  const loadTimeEntries = async (employeeId) => {
    try {
      console.log('⏰ Loading time entries for:', employeeId);
      const entriesResults = await TimeEntry.filter({ employee_id: employeeId }).catch(err => {
        console.warn('Error loading time entries:', err);
        return [];
      });
      
      setTimeEntries(entriesResults || []);
      console.log('✅ Time entries loaded:', entriesResults?.length || 0);
      
      // Calculer les statistiques
      calculateTimeStats(entriesResults || []);
    } catch (error) {
      console.error('❌ Error loading time entries:', error);
    }
  };

  const loadLeaveRequests = async (employeeId) => {
    try {
      console.log('🏖️ Loading leave requests for:', employeeId);
      const leaveResults = await LeaveRequest.filter({ employee_id: employeeId }).catch(err => {
        console.warn('Error loading leave requests:', err);
        return [];
      });
      
      setLeaveRequests(leaveResults || []);
      console.log('✅ Leave requests loaded:', leaveResults?.length || 0);
    } catch (error) {
      console.error('❌ Error loading leave requests:', error);
    }
  };

  const loadAnnouncements = async (employee) => {
    try {
      console.log('📢 Loading announcements...');
      const announcementsResults = await Announcement.list("-created_date", 50).catch(err => {
        console.warn('Error loading announcements:', err);
        return [];
      });
      
      // Filtrer les annonces visibles pour cet employé
      const visibleAnnouncements = (announcementsResults || []).filter(ann => {
        if (!ann.is_published) return false;
        if (ann.expiry_date && new Date(ann.expiry_date) < new Date()) return false;
        
        if (ann.target_audience === 'all') return true;
        if (ann.target_audience === 'department_specific' && ann.department_filter === employee.department) return true;
        
        return false;
      });
      
      setAnnouncements(visibleAnnouncements);
      console.log('✅ Announcements loaded:', visibleAnnouncements.length);
    } catch (error) {
      console.error('❌ Error loading announcements:', error);
    }
  };

  const loadEmployeeOfTheDay = async () => {
    try {
      console.log('🌟 Loading employee of the day...');
      const allEmployeePoints = await EmployeePoints.list("-total_points", 1).catch(err => {
        console.warn('Error loading top employee:', err);
        return [];
      });
      
      if (allEmployeePoints.length > 0) {
        const topEmployeePoints = allEmployeePoints[0];
        const employeeResults = await Employee.filter({ id: topEmployeePoints.employee_id }).catch(() => []);
        
        if (employeeResults.length > 0) {
          const employee = employeeResults[0];
          setEmployeeOfTheDay({
            ...employee,
            total_points: topEmployeePoints.total_points,
            level: topEmployeePoints.level
          });
          console.log('✅ Employee of the day loaded:', employee.first_name, employee.last_name);
        }
      }
    } catch (error) {
      console.error('❌ Error loading employee of the day:', error);
    }
  };

  const loadEmployeeOfTheWeek = async () => {
    try {
      console.log('🌟 Loading employee of the week...');
      const allEmployeePoints = await EmployeePoints.list("-points_this_week", 1).catch(err => {
        console.warn('Error loading top weekly employee:', err);
        return [];
      });
      
      if (allEmployeePoints.length > 0) {
        const topEmployeePoints = allEmployeePoints[0];
        const employeeResults = await Employee.filter({ id: topEmployeePoints.employee_id }).catch(() => []);
        
        if (employeeResults.length > 0) {
          const employee = employeeResults[0];
          setEmployeeOfTheWeek({
            ...employee,
            points_this_week: topEmployeePoints.points_this_week,
            level: topEmployeePoints.level
          });
          console.log('✅ Employee of the week loaded:', employee.first_name, employee.last_name);
        }
      }
    } catch (error) {
      console.error('❌ Error loading employee of the week:', error);
    }
  };

  const calculateTimeStats = (entries) => {
    try {
      console.log('📊 Calculating time statistics...');
      
      const now = new Date();
      const startWeek = startOfWeek(now, { weekStartsOn: 1 });
      const endWeek = endOfWeek(now, { weekStartsOn: 1 });
      
      const thisWeekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startWeek && entryDate <= endWeek;
      });
      
      const hoursThisWeek = thisWeekEntries.reduce((total, entry) => {
        return total + (entry.hours_worked || 0);
      }, 0);
      
      const daysWorkedThisWeek = thisWeekEntries.filter(entry => 
        entry.status === 'checked_out' && entry.hours_worked > 0
      ).length;
      
      const punctualEntries = thisWeekEntries.filter(entry => {
        if (!entry.check_in_time) return false;
        const checkInTime = entry.check_in_time;
        return checkInTime <= '09:00'; // Considéré comme ponctuel si arrivée avant 9h
      });
      
      const punctualityRate = thisWeekEntries.length > 0 
        ? Math.round((punctualEntries.length / thisWeekEntries.length) * 100)
        : 100;
      
      const attendanceRate = Math.round((daysWorkedThisWeek / 5) * 100); // Sur 5 jours ouvrables
      
      setStats(prevStats => ({
        ...prevStats,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        daysWorkedThisWeek,
        punctualityRate,
        attendanceRate,
        averageHoursPerDay: daysWorkedThisWeek > 0 ? Math.round((hoursThisWeek / daysWorkedThisWeek) * 10) / 10 : 0
      }));
      
      console.log('✅ Time statistics calculated');
    } catch (error) {
      console.error('❌ Error calculating time stats:', error);
    }
  };

  const refreshDashboard = async () => {
    try {
      console.log('🔄 Refreshing dashboard...');
      if (currentUser && currentEmployee) {
        await loadDashboardData(currentUser);
        toast({
          title: "✅ Dashboard actualisé",
          description: "Toutes les données ont été mises à jour",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing dashboard:', error);
      toast({
        title: "❌ Erreur de mise à jour",
        description: "Impossible d'actualiser le dashboard",
        variant: "destructive"
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getBadgeIcon = (iconName) => {
    const iconMap = {
      'Trophy': Trophy,
      'Award': Award,
      'Star': Star,
      'Crown': Crown,
      'Target': Target,
      'Zap': Zap,
      'CheckCircle': CheckCircle,
      'Activity': Activity,
      'Timer': Timer,
      'Globe': Globe
    };
    return iconMap[iconName] || Award;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <Badge className={`px-2 py-1 text-xs ${trend.type === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.value}
          </Badge>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Erreur de connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            <Button onClick={initializeDashboard} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header avec salutation */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative">
                  <AvatarGenerator
                    firstName={currentEmployee?.first_name}
                    lastName={currentEmployee?.last_name}
                    email={currentEmployee?.email}
                    department={currentEmployee?.department}
                    profilePicture={currentEmployee?.profile_picture}
                    size="xl"
                    style={currentEmployee?.avatar_style || 'auto'}
                    className="ring-4 ring-white/30 shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 border-4 border-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{employeePoints?.level || 1}</span>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    {getGreeting()}, {currentEmployee?.first_name}! 👋
                  </h1>
                  <p className="text-xl text-blue-100 mb-3">
                    {currentEmployee?.position} • {currentEmployee?.department}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white px-3 py-1">
                      <Trophy className="w-4 h-4 mr-1" />
                      {employeePoints?.total_points || 0} points
                    </Badge>
                    <Badge className="bg-white/20 text-white px-3 py-1">
                      <Award className="w-4 h-4 mr-1" />
                      {employeeBadges.length} badges
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">{format(new Date(), "HH:mm")}</p>
                <p className="text-blue-200">{format(new Date(), "EEEE, d MMMM yyyy", { locale: fr })}</p>
              </div>
              
              <Button
                onClick={refreshDashboard}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Heures cette semaine"
            value={stats.hoursThisWeek}
            subtitle="heures"
            icon={Clock}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          
          <StatCard
            title="Jours travaillés"
            value={stats.daysWorkedThisWeek}
            subtitle="sur 5"
            icon={Calendar}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          
          <StatCard
            title="Ponctualité"
            value={`${stats.punctualityRate}%`}
            icon={Timer}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          
          <StatCard
            title="Présence"
            value={`${stats.attendanceRate}%`}
            icon={CheckCircle}
            color="bg-gradient-to-br from-amber-500 to-orange-500"
          />
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne gauche - Activité récente */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pointages récents */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Pointages récents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          entry.status === 'checked_out' ? 'bg-green-500' :
                          entry.status === 'checked_in' ? 'bg-blue-500' :
                          entry.status === 'on_break' ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{format(new Date(entry.date), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-gray-600">
                            {entry.check_in_time} - {entry.check_out_time || 'En cours'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{entry.hours_worked || 0}h</p>
                        <Badge className={`text-xs ${
                          entry.status === 'checked_out' ? 'bg-green-100 text-green-700' :
                          entry.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                          entry.status === 'on_break' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {entry.status === 'checked_out' ? 'Terminé' :
                           entry.status === 'checked_in' ? 'En cours' :
                           entry.status === 'on_break' ? 'En pause' :
                           'Incomplet'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                  
                  {timeEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun pointage enregistré</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Demandes de congés */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Mes demandes de congés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests.slice(0, 3).map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{request.leave_type}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(request.start_date), 'dd/MM/yyyy')} - {format(new Date(request.end_date), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">{request.days_requested} jour(s)</p>
                      </div>
                      <Badge className={`${
                        request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        request.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'Denied' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {request.status === 'Approved' ? 'Approuvé' :
                         request.status === 'Pending' ? 'En attente' :
                         request.status === 'Denied' ? 'Refusé' :
                         request.status}
                      </Badge>
                    </motion.div>
                  ))}
                  
                  {leaveRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune demande de congé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Widgets */}
          <div className="space-y-6">
            
            {/* Mes badges */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Mes badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {employeeBadges.slice(0, 6).map((badge, index) => {
                    const BadgeIcon = getBadgeIcon(badge.badge_icon);
                    return (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col items-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                      >
                        <BadgeIcon className="w-8 h-8 text-yellow-600 mb-2" />
                        <p className="text-xs font-medium text-center text-yellow-800">
                          {badge.badge_name}
                        </p>
                        <p className="text-xs text-yellow-600">
                          +{badge.points_value} pts
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
                
                {employeeBadges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun badge obtenu</p>
                    <p className="text-xs">Continuez à travailler pour en gagner !</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employé du jour */}
            {employeeOfTheDay && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Crown className="w-5 h-5" />
                    Employé du jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <AvatarGenerator
                      firstName={employeeOfTheDay.first_name}
                      lastName={employeeOfTheDay.last_name}
                      email={employeeOfTheDay.email}
                      department={employeeOfTheDay.department}
                      profilePicture={employeeOfTheDay.profile_picture}
                      size="md"
                      style={employeeOfTheDay.avatar_style}
                      className="ring-2 ring-yellow-400"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-yellow-800">
                        {employeeOfTheDay.first_name} {employeeOfTheDay.last_name}
                      </p>
                      <p className="text-sm text-yellow-600">{employeeOfTheDay.department}</p>
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs mt-1">
                        {employeeOfTheDay.total_points} points
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Employé de la semaine */}
            {employeeOfTheWeek && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Star className="w-5 h-5" />
                    Employé de la semaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <AvatarGenerator
                      firstName={employeeOfTheWeek.first_name}
                      lastName={employeeOfTheWeek.last_name}
                      email={employeeOfTheWeek.email}
                      department={employeeOfTheWeek.department}
                      profilePicture={employeeOfTheWeek.profile_picture}
                      size="md"
                      style={employeeOfTheWeek.avatar_style}
                      className="ring-2 ring-purple-400"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-purple-800">
                        {employeeOfTheWeek.first_name} {employeeOfTheWeek.last_name}
                      </p>
                      <p className="text-sm text-purple-600">{employeeOfTheWeek.department}</p>
                      <Badge className="bg-purple-100 text-purple-800 text-xs mt-1">
                        {employeeOfTheWeek.points_this_week} pts cette semaine
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Annonces récentes */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Annonces récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement, index) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <p className="font-medium text-blue-900 text-sm">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        {format(new Date(announcement.created_date), 'dd/MM/yyyy')}
                      </p>
                      <Badge className={`text-xs mt-2 ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {announcement.priority === 'urgent' ? 'Urgent' :
                         announcement.priority === 'high' ? 'Important' :
                         'Normal'}
                      </Badge>
                    </motion.div>
                  ))}
                  
                  {announcements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune annonce récente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Informations de debug */}
        <div className="text-xs text-gray-500 text-center">
          Dernière mise à jour: {format(lastRefresh, 'HH:mm:ss')}
        </div>
      </div>
    </div>
  );
}