import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  TrendingUp,
  Target,
  Award,
  Crown,
  Flame,
  Users,
  Calendar,
  Clock,
  MessageCircle,
  Zap,
  BookOpen,
  Lightbulb,
  UserCheck,
  Sunrise,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import { getEmployeeProgress, getLeaderboard, processEmployeeAchievements } from './GamificationEngine';

const iconMap = {
  Trophy, Star, TrendingUp, Target, Award, Crown, Flame, Users, Calendar,
  Clock, MessageCircle, Zap, BookOpen, Lightbulb, UserCheck, Sunrise
};

const tierColors = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-400 to-gray-600", 
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-purple-400 to-purple-600",
  diamond: "from-blue-400 to-cyan-400"
};

const categoryColors = {
  attendance: "bg-green-100 text-green-800",
  performance: "bg-blue-100 text-blue-800",
  collaboration: "bg-purple-100 text-purple-800",
  innovation: "bg-orange-100 text-orange-800",
  leadership: "bg-red-100 text-red-800",
  growth: "bg-indigo-100 text-indigo-800",
  special: "bg-pink-100 text-pink-800"
};

export default function GamificationDashboard({ employeeId, badges = [], isCompact = false }) {
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employeeId) {
      loadDashboardData();
    }
  }, [employeeId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [progressData, leaderboardData] = await Promise.all([
        getEmployeeProgress(employeeId),
        getLeaderboard(10)
      ]);

      setProgress(progressData);
      setLeaderboard(leaderboardData);
      
    } catch (error) {
      console.error('❌ Erreur chargement dashboard gamification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de progression",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Recalculer les achievements
      await processEmployeeAchievements(employeeId);
      
      // Recharger les données
      await loadDashboardData();
      
      toast({
        title: "✅ Données mises à jour",
        description: "Vos récompenses ont été recalculées",
      });
      
    } catch (error) {
      console.error('❌ Erreur actualisation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!progress) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée de progression disponible</p>
          <Button onClick={loadDashboardData} variant="outline" className="mt-4">
            Actualiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCompact) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Progression
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">{progress.total_points}</div>
              <div className="text-sm text-purple-600">Points Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">Niv. {progress.level}</div>
              <div className="text-sm text-purple-600">Niveau Actuel</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Niveau suivant</span>
              <span>{progress.next_level_points} pts</span>
            </div>
            <Progress 
              value={((progress.level * 100 - progress.next_level_points) / 100) * 100} 
              className="h-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge className="bg-orange-100 text-orange-800">
              <Flame className="w-3 h-3 mr-1" />
              {progress.streak_days} jours
            </Badge>
            <Badge className="bg-amber-100 text-amber-800">
              <Award className="w-3 h-3 mr-1" />
              {progress.badges_earned} badges
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Points Total</p>
                <p className="text-3xl font-bold">{progress.total_points}</p>
              </div>
              <Star className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Niveau</p>
                <p className="text-3xl font-bold">{progress.level}</p>
              </div>
              <Trophy className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Série</p>
                <p className="text-3xl font-bold">{progress.streak_days}</p>
              </div>
              <Flame className="w-10 h-10 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Badges</p>
                <p className="text-3xl font-bold">{progress.badges_earned}</p>
              </div>
              <Award className="w-10 h-10 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Classement</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-6">
          {/* Progression vers le niveau suivant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Progression Niveau {progress.level + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Niveau {progress.level}</span>
                  <span>{progress.next_level_points} points restants</span>
                  <span>Niveau {progress.level + 1}</span>
                </div>
                <Progress 
                  value={((100 - progress.next_level_points) / 100) * 100} 
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Prochains badges à débloquer */}
          {progress.next_badges && progress.next_badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Prochains Objectifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress.next_badges.map((badge, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{badge.badge_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={categoryColors[badge.category]}>
                            {badge.category}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {badge.current_progress} / {badge.required}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(badge.progress_percentage)}%
                        </div>
                        <Progress 
                          value={badge.progress_percentage} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistiques par catégorie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Badges par Catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(progress.badges_by_category).map(([category, count]) => (
                  <div key={category} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{count}</div>
                    <Badge className={`${categoryColors[category]} mt-1`}>
                      {category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-600" />
                Mes Badges ({badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {badges.map((badge, index) => {
                      const IconComponent = iconMap[badge.badge_icon] || Award;
                      const tierGradient = tierColors[badge.badge_tier] || tierColors.bronze;
                      
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-4 text-center">
                              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tierGradient} flex items-center justify-center mx-auto mb-3`}>
                                <IconComponent className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {badge.badge_name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                {badge.badge_description}
                              </p>
                              <div className="flex justify-center gap-2">
                                <Badge className={categoryColors[badge.badge_category]}>
                                  {badge.badge_category}
                                </Badge>
                                <Badge variant="outline">
                                  +{badge.points_value} pts
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Aucun badge encore
                  </h3>
                  <p className="text-gray-500">
                    Continuez vos activités pour débloquer vos premiers badges !
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Classement Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.employee_id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.employee_id === employeeId 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-medium">
                            {entry.employee_name}
                            {entry.employee_id === employeeId && (
                              <span className="text-blue-600 text-sm ml-2">(Vous)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            Niveau {entry.level} • {entry.badges_count} badges
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{entry.total_points}</div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Classement en cours de génération...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}