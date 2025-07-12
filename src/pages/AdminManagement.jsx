
import React, { useState, useEffect } from "react";
import { AuthService, Employee } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Shield,
  Search,
  User as UserIcon,
  Settings,
  Key,
  AlertTriangle,
  UserPlus,
  Clock,
  CheckCircle,
  Users,
  Crown,
  Filter,
  MoreVertical,
  Eye,
  RefreshCw,
  TrendingUp,
  Activity,
  Zap,
  Building2,
  Loader2,
  UserCheck,
  UserX,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createPageUrl } from "@/utils";

import AdminCard from "../components/admin/AdminCard";
import ApproveUserModal from "../components/admin/ApproveUserModal";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [regularEmployees, setRegularEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUserForApproval, setSelectedUserForApproval] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [isProcessing, setIsProcessing] = useState({}); // To manage loading state for specific users
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    try {
      const [userData, employeeData] = await Promise.all([
        User.list(),
        Employee.list()
      ]);

      const adminUsers = userData.filter(user => user.is_active && (user.role === 'admin' || user.email === 'syllacloud@gmail.com'));
      const pending = userData.filter(user => !user.is_active);
      const regularEmps = userData.filter(user =>
        user.is_active &&
        user.role === 'user' &&
        user.email !== 'syllacloud@gmail.com'
      );

      setAdmins(adminUsers);
      setAllUsers(userData);
      setEmployees(employeeData);
      setPendingUsers(pending);
      setRegularEmployees(regularEmps);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployeeInfo = (userId) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return null;
    return employees.find(e => e.email === user.email);
  };

  const filteredAdmins = admins.filter(admin => {
    const employee = getEmployeeInfo(admin.id);
    const fullName = employee ? `${employee.first_name} ${employee.last_name}` : admin.full_name || admin.email;

    return searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredRegularEmployees = regularEmployees.filter(user => {
    const employeeInfo = getEmployeeInfo(user.id);
    const fullName = employeeInfo ? `${employeeInfo.first_name} ${employeeInfo.last_name}` : user.full_name || user.email;

    const matchesSearch = searchTerm === "" ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employeeInfo?.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = departmentFilter === "all" ||
      (employeeInfo && employeeInfo.department === departmentFilter);

    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))].filter(Boolean);

  const stats = {
    totalAdmins: admins.length,
    activeAdmins: admins.filter(a => !a.is_suspended).length,
    mainAdmin: admins.filter(a => a.email === 'syllacloud@gmail.com').length,
    pendingApprovals: pendingUsers.length,
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter(u => u.is_active).length,
    recentLogins: admins.filter(a =>
      a.last_login && new Date(a.last_login) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  const sendNotification = async (userId, title, message, type = 'announcement_read', linkTo = null) => {
    try {
      if (!Notification) {
        console.warn("Notification entity not available, skipping notification");
        return;
      }

      await Notification.create({
        user_id: userId,
        title: title,
        message: message,
        type: type,
        link_to: linkTo,
        is_read: false
      });

      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleApproveUser = async (employeeData) => {
    if (!selectedUserForApproval) return;
    const userId = selectedUserForApproval.id;

    try {
      setIsProcessing(prev => ({ ...prev, [userId]: true }));

      const newEmployee = await Employee.create(employeeData);
      const userUpdateData = {
        role: 'user',
        is_active: true,
        employee_id: newEmployee.employee_id
      };

      await User.update(userId, userUpdateData);

      try {
        await sendNotification(
          userId,
          "✅ Compte Approuvé",
          "Félicitations ! Votre compte Flow HR a été approuvé. Vous pouvez maintenant accéder à toutes les fonctionnalités.",
          "announcement_read",
          createPageUrl("EmployeeDashboard")
        );
      } catch (notifError) {
        console.warn("Could not send approval notification:", notifError);
      }

      setShowApproveModal(false);
      setSelectedUserForApproval(null);
      await loadData();

      toast({
        title: "✅ Utilisateur approuvé",
        description: `${selectedUserForApproval.full_name || selectedUserForApproval.email} peut maintenant accéder à l'application.`,
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "❌ Erreur d'approbation",
        description: error.message || "Impossible d'approuver l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRejectUser = async (userId) => {
    const userToReject = pendingUsers.find(u => u.id === userId);

    if (!userToReject) {
      toast({ title: "Erreur", description: "Utilisateur non trouvé pour le rejet.", variant: "destructive" });
      return;
    }

    try {
      if (!window.confirm(`Êtes-vous sûr de vouloir rejeter la demande d'inscription de ${userToReject.full_name || userToReject.email} ? Cela désactivera son compte.`)) {
        return;
      }
      setIsProcessing(prev => ({ ...prev, [userId]: true }));

      // Rejet logique: désactiver le compte (as per outline implies)
      await User.update(userId, {
        is_active: false,
        role: 'user' // Keep role as user, just inactive
      });

      try {
        await sendNotification(
          userId,
          "❌ Compte Non Approuvé",
          "Votre demande d'accès à Flow HR n'a pas été approuvée. Veuillez contacter l'administrateur pour plus d'informations.",
          "announcement_read"
        );
      } catch (notifError) {
        console.warn("Could not send rejection notification:", notifError);
      }

      await loadData();
      toast({
        title: "❌ Utilisateur rejeté",
        description: `L'accès de ${userToReject.full_name || userToReject.email} a été refusé.`,
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "❌ Erreur de rejet",
        description: error.message || "Impossible de rejeter la demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRevokeAdminRole = async (userId) => {
    try {
      const user = admins.find(a => a.id === userId);

      if (user?.email === 'syllacloud@gmail.com') {
        alert("Cannot revoke admin privileges from the main administrator account.");
        return;
      }

      setIsProcessing(prev => ({ ...prev, [userId]: true }));
      await User.update(userId, { role: 'user' });
      await loadData();
      toast({
        title: "Rôle Modifié",
        description: "Les privilèges administrateur ont été révoqués.",
      });
    } catch (error) {
      console.error("Error revoking admin role:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handlePromoteToAdmin = async (userId) => {
    const userToPromote = regularEmployees.find(u => u.id === userId);

    if (!userToPromote) {
      toast({ title: "Erreur", description: "Utilisateur non trouvé pour la promotion.", variant: "destructive" });
      return;
    }

    try {
      if (window.confirm(`Êtes-vous sûr de vouloir promouvoir ${userToPromote.full_name || userToPromote.email} au rang d'administrateur ?`)) {
        setIsProcessing(prev => ({ ...prev, [userId]: true }));

        await User.update(userId, { role: 'admin', is_active: true });

        try {
          await sendNotification(
            userId,
            "🎉 Promotion Administrateur",
            "Félicitations ! Vous avez été promu administrateur de Flow HR. Vous avez maintenant accès au panneau d'administration.",
            "announcement_read",
            createPageUrl("AdminDashboard")
          );
        } catch (notifError) {
          console.warn("Could not send promotion notification:", notifError);
        }

        await loadData();
        toast({
          title: "🎉 Utilisateur promu",
          description: `${userToPromote.full_name || userToPromote.email} est maintenant administrateur.`,
        });
      }
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      toast({
        title: "❌ Erreur de promotion",
        description: error.message || "Impossible de promouvoir l'utilisateur. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const openApprovalModal = (user) => {
    setSelectedUserForApproval(user);
    setShowApproveModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-10 h-10 text-white" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Gestion des Utilisateurs
                </h1>
              </div>
              <p className="text-xl text-indigo-100 mb-4">
                Centre de contrôle administratif et gestion des permissions
              </p>
              <div className="flex items-center gap-4 text-indigo-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Système opérationnel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">{stats.totalUsers} utilisateurs actifs</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={loadData} variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Admins</p>
                    <p className="text-3xl font-bold">{stats.totalAdmins}</p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Utilisateurs Actifs</p>
                    <p className="text-3xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <UserIcon className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">En Attente</p>
                    <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Connexions 7j</p>
                    <p className="text-3xl font-bold">{stats.recentLogins}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg h-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              En attente ({stats.pendingApprovals})
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Administrateurs
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Actions rapides */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.pendingApprovals > 0 && (
                    <Button
                      onClick={() => setActiveTab("pending")}
                      className="w-full justify-between bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      <span>Traiter les demandes en attente</span>
                      <Badge className="bg-white/20 text-white">{stats.pendingApprovals}</Badge>
                    </Button>
                  )}
                  <Button
                    onClick={() => setActiveTab("admins")}
                    variant="outline"
                    className="w-full justify-between"
                  >
                    <span>Gérer les administrateurs</span>
                    <Badge variant="outline">{stats.totalAdmins}</Badge>
                  </Button>
                </CardContent>
              </Card>

              {/* Promouvoir des employés */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    Promouvoir des Employés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="Rechercher un employé..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {departments.length > 1 && (
                        <select
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-200 rounded-md"
                        >
                          <option value="all">Tous</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {filteredRegularEmployees.slice(0, 5).map(user => {
                        const employeeInfo = getEmployeeInfo(user.id);
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {user.full_name?.[0] || user.email?.[0] || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {user.full_name || user.email}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {employeeInfo?.department || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handlePromoteToAdmin(user.id)}
                              className="bg-indigo-600 hover:bg-indigo-700"
                              disabled={isProcessing[user.id]}
                            >
                              {isProcessing[user.id] ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Shield className="w-3 h-3 mr-1" />
                              )}
                              Promouvoir
                            </Button>
                          </div>
                        );
                      })}
                      {filteredRegularEmployees.length > 5 && (
                        <p className="text-center text-sm text-slate-500 pt-2">
                          Et {filteredRegularEmployees.length - 5} autres employés...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Demandes en attente */}
          <TabsContent value="pending" className="space-y-6">
            {pendingUsers.length > 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Clock className="w-6 h-6"/>
                    Demandes d'Inscription en Attente ({pendingUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingUsers.map(user => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.full_name || user.email}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <p className="text-xs text-slate-500">
                              Inscrit le {format(new Date(user.created_date), 'dd/MM/yyyy à HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => openApprovalModal(user)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isProcessing[user.id]}
                          >
                            {isProcessing[user.id] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectUser(user.id)}
                            disabled={isProcessing[user.id]}
                          >
                            {isProcessing[user.id] ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              "Rejeter"
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune demande en attente</h3>
                  <p className="text-slate-600">Toutes les demandes d'inscription ont été traitées.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Administrateurs */}
          <TabsContent value="admins" className="space-y-6">
            {/* Search */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher des administrateurs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-slate-50 border-0 focus:bg-white transition-colors"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAdmins.map((admin) => (
                  <AdminCard
                    key={admin.id}
                    admin={admin}
                    employee={getEmployeeInfo(admin.id)}
                    onRevoke={handleRevokeAdminRole}
                    isProcessing={isProcessing[admin.id]}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>

        {/* Approve User Modal */}
        <ApproveUserModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedUserForApproval(null);
          }}
          onSave={handleApproveUser}
          userToApprove={selectedUserForApproval}
        />
      </div>
    </div>
  );
}
