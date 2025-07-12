
import React, { useState, useEffect } from "react";
import { Project, Task, Employee, AuthService } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FolderPlus,
  Calendar,
  Clock,
  Users,
  Target,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Paperclip,
  Flag,
  BarChart3,
  Kanban,
  List,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  Zap,
  Activity,
  Building2,
  MoreVertical,
  Archive,
  RefreshCw,
  Send,
  Bell,
  Settings,
  Award,
  XCircle
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import CreateProjectModal from "../components/projects/CreateProjectModal";
import CreateTaskModal from "../components/projects/CreateTaskModal";
import TaskCard from "../components/projects/TaskCard";
import ProjectCard from "../components/projects/ProjectCard";
import EditProjectModal from "../components/projects/EditProjectModal";
import EditTaskModal from "../components/projects/EditTaskModal";
import ProjectDetailsModal from "../components/projects/ProjectDetailsModal";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("kanban");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'syllacloud@gmail.com';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const user = await User.me();
      setCurrentUser(user);

      const [projectsData, tasksData, employeesData] = await Promise.all([
        Project.list('-created_date'),
        Task.list('-created_date'),
        Employee.list()
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setEmployees(employeesData);

      // Trouver l'employé actuel
      const userEmployee = employeesData.find(emp => emp.email === user.email);
      setCurrentEmployee(userEmployee);

    } catch (error) {
      console.error("Error loading project data:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les données des projets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour envoyer des notifications
  const sendNotification = async (userId, title, message, type, linkTo = null) => {
    try {
      await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        link_to: linkTo
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      if (!currentEmployee) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de trouver vos informations d'employé",
          variant: "destructive"
        });
        return;
      }

      const newProject = await Project.create({
        ...projectData,
        created_by: currentEmployee.id
      });

      // Notifications pour les membres de l'équipe
      if (projectData.team_members && projectData.team_members.length > 0) {
        const allUsers = await User.list();
        
        for (const memberId of projectData.team_members) {
          const member = employees.find(emp => emp.id === memberId);
          if (member && member.id !== currentEmployee.id) {
            const memberUser = allUsers.find(u => u.email === member.email);
            if (memberUser) {
              await sendNotification(
                memberUser.id,
                "🎯 Nouveau projet assigné",
                `Vous avez été ajouté au projet "${projectData.name}"`,
                "project_assignment",
                `/ProjectManagement?project=${newProject.id}`
              );
            }
          }
        }
      }

      toast({
        title: "✅ Projet créé",
        description: `Le projet "${projectData.name}" a été créé avec succès`,
      });

      setShowCreateProject(false);
      loadData();
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProject = async (projectId, projectData) => {
    try {
      await Project.update(projectId, projectData);

      // Notification aux membres de l'équipe sur les changements
      const project = projects.find(p => p.id === projectId);
      if (project && project.team_members) {
        const allUsers = await User.list();
        
        for (const memberId of project.team_members) {
          const member = employees.find(emp => emp.id === memberId);
          if (member && member.id !== currentEmployee.id) {
            const memberUser = allUsers.find(u => u.email === member.email);
            if (memberUser) {
              await sendNotification(
                memberUser.id,
                "📝 Projet mis à jour",
                `Le projet "${project.name}" a été modifié`,
                "project_update",
                `/ProjectManagement?project=${projectId}`
              );
            }
          }
        }
      }

      toast({
        title: "✅ Projet mis à jour",
        description: "Le projet a été modifié avec succès",
      });

      setShowEditProject(false);
      setSelectedProject(null);
      loadData();
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le projet",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      
      // Supprimer toutes les tâches associées
      const projectTasks = tasks.filter(t => t.project_id === projectId);
      for (const task of projectTasks) {
        await Task.delete(task.id);
      }

      await Project.delete(projectId);

      // Notification aux membres de l'équipe
      if (project && project.team_members) {
        const allUsers = await User.list();
        
        for (const memberId of project.team_members) {
          const member = employees.find(emp => emp.id === memberId);
          if (member && member.id !== currentEmployee.id) {
            const memberUser = allUsers.find(u => u.email === member.email);
            if (memberUser) {
              await sendNotification(
                memberUser.id,
                "🗑️ Projet supprimé",
                `Le projet "${project.name}" a été supprimé`,
                "project_deleted"
              );
            }
          }
        }
      }

      toast({
        title: "✅ Projet supprimé",
        description: "Le projet et toutes ses tâches ont été supprimés",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer le projet",
        variant: "destructive"
      });
    }
  };

  const handleArchiveProject = async (projectId) => {
    try {
      await Project.update(projectId, { is_active: false, status: 'completed' });
      
      const project = projects.find(p => p.id === projectId);
      
      // Notification aux membres de l'équipe
      if (project && project.team_members) {
        const allUsers = await User.list();
        
        for (const memberId of project.team_members) {
          const member = employees.find(emp => emp.id === memberId);
          if (member) {
            const memberUser = allUsers.find(u => u.email === member.email);
            if (memberUser) {
              await sendNotification(
                memberUser.id,
                "🎉 Projet terminé",
                `Le projet "${project.name}" a été marqué comme terminé ! Félicitations !`,
                "project_completed"
              );
            }
          }
        }
      }

      toast({
        title: "🎉 Projet archivé",
        description: "Le projet a été marqué comme terminé",
      });

      loadData();
    } catch (error) {
      console.error("Error archiving project:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'archiver le projet",
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      if (!currentEmployee) {
        toast({
          title: "❌ Erreur",
          description: "Impossible de trouver vos informations d'employé",
          variant: "destructive"
        });
        return;
      }

      const newTask = await Task.create({
        ...taskData,
        assigned_by: currentEmployee.id
      });

      // Notification pour l'employé assigné
      if (taskData.assigned_to && taskData.assigned_to !== currentEmployee.id) {
        const assignedEmployee = employees.find(emp => emp.id === taskData.assigned_to);
        if (assignedEmployee) {
          const allUsers = await User.list();
          const assignedUser = allUsers.find(u => u.email === assignedEmployee.email);
          
          if (assignedUser) {
            await sendNotification(
              assignedUser.id,
              "🎯 Nouvelle tâche assignée",
              `Vous avez été assigné à la tâche "${taskData.title}"`,
              "task_assignment",
              `/ProjectManagement?task=${newTask.id}`
            );
          }
        }
      }

      toast({
        title: "✅ Tâche créée",
        description: `La tâche "${taskData.title}" a été créée et assignée`,
      });

      setShowCreateTask(false);
      loadData();
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer la tâche",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const originalTask = tasks.find(t => t.id === taskId);
      await Task.update(taskId, taskData);

      // Notification si l'assignation a changé
      if (originalTask && taskData.assigned_to !== originalTask.assigned_to) {
        const newAssignee = employees.find(emp => emp.id === taskData.assigned_to);
        if (newAssignee) {
          const allUsers = await User.list();
          const assignedUser = allUsers.find(u => u.email === newAssignee.email);
          
          if (assignedUser) {
            await sendNotification(
              assignedUser.id,
              "🔄 Tâche réassignée",
              `La tâche "${taskData.title}" vous a été assignée`,
              "task_reassignment",
              `/ProjectManagement?task=${taskId}`
            );
          }
        }
      }

      toast({
        title: "✅ Tâche mise à jour",
        description: "La tâche a été modifiée avec succès",
      });

      setShowEditTask(false);
      setSelectedTask(null);
      loadData();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour la tâche",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await Task.delete(taskId);

      // Notification à l'assigné
      if (task && task.assigned_to && task.assigned_to !== currentEmployee.id) {
        const assignedEmployee = employees.find(emp => emp.id === task.assigned_to);
        if (assignedEmployee) {
          const allUsers = await User.list();
          const assignedUser = allUsers.find(u => u.email === assignedEmployee.email);
          
          if (assignedUser) {
            await sendNotification(
              assignedUser.id,
              "🗑️ Tâche supprimée",
              `La tâche "${task.title}" a été supprimée`,
              "task_deleted"
            );
          }
        }
      }

      toast({
        title: "✅ Tâche supprimée",
        description: "La tâche a été supprimée avec succès",
      });

      loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive"
      });
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updateData = { 
        status: newStatus,
        ...(newStatus === 'completed' && { completion_date: new Date().toISOString() })
      };

      await Task.update(taskId, updateData);

      // Notification pour changement de statut important
      if (task && task.assigned_by !== currentEmployee?.id) {
        const assignerEmployee = employees.find(emp => emp.id === task.assigned_by);
        if (assignerEmployee) {
          const allUsers = await User.list();
          const assignerUser = allUsers.find(u => u.email === assignerEmployee.email);
          
          if (assignerUser) {
            let title = "📋 Statut de tâche mis à jour";
            let message = `La tâche "${task.title}" est maintenant "${getStatusLabel(newStatus)}"`;
            
            if (newStatus === 'completed') {
              title = "🎉 Tâche terminée";
              message = `La tâche "${task.title}" a été terminée avec succès !`;
            } else if (newStatus === 'in_progress') {
              title = "🚀 Tâche en cours";
              message = `Le travail sur la tâche "${task.title}" a commencé`;
            }

            await sendNotification(
              assignerUser.id,
              title,
              message,
              "task_update",
              `/ProjectManagement?task=${taskId}`
            );
          }
        }
      }

      // Auto-complétion de projet si toutes les tâches sont terminées
      if (newStatus === 'completed') {
        checkProjectCompletion(task.project_id);
      }

      loadData();
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  // Vérifier si un projet peut être marqué comme terminé
  const checkProjectCompletion = async (projectId) => {
    try {
      const projectTasks = tasks.filter(t => t.project_id === projectId);
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      
      if (projectTasks.length > 0 && completedTasks.length === projectTasks.length) {
        const project = projects.find(p => p.id === projectId);
        if (project && project.status !== 'completed') {
          await Project.update(projectId, { 
            status: 'completed', 
            progress: 100 
          });

          // Notification aux membres de l'équipe
          if (project.team_members) {
            const allUsers = await User.list();
            
            for (const memberId of project.team_members) {
              const member = employees.find(emp => emp.id === memberId);
              if (member) {
                const memberUser = allUsers.find(u => u.email === member.email);
                if (memberUser) {
                  await sendNotification(
                    memberUser.id,
                    "🏆 Projet terminé automatiquement",
                    `Le projet "${project.name}" a été automatiquement marqué comme terminé car toutes les tâches sont finies !`,
                    "project_auto_completed"
                  );
                }
              }
            }
          }

          toast({
            title: "🏆 Projet terminé !",
            description: `Le projet "${project.name}" a été automatiquement marqué comme terminé`,
          });
        }
      }
    } catch (error) {
      console.error("Error checking project completion:", error);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      todo: "À faire",
      in_progress: "En cours",
      review: "En révision",
      completed: "Terminé",
      cancelled: "Annulé"
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 border-green-200 text-green-800",
      medium: "bg-yellow-100 border-yellow-200 text-yellow-800",
      high: "bg-orange-100 border-orange-200 text-orange-800",
      urgent: "bg-red-100 border-red-200 text-red-800"
    };
    return colors[priority] || "bg-gray-100 border-gray-200 text-gray-800";
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Non assigné';
  };

  // Calcul des statistiques intelligentes
  const getIntelligentStats = () => {
    const myTasks = isAdmin ? tasks : tasks.filter(task => task.assigned_to === currentEmployee?.id);
    const myProjects = isAdmin ? projects : projects.filter(project => 
      project.created_by === currentEmployee?.id || 
      (project.team_members && project.team_members.includes(currentEmployee?.id))
    );
    
    const overdueTasks = myTasks.filter(task => 
      task.due_date && isAfter(new Date(), parseISO(task.due_date)) && task.status !== 'completed'
    );

    const urgentTasks = myTasks.filter(task => task.priority === 'urgent' && task.status !== 'completed');
    
    const completedThisWeek = myTasks.filter(task => 
      task.completion_date && 
      differenceInDays(new Date(), parseISO(task.completion_date)) <= 7
    );

    const activeProjects = myProjects.filter(p => p.status === 'active');
    
    return {
      totalProjects: myProjects.length,
      activeProjects: activeProjects.length,
      myTasks: myTasks.length,
      completedTasks: myTasks.filter(task => task.status === 'completed').length,
      overdueTasks: overdueTasks.length,
      urgentTasks: urgentTasks.length,
      completedThisWeek: completedThisWeek.length,
      completionRate: myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'completed').length / myTasks.length) * 100) : 0
    };
  };

  // Filtrer les tâches avec logique intelligente
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filtrage par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filtrage par priorité
    if (filterPriority !== "all") {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Filtrage par assigné
    if (filterAssignee !== "all") {
      filtered = filtered.filter(task => task.assigned_to === filterAssignee);
    }

    // Recherche textuelle
    if (searchTerm !== "") {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Pour les employés non-admin, ne montrer que leurs tâches ou celles de leur équipe
    if (!isAdmin && currentEmployee) {
      filtered = filtered.filter(task => 
        task.assigned_to === currentEmployee.id || 
        task.assigned_by === currentEmployee.id ||
        // Tâches des projets dont ils font partie
        projects.some(p => 
          p.id === task.project_id && 
          p.team_members && 
          p.team_members.includes(currentEmployee.id)
        )
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Organiser les tâches par statut pour Kanban
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  // Drag and Drop handler
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    handleTaskStatusChange(draggableId, newStatus);
  };

  const stats = getIntelligentStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Chargement des projets...</p>
            <p className="text-gray-600">Préparation de votre espace collaboratif</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête moderne amélioré */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Gestion de Projets Collaborative
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    {isAdmin 
                      ? "Supervision de tous les projets et tâches de l'équipe"
                      : "Collaborez efficacement sur vos projets et tâches"
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Système opérationnel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Mis à jour: {format(new Date(), "HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{employees.length} collaborateurs</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => setShowCreateProject(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <FolderPlus className="w-5 h-5 mr-2" />
                Nouveau Projet
              </Button>
              <Button
                onClick={() => setShowCreateTask(true)}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Tâche
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques intelligentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Projets Actifs",
              value: stats.activeProjects,
              total: stats.totalProjects,
              icon: FolderPlus,
              gradient: "from-blue-500 to-indigo-600",
              bgGradient: "from-blue-50 to-indigo-100",
              change: `${stats.totalProjects} total`
            },
            {
              title: "Mes Tâches",
              value: stats.myTasks - stats.completedTasks,
              total: stats.myTasks,
              icon: Target,
              gradient: "from-emerald-500 to-green-600",
              bgGradient: "from-emerald-50 to-green-100",
              change: `${stats.completionRate}% taux`
            },
            {
              title: "Terminées",
              value: stats.completedTasks,
              total: stats.myTasks,
              icon: CheckCircle,
              gradient: "from-purple-500 to-violet-600",
              bgGradient: "from-purple-50 to-violet-100",
              change: `+${stats.completedThisWeek} cette semaine`
            },
            {
              title: "Urgentes",
              value: stats.urgentTasks + stats.overdueTasks,
              total: stats.myTasks,
              icon: AlertCircle,
              gradient: "from-red-500 to-rose-600",
              bgGradient: "from-red-50 to-rose-100",
              change: stats.overdueTasks > 0 ? `${stats.overdueTasks} en retard` : "À jour !"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="relative overflow-hidden"
            >
              <Card className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      {stat.total && (
                        <div className="text-sm text-gray-500">
                          sur {stat.total}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{stat.title}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Alertes intelligentes */}
        {(stats.overdueTasks > 0 || stats.urgentTasks > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  Attention requise
                </h3>
                <p className="text-red-700">
                  {stats.overdueTasks > 0 && `${stats.overdueTasks} tâche(s) en retard`}
                  {stats.overdueTasks > 0 && stats.urgentTasks > 0 && " • "}
                  {stats.urgentTasks > 0 && `${stats.urgentTasks} tâche(s) urgente(s)`}
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("tasks")}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Voir les tâches
              </Button>
            </div>
          </motion.div>
        )}

        {/* Onglets avec design moderne amélioré */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Header des onglets avec design ultra-moderne */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl p-6 shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  {/* Tabs Navigation avec style moderne */}
                  <div className="relative">
                    <TabsList className="grid grid-cols-3 bg-gradient-to-r from-slate-100 to-gray-100 p-2 rounded-2xl border border-gray-200/50 shadow-lg backdrop-blur-sm">
                      <TabsTrigger 
                        value="overview" 
                        className="relative rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 hover:bg-white/60"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          <span className="hidden sm:inline">Vue d'ensemble</span>
                          <span className="sm:hidden">Vue</span>
                        </div>
                        <Badge className="ml-2 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {projects.length + filteredTasks.length}
                        </Badge>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="projects" 
                        className="relative rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 hover:bg-white/60"
                      >
                        <div className="flex items-center gap-2">
                          <FolderPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">Projets</span>
                          <span className="sm:hidden">Proj.</span>
                        </div>
                        <Badge className="ml-2 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                          {projects.length}
                        </Badge>
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="tasks" 
                        className="relative rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 hover:bg-white/60"
                      >
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span className="hidden sm:inline">Tâches</span>
                          <span className="sm:hidden">Tasks</span>
                        </div>
                        <Badge className="ml-2 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          {filteredTasks.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Actions rapides contextuelles */}
                  <div className="flex items-center gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2"
                    >
                      {activeTab === "overview" && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/70 px-4 py-2 rounded-xl border border-gray-200/50">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">Activité récente</span>
                        </div>
                      )}
                      
                      {activeTab === "projects" && (
                        <Button
                          onClick={() => setShowCreateProject(true)}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Nouveau Projet</span>
                          <span className="sm:hidden">Nouveau</span>
                        </Button>
                      )}
                      
                      {activeTab === "tasks" && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setShowCreateTask(true)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">Nouvelle Tâche</span>
                            <span className="sm:hidden">Nouvelle</span>
                          </Button>
                          
                          {/* Mode toggle pour tasks */}
                          <div className="flex items-center bg-white/70 rounded-xl border border-gray-200/50 p-1">
                            <Button
                              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setViewMode('kanban')}
                              className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                                viewMode === 'kanban' 
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                              }`}
                            >
                              <Kanban className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline text-xs">Kanban</span>
                            </Button>
                            <Button
                              variant={viewMode === 'list' ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => setViewMode('list')}
                              className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                                viewMode === 'list' 
                                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                              }`}
                            >
                              <List className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline text-xs">Liste</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Indicateur de performance en temps réel */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-3 text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-2 rounded-xl border border-gray-200/50"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <span>{format(new Date(), "HH:mm")}</span>
                    </motion.div>
                  </div>
                </div>

                {/* Breadcrumb contextuel */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 pt-4 border-t border-gray-200/50"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">
                        {isAdmin ? "Administration" : "Mon Espace"}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-800 font-semibold">
                        {activeTab === "overview" && "Vue d'ensemble"}
                        {activeTab === "projects" && "Gestion des Projets"}
                        {activeTab === "tasks" && `Tâches (${viewMode === 'kanban' ? 'Kanban' : 'Liste'})`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {activeTab === "overview" && (
                        <span>
                          {projects.length} projet{projects.length > 1 ? 's' : ''} • {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {activeTab === "projects" && (
                        <span>
                          {projects.filter(p => p.status === 'active').length} actif{projects.filter(p => p.status === 'active').length > 1 ? 's' : ''} • {projects.filter(p => p.status === 'completed').length} terminé{projects.filter(p => p.status === 'completed').length > 1 ? 's' : ''}
                        </span>
                      )}
                      {activeTab === "tasks" && (
                        <span>
                          {filteredTasks.filter(t => t.status === 'completed').length}/{filteredTasks.length} terminée{filteredTasks.filter(t => t.status === 'completed').length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            <TabsContent value="overview" className="space-y-8">
              {/* Projets récents */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Projets Récents
                  </h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {projects.length} projet{projects.length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {projects.slice(0, 6).map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                      >
                        <ProjectCard
                          project={project}
                          employees={employees}
                          onEdit={(proj) => {
                            setSelectedProject(proj);
                            setShowEditProject(true);
                          }}
                          onDelete={handleDeleteProject}
                          onArchive={handleArchiveProject}
                          onView={(proj) => {
                            setSelectedProject(proj);
                            setShowProjectDetails(true);
                          }}
                          canEdit={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tâches prioritaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-red-500" />
                    Tâches Prioritaires
                  </h3>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {filteredTasks.filter(task => task.priority === 'urgent' || task.priority === 'high').length} urgente{filteredTasks.filter(task => task.priority === 'urgent' || task.priority === 'high').length > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {filteredTasks
                      .filter(task => task.priority === 'urgent' || task.priority === 'high')
                      .slice(0, 6)
                      .map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                          <TaskCard
                            task={task}
                            project={projects.find(p => p.id === task.project_id)}
                            assigneeName={getEmployeeName(task.assigned_to)}
                            onStatusChange={handleTaskStatusChange}
                            onEdit={(tsk) => {
                              setSelectedTask(tsk);
                              setShowEditTask(true);
                            }}
                            onDelete={handleDeleteTask}
                            isAdmin={isAdmin}
                            canEdit={!isAdmin}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                    >
                      <ProjectCard
                        project={project}
                        employees={employees}
                        onEdit={(proj) => {
                          setSelectedProject(proj);
                          setShowEditProject(true);
                        }}
                        onDelete={handleDeleteProject}
                        onArchive={handleArchiveProject}
                        onView={(proj) => {
                          setSelectedProject(proj);
                          setShowProjectDetails(true);
                        }}
                        canEdit={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              {/* Filtres et recherche améliorés */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher des tâches..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-gray-300"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="review">En révision</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes priorités</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>

                  {isAdmin && (
                    <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                      <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm">
                        <SelectValue placeholder="Assigné à" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les assignés</SelectItem>
                        {employees.map(employee => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </motion.div>

              {/* Vue Kanban améliorée */}
              {viewMode === 'kanban' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {Object.entries(tasksByStatus).map(([status, statusTasks], columnIndex) => (
                        <motion.div 
                          key={status} 
                          className="space-y-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 * columnIndex }}
                        >
                          <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                status === 'todo' ? 'bg-gray-400' :
                                status === 'in_progress' ? 'bg-blue-500' :
                                status === 'review' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                              {getStatusLabel(status)}
                            </h3>
                            <Badge className={getStatusColor(status)}>
                              {statusTasks.length}
                            </Badge>
                          </div>
                          
                          <Droppable droppableId={status}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`min-h-[400px] p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                                  snapshot.isDraggingOver 
                                    ? 'border-blue-400 bg-blue-50/80 backdrop-blur-sm' 
                                    : 'border-gray-200 bg-gray-50/50'
                                }`}
                              >
                                <AnimatePresence>
                                  {statusTasks.map((task, index) => (
                                    <Draggable
                                      key={task.id}
                                      draggableId={task.id}
                                      index={index}
                                      isDragDisabled={isAdmin}
                                    >
                                      {(provided, snapshot) => (
                                        <motion.div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`mb-4 transition-all duration-200 ${
                                            snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : ''
                                          }`}
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -20 }}
                                          transition={{ duration: 0.3 }}
                                        >
                                          <TaskCard
                                            task={task}
                                            project={projects.find(p => p.id === task.project_id)}
                                            assigneeName={getEmployeeName(task.assigned_to)}
                                            onStatusChange={handleTaskStatusChange}
                                            onEdit={(tsk) => {
                                              setSelectedTask(tsk);
                                              setShowEditTask(true);
                                            }}
                                            onDelete={handleDeleteTask}
                                            isAdmin={isAdmin}
                                            canEdit={!isAdmin}
                                          />
                                        </motion.div>
                                      )}
                                    </Draggable>
                                  ))}
                                </AnimatePresence>
                                {provided.placeholder}
                                
                                {statusTasks.length === 0 && (
                                  <div className="text-center py-12 text-gray-400">
                                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">Aucune tâche</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </motion.div>
                      ))}
                    </div>
                  </DragDropContext>
                </motion.div>
              )}

              {/* Vue Liste améliorée */}
              {viewMode === 'list' && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <AnimatePresence>
                    {filteredTasks.map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                      >
                        <TaskCard
                          task={task}
                          project={projects.find(p => p.id === task.project_id)}
                          assigneeName={getEmployeeName(task.assigned_to)}
                          onStatusChange={handleTaskStatusChange}
                          onEdit={(tsk) => {
                            setSelectedTask(tsk);
                            setShowEditTask(true);
                          }}
                          onDelete={handleDeleteTask}
                          isAdmin={isAdmin}
                          canEdit={!isAdmin}
                          listView={true}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredTasks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune tâche trouvée</h3>
                      <p className="text-gray-500">Essayez de modifier vos filtres ou créez une nouvelle tâche</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Modals intelligents */}
        <CreateProjectModal
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onSubmit={handleCreateProject}
          employees={employees}
        />

        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onSubmit={handleCreateTask}
          projects={projects}
          employees={employees}
          currentEmployeeId={currentEmployee?.id}
        />

        <EditProjectModal
          isOpen={showEditProject}
          onClose={() => {
            setShowEditProject(false);
            setSelectedProject(null);
          }}
          onSubmit={(data) => handleUpdateProject(selectedProject?.id, data)}
          project={selectedProject}
          employees={employees}
        />

        <EditTaskModal
          isOpen={showEditTask}
          onClose={() => {
            setShowEditTask(false);
            setSelectedTask(null);
          }}
          onSubmit={(data) => handleUpdateTask(selectedTask?.id, data)}
          task={selectedTask}
          projects={projects}
          employees={employees}
        />

        <ProjectDetailsModal
          isOpen={showProjectDetails}
          onClose={() => {
            setShowProjectDetails(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          tasks={tasks.filter(t => t.project_id === selectedProject?.id)}
          employees={employees}
        />
      </div>
    </div>
  );
}
