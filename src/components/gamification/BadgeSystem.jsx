import React, { useState, useEffect } from 'react';
import { Employee, AuthService } from '@/api/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Star,
  Crown,
  Zap,
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
  Sunrise
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processEmployeeAchievements, logAction, BADGE_DEFINITIONS } from '../gamification/GamificationEngine';
import NotificationHelper from '../notifications/NotificationHelper';

const BADGE_ICONS = {
  Award: Award,
  Star: Star,
  Crown: Crown,
  Zap: Zap,
  Trophy: Trophy,
  Clock: Clock,
  Users: Users,
  MessageCircle: MessageCircle,
  BookOpen: BookOpen,
  Lightbulb: Lightbulb,
  UserCheck: UserCheck,
  Flame: Flame,
  CheckCircle: CheckCircle,
  CheckCircle2: CheckCircle2,
  Sparkles: Sparkles,
  TrendingUp: TrendingUp,
  Calendar: Calendar,
  Video: Video,
  Heart: Heart,
  Wrench: Wrench,
  GraduationCap: GraduationCap,
  FileText: FileText,
  MessageSquare: MessageSquare,
  Send: Send,
  Sunrise: Sunrise
};

const TIER_COLORS = {
  bronze: {
    gradient: 'from-amber-600 to-orange-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-600'
  },
  silver: {
    gradient: 'from-gray-400 to-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    icon: 'text-gray-600'
  },
  gold: {
    gradient: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-600'
  },
  platinum: {
    gradient: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-800',
    icon: 'text-purple-600'
  },
  diamond: {
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-600'
  }
};

const CATEGORY_INFO = {
  attendance: { name: 'Assiduité', icon: Clock, color: 'blue' },
  performance: { name: 'Performance', icon: Target, color: 'green' },
  collaboration: { name: 'Collaboration', icon: Users, color: 'purple' },
  innovation: { name: 'Innovation', icon: Lightbulb, color: 'yellow' },
  leadership: { name: 'Leadership', icon: Crown, color: 'red' },
  growth: { name: 'Développement', icon: TrendingUp, color: 'indigo' },
  special: { name: 'Spécial', icon: Sparkles, color: 'pink' }
};

