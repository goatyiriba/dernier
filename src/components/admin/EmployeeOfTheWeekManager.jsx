import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Award,
  Star,
  Crown,
  Trophy,
  Target,
  Clock,
  Users,
  MessageCircle,
  BookOpen,
  Lightbulb,
  UserCheck,
  Flame,
  CheckCircle,
  ArrowUp,
  Gift,
  Sparkles,
  TrendingUp,
  Calendar,
  Video,
  Heart,
  Wrench,
  CheckCircle2,
  GraduationCap,
  FileText,
  MessageSquare,
  Send,
  Sunrise,
  Plus,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  Users2,
  Target as TargetIcon,
  Clock as ClockIcon,
  MessageCircle as MessageCircleIcon,
  BookOpen as BookOpenIcon,
  Lightbulb as LightbulbIcon,
  Crown as CrownIcon,
  TrendingUp as TrendingUpIcon,
  Sparkles as SparklesIcon,
  Coins,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  DollarSign,
  Gift as GiftIcon,
  ShoppingCart,
  RefreshCw,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  Settings as SettingsIcon,
  User,
  UserPlus,
  UserMinus,
  UserCheck as UserCheckIcon,
  UserX,
  Users as UsersIcon,
  UserCog,
  UserEdit,
  UserSearch,
  UserTag,
  UserVoice,
  UserShield,
  UserStar,
  UserHeart,
  UserSmile,
  UserFrown,
  UserMeh,
  UserZap,
  UserGear,
  UserKey,
  UserLock,
  UserUnlock,
  UserAlert,
  UserBan,
  UserCheck2,
  UserClock,
  UserCrown,
  UserDollar,
  UserEdit2,
  UserMinus2,
  UserPlus2,
  UserSearch2,
  UserSettings,
  UserStar2,
  UserTag2,
  UserVoice2,
  UserX2,
  UserZap2,
  UserGear2,
  UserKey2,
  UserLock2,
  UserUnlock2,
  UserAlert2,
  UserBan2,
  UserCheck3,
  UserClock2,
  UserCrown2,
  UserDollar2,
  UserEdit3,
  UserMinus3,
  UserPlus3,
  UserSearch3,
  UserSettings2,
  UserStar3,
  UserTag3,
  UserVoice3,
  UserX3,
  UserZap3,
  UserGear3,
  UserKey3,
  UserLock3,
  UserUnlock3,
  UserAlert3,
  UserBan3,
  UserCheck4,
  UserClock3,
  UserCrown3,
  UserDollar3,
  UserEdit4,
  UserMinus4,
  UserPlus4,
  UserSearch4,
  UserSettings3,
  UserStar4,
  UserTag4,
  UserVoice4,
  UserX4,
  UserZap4,
  UserGear4,
  UserKey4,
  UserLock4,
  UserUnlock4,
  UserAlert4,
  UserBan4,
  UserCheck5,
  UserClock4,
  UserCrown4,
  UserDollar4,
  UserEdit5,
  UserMinus5,
  UserPlus5,
  UserSearch5,
  UserSettings4,
  UserStar5,
  UserTag5,
  UserVoice5,
  UserX5,
  UserZap5,
  UserGear5,
  UserKey5,
  UserLock5,
  UserUnlock5,
  UserAlert5,
  UserBan5,
  Zap,
  Bell,
  BellOff,
  BellRing,
  BellPlus,
  BellMinus,
  BellX,
  BellCheck,
  BellAlert,
  BellBan,
  BellClock,
  BellCrown,
  BellDollar,
  BellEdit,
  BellMinus2,
  BellPlus2,
  BellSearch,
  BellSettings,
  BellStar,
  BellTag,
  BellVoice,
  BellX2,
  BellZap,
  BellGear,
  BellKey,
  BellLock,
  BellUnlock,
  BellAlert2,
  BellBan2,
  BellCheck2,
  BellClock2,
  BellCrown2,
  BellDollar2,
  BellEdit2,
  BellMinus3,
  BellPlus3,
  BellSearch2,
  BellSettings2,
  BellStar2,
  BellTag2,
  BellVoice2,
  BellX3,
  BellZap2,
  BellGear2,
  BellKey2,
  BellLock2,
  BellUnlock2,
  BellAlert3,
  BellBan3,
  BellCheck3,
  BellClock3,
  BellCrown3,
  BellDollar3,
  BellEdit3,
  BellMinus4,
  BellPlus4,
  BellSearch3,
  BellSettings3,
  BellStar3,
  BellTag3,
  BellVoice3,
  BellX4,
  BellZap3,
  BellGear3,
  BellKey3,
  BellLock3,
  BellUnlock3,
  BellAlert4,
  BellBan4,
  BellCheck4,
  BellClock4,
  BellCrown4,
  BellDollar4,
  BellEdit4,
  BellMinus5,
  BellPlus5,
  BellSearch4,
  BellSettings4,
  BellStar4,
  BellTag4,
  BellVoice4,
  BellX5,
  BellZap4,
  BellGear4,
  BellKey4,
  BellLock4,
  BellUnlock4,
  BellAlert5,
  BellBan5
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, endOfWeek, isSameWeek, parseISO, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';
import AvatarGenerator from "../ui/AvatarGenerator";
import { Employee, AuthService } from '@/api/supabaseEntities';

