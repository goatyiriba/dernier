import React, { useState, useEffect, useMemo } from "react";
import { Employee, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Plus,
  User as UserIcon,
  RefreshCw,
  AlertTriangle,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import EmployeeCard from "../components/employees/EmployeeCard";
import EmployeeFilters from "../components/employees/EmployeeFilters";
import AddEmployeeModal from "../components/employees/AddEmployeeModal";
import ViewEmployeeModal from "../components/employees/ViewEmployeeModal";
import EditEmployeeModal from "../components/employees/EditEmployeeModal";
import { useTranslation } from "../components/utils/i18n";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const { t, formatNumber } = useTranslation();

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 120000);
    return () => clearInterval(intervalId);
  }, []);

  const { enrichedEmployees, unlinkedUsers } = useMemo(() => {
    const userMap = new Map(users.map(user => [user.email, user]));
    const linkedEmails = new Set(employees.map(emp => emp.email));

    const enriched = employees.map(employee => {
      const user = userMap.get(employee.email);
      return {
        ...employee,
        last_login: user?.last_login,
      };
    }).sort((a,b) => new Date(b.created_date) - new Date(a.created_date));

    const unlinked = users.filter(user => !linkedEmails.has(user.email) && user.role !== 'admin');

    return { enrichedEmployees: enriched, unlinkedUsers: unlinked };
  }, [employees, users]);

  const [filteredEmployees, setFilteredEmployees] = useState([]);

  useEffect(() => {
    filterEmployees();
  }, [enrichedEmployees, searchTerm, selectedDepartment, selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const employeeData = await Employee.list("-created_date");
      setEmployees(employeeData);

      const lastUserLoad = localStorage.getItem('lastUserLoadTime');
      const now = Date.now();
      const oneMinuteAgo = now - 60000;

      if (!lastUserLoad || parseInt(lastUserLoad) < oneMinuteAgo) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const userData = await User.list();
          setUsers(userData);
          localStorage.setItem('lastUserLoadTime', now.toString());
          localStorage.setItem('cachedUsers', JSON.stringify(userData));
        } catch (userError) {
          console.warn("Could not load user data, using cached data:", userError);
          
          const cachedUsers = localStorage.getItem('cachedUsers');
          if (cachedUsers) {
            try {
              setUsers(JSON.parse(cachedUsers));
            } catch (parseError) {
              console.error("Error parsing cached users:", parseError);
              setUsers([]);
            }
          } else {
            setUsers([]);
          }
          
          toast({
            title: t('common.warning') || 'Avertissement',
            description: "Impossible de charger les données utilisateur. Utilisation des données en cache.",
            variant: "default",
          });
        }
      } else {
        const cachedUsers = localStorage.getItem('cachedUsers');
        if (cachedUsers) {
          try {
            setUsers(JSON.parse(cachedUsers));
          } catch (parseError) {
            console.error("Error parsing cached users:", parseError);
            setUsers([]);
          }
        }
      }
    } catch (employeeError) {
      console.error("Error loading employee data:", employeeError);
      const errorMessage = "Erreur de chargement des données";
      setError(errorMessage);
      toast({
        title: t('common.error') || 'Erreur',
        description: "Erreur lors du chargement des employés",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...enrichedEmployees];

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(emp => emp.department === selectedDepartment);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(emp => emp.status === selectedStatus);
    }

    setFilteredEmployees(filtered);
  };

  const handleAddEmployee = async (employeeData, userId) => {
    try {
      const newEmployee = await Employee.create(employeeData);

      if (userId) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await User.update(userId, { employee_id: newEmployee.id });
        } catch (updateError) {
          console.warn("Could not update user employee_id:", updateError);
        }
      }

      setShowAddModal(false);
      
      const updatedEmployeeData = await Employee.list("-created_date");
      setEmployees(updatedEmployeeData);
      
      toast({
        title: t('common.success') || 'Succès',
        description: "Employé créé avec succès",
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      toast({
        title: t('common.error') || 'Erreur',
        description: "Erreur lors de la création de l'employé",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = async (employeeData) => {
    try {
      await Employee.update(selectedEmployee.id, employeeData);
      setShowEditModal(false);
      setSelectedEmployee(null);
      
      const updatedEmployeeData = await Employee.list("-created_date");
      setEmployees(updatedEmployeeData);
      
      toast({
        title: t('common.success') || 'Succès',
        description: "Employé mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: t('common.error') || 'Erreur',
        description: "Erreur lors de la mise à jour de l'employé",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await Employee.delete(employeeId);
      
      const updatedEmployeeData = await Employee.list("-created_date");
      setEmployees(updatedEmployeeData);
      
      toast({
        title: t('common.success') || 'Succès',
        description: "Employé supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: t('common.error') || 'Erreur',
        description: "Erreur lors de la suppression de l'employé",
        variant: "destructive",
      });
    }
  };

  const handleToggleEmployeeStatus = async (employeeId, newStatus) => {
    try {
      await Employee.update(employeeId, { status: newStatus });
      
      const updatedEmployeeData = await Employee.list("-created_date");
      setEmployees(updatedEmployeeData);
      
      toast({
        title: t('common.success') || 'Succès',
        description: "Statut mis à jour avec succès",
      });
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: t('common.error') || 'Erreur',
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête moderne avec gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent mb-3">
                {t('employees.title') || 'Gestion des Employés'}
              </h1>
              <p className="text-xl text-emerald-100 font-medium mb-4">
                Administrez votre équipe avec efficacité
              </p>
              <div className="flex items-center gap-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>
                    {formatNumber ? formatNumber(employees.length) : employees.length} employés au total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {formatNumber ? formatNumber(employees.filter(e => e.status === "Active").length) : employees.filter(e => e.status === "Active").length} actifs
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter Employé
            </Button>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher par nom, email, poste ou département..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 border-0 bg-gray-50/80 focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
                <EmployeeFilters
                  selectedDepartment={selectedDepartment}
                  selectedStatus={selectedStatus}
                  onDepartmentChange={setSelectedDepartment}
                  onStatusChange={setSelectedStatus}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gestion d'erreur */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-red-50 border-red-200 shadow-xl">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-6">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-red-900">Erreur de Chargement</h3>
                  <p className="text-red-700 max-w-md">{error}</p>
                </div>
                <Button
                  onClick={loadData}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Section employés avec compteur */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Équipe ({formatNumber ? formatNumber(filteredEmployees.length) : filteredEmployees.length})
            </h2>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-4 py-2">
                {formatNumber ? formatNumber(filteredEmployees.length) : filteredEmployees.length} sur {formatNumber ? formatNumber(employees.length) : employees.length} employés
              </Badge>
              {filteredEmployees.length !== employees.length && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDepartment("all");
                    setSelectedStatus("all");
                  }}
                  className="bg-white/80 backdrop-blur-sm"
                >
                  Réinitialiser filtres
                </Button>
              )}
            </div>
          </div>

          {/* Grille d'employés */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg h-96">
                      <CardContent className="p-8">
                        <div className="animate-pulse flex flex-col space-y-6">
                          <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-3xl" />
                            <div className="flex-1 space-y-3">
                              <div className="h-6 bg-gray-200 rounded w-3/4" />
                              <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="h-8 bg-gray-200 rounded-xl flex-1" />
                            <div className="h-8 bg-gray-200 rounded-xl flex-1" />
                          </div>
                          <div className="space-y-4">
                            <div className="h-16 bg-gray-200 rounded-2xl" />
                            <div className="h-16 bg-gray-200 rounded-2xl" />
                            <div className="h-16 bg-gray-200 rounded-2xl" />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <div className="h-12 bg-gray-200 rounded-xl flex-1" />
                            <div className="h-12 bg-gray-200 rounded-xl flex-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : !error ? (
                filteredEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="min-h-[400px]"
                  >
                    <EmployeeCard
                      employee={employee}
                      onView={handleViewEmployee}
                      onEdit={handleEditEmployeeClick}
                      onDelete={handleDeleteEmployee}
                      onToggleStatus={handleToggleEmployeeStatus}
                    />
                  </motion.div>
                ))
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* État vide */}
        {!isLoading && !error && filteredEmployees.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Aucun employé trouvé
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {employees.length === 0
                    ? "Commencez par ajouter votre premier employé à l'équipe."
                    : "Aucun employé ne correspond aux filtres sélectionnés."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {employees.length === 0 ? 'Ajouter le premier employé' : 'Ajouter un employé'}
                  </Button>
                  {employees.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedDepartment("all");
                        setSelectedStatus("all");
                      }}
                      className="bg-white/80 backdrop-blur-sm px-8 py-3 rounded-xl"
                    >
                      Réinitialiser filtres
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Modales */}
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEmployee}
          unlinkedUsers={unlinkedUsers}
        />

        <ViewEmployeeModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
        />

        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSave={handleEditEmployee}
        />
      </div>
    </div>
  );
}