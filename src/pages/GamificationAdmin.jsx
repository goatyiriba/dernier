
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Trophy, 
  Users, 
  Target, 
  Award, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  Save,
  RotateCcw,
  Crown,
  Star,
  Flame,
  Shield,
  Clock, // Added Clock for the new card
  MessageCircle,
  Calendar,
  Eye,
  BarChart3,
  Sparkles,
  Gift,
  Gamepad2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Employee, AuthService } from "@/api/supabaseEntities";
import { EmployeePoints } from "@/api/supabaseEntities";
import { Badge as BadgeEntity } from "@/api/supabaseEntities";
import { GamificationSettings } from "@/api/supabaseEntities";

import PointsRulesManager from "../components/gamification/PointsRulesManager";
import BadgeSystemManager from "../components/gamification/BadgeSystemManager";
import EmployeePointsManager from "../components/gamification/EmployeePointsManager";
import GamificationAnalytics from "../components/gamification/GamificationAnalytics";
import LeaderboardManager from "../components/gamification/LeaderboardManager";
import RewardsSystemManager from "../components/gamification/RewardsSystemManager";

export default function GamificationAdmin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [employeePoints, setEmployeePoints] = useState([]);
  const [badges, setBadges] = useState([]);
  const [gamificationSettings, setGamificationSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // New state for manual attendance check
  const { toast } = useToast();

  // Stats calculées
  const [stats, setStats] = useState({
    totalPlayers: 0,
    averagePoints: 0,
    totalBadges: 0,
    topPerformer: null,
    pointsDistribution: [],
    recentActivity: []
  });

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    try {
      setIsLoading(true);
      
      // Charger toutes les données nécessaires
      const [employeesData, pointsData, badgesData, settingsData] = await Promise.all([
        Employee.list(),
        EmployeePoints.list(),
        BadgeEntity.list(),
        GamificationSettings.list()
      ]);

      setEmployees(employeesData);
      setEmployeePoints(pointsData);
      setBadges(badgesData);
      
      // Paramètres de gamification
      const activeSettings = settingsData.find(s => s.is_active) || null;
      setGamificationSettings(activeSettings);
      
      // Calculer les statistiques
      calculateStats(employeesData, pointsData, badgesData);
      
    } catch (error) {
      console.error("Error loading gamification data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de gamification",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (employeesData, pointsData, badgesData) => {
    const totalPlayers = pointsData.length;
    const totalPoints = pointsData.reduce((sum, p) => sum + (p.total_points || 0), 0);
    const averagePoints = totalPlayers > 0 ? Math.round(totalPoints / totalPlayers) : 0;
    const totalBadges = badgesData.length;
    
    // Top performer
    const topPerformer = pointsData.reduce((top, current) => 
      (current.total_points || 0) > (top?.total_points || 0) ? current : top, null
    );

    // Distribution des points
    const pointsRanges = [
      { range: "0-100", count: 0, color: "bg-red-500" },
      { range: "101-500", count: 0, color: "bg-orange-500" },
      { range: "501-1000", count: 0, color: "bg-yellow-500" },
      { range: "1001-2000", count: 0, color: "bg-green-500" },
      { range: "2000+", count: 0, color: "bg-blue-500" }
    ];

    pointsData.forEach(p => {
      const points = p.total_points || 0;
      if (points <= 100) pointsRanges[0].count++;
      else if (points <= 500) pointsRanges[1].count++;
      else if (points <= 1000) pointsRanges[2].count++;
      else if (points <= 2000) pointsRanges[3].count++;
      else pointsRanges[4].count++;
    });

    setStats({
      totalPlayers,
      averagePoints,
      totalBadges,
      topPerformer,
      pointsDistribution: pointsRanges,
      recentActivity: [] // À implémenter avec ActionLog
    });
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      setIsSaving(true);
      
      if (gamificationSettings) {
        await GamificationSettings.update(gamificationSettings.id, newSettings);
      } else {
        await GamificationSettings.create({ ...newSettings, is_active: true });
      }
      
      await loadGamificationData();
      
      toast({
        title: "✅ Paramètres sauvegardés",
        description: "Les règles de gamification ont été mises à jour",
        duration: 3000
      });
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // New function for manual attendance check
  const handleManualAttendanceCheck = async () => {
    try {
      setIsProcessing(true);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const checkDate = yesterday.toISOString().split('T')[0];
      
      const response = await fetch('/functions/dailyAttendanceCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AuthService.getToken()}`
        },
        body: JSON.stringify({ date: checkDate })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "✅ Vérification d'assiduité terminée",
          description: `${result.results.penalties_applied} pénalités appliquées sur ${result.results.total_employees} employés`,
          duration: 5000
        });
        
        // Recharger les données
        loadGamificationData();
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error("Error in manual attendance check:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de vérifier l'assiduité",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement du système de gamification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header Hero Gaming Style */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-6 lg:p-8 text-white shadow-2xl"
        >
          {/* Éléments décoratifs gaming */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full translate-y-48 -translate-x-48"></div>
          
          {/* Icônes flottantes */}
          <div className="absolute top-8 right-8 w-8 h-8 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-24 w-6 h-6 bg-green-400/30 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-24 right-12 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse delay-1000"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    🎮 Centre de Gamification
                  </h1>
                  <p className="text-xl text-purple-100 font-medium">
                    Système de motivation et récompenses avancé
                  </p>
                </div>
              </div>
              
              {/* Stats rapides gaming */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                  <div className="text-sm text-purple-100 flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    Joueurs actifs
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">{stats.averagePoints}</div>
                  <div className="text-sm text-purple-100 flex items-center justify-center gap-1">
                    <Target className="w-4 h-4" />
                    Points moyens
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">{stats.totalBadges}</div>
                  <div className="text-sm text-purple-100 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" />
                    Badges attribués
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl font-bold">🏆</div>
                  <div className="text-sm text-purple-100">
                    {stats.topPerformer ? `Top: ${stats.topPerformer.total_points}pts` : 'Aucun leader'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions rapides */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setActiveTab("points")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Règles Points
              </Button>
              <Button 
                onClick={() => setActiveTab("badges")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                <Award className="w-4 h-4 mr-2" />
                Système Badges
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Actions rapides avec nouvelle option */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveTab("employees")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-purple-700 mb-2">Gérer les Employés</h3>
              <p className="text-sm text-purple-600">Attribuer des points et des badges manuellement</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-teal-100 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveTab("leaderboard")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-2">Voir les Classements</h3>
              <p className="text-sm text-green-600">Visualiser les performances des équipes et individus</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setActiveTab("rewards")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-yellow-700 mb-2">Gérer les Récompenses</h3>
              <p className="text-sm text-yellow-600">Définir et attribuer des récompenses</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-pink-100 border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={handleManualAttendanceCheck}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-red-700 mb-2">Vérifier Assiduité</h3>
              <p className="text-sm text-red-600">Appliquer les pénalités d'absence (-300 pts)</p>
              {isProcessing && (
                <div className="mt-3">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section informative sur les pénalités */}
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Système de Pénalités Automatiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Règles d'Assiduité</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span><strong>-300 points</strong> pour absence de pointage quotidien</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Vérification automatique chaque matin à 9h</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Weekends exclus du système de pénalités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Notification automatique à l'employé</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Impact sur le Streak</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Streak quotidien réinitialisé à 0</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Perte des bonus de constance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Statistiques d'absence enregistrées</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Gaming Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <TabsList className="bg-white/80 backdrop-blur-sm shadow-lg border-0 h-auto p-2">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger 
                value="points" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <Target className="w-4 h-4" />
                Règles Points
              </TabsTrigger>
              <TabsTrigger 
                value="badges" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <Award className="w-4 h-4" />
                Badges
              </TabsTrigger>
              <TabsTrigger 
                value="employees" 
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <Users className="w-4 h-4" />
                Gestion Employés
              </TabsTrigger>
              <TabsTrigger 
                value="leaderboard" 
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <Trophy className="w-4 h-4" />
                Classements
              </TabsTrigger>
              <TabsTrigger 
                value="rewards" 
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex items-center gap-2 px-4 py-3 font-medium"
              >
                <Gift className="w-4 h-4" />
                Récompenses
              </TabsTrigger>
            </TabsList>
            
            {/* Indicateur de statut */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Système actif</span>
              </div>
              
              <Button 
                onClick={loadGamificationData}
                variant="outline"
                className="bg-white/80 backdrop-blur-sm"
                disabled={isLoading}
              >
                <RotateCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Contenu des onglets */}
          <TabsContent value="overview" className="space-y-6">
            <GamificationAnalytics 
              stats={stats}
              employees={employees}
              employeePoints={employeePoints}
              badges={badges}
            />
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <PointsRulesManager 
              settings={gamificationSettings}
              onSave={handleSaveSettings}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="badges" className="space-y-6">
            <BadgeSystemManager 
              badges={badges}
              employees={employees}
              onUpdate={loadGamificationData}
            />
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <EmployeePointsManager 
              employees={employees}
              employeePoints={employeePoints}
              badges={badges}
              onUpdate={loadGamificationData}
            />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <LeaderboardManager 
              employees={employees}
              employeePoints={employeePoints}
              badges={badges}
            />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardsSystemManager 
              settings={gamificationSettings}
              employees={employees}
              onUpdate={loadGamificationData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