export default function EmployeeOfTheWeekManager() {
  // États principaux
  const [nominations, setNominations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeePoints, setEmployeePoints] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  
  // États des modals
  const [showNominationForm, setShowNominationForm] = useState(false);
  const [editingNomination, setEditingNomination] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  // États du formulaire
  const [nominationForm, setNominationForm] = useState({
    employee_id: '',
    nomination_reason: '',
    achievements: [''],
    performance_score: 85,
    metrics: {
      attendance_rate: 100,
      punctuality_score: 95,
      tasks_completed: 0,
      collaboration_score: 90,
      innovation_points: 0,
      customer_satisfaction: 0,
      team_impact: 85
    },
    reward_details: {
      type: 'points',
      value: 500,
      description: 'Employé de la semaine'
    },
    public_recognition: true
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedWeek]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger toutes les données nécessaires
      const [
        nominationsData,
        employeesData,
        pointsData,
        timeEntriesData
      ] = await Promise.all([
        EmployeeOfTheWeek.list(),
        Employee.list(),
        EmployeePoints.list(),
        TimeEntry.list()
      ]);

      setNominations(nominationsData || []);
      setEmployees(employeesData || []);
      setEmployeePoints(pointsData || []);
      setTimeEntries(timeEntriesData || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekStats = (employeeId, weekStart, weekEnd) => {
    const employeeTimeEntries = timeEntries.filter(entry => 
      entry.employee_id === employeeId &&
      new Date(entry.date) >= weekStart &&
      new Date(entry.date) <= weekEnd
    );

    const totalDays = employeeTimeEntries.length;
    const completedDays = employeeTimeEntries.filter(entry => entry.check_out_time).length;
    const totalHours = employeeTimeEntries.reduce((sum, entry) => sum + (entry.hours_worked || 0), 0);
    const punctualEntries = employeeTimeEntries.filter(entry => {
      if (!entry.check_in_time) return false;
      const checkInTime = entry.check_in_time.split(':');
      const checkInMinutes = parseInt(checkInTime[0]) * 60 + parseInt(checkInTime[1]);
      return checkInMinutes <= (9 * 60); // Ponctuel si arrivée avant 9h00
    }).length;

    const attendanceRate = totalDays > 0 ? (completedDays / 5) * 100 : 0; // Sur 5 jours ouvrés
    const punctualityScore = totalDays > 0 ? (punctualEntries / totalDays) * 100 : 0;

    return {
      attendance_rate: Math.round(attendanceRate),
      punctuality_score: Math.round(punctualityScore),
      total_hours: Math.round(totalHours * 100) / 100,
      days_worked: totalDays
    };
  };

  const calculatePerformanceScore = (metrics) => {
    const weights = {
      attendance_rate: 0.25,
      punctuality_score: 0.20,
      collaboration_score: 0.20,
      team_impact: 0.15,
      tasks_completed: 0.10,
      innovation_points: 0.05,
      customer_satisfaction: 0.05
    };

    let score = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([key, weight]) => {
      if (metrics[key] !== undefined && metrics[key] !== null) {
        const normalizedValue = key === 'tasks_completed' || key === 'innovation_points' 
          ? Math.min(metrics[key] * 10, 100) // Normaliser les compteurs
          : metrics[key];
        
        score += normalizedValue * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    
    if (employeeId) {
      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
      const stats = getWeekStats(employeeId, weekStart, weekEnd);
      
      setNominationForm(prev => ({
        ...prev,
        employee_id: employeeId,
        metrics: {
          ...prev.metrics,
          attendance_rate: stats.attendance_rate,
          punctuality_score: stats.punctuality_score,
          tasks_completed: stats.days_worked
        }
      }));
    }
  };

  const handleSubmitNomination = async () => {
    try {
      if (!nominationForm.employee_id || !nominationForm.nomination_reason) {
        toast({
          title: "❌ Erreur",
          description: "Veuillez sélectionner un employé et saisir une raison",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);

      const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });

      // Vérifier si une nomination existe déjà pour cette semaine
      const existingNomination = nominations.find(nom => 
        nom.week_start_date === format(weekStart, 'yyyy-MM-dd') &&
        nom.approval_status !== 'rejected'
      );

      if (existingNomination && !editingNomination) {
        toast({
          title: "⚠️ Attention",
          description: "Une nomination existe déjà pour cette semaine",
          variant: "destructive"
        });
        return;
      }

      const performanceScore = calculatePerformanceScore(nominationForm.metrics);
      
      const nominationData = {
        ...nominationForm,
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        week_end_date: format(weekEnd, 'yyyy-MM-dd'),
        performance_score: performanceScore,
        achievements: nominationForm.achievements.filter(a => a.trim()),
        nominated_by: 'admin', // À remplacer par l'ID de l'admin connecté
        approval_status: 'approved' // Auto-approuvé par l'admin
      };

      if (editingNomination) {
        await EmployeeOfTheWeek.update(editingNomination.id, nominationData);
        toast({
          title: "✅ Nomination mise à jour",
          description: "La nomination a été modifiée avec succès"
        });
      } else {
        await EmployeeOfTheWeek.create(nominationData);
        toast({
          title: "✅ Nomination créée",
          description: "L'employé de la semaine a été nominé avec succès"
        });
      }

      // Réinitialiser le formulaire
      setNominationForm({
        employee_id: '',
        nomination_reason: '',
        achievements: [''],
        performance_score: 85,
        metrics: {
          attendance_rate: 100,
          punctuality_score: 95,
          tasks_completed: 0,
          collaboration_score: 90,
          innovation_points: 0,
          customer_satisfaction: 0,
          team_impact: 85
        },
        reward_details: {
          type: 'points',
          value: 500,
          description: 'Employé de la semaine'
        },
        public_recognition: true
      });
      
      setShowNominationForm(false);
      setEditingNomination(null);
      setSelectedEmployee('');
      
      await loadData();
      
    } catch (error) {
      console.error('Error submitting nomination:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de soumettre la nomination",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnounceWinner = async (nomination) => {
    try {
      const employee = employees.find(e => e.id === nomination.employee_id);
      if (!employee) return;

      // Créer l'annonce publique
      const announcementData = {
        title: `🏆 Employé de la Semaine - ${employee.first_name} ${employee.last_name}`,
        content: `Félicitations à ${employee.first_name} ${employee.last_name} qui est notre Employé de la Semaine !\n\n${nomination.nomination_reason}\n\nAchievements:\n${nomination.achievements?.map(a => `• ${a}`).join('\n') || ''}\n\nScore de performance: ${nomination.performance_score}/100`,
        author_id: 'admin',
        priority: 'high',
        target_audience: 'all',
        is_published: true
      };

      await Announcement.create(announcementData);

      // Attribuer la récompense
      if (nomination.reward_details && nomination.reward_details.type === 'points') {
        const employeePointsRecord = employeePoints.find(ep => ep.employee_id === nomination.employee_id);
        if (employeePointsRecord) {
          await EmployeePoints.update(employeePointsRecord.id, {
            total_points: (employeePointsRecord.total_points || 0) + (nomination.reward_details.value || 500),
            points_this_week: (employeePointsRecord.points_this_week || 0) + (nomination.reward_details.value || 500)
          });
        }
      }

      // Marquer comme annoncé
      await EmployeeOfTheWeek.update(nomination.id, {
        announcement_sent: true,
        reward_given: true
      });

      toast({
        title: "🎉 Annonce publiée !",
        description: `L'employé de la semaine a été annoncé à toute l'équipe`,
        duration: 5000
      });

      await loadData();

    } catch (error) {
      console.error('Error announcing winner:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de publier l'annonce",
        variant: "destructive"
      });
    }
  };

  const getCurrentWeekNomination = () => {
    const weekStart = format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
    return nominations.find(nom => 
      nom.week_start_date === weekStart && 
      nom.approval_status === 'approved'
    );
  };

  const currentNomination = getCurrentWeekNomination();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement des nominations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header avec sélection de semaine */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl text-yellow-800">
                <Trophy className="w-8 h-8 text-yellow-600" />
                Employé de la Semaine
              </CardTitle>
              <p className="text-yellow-700 mt-2">
                Gérez les nominations et récompensez l'excellence
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Navigation semaine */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
                >
                  ←
                </Button>
                <div className="text-center px-4">
                  <div className="font-semibold">
                    {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'd MMM', { locale: fr })} - 
                    {format(endOfWeek(selectedWeek, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: fr })}
                  </div>
                  {isSameWeek(selectedWeek, new Date()) && (
                    <UIBadge className="bg-green-100 text-green-800 text-xs mt-1">
                      Cette semaine
                    </UIBadge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
                >
                  →
                </Button>
              </div>
              
              <Button
                onClick={() => setShowNominationForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Nomination
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Nomination actuelle */}
      {currentNomination && (
        <Card className="border-yellow-300 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <Crown className="w-6 h-6" />
              Employé de la Semaine Actuel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {(() => {
              const employee = employees.find(e => e.id === currentNomination.employee_id);
              return employee ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <AvatarGenerator
                      firstName={employee.first_name}
                      lastName={employee.last_name}
                      email={employee.email}
                      department={employee.department}
                      size="xl"
                      className="ring-4 ring-yellow-400 shadow-lg"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-gray-600">{employee.position}</p>
                      <p className="text-gray-500 text-sm">{employee.department}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-yellow-700">
                          Score: {currentNomination.performance_score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Raison de la nomination</h4>
                      <p className="text-gray-700">{currentNomination.nomination_reason}</p>
                    </div>
                    
                    {currentNomination.achievements && currentNomination.achievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Accomplissements</h4>
                        <ul className="space-y-1">
                          {currentNomination.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-yellow-500 mt-1">•</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 pt-4">
                      {!currentNomination.announcement_sent && (
                        <Button
                          onClick={() => handleAnnounceWinner(currentNomination)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Annoncer à l'équipe
                        </Button>
                      )}
                      
                      {currentNomination.announcement_sent && (
                        <UIBadge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Annoncé
                        </UIBadge>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingNomination(currentNomination);
                          setNominationForm({
                            ...currentNomination,
                            achievements: currentNomination.achievements || ['']
                          });
                          setSelectedEmployee(currentNomination.employee_id);
                          setShowNominationForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Employé non trouvé</p>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Historique des nominations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Historique des Nominations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nominations.length > 0 ? (
            <div className="space-y-4">
              {nominations
                .sort((a, b) => new Date(b.week_start_date) - new Date(a.week_start_date))
                .slice(0, 10)
                .map((nomination) => {
                  const employee = employees.find(e => e.id === nomination.employee_id);
                  return (
                    <div 
                      key={nomination.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        {employee && (
                          <AvatarGenerator
                            firstName={employee.first_name}
                            lastName={employee.last_name}
                            email={employee.email}
                            department={employee.department}
                            size="md"
                          />
                        )}
                        <div>
                          <h4 className="font-semibold">
                            {employee ? `${employee.first_name} ${employee.last_name}` : 'Employé inconnu'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Semaine du {format(new Date(nomination.week_start_date), 'd MMM', { locale: fr })} - 
                            {format(new Date(nomination.week_end_date), 'd MMM yyyy', { locale: fr })}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <UIBadge className={`text-xs ${
                              nomination.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                              nomination.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {nomination.approval_status === 'approved' ? 'Approuvé' :
                               nomination.approval_status === 'pending' ? 'En attente' :
                               'Rejeté'}
                            </UIBadge>
                            <span className="text-xs text-gray-500">
                              Score: {nomination.performance_score}/100
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {nomination.announcement_sent && (
                          <UIBadge className="bg-blue-100 text-blue-800 text-xs">
                            <Send className="w-3 h-3 mr-1" />
                            Annoncé
                          </UIBadge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNomination(nomination);
                            setNominationForm({
                              ...nomination,
                              achievements: nomination.achievements || ['']
                            });
                            setSelectedEmployee(nomination.employee_id);
                            setShowNominationForm(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Aucune nomination pour le moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de nomination */}
      <AnimatePresence>
        {showNominationForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-yellow-600" />
                    {editingNomination ? 'Modifier la Nomination' : 'Nouvelle Nomination'}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowNominationForm(false);
                      setEditingNomination(null);
                      setSelectedEmployee('');
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Sélection employé */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Sélection de l'employé</Label>
                    <Select onValueChange={handleEmployeeSelect} value={selectedEmployee}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choisir un employé..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Choisir un employé...</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name} - {employee.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedEmployee && (() => {
                    const employee = employees.find(e => e.id === selectedEmployee);
                    const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
                    const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
                    const stats = getWeekStats(selectedEmployee, weekStart, weekEnd);
                    
                    return employee ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <AvatarGenerator
                            firstName={employee.first_name}
                            lastName={employee.last_name}
                            email={employee.email}
                            department={employee.department}
                            size="md"
                          />
                          <div>
                            <h4 className="font-semibold">{employee.first_name} {employee.last_name}</h4>
                            <p className="text-sm text-gray-600">{employee.position}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Présence: <span className="font-medium">{stats.attendance_rate}%</span></div>
                          <div>Ponctualité: <span className="font-medium">{stats.punctuality_score}%</span></div>
                          <div>Heures: <span className="font-medium">{stats.total_hours}h</span></div>
                          <div>Jours: <span className="font-medium">{stats.days_worked}</span></div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Raison de la nomination */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Raison de la nomination *</Label>
                  <Textarea
                    value={nominationForm.nomination_reason}
                    onChange={(e) => setNominationForm(prev => ({
                      ...prev,
                      nomination_reason: e.target.value
                    }))}
                    placeholder="Décrivez pourquoi cet employé mérite d'être nommé employé de la semaine..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Accomplissements */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Accomplissements de la semaine</Label>
                  {nominationForm.achievements.map((achievement, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={achievement}
                        onChange={(e) => {
                          const newAchievements = [...nominationForm.achievements];
                          newAchievements[index] = e.target.value;
                          setNominationForm(prev => ({
                            ...prev,
                            achievements: newAchievements
                          }));
                        }}
                        placeholder={`Accomplissement ${index + 1}...`}
                        className="flex-1"
                      />
                      {nominationForm.achievements.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newAchievements = nominationForm.achievements.filter((_, i) => i !== index);
                            setNominationForm(prev => ({
                              ...prev,
                              achievements: newAchievements
                            }));
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNominationForm(prev => ({
                        ...prev,
                        achievements: [...prev.achievements, '']
                      }));
                    }}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un accomplissement
                  </Button>
                </div>

                {/* Métriques de performance */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Métriques de Performance</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(nominationForm.metrics).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-sm capitalize mb-1 block">
                          {key.replace(/_/g, ' ')}
                          {['attendance_rate', 'punctuality_score', 'collaboration_score', 'team_impact'].includes(key) && ' (%)'}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={['tasks_completed', 'innovation_points'].includes(key) ? "1000" : "100"}
                          value={value}
                          onChange={(e) => {
                            setNominationForm(prev => ({
                              ...prev,
                              metrics: {
                                ...prev.metrics,
                                [key]: parseInt(e.target.value) || 0
                              }
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        Score Calculé: {calculatePerformanceScore(nominationForm.metrics)}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Récompense */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Récompense</Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm mb-1 block">Type</Label>
                      <Select onValueChange={(value) => setNominationForm(prev => ({
                        ...prev,
                        reward_details: {
                          ...prev.reward_details,
                          type: value
                        }
                      }))} value={nominationForm.reward_details.type}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="points">Points</SelectItem>
                          <SelectItem value="badge">Badge</SelectItem>
                          <SelectItem value="gift">Cadeau</SelectItem>
                          <SelectItem value="time_off">Temps libre</SelectItem>
                          <SelectItem value="certificate">Certificat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">Valeur</Label>
                      <Input
                        type="number"
                        value={nominationForm.reward_details.value}
                        onChange={(e) => setNominationForm(prev => ({
                          ...prev,
                          reward_details: {
                            ...prev.reward_details,
                            value: parseInt(e.target.value) || 0
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm mb-1 block">Description</Label>
                      <Input
                        value={nominationForm.reward_details.description}
                        onChange={(e) => setNominationForm(prev => ({
                          ...prev,
                          reward_details: {
                            ...prev.reward_details,
                            description: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNominationForm(false);
                      setEditingNomination(null);
                      setSelectedEmployee('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmitNomination}
                    disabled={isSubmitting || !nominationForm.employee_id || !nominationForm.nomination_reason}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <Trophy className="w-4 h-4 mr-2" />
                        {editingNomination ? 'Mettre à jour' : 'Nominer'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}