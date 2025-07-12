import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Target,
  Zap,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Flame,
  Shield,
  Sparkles,
  Gift,
  Loader
} from "lucide-react";
import { Employee, EmployeePoints, Badge as BadgeEntity, User } from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import AvatarGenerator from "../components/ui/AvatarGenerator";

// Configuration des niveaux et achievements
const LEVEL_CONFIG = {
  1: { name: "Débutant", color: "from-gray-400 to-gray-600", icon: Shield, minPoints: 0 },
  2: { name: "Apprenti", color: "from-blue-400 to-blue-600", icon: Star, minPoints: 100 },
  3: { name: "Compétent", color: "from-green-400 to-green-600", icon: Target, minPoints: 300 },
  4: { name: "Expert", color: "from-purple-400 to-purple-600", icon: Award, minPoints: 600 },
  5: { name: "Maître", color: "from-orange-400 to-orange-600", icon: Trophy, minPoints: 1000 },
  6: { name: "Champion", color: "from-red-400 to-red-600", icon: Crown, minPoints: 1500 },
  7: { name: "Légende", color: "from-yellow-400 to-yellow-600", icon: Sparkles, minPoints: 2500 }
};

const BADGE_CATEGORIES = {
  punctuality: { name: "Ponctualité", color: "bg-blue-100 text-blue-800", icon: Clock },
  performance: { name: "Performance", color: "bg-green-100 text-green-800", icon: TrendingUp },
  collaboration: { name: "Collaboration", color: "bg-purple-100 text-purple-800", icon: Users },
  engagement: { name: "Engagement", color: "bg-orange-100 text-orange-800", icon: Zap },
  consistency: { name: "Régularité", color: "bg-red-100 text-red-800", icon: Flame },
  innovation: { name: "Innovation", color: "bg-yellow-100 text-yellow-800", icon: Sparkles },
  special: { name: "Spécial", color: "bg-pink-100 text-pink-800", icon: Gift }
};