export default function BadgeSystem({ employeeId, compact = false }) {
  const [badges, setBadges] = useState([]);
  const [employeePoints, setEmployeePoints] = useState(null);
  const [nextBadges, setNextBadges] = useState([]);
  const [newBadgeAnimation, setNewBadgeAnimation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProgress, setShowProgress] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBadgeData();
    loadCurrentUser();
  }, [employeeId]);

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  };

  const loadBadgeData = async () => {
    setIsLoading(true);
    try {
      console.log('🏆 Chargement données badges pour employé:', employeeId);

      // Charger les badges de l'employé
      const employeeBadges = await AuthService.getEmployeeBadges(employeeId);
      console.log('📊 Badges trouvés:', employeeBadges.length);
      setBadges(employeeBadges);

      // Charger les points de l'employé
      const pointsData = await AuthService.getEmployeePoints(employeeId);
      if (pointsData.length > 0) {
        setEmployeePoints(pointsData[0]);
        console.log('💎 Points employé:', pointsData[0].total_points);
      }

      // Calculer les prochains badges possibles
      await calculateNextBadges(employeeId);

    } catch (error) {
      console.error('❌ Erreur chargement badges:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les badges",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextBadges = async (empId) => {
    try {
      // Récupérer les actions de l'employé
      const actions = await AuthService.getEmployeeActions(empId);
      const currentBadges = badges.map(b => b.badge_id);
      const upcomingBadges = [];

      // Calculer les statistiques
      const stats = calculateEmployeeStats(actions);

      // Analyser chaque badge non encore obtenu
      for (const [badgeId, badge] of Object.entries(BADGE_DEFINITIONS)) {
        if (currentBadges.includes(badgeId)) continue;

        const progress = calculateBadgeProgress(badge.criteria, stats);
        if (progress > 0 && progress < 100) {
          upcomingBadges.push({
            ...badge,
            progress: progress,
            current: getCurrentValue(badge.criteria, stats),
            required: getRequiredValue(badge.criteria)
          });
        }
      }

      // Trier par progression décroissante et prendre les 5 premiers
      upcomingBadges.sort((a, b) => b.progress - a.progress);
      setNextBadges(upcomingBadges.slice(0, 5));
      
    } catch (error) {
      console.error('❌ Erreur calcul prochains badges:', error);
    }
  };

  const calculateEmployeeStats = (actions) => {
    return {
      earlyArrivals: actions.filter(a => a.action_type === 'early_checkin').length,
      announcementsRead: actions.filter(a => a.action_type === 'announcement_read').length,
      tasksCompleted: actions.filter(a => a.action_type === 'task_completed').length,
      tasksCompletedEarly: actions.filter(a => a.action_type === 'task_completed_early').length,
      messagesSent: actions.filter(a => a.action_type === 'message_sent').length,
      meetingsAttended: actions.filter(a => a.action_type === 'meeting_attended').length,
      documentsViewed: actions.filter(a => a.action_type === 'document_view').length,
      surveysCompleted: actions.filter(a => a.action_type === 'survey_completed').length,
      feedbacksGiven: actions.filter(a => a.action_type === 'feedback_given').length,
      helpProvided: actions.filter(a => a.action_type === 'help_provided').length,
      ideasSuggested: actions.filter(a => a.action_type === 'innovation_suggested').length,
      problemsSolved: actions.filter(a => a.action_type === 'problem_solved').length,
      projectsLed: actions.filter(a => a.action_type === 'project_led').length,
      totalPoints: employeePoints?.total_points || 0,
      consecutivePunctualDays: calculateConsecutiveDays(actions),
      firstLogin: actions.some(a => a.action_type === 'login')
    };
  };

  const calculateConsecutiveDays = (actions) => {
    // Logique simplifiée pour calculer les jours consécutifs
    const checkins = actions.filter(a => a.action_type === 'early_checkin');
    return checkins.length; // Approximation
  };

  const calculateBadgeProgress = (criteria, stats) => {
    let totalCriteria = 0;
    let metCriteria = 0;

    for (const [key, required] of Object.entries(criteria)) {
      totalCriteria++;
      const current = stats[key] || 0;
      
      if (typeof required === 'number') {
        if (current >= required) {
          metCriteria++;
        }
      } else if (typeof required === 'boolean') {
        if (current === required) {
          metCriteria++;
        }
      }
    }

    return totalCriteria > 0 ? Math.round((metCriteria / totalCriteria) * 100) : 0;
  };

  const getCurrentValue = (criteria, stats) => {
    const firstKey = Object.keys(criteria)[0];
    return stats[firstKey] || 0;
  };

  const getRequiredValue = (criteria) => {
    const firstValue = Object.values(criteria)[0];
    return firstValue;
  };

  const triggerBadgeCheck = async () => {
    try {
      console.log('🔄 Vérification manuelle des badges...');
      
      const result = await processEmployeeAchievements(employeeId);
      
      if (result.success && result.newBadges.length > 0) {
        // Animation des nouveaux badges
        for (const badge of result.newBadges) {
          setNewBadgeAnimation({
            name: badge.badge_name,
            tier: badge.badge_tier,
            points: badge.points_value
          });
          
          // Notification toast
          toast({
            title: "🎉 Nouveau Badge !",
            description: `Vous avez débloqué: ${badge.badge_name} (+${badge.points_value} points)`,
            duration: 8000,
          });
          
          // Attendre avant le prochain badge
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Recharger les données
        setTimeout(() => {
          loadBadgeData();
          setNewBadgeAnimation(null);
        }, 3000);
      } else {
        toast({
          title: "Aucun nouveau badge",
          description: "Continuez vos efforts pour débloquer de nouveaux badges !",
          duration: 5000,
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification badges:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les badges",
        variant: "destructive"
      });
    }
  };

  // Filtrer les badges par catégorie
  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(b => b.badge_category === selectedCategory);

  // Grouper les badges par catégorie
  const badgesByCategory = badges.reduce((acc, badge) => {
    const category = badge.badge_category || 'special';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 animate-pulse">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Résumé compact */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                Niveau {employeePoints?.level || 1}
              </div>
              <div className="text-sm text-gray-600">Niveau</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {employeePoints?.total_points || 0}
              </div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {badges.length}
              </div>
              <div className="text-sm text-gray-600">Badges</div>
            </div>
          </div>
          <Button onClick={triggerBadgeCheck} size="sm" variant="outline">
            <Zap className="w-4 h-4 mr-2" />
            Vérifier
          </Button>
        </div>

        {/* Badges récents */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 6).map((badge) => {
              const IconComponent = BADGE_ICONS[badge.badge_icon] || Trophy;
              const tierColors = TIER_COLORS[badge.badge_tier] || TIER_COLORS.bronze;
              
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tierColors.bg} ${tierColors.border} border`}
                  title={badge.badge_description}
                >
                  <IconComponent className={`w-4 h-4 ${tierColors.icon}`} />
                  <span className={`text-sm font-medium ${tierColors.text}`}>
                    {badge.badge_name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Animation nouveau badge */}
      <AnimatePresence>
        {newBadgeAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${TIER_COLORS[newBadgeAnimation.tier]?.gradient || 'from-yellow-400 to-yellow-600'} flex items-center justify-center`}
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 Nouveau Badge !
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                {newBadgeAnimation.name}
              </p>
              <p className="text-sm text-gray-500">
                +{newBadgeAnimation.points} points
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête avec statistiques */}
      <Card className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-purple-600" />
              Système de Badges & Progression
            </div>
            <div className="flex gap-2">
              <Button onClick={triggerBadgeCheck} variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Vérifier badges
              </Button>
              <Button 
                onClick={() => setShowProgress(!showProgress)} 
                variant="ghost" 
                size="sm"
              >
                {showProgress ? 'Masquer progression' : 'Voir progression'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                Niveau {employeePoints?.level || 1}
              </div>
              <div className="text-sm text-gray-600">Niveau actuel</div>
              {employeePoints && showProgress && (
                <Progress 
                  value={((employeePoints.total_points % 1000) / 1000) * 100} 
                  className="mt-2 h-2"
                />
              )}
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {employeePoints?.total_points || 0}
              </div>
              <div className="text-sm text-gray-600">Points totaux</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {badges.length}
              </div>
              <div className="text-sm text-gray-600">Badges obtenus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {employeePoints?.streak_days || 0}
              </div>
              <div className="text-sm text-gray-600">Jours de série</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prochains badges (progression) */}
      {showProgress && nextBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Prochains Badges à Débloquer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextBadges.map((badge, index) => {
                const IconComponent = BADGE_ICONS[badge.icon] || Trophy;
                const tierColors = TIER_COLORS[badge.tier] || TIER_COLORS.bronze;
                
                return (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierColors.gradient} flex items-center justify-center opacity-60`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <span className="text-sm text-gray-500">
                          {badge.current}/{badge.required}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                      <Progress value={badge.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Progression: {badge.progress}%</span>
                        <span>+{badge.points} points</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          Tous ({badges.length})
        </Button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => {
          const count = badgesByCategory[key]?.length || 0;
          if (count === 0) return null;
          
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className="gap-2"
            >
              <info.icon className="w-4 h-4" />
              {info.name} ({count})
            </Button>
          );
        })}
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge) => {
            const IconComponent = BADGE_ICONS[badge.badge_icon] || Trophy;
            const tierColors = TIER_COLORS[badge.badge_tier] || TIER_COLORS.bronze;
            const categoryInfo = CATEGORY_INFO[badge.badge_category] || CATEGORY_INFO.special;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative overflow-hidden rounded-xl border-2 ${tierColors.border} ${tierColors.bg} shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tierColors.gradient} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <UIBadge className={`${tierColors.text} bg-white/80 mb-1 capitalize`}>
                        {badge.badge_tier}
                      </UIBadge>
                      <div className="text-sm text-gray-600">
                        +{badge.points_value} pts
                      </div>
                    </div>
                  </div>
                  
                  <h3 className={`font-bold text-lg ${tierColors.text} mb-2`}>
                    {badge.badge_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {badge.badge_description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <UIBadge variant="outline" className="text-xs">
                      <categoryInfo.icon className="w-3 h-3 mr-1" />
                      {categoryInfo.name}
                    </UIBadge>
                    <div className="text-xs text-gray-500">
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-1000"></div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {selectedCategory === 'all' 
                ? 'Aucun badge obtenu pour le moment'
                : `Aucun badge ${CATEGORY_INFO[selectedCategory]?.name.toLowerCase()} obtenu`
              }
            </h3>
            <p className="text-gray-400 mb-4">
              Continuez vos efforts pour débloquer vos premiers badges !
            </p>
            <Button onClick={triggerBadgeCheck} variant="outline">
              <Zap className="w-4 h-4 mr-2" />
              Vérifier les badges disponibles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}