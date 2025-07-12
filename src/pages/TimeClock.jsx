
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Coffee, 
  MapPin, 
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Timer,
  BarChart3,
  Loader2,
  RefreshCw,
  Settings,
  Info,
  User,
  Shield,
  HelpCircle,
  Activity,
  Zap,
  Globe,
  Smartphone,
  Navigation,
  Target,
  Award,
  Star,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Utensils
} from "lucide-react";
import { TimeEntry, Employee, User as UserEntity, TimeSettings } from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInMinutes, differenceInHours, startOfWeek, endOfWeek, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import AvatarGenerator from "../components/ui/AvatarGenerator";

export default function TimeClock() {
  // États principaux
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [todayEntry, setTodayEntry] = useState(null);
  const [weekEntries, setWeekEntries] = useState([]);
  const [timeSettings, setTimeSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États d'actions
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isProcessingBreak, setIsProcessingBreak] = useState(false);
  
  // États d'interface
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workDuration, setWorkDuration] = useState('00:00:00');
  const [breakDuration, setBreakDuration] = useState('00:00:00');
  const [locationData, setLocationData] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  // États pour le modal de pause avec motif
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakReason, setBreakReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  
  const { toast } = useToast();
  const timeUpdateInterval = useRef(null);

  // Motifs de pause prédéfinis
  const breakReasons = [
    { value: 'lunch', label: '🍽️ Pause déjeuner', icon: Utensils },
    { value: 'coffee', label: '☕ Pause café', icon: Coffee },
    { value: 'personal', label: '👤 Pause personnelle', icon: User },
    { value: 'phone', label: '📞 Appel personnel', icon: Info },
    { value: 'medical', label: '🏥 Rendez-vous médical', icon: Shield },
    { value: 'other', label: '➕ Autre motif', icon: HelpCircle }
  ];

  useEffect(() => {
    initializeTimeClock();
    
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    timeUpdateInterval.current = setInterval(() => {
      setCurrentTime(new Date());
      if (todayEntry) {
        updateWorkDuration();
        updateBreakDuration();
      }
    }, 1000);

    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
    };
  }, [todayEntry]);

  const initializeTimeClock = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await UserEntity.me();
      setCurrentUser(user);
      
      if (!user.is_active) {
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      await loadTimeClockData(user);
      
    } catch (error) {
      setError(`Erreur d'initialisation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimeClockData = async (user) => {
    try {
      // Trouver l'employé
      let employee = null;
      
      if (user.employee_id) {
        const employeeResults = await Employee.filter({ id: user.employee_id }).catch(() => []);
        if (employeeResults.length > 0) {
          employee = employeeResults[0];
        }
      }
      
      if (!employee && user.email) {
        const employeeResults = await Employee.filter({ email: user.email }).catch(() => []);
        if (employeeResults.length > 0) {
          employee = employeeResults[0];
        }
      }

      if (!employee) {
        throw new Error('Aucun profil employé trouvé. Contactez votre administrateur.');
      }

      setCurrentEmployee(employee);
      
      // Charger les paramètres de temps
      await loadTimeSettings();
      
      // Charger les entrées de temps
      await loadTimeEntries(employee.id);
      
    } catch (error) {
      throw error;
    }
  };

  const loadTimeSettings = async () => {
    try {
      const settings = await TimeSettings.list();
      if (settings && settings.length > 0) {
        setTimeSettings(settings[0]);
      } else {
        // Paramètres par défaut
        setTimeSettings({
          check_in_start: "07:00",
          check_in_end: "10:00",
          check_out_start: "16:00",
          check_out_end: "20:00",
          require_location: false,
          max_work_hours: 10
        });
      }
    } catch (error) {
      console.warn('Erreur chargement paramètres temps:', error);
      setTimeSettings({
        check_in_start: "07:00",
        check_in_end: "10:00",
        check_out_start: "16:00",
        check_out_end: "20:00",
        require_location: false,
        max_work_hours: 10
      });
    }
  };

  const loadTimeEntries = async (employeeId) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const allEntries = await TimeEntry.filter({ employee_id: employeeId });
      
      const todayEntries = allEntries.filter(entry => entry.date === today);
      const todayEntry = todayEntries.length > 0 ? todayEntries[0] : null;
      
      setTodayEntry(todayEntry);
      
      // Vérifier si en pause
      if (todayEntry && todayEntry.status === 'on_break') {
        setIsOnBreak(true);
      }
      
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const weekEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      setWeekEntries(weekEntries);
      
    } catch (error) {
      console.warn('Erreur chargement entrées temps:', error);
      setTodayEntry(null);
      setWeekEntries([]);
    }
  };

  const updateWorkDuration = () => {
    if (!todayEntry || !todayEntry.check_in_time) return;

    const now = new Date();
    const checkInTime = new Date(`${todayEntry.date}T${todayEntry.check_in_time}`);
    
    let totalMinutes = differenceInMinutes(now, checkInTime);
    
    // Soustraire les pauses
    if (todayEntry.total_break_duration) {
      totalMinutes -= todayEntry.total_break_duration;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const seconds = Math.floor((now.getTime() - checkInTime.getTime()) / 1000) % 60;
    
    setWorkDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const updateBreakDuration = () => {
    if (!todayEntry || !isOnBreak || !todayEntry.break_start_time) return;

    const now = new Date();
    const breakStartTime = new Date(`${todayEntry.date}T${todayEntry.break_start_time}`);
    const breakMinutes = differenceInMinutes(now, breakStartTime);
    
    const hours = Math.floor(breakMinutes / 60);
    const minutes = breakMinutes % 60;
    const seconds = Math.floor((now.getTime() - breakStartTime.getTime()) / 1000) % 60;
    
    setBreakDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleCheckIn = async () => {
    try {
      setIsCheckingIn(true);
      
      const now = new Date();
      const timeString = format(now, 'HH:mm:ss');
      const dateString = format(now, 'yyyy-MM-dd');
      
      await TimeEntry.create({
        employee_id: currentEmployee.id,
        date: dateString,
        check_in_time: timeString,
        status: 'checked_in',
        location: locationData?.address || 'Non spécifié',
        latitude: locationData?.latitude,
        longitude: locationData?.longitude
      });
      
      await loadTimeEntries(currentEmployee.id);
      
      toast({
        title: "✅ Pointage d'entrée enregistré",
        description: `Arrivée à ${timeString}`,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'enregistrer le pointage",
        variant: "destructive"
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingOut(true);
      
      if (!todayEntry) {
        throw new Error('Aucun pointage d\'entrée trouvé');
      }
      
      const now = new Date();
      const timeString = format(now, 'HH:mm:ss');
      
      const checkInTime = new Date(`${todayEntry.date}T${todayEntry.check_in_time}`);
      const totalMinutes = differenceInMinutes(now, checkInTime);
      const hoursWorked = totalMinutes / 60;
      
      await TimeEntry.update(todayEntry.id, {
        check_out_time: timeString,
        hours_worked: hoursWorked,
        status: 'checked_out'
      });
      
      await loadTimeEntries(currentEmployee.id);
      
      toast({
        title: "✅ Pointage de sortie enregistré",
        description: `Départ à ${timeString}`,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'enregistrer le pointage de sortie",
        variant: "destructive"
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Fonction pour ouvrir le modal de pause
  const handleBreakClick = () => {
    if (isOnBreak) {
      handleEndBreak();
    } else {
      setShowBreakModal(true);
      setBreakReason('');
      setCustomReason('');
    }
  };

  // Fonction pour démarrer une pause avec motif
  const handleStartBreakWithReason = async () => {
    try {
      setIsProcessingBreak(true);
      
      if (!todayEntry) {
        throw new Error('Aucun pointage d\'entrée trouvé');
      }
      
      const now = new Date();
      const timeString = format(now, 'HH:mm:ss');
      
      // Déterminer le motif final
      let finalReason = breakReason;
      if (breakReason === 'other' && customReason.trim()) {
        finalReason = customReason.trim();
      } else if (breakReason) {
        const selectedBreakType = breakReasons.find(r => r.value === breakReason);
        finalReason = selectedBreakType?.label || breakReason;
      }
      
      await TimeEntry.update(todayEntry.id, {
        break_start_time: timeString,
        status: 'on_break',
        notes: finalReason ? `Pause: ${finalReason}` : 'Pause'
      });
      
      setIsOnBreak(true);
      setShowBreakModal(false);
      await loadTimeEntries(currentEmployee.id);
      
      toast({
        title: "☕ Pause commencée",
        description: finalReason ? `${finalReason} à ${timeString}` : `Début de pause à ${timeString}`,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de démarrer la pause",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBreak(false);
    }
  };

  const handleEndBreak = async () => {
    try {
      setIsProcessingBreak(true);
      
      if (!todayEntry || !todayEntry.break_start_time) {
        throw new Error('Aucune pause en cours');
      }
      
      const now = new Date();
      const timeString = format(now, 'HH:mm:ss');
      
      const breakStartTime = new Date(`${todayEntry.date}T${todayEntry.break_start_time}`);
      const breakDurationMinutes = differenceInMinutes(now, breakStartTime);
      
      const totalBreakDuration = (todayEntry.total_break_duration || 0) + breakDurationMinutes;
      
      await TimeEntry.update(todayEntry.id, {
        break_end_time: timeString,
        total_break_duration: totalBreakDuration,
        status: 'checked_in'
      });
      
      setIsOnBreak(false);
      await loadTimeEntries(currentEmployee.id);
      
      toast({
        title: "✅ Pause terminée",
        description: `Fin de pause à ${timeString} (${breakDurationMinutes} min)`,
        duration: 2000,
      });
      
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible de terminer la pause",
        variant: "destructive"
      });
    } finally {
      setIsProcessingBreak(false);
    }
  };

  // Calculs pour les statistiques
  const getWeekStats = () => {
    const totalHours = weekEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
    const totalDays = weekEntries.filter(entry => entry.hours_worked > 0).length;
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    return {
      totalHours: Math.round(totalHours * 10) / 10,
      totalDays,
      averageHours: Math.round(averageHours * 10) / 10
    };
  };

  const getCurrentStatus = () => {
    if (!todayEntry) return { status: 'not_started', label: 'Pas encore pointé', color: 'gray' };
    if (todayEntry.status === 'on_break') return { status: 'on_break', label: 'En pause', color: 'yellow' };
    if (todayEntry.check_out_time) return { status: 'finished', label: 'Journée terminée', color: 'green' };
    if (todayEntry.check_in_time) return { status: 'working', label: 'En cours de travail', color: 'blue' };
    return { status: 'unknown', label: 'Statut inconnu', color: 'gray' };
  };

  const getTimeOfDayIcon = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 12) return <Sunrise className="w-6 h-6 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sun className="w-6 h-6 text-orange-500" />;
    if (hour >= 18 && hour < 22) return <Sunset className="w-6 h-6 text-orange-600" />;
    return <Moon className="w-6 h-6 text-indigo-500" />;
  };

  const weekStats = getWeekStats();
  const currentStatus = getCurrentStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Clock className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Initialisation</h2>
            <p className="text-gray-600">Chargement de votre système de pointage...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Erreur de connexion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              
              <Button 
                onClick={initializeTimeClock} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header moderne avec heure en temps réel */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          {/* Éléments décoratifs */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-6">
                {currentEmployee && (
                  <AvatarGenerator
                    firstName={currentEmployee.first_name}
                    lastName={currentEmployee.last_name}
                    email={currentEmployee.email}
                    department={currentEmployee.department}
                    size="xl"
                    className="ring-4 ring-white/30 shadow-2xl"
                  />
                )}
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                    Système de Pointage
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    {currentEmployee ? `Bonjour ${currentEmployee.first_name} !` : 'Bienvenue'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${currentStatus.status === 'working' ? 'bg-green-500' : 
                                      currentStatus.status === 'on_break' ? 'bg-yellow-500' :
                                      currentStatus.status === 'finished' ? 'bg-blue-500' :
                                      'bg-gray-500'} text-white px-3 py-1`}>
                      <Activity className="w-3 h-3 mr-1" />
                      {currentStatus.label}
                    </Badge>
                    <Badge className="bg-white/20 text-white px-3 py-1">
                      {currentEmployee?.department || 'Non défini'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{weekStats.totalHours}h</div>
                  <div className="text-sm text-blue-100">Cette semaine</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{weekStats.totalDays}</div>
                  <div className="text-sm text-blue-100">Jours travaillés</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{weekStats.averageHours}h</div>
                  <div className="text-sm text-blue-100">Moyenne/jour</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{workDuration}</div>
                  <div className="text-sm text-blue-100">Aujourd'hui</div>
                </div>
              </div>
            </div>
            
            {/* Horloge moderne */}
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="mb-4"
              >
                {getTimeOfDayIcon()}
              </motion.div>
              <div className="text-5xl lg:text-6xl font-bold mb-2 font-mono">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-blue-200 font-medium">
                {format(currentTime, 'EEEE, d MMMM yyyy', { locale: fr })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions de pointage modernes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Pointage principal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte de pointage principale */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Actions de Pointage</h2>
                  <p className="text-blue-100">Gérez vos heures de travail et pauses</p>
                </div>
                
                <CardContent className="p-8 space-y-8">
                  
                  {/* Boutons d'action principaux */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Check In */}
                    {!todayEntry && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleCheckIn}
                          disabled={isCheckingIn}
                          className="w-full h-32 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-xl text-lg font-semibold"
                        >
                          {isCheckingIn ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Play className="w-10 h-10" />
                              <span>Pointer l'Arrivée</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    )}
                    
                    {/* Check Out */}
                    {todayEntry && !todayEntry.check_out_time && !isOnBreak && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleCheckOut}
                          disabled={isCheckingOut}
                          className="w-full h-32 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-xl text-lg font-semibold"
                        >
                          {isCheckingOut ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <Square className="w-10 h-10" />
                              <span>Pointer le Départ</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    )}
                    
                    {/* Pause avec modal */}
                    {todayEntry && !todayEntry.check_out_time && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleBreakClick}
                          disabled={isProcessingBreak}
                          className={`w-full h-32 border-0 shadow-xl text-lg font-semibold ${
                            isOnBreak 
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700' 
                              : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
                          } text-white`}
                        >
                          {isProcessingBreak ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              {isOnBreak ? <Play className="w-10 h-10" /> : <Coffee className="w-10 h-10" />}
                              <span>{isOnBreak ? 'Reprendre le Travail' : 'Prendre une Pause'}</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    )}
                    
                    {/* Journée terminée */}
                    {todayEntry && todayEntry.check_out_time && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="md:col-span-2"
                      >
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-green-800 mb-2">Journée Terminée !</h3>
                          <p className="text-green-700">
                            Vous avez travaillé {todayEntry.hours_worked?.toFixed(1) || 0}h aujourd'hui
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Informations de session actuelle */}
                  {todayEntry && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 border border-gray-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Actuelle</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Timer className="w-6 h-6 text-blue-600" />
                          </div>
                          <p className="text-sm text-gray-600">Temps de travail</p>
                          <p className="text-2xl font-bold text-blue-600 font-mono">{workDuration}</p>
                        </div>
                        
                        {isOnBreak && (
                          <div className="text-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <Coffee className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-sm text-gray-600">Pause actuelle</p>
                            <p className="text-2xl font-bold text-orange-600 font-mono">{breakDuration}</p>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-sm text-gray-600">Arrivée</p>
                          <p className="text-xl font-bold text-green-600">
                            {todayEntry.check_in_time || '--:--'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Sidebar - Statistiques et informations */}
          <div className="space-y-6">
            
            {/* Statistiques de la semaine */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Statistiques Semaine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Heures totales</span>
                      <span className="font-bold text-purple-600">{weekStats.totalHours}h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jours travaillés</span>
                      <span className="font-bold text-blue-600">{weekStats.totalDays}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Moyenne par jour</span>
                      <span className="font-bold text-green-600">{weekStats.averageHours}h</span>
                    </div>
                  </div>
                  
                  {/* Progression vers objectif */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Objectif 40h</span>
                      <span className="text-sm font-medium">{Math.round((weekStats.totalHours / 40) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(weekStats.totalHours / 40) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Historique rapide */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Historique Récent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weekEntries.slice(-5).reverse().map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(entry.date), 'EEE dd/MM', { locale: fr })}
                          </p>
                          <p className="text-xs text-gray-600">
                            {entry.check_in_time} - {entry.check_out_time || 'En cours'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {entry.hours_worked ? `${entry.hours_worked.toFixed(1)}h` : '--'}
                          </p>
                          <Badge 
                            className={`text-xs ${
                              entry.status === 'checked_out' ? 'bg-green-100 text-green-800' :
                              entry.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                              entry.status === 'on_break' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {entry.status === 'checked_out' ? 'Terminé' :
                             entry.status === 'checked_in' ? 'En cours' :
                             entry.status === 'on_break' ? 'Pause' :
                             'Incomplet'}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal pour choisir le motif de pause */}
      <Dialog open={showBreakModal} onOpenChange={setShowBreakModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-orange-600" />
              Motif de la pause
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="break-reason" className="text-sm font-medium mb-3 block">
                Pourquoi prenez-vous une pause ?
              </Label>
              <Select value={breakReason} onValueChange={setBreakReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  {breakReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      <div className="flex items-center gap-2">
                        <reason.icon className="w-4 h-4" />
                        {reason.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Champ personnalisé si "Autre" */}
            {breakReason === 'other' && (
              <div>
                <Label htmlFor="custom-reason" className="text-sm font-medium mb-2 block">
                  Précisez le motif
                </Label>
                <Input
                  id="custom-reason"
                  placeholder="Décrivez votre motif de pause..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowBreakModal(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleStartBreakWithReason}
              disabled={!breakReason || (breakReason === 'other' && !customReason.trim()) || isProcessingBreak}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessingBreak ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Coffee className="w-4 h-4 mr-2" />
              )}
              Commencer la pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
