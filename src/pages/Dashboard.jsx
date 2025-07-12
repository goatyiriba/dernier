
import React, { useState, useEffect } from "react";
import { Employee, LeaveRequest, PerformanceReview } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  UserPlus,
  ArrowUpRight,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";
import DepartmentOverview from "../components/dashboard/DepartmentOverview";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [performanceReviews, setPerformanceReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      
      const employeeData = await Employee.list("-created_date");
      setEmployees(employeeData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const leaveData = await LeaveRequest.list("-created_date");
      setLeaveRequests(leaveData);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const reviewData = await PerformanceReview.list("-created_date");
      setPerformanceReviews(reviewData);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === "Active").length,
    onlineEmployees: employees.filter(e => {
      const lastActivity = e.last_activity || e.updated_date;
      if (!lastActivity) return false;
      const diffSeconds = Math.floor((new Date() - new Date(lastActivity)) / 1000);
      return diffSeconds < 300; // En ligne si actif dans les 5 dernières minutes (300 seconds)
    }).length,
    pendingLeaves: leaveRequests.filter(r => r.status === "Pending").length,
    upcomingReviews: performanceReviews.filter(r => r.status === "Draft").length
  };

  const recentActivities = [
    ...leaveRequests.slice(0, 3).map(leave => ({
      id: leave.id,
      type: "leave",
      title: "Demande de Congé",
      description: `${leave.leave_type} demandé`,
      time: format(new Date(leave.created_date), "dd MMM yyyy"),
      status: leave.status
    })),
    ...performanceReviews.slice(0, 2).map(review => ({
      id: review.id,
      type: "review",
      title: "Évaluation Performance",
      description: `Évaluation ${review.review_period} complétée`,
      time: format(new Date(review.created_date), "dd MMM yyyy"),
      status: review.status
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200 shadow-xl">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-red-900 mb-4">Erreur de Chargement</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <Button 
                onClick={loadData}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl"
              >
                <Activity className="w-5 h-5 mr-2" />
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Centre de Pilotage RH
              </h1>
              <p className="text-xl text-blue-100 font-medium mb-4">
                Tableau de bord administrateur • Vue d'ensemble complète
              </p>
              <div className="flex items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Système opérationnel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Dernière mise à jour: {format(new Date(), "HH:mm")}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-right">
                <p className="text-3xl font-bold">{format(new Date(), "dd")}</p>
                <p className="text-blue-200">{format(new Date(), "MMMM yyyy")}</p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Target className="w-4 h-4 mr-2" />
                Vue Admin
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Métriques principales avec design amélioré et nouveau statut en ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <StatsCard
              title="Total Employés"
              value={stats.totalEmployees}
              icon={Users}
              color="blue"
              trend="+3 ce mois"
              subtitle="Équipe globale"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <StatsCard
              title="Employés Actifs"
              value={stats.activeEmployees}
              icon={CheckCircle}
              color="green"
              trend="98% taux d'activité"
              subtitle="Statut opérationnel"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <StatsCard
              title="En Ligne"
              value={stats.onlineEmployees}
              icon={Activity}
              color="green"
              trend="Temps réel"
              subtitle="Connectés maintenant"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <StatsCard
              title="Congés en Attente"
              value={stats.pendingLeaves}
              icon={Clock}
              color="amber"
              trend="Nécessite attention"
              subtitle="Demandes à traiter"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StatsCard
              title="Évaluations Prévues"
              value={stats.upcomingReviews}
              icon={TrendingUp}
              color="purple"
              trend="Ce trimestre"
              subtitle="Performance reviews"
            />
          </motion.div>
        </div>

        {/* Contenu principal avec layout amélioré */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Activité récente - Design moderne */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <RecentActivity activities={recentActivities} isLoading={isLoading} />
            </motion.div>
          </div>

          {/* Panneau latéral avec actions et aperçus */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <QuickActions />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
            >
              <DepartmentOverview employees={employees} />
            </motion.div>
          </div>
        </div>

        {/* Section insights et analytics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-emerald-700">
                <BarChart3 className="w-6 h-6" />
                Tendances Mensuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Nouvelles embauches</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">+5</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taux de présence</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">96.2%</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Satisfaction équipe</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">4.8/5</span>
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Employés en ligne</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">{stats.onlineEmployees}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-0 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/5"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-purple-700">
                <Zap className="w-6 h-6" />
                Actions Recommandées
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <Link 
                  to={createPageUrl("LeaveManagement")}
                  className="block p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Traiter les congés</span>
                    <Badge className="bg-amber-100 text-amber-700">
                      {stats.pendingLeaves}
                    </Badge>
                  </div>
                </Link>
                <Link 
                  to={createPageUrl("Performance")}
                  className="block p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Révisions performance</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      {stats.upcomingReviews}
                    </Badge>
                  </div>
                </Link>
                <Link 
                  to={createPageUrl("MyTeam")}
                  className="block p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Voir l'équipe en ligne</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-green-600 font-medium">{stats.onlineEmployees} connectés</span>
                      <ArrowUpRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </Link>
                <Link 
                  to={createPageUrl("Employees")}
                  className="block p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Gérer l'équipe</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-500" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