export default function Leaderboard() {
  const [employees, setEmployees] = useState([]);
  const [employeePoints, setEmployeePoints] = useState([]);
  const [badges, setBadges] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [topPerformers, setTopPerformers] = useState({ first: null, second: null, third: null });
  const [myRanking, setMyRanking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeLeaderboard();
  }, []);

  const initializeLeaderboard = async () => {
    try {
      console.log('🚀 Initializing Leaderboard...');
      setIsLoading(true);
      setError(null);
      
      // Vérifier l'authentification
      const user = await User.me();
      console.log('✅ User authenticated:', user.email);
      
      setCurrentUser(user);
      
      // Vérifier que l'utilisateur est actif
      if (!user.is_active) {
        console.log('❌ User not active');
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // Charger les données du leaderboard
      await loadLeaderboardData(user);
      
    } catch (error) {
      console.error('❌ Error initializing leaderboard:', error);
      setError('Erreur de connexion. Veuillez vous reconnecter.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboardData = async (user) => {
    try {
      console.log('📊 Loading leaderboard data...');
      
      // Charger toutes les données en parallèle avec gestion d'erreur
      const [employeesData, pointsData, badgesData] = await Promise.all([
        Employee.list("-created_date", 100).catch(err => {
          console.warn('Error loading employees:', err);
          return [];
        }),
        EmployeePoints.list("-total_points", 100).catch(err => {
          console.warn('Error loading points:', err);
          return [];
        }),
        BadgeEntity.list("-created_date", 500).catch(err => {
          console.warn('Error loading badges:', err);
          return [];
        })
      ]);

      console.log('📈 Data loaded:', {
        employees: employeesData?.length || 0,
        points: pointsData?.length || 0,
        badges: badgesData?.length || 0
      });

      // Trouver l'employé actuel
      let currentEmp = null;
      if (user.employee_id) {
        currentEmp = employeesData.find(emp => emp.id === user.employee_id);
      }
      if (!currentEmp) {
        currentEmp = employeesData.find(emp => emp.email === user.email);
      }
      
      console.log('👤 Current employee:', currentEmp ? `${currentEmp.first_name} ${currentEmp.last_name}` : 'Not found');
      
      setEmployees(employeesData || []);
      setEmployeePoints(pointsData || []);
      setBadges(badgesData || []);
      setCurrentEmployee(currentEmp);

      // Construire le leaderboard
      const leaderboard = buildLeaderboard(employeesData || [], pointsData || [], badgesData || []);
      setLeaderboardData(leaderboard);
      
      // Définir le podium
      if (leaderboard.length > 0) {
        setTopPerformers({
          first: leaderboard[0] || null,
          second: leaderboard[1] || null,
          third: leaderboard[2] || null
        });
      }

      // Trouver mon classement
      if (currentEmp) {
        const myRank = leaderboard.findIndex(emp => emp.id === currentEmp.id);
        if (myRank !== -1) {
          setMyRanking({
            position: myRank + 1,
            employee: leaderboard[myRank]
          });
        }
      }

    } catch (error) {
      console.error('❌ Error loading leaderboard data:', error);
      setError('Erreur lors du chargement des données.');
    }
  };

  const buildLeaderboard = (employeesData, pointsData, badgesData) => {
    console.log('🏗️ Building leaderboard...');
    
    const leaderboard = [];
    
    // Grouper les badges par employé
    const badgesByEmployee = {};
    badgesData.forEach(badge => {
      if (!badgesByEmployee[badge.employee_id]) {
        badgesByEmployee[badge.employee_id] = [];
      }
      badgesByEmployee[badge.employee_id].push(badge);
    });

    // Créer les données du leaderboard
    employeesData.forEach(employee => {
      const pointsRecord = pointsData.find(p => p.employee_id === employee.id);
      const employeeBadges = badgesByEmployee[employee.id] || [];
      
      const totalPoints = pointsRecord?.total_points || 0;
      const level = calculateLevel(totalPoints);
      
      leaderboard.push({
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        first_name: employee.first_name,
        last_name: employee.last_name,
        department: employee.department,
        position: employee.position,
        profile_picture: employee.profile_picture,
        avatar_style: employee.avatar_style,
        totalPoints: totalPoints,
        pointsThisMonth: pointsRecord?.points_this_month || 0,
        pointsThisWeek: pointsRecord?.points_this_week || 0,
        level: level,
        streakDays: pointsRecord?.streak_days || 0,
        badges: employeeBadges,
        badgeCount: employeeBadges.length,
        achievements: groupBadgesByCategory(employeeBadges)
      });
    });

    // Trier par points total (décroissant)
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    
    console.log('✅ Leaderboard built with', leaderboard.length, 'employees');
    
    return leaderboard;
  };

  const calculateLevel = (points) => {
    const levels = Object.keys(LEVEL_CONFIG).map(Number).sort((a, b) => b - a);
    
    for (const level of levels) {
      if (points >= LEVEL_CONFIG[level].minPoints) {
        return level;
      }
    }
    return 1;
  };

  const groupBadgesByCategory = (badges) => {
    const grouped = {};
    badges.forEach(badge => {
      const category = badge.badge_category || 'other';
      if (!grouped[category]) grouped[category] = 0;
      grouped[category]++;
    });
    return grouped;
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">{rank}</div>;
    }
  };

  const getPodiumHeight = (position) => {
    switch (position) {
      case 1: return "h-32";
      case 2: return "h-24";
      case 3: return "h-20";
      default: return "h-16";
    }
  };

  const filteredLeaderboard = leaderboardData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.department?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium text-gray-700">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur d'accès</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header du Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🏆 Classement des Performances
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Découvrez les meilleurs performeurs de votre équipe
          </p>
        </motion.div>

        {/* Ma Position */}
        {myRanking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <AvatarGenerator
                        firstName={currentEmployee?.first_name}
                        lastName={currentEmployee?.last_name}
                        email={currentUser?.email}
                        department={currentEmployee?.department}
                        profilePicture={currentEmployee?.profile_picture}
                        size="lg"
                        style={currentEmployee?.avatar_style || 'auto'}
                        className="ring-4 ring-white/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">#{myRanking.position}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Ma Position</h3>
                      <p className="text-indigo-100">
                        {myRanking.employee.name} • {myRanking.employee.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{myRanking.employee.totalPoints}</div>
                    <div className="text-indigo-100 text-sm">points</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Podium Top 3 */}
        {topPerformers.first && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  Podium des Champions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center items-end gap-8 mb-8">
                  {/* 2ème place */}
                  {topPerformers.second && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center"
                    >
                      <div className="relative mb-4">
                        <AvatarGenerator
                          firstName={topPerformers.second.first_name}
                          lastName={topPerformers.second.last_name}
                          department={topPerformers.second.department}
                          profilePicture={topPerformers.second.profile_picture}
                          size="xl"
                          style={topPerformers.second.avatar_style || 'auto'}
                          className="ring-4 ring-gray-300"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                      </div>
                      <div className={`bg-gradient-to-t from-gray-300 to-gray-400 ${getPodiumHeight(2)} w-24 mx-auto rounded-t-lg flex items-end justify-center pb-2`}>
                        <Medal className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold mt-2">{topPerformers.second.name}</h3>
                      <p className="text-sm text-gray-600">{topPerformers.second.department}</p>
                      <p className="text-lg font-bold text-gray-700">{topPerformers.second.totalPoints} pts</p>
                    </motion.div>
                  )}

                  {/* 1ère place */}
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <div className="relative mb-4">
                      <AvatarGenerator
                        firstName={topPerformers.first.first_name}
                        lastName={topPerformers.first.last_name}
                        department={topPerformers.first.department}
                        profilePicture={topPerformers.first.profile_picture}
                        size="xl"
                        style={topPerformers.first.avatar_style || 'auto'}
                        className="ring-4 ring-yellow-400"
                      />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className={`bg-gradient-to-t from-yellow-400 to-yellow-500 ${getPodiumHeight(1)} w-28 mx-auto rounded-t-lg flex items-end justify-center pb-2`}>
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold mt-2 text-lg">{topPerformers.first.name}</h3>
                    <p className="text-sm text-gray-600">{topPerformers.first.department}</p>
                    <p className="text-xl font-bold text-yellow-600">{topPerformers.first.totalPoints} pts</p>
                    <Badge className="mt-2 bg-yellow-500 text-white">🥇 Champion</Badge>
                  </motion.div>

                  {/* 3ème place */}
                  {topPerformers.third && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-center"
                    >
                      <div className="relative mb-4">
                        <AvatarGenerator
                          firstName={topPerformers.third.first_name}
                          lastName={topPerformers.third.last_name}
                          department={topPerformers.third.department}
                          profilePicture={topPerformers.third.profile_picture}
                          size="xl"
                          style={topPerformers.third.avatar_style || 'auto'}
                          className="ring-4 ring-orange-300"
                        />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                      </div>
                      <div className={`bg-gradient-to-t from-orange-300 to-orange-400 ${getPodiumHeight(3)} w-20 mx-auto rounded-t-lg flex items-end justify-center pb-2`}>
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold mt-2">{topPerformers.third.name}</h3>
                      <p className="text-sm text-gray-600">{topPerformers.third.department}</p>
                      <p className="text-lg font-bold text-orange-600">{topPerformers.third.totalPoints} pts</p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Barre de recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un employé ou département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={loadLeaderboardData}
                variant="outline"
                className="shrink-0"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Classement complet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Classement Complet
              <Badge variant="outline">{filteredLeaderboard.length} employés</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredLeaderboard.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      currentEmployee?.id === employee.id 
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rang */}
                      <div className="w-12 flex justify-center">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Avatar et infos */}
                      <div className="flex items-center gap-3">
                        <AvatarGenerator
                          firstName={employee.first_name}
                          lastName={employee.last_name}
                          department={employee.department}
                          profilePicture={employee.profile_picture}
                          size="default"
                          style={employee.avatar_style || 'auto'}
                          className="ring-2 ring-white ring-offset-1"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {employee.name}
                            {currentEmployee?.id === employee.id && (
                              <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                                C'est moi !
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {employee.position} • {employee.department}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Métriques */}
                    <div className="flex items-center gap-6">
                      {/* Points */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">
                          {employee.totalPoints}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>

                      {/* Niveau */}
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          {React.createElement(LEVEL_CONFIG[employee.level]?.icon || Shield, {
                            className: "w-5 h-5 text-purple-600"
                          })}
                          <span className="font-bold text-purple-600">Niv. {employee.level}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {LEVEL_CONFIG[employee.level]?.name}
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-yellow-600">{employee.badgeCount}</span>
                        </div>
                        <div className="text-xs text-gray-500">badges</div>
                      </div>

                      {/* Série */}
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-600" />
                          <span className="font-bold text-orange-600">{employee.streakDays}</span>
                        </div>
                        <div className="text-xs text-gray-500">jours</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun résultat</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Aucun employé ne correspond à votre recherche.' : 'Aucune donnée disponible.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}