
import React, { useState, useEffect } from "react";
import { PerformanceReview, Employee } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  Star,
  Calendar,
  User,
  Target,
  Users,
  Eye,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ReviewCard from "../components/performance/ReviewCard";
import SurveyAnalytics from "../components/surveys/SurveyAnalytics";
import ViewReviewModal from "../components/performance/ViewReviewModal"; // Added ViewReviewModal import

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null); // New state for selected review
  const [showViewModal, setShowViewModal] = useState(false); // New state for modal visibility

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    try {
      const [reviewData, employeeData] = await Promise.all([
        PerformanceReview.list("-created_date"),
        Employee.list()
      ]);

      setReviews(reviewData);
      setEmployees(employeeData);

    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReview = (review) => {
    console.log("handleViewReview called with:", review);
    setSelectedReview(review);
    setShowViewModal(true);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";
  };

  const getEmployeeDepartment = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.department || "N/A";
  };

  const filteredReviews = reviews.filter(review => {
    const statusMatch = activeTab === "all" || review.status === activeTab;
    
    const departmentMatch = filterDepartment === "all" || 
      getEmployeeDepartment(review.employee_id) === filterDepartment;
    
    return statusMatch && departmentMatch;
  });

  const statusCounts = {
    all: reviews.length,
    Draft: reviews.filter(r => r.status === "Draft").length,
    Completed: reviews.filter(r => r.status === "Completed").length,
    Acknowledged: reviews.filter(r => r.status === "Acknowledged").length
  };

  const peerReviews = reviews.filter(r => {
    const reviewer = employees.find(e => e.id === r.reviewer_id);
    const reviewee = employees.find(e => e.id === r.employee_id);
    return reviewer && reviewee;
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Centre Performance RH
              </h1>
              <p className="text-xl text-purple-100 font-medium mb-4">
                Visualisation et analyse des évaluations de performance
              </p>
              <div className="flex items-center gap-6 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{statusCounts.all} évaluations totales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>Note moyenne: {averageRating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{peerReviews.length} évaluations entre collègues</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 justify-center">
                <Eye className="w-4 h-4 mr-2" />
                Vue Consultation
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Métriques améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { title: "Total Évaluations", value: statusCounts.all, icon: TrendingUp, color: "from-purple-500 to-indigo-600" },
            { title: "Note Moyenne", value: averageRating, icon: Star, color: "from-amber-500 to-yellow-600" },
            { title: "Évaluations Collègues", value: peerReviews.length, icon: Users, color: "from-blue-500 to-cyan-600" },
            { title: "Terminées", value: statusCounts.Completed, icon: Target, color: "from-green-500 to-emerald-600" },
            { title: "En Cours", value: statusCounts.Draft, icon: Calendar, color: "from-indigo-500 to-blue-600" }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
            >
              <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-gradient-to-br ${metric.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <metric.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">{metric.title}</h3>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filtres */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Filtres:</span>
              </div>
              
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les départements</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TabsTrigger value="all">Toutes ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="Draft">Brouillons ({statusCounts.Draft})</TabsTrigger>
            <TabsTrigger value="Completed">Terminées ({statusCounts.Completed})</TabsTrigger>
            <TabsTrigger value="Acknowledged">Validées ({statusCounts.Acknowledged})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            <div className="grid gap-4">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-4">
                          <div className="flex justify-between">
                            <div className="space-y-2">
                              <div className="h-4 bg-slate-200 rounded w-32" />
                              <div className="h-3 bg-slate-200 rounded w-24" />
                            </div>
                            <div className="h-6 bg-slate-200 rounded w-20" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredReviews.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      employeeName={getEmployeeName(review.employee_id)}
                      employeeDepartment={getEmployeeDepartment(review.employee_id)}
                      isAdminView={true}
                      showViewOnly={true}
                      onView={handleViewReview} // Added onView prop
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de visualisation pour admin */}
        {selectedReview && showViewModal && (
          <ViewReviewModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedReview(null);
            }}
            review={selectedReview}
            employeeName={getEmployeeName(selectedReview.employee_id)}
            employeeDepartment={getEmployeeDepartment(selectedReview.employee_id)}
            isAdminView={true}
          />
        )}
      </div>
    </div>
  );
}
