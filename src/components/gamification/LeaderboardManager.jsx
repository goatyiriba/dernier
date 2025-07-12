import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  Crown, 
  Star, 
  Medal, 
  Award, 
  TrendingUp, 
  Users,
  Calendar,
  Target,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardManager({ employees, employeePoints, badges }) {
  const [timeFrame, setTimeFrame] = useState("all"); // all, month, week
  const [category, setCategory] = useState("points"); // points, badges, level
  const [showNegative, setShowNegative] = useState(false);

  // Fusionner les données
  const employeesWithStats = employees.map(emp => {
    const points = employeePoints.find(p => p.employee_id === emp.id);
    const empBadges = badges.filter(b => b.employee_id === emp.id);
    
    return {
      ...emp,
      points: points || { total_points: 0, level: 1, streak_days: 0, points_this_month: 0, points_this_week: 0 },
      badges: empBadges,
      badgeCount: empBadges.length
    };
  });

  // Filtrer et trier selon les critères
  const getFilteredAndSortedEmployees = () => {
    let filtered = [...employeesWithStats];

    // Filtrer les points négatifs si nécessaire
    if (!showNegative) {
      filtered = filtered.filter(emp => emp.points.total_points >= 0);
    }

    // Trier selon la catégorie
    switch (category) {
      case "points":
        if (timeFrame === "month") {
          filtered.sort((a, b) => (b.points.points_this_month || 0) - (a.points.points_this_month || 0));
        } else if (timeFrame === "week") {
          filtered.sort((a, b) => (b.points.points_this_week || 0) - (a.points.points_this_week || 0));
        } else {
          filtered.sort((a, b) => (b.points.total_points || 0) - (a.points.total_points || 0));
        }
        break;
      case "badges":
        filtered.sort((a, b) => b.badgeCount - a.badgeCount);
        break;
      case "level":
        filtered.sort((a, b) => (b.points.level || 1) - (a.points.level || 1));
        break;
      case "streak":
        filtered.sort((a, b) => (b.points.streak_days || 0) - (a.points.streak_days || 0));
        break;
    }

    return filtered;
  };

  const sortedEmployees = getFilteredAndSortedEmployees();

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">{rank}</div>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3: return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
      default: return "bg-white border border-gray-200";
    }
  };

  const getValueByCategory = (employee) => {
    switch (category) {
      case "points":
        if (timeFrame === "month") return employee.points.points_this_month || 0;
        if (timeFrame === "week") return employee.points.points_this_week || 0;
        return employee.points.total_points || 0;
      case "badges":
        return employee.badgeCount;
      case "level":
        return employee.points.level || 1;
      case "streak":
        return employee.points.streak_days || 0;
      default:
        return 0;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "points": return "Points";
      case "badges": return "Badges";
      case "level": return "Niveau";
      case "streak": return "Série";
      default: return "Score";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                Classements & Leaderboards
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Visualisez les performances de vos employés
              </p>
            </div>
            
            {/* Contrôles de filtrage */}
            <div className="flex flex-wrap items-center gap-4">
              <Select value={timeFrame} onValueChange={setTimeFrame}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tout temps</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="badges">Badges</SelectItem>
                  <SelectItem value="level">Niveau</SelectItem>
                  <SelectItem value="streak">Série</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showNegative ? "default" : "outline"}
                onClick={() => setShowNegative(!showNegative)}
                size="sm"
              >
                Points négatifs
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Podium Top 3 */}
      <Card className="shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {sortedEmployees.slice(0, 3).map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl ${getRankColor(index + 1)} text-center shadow-lg`}
              >
                {/* Position et icône */}
                <div className="flex justify-center mb-4">
                  {getRankIcon(index + 1)}
                </div>

                {/* Avatar */}
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {employee.first_name?.[0]}{employee.last_name?.[0]}
                </div>

                {/* Nom */}
                <h3 className="font-bold text-lg mb-2">
                  {employee.first_name} {employee.last_name}
                </h3>

                {/* Département */}
                <p className={`text-sm mb-4 ${index + 1 <= 3 ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                  {employee.department}
                </p>

                {/* Score principal */}
                <div className="text-3xl font-bold mb-2">
                  {getValueByCategory(employee)}
                </div>
                <div className={`text-sm ${index + 1 <= 3 ? 'text-white text-opacity-80' : 'text-gray-600'}`}>
                  {getCategoryLabel()}
                </div>

                {/* Stats secondaires */}
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white border-opacity-20">
                  <div>
                    <div className="font-bold">{employee.points.level}</div>
                    <div className={`text-xs ${index + 1 <= 3 ? 'text-white text-opacity-80' : 'text-gray-500'}`}>Niveau</div>
                  </div>
                  <div>
                    <div className="font-bold">{employee.badgeCount}</div>
                    <div className={`text-xs ${index + 1 <= 3 ? 'text-white text-opacity-80' : 'text-gray-500'}`}>Badges</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Classement complet */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Classement Complet - {getCategoryLabel()}
            <Badge variant="outline">{sortedEmployees.length} employés</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {sortedEmployees.map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rang */}
                    <div className="w-12 text-center">
                      {index < 3 ? (
                        getRankIcon(index + 1)
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {employee.first_name?.[0]}{employee.last_name?.[0]}
                    </div>

                    {/* Infos employé */}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {employee.position} • {employee.department}
                      </p>
                    </div>
                  </div>

                  {/* Métriques */}
                  <div className="flex items-center gap-6">
                    {/* Score principal */}
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        getValueByCategory(employee) < 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {getValueByCategory(employee)}
                      </div>
                      <div className="text-xs text-gray-500">{getCategoryLabel()}</div>
                    </div>

                    {/* Stats supplémentaires */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="text-center">
                        <div className="font-medium">{employee.points.level}</div>
                        <div className="text-xs">Niv.</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          {employee.badgeCount}
                        </div>
                        <div className="text-xs">Badges</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {employee.points.streak_days}
                        </div>
                        <div className="text-xs">Série</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}