
import React, { useState, useEffect } from "react";
import { LeaveRequest, Employee } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity // Added Activity icon
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import LeaveRequestCard from "../components/leave/LeaveRequestCard";
import RequestLeaveModal from "../components/leave/RequestLeaveModal";

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 15000); // Refresh data every 15 seconds
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const loadData = async () => {
    try {
      const [leaveData, employeeData] = await Promise.all([
        LeaveRequest.list("-created_date"),
        Employee.list()
      ]);
      
      setLeaveRequests(leaveData);
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error loading leave data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";
  };

  const filteredRequests = activeTab === "all" 
    ? leaveRequests 
    : leaveRequests.filter(request => request.status === activeTab);

  const statusCounts = {
    all: leaveRequests.length,
    Pending: leaveRequests.filter(r => r.status === "Pending").length,
    Approved: leaveRequests.filter(r => r.status === "Approved").length,
    Denied: leaveRequests.filter(r => r.status === "Denied").length
  };

  const handleRequestLeave = async (leaveData) => {
    try {
      await LeaveRequest.create(leaveData);
      setShowRequestModal(false);
      loadData();
    } catch (error) {
      console.error("Error creating leave request:", error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await LeaveRequest.update(requestId, { 
        status: newStatus,
        approval_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error("Error updating leave request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero avec gradient et animations */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Gestion des Congés
              </h1>
              <p className="text-xl text-purple-100 font-medium mb-4">
                Centre de contrôle des demandes de congés et absences
              </p>
              <div className="flex items-center gap-6 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{leaveRequests.length} demandes totales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{statusCounts.Pending} en attente</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{statusCounts.Approved} approuvées</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => setShowRequestModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Demande
              </Button>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 justify-center">
                <Activity className="w-4 h-4 mr-2" />
                Système Actif
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Métriques avec design moderne et animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Total
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Demandes Totales</h3>
                  <p className="text-3xl font-bold text-blue-600">{statusCounts.all}</p>
                  <p className="text-xs text-gray-500">Toutes périodes confondues</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">
                    Urgent
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">En Attente</h3>
                  <p className="text-3xl font-bold text-amber-600">{statusCounts.Pending}</p>
                  <p className="text-xs text-gray-500">Nécessitent une action</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Validé
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Approuvées</h3>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.Approved}</p>
                  <p className="text-xs text-gray-500">Congés confirmés</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="w-8 h-8 text-white" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200">
                    Refusé
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Refusées</h3>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.Denied}</p>
                  <p className="text-xs text-gray-500">Demandes non accordées</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Système d'onglets moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-14 p-1 rounded-2xl">
              <TabsTrigger 
                value="all" 
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                Toutes ({statusCounts.all})
              </TabsTrigger>
              <TabsTrigger 
                value="Pending"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                En Attente ({statusCounts.Pending})
              </TabsTrigger>
              <TabsTrigger 
                value="Approved"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                Approuvées ({statusCounts.Approved})
              </TabsTrigger>
              <TabsTrigger 
                value="Denied"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
              >
                Refusées ({statusCounts.Denied})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTab === "all" ? "Toutes les demandes" : 
                   activeTab === "Pending" ? "Demandes en attente" :
                   activeTab === "Approved" ? "Demandes approuvées" : "Demandes refusées"}
                </h2>
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-4 py-2">
                  {filteredRequests.length} résultats
                </Badge>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                      >
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                          <CardContent className="p-6">
                            <div className="animate-pulse space-y-4">
                              <div className="flex justify-between">
                                <div className="space-y-2">
                                  <div className="h-5 bg-gray-200 rounded w-48" />
                                  <div className="h-4 bg-gray-200 rounded w-32" />
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-20" />
                              </div>
                              <div className="h-3 bg-gray-200 rounded w-full" />
                              <div className="flex gap-2">
                                <div className="h-8 bg-gray-200 rounded w-24" />
                                <div className="h-8 bg-gray-200 rounded w-24" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <LeaveRequestCard
                          request={request}
                          employeeName={getEmployeeName(request.employee_id)}
                          onStatusUpdate={handleStatusUpdate}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-16 text-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Aucune demande trouvée
                          </h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {activeTab === "all" 
                              ? "Aucune demande de congé n'a été soumise pour le moment."
                              : `Aucune demande avec le statut "${activeTab}" pour le moment.`
                            }
                          </p>
                          <Button
                            onClick={() => setShowRequestModal(true)}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Créer une demande
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Request Leave Modal */}
        <RequestLeaveModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSave={handleRequestLeave}
          employees={employees}
        />
      </div>
    </div>
  );
}
