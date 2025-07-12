import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Star,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function GamificationAnalytics({ stats, employees, employeePoints, badges }) {
  const [selectedMetric, setSelectedMetric] = useState("points");

  // Calculer des métriques avancées
  const getAdvancedStats = () => {
    // Top 5 performers
    const topPerformers = employeePoints
      .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
      .slice(0, 5)
      .map(points => {
        const employee = employees.find(emp => emp.id === points.employee_id);
        return {
          ...points,
          employee
        };
      });

    // Distribution des niveaux
    const levelDistribution = employeePoints.reduce((acc, points) => {
      const level = points.level || 1;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    // Badges les plus attribués
    const badgeStats = badges.reduce((acc, badge) => {
      const badgeName = badge.badge_name;
      acc[badgeName] = (acc[badgeName] || 0) + 1;
      return acc;
    }, {});

    // Engagement moyen
    const totalPoints = employeePoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
    const averageEngagement = employeePoints.length > 0 ? totalPoints / employeePoints.length : 0;

    return {
      topPerformers,
      levelDistribution,
      badgeStats,
      averageEngagement
    };
  };

  const advancedStats = getAdvancedStats();

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Joueurs Actifs</p>
                  <p className="text-3xl font-bold">{stats.totalPlayers}</p>
                  <p className="text-blue-200 text-xs">
                    {Math.round((stats.totalPlayers / employees.length) * 100)}% des employés
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Points Moyens</p>
                  <p className="text-3xl font-bold">{stats.averagePoints}</p>
                  <p className="text-green-200 text-xs">
                    Engagement: {advancedStats.averageEngagement > 100 ? 'Élevé' : 'Modéré'}
                  </p>
                </div>
                <Target className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Badges Attribués</p>
                  <p className="text-3xl font-bold">{stats.totalBadges}</p>
                  <p className="text-yellow-200 text-xs">
                    {(stats.totalBadges / stats.totalPlayers).toFixed(1)} par employé
                  </p>
                </div>
                <Award className="w-10 h-10 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Leader Actuel</p>
                  <p className="text-xl font-bold">
                    {stats.topPerformer ? `${stats.topPerformer.total_points}pts` : 'N/A'}
                  </p>
                  <p className="text-purple-200 text-xs">
                    {stats.topPerformer ? 'Performance excellente' : 'Aucun leader'}
                  </p>
                </div>
                <Crown className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Performers */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {advancedStats.topPerformers.map((performer, index) => (
              <motion.div
                key={performer.employee_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {performer.employee?.first_name?.[0]}{performer.employee?.last_name?.[0]}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {performer.employee?.first_name} {performer.employee?.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {performer.employee?.position} • Niveau {performer.level}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {performer.total_points || 0}
                  </div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
                
                {index === 0 && (
                  <Crown className="w-6 h-6 text-yellow-500 ml-2" />
                )}
                {index === 1 && (
                  <Star className="w-6 h-6 text-gray-400 ml-2" />
                )}
                {index === 2 && (
                  <Zap className="w-6 h-6 text-orange-500 ml-2" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution des points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Distribution des Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pointsDistribution.map((range, index) => (
                <div key={range.range} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.range} points</span>
                    <Badge variant="outline">{range.count} employés</Badge>
                  </div>
                  <Progress 
                    value={(range.count / stats.totalPlayers) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Badges Populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(advancedStats.badgeStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([badgeName, count]) => (
                  <div key={badgeName} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="font-medium text-gray-900">{badgeName}</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {count} fois
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution des niveaux */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Distribution des Niveaux
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {Object.entries(advancedStats.levelDistribution)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([level, count]) => (
                <div key={level} className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {level}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">Niveau</div>
                  <Badge variant="outline" className="text-xs">
                    {count} emp.
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}