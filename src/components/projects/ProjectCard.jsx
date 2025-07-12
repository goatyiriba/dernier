
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Calendar,
  Users,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Eye
} from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

export default function ProjectCard({ project, employees, onEdit, onDelete, onArchive, onView, canEdit = true }) {
  const getStatusConfig = (status) => {
    const configs = {
      planning: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: Clock,
        label: "Planification"
      },
      active: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: Play,
        label: "Actif"
      },
      on_hold: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: Pause,
        label: "En pause"
      },
      completed: { 
        color: "bg-purple-100 text-purple-800 border-purple-200", 
        icon: CheckCircle,
        label: "Terminé"
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: AlertCircle,
        label: "Annulé"
      }
    };
    return configs[status] || configs.planning;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: "bg-green-100 text-green-800", label: "Faible" },
      medium: { color: "bg-yellow-100 text-yellow-800", label: "Moyenne" },
      high: { color: "bg-orange-100 text-orange-800", label: "Haute" },
      urgent: { color: "bg-red-100 text-red-800", label: "Urgente" }
    };
    return configs[priority] || configs.medium;
  };

  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);
  const StatusIcon = statusConfig.icon;

  // Calculer les membres de l'équipe
  const teamMembers = project.team_members 
    ? employees.filter(emp => project.team_members.includes(emp.id))
    : [];

  // Calculer si le projet est en retard
  const isOverdue = project.end_date && 
    isAfter(new Date(), parseISO(project.end_date)) && 
    project.status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Barre de couleur du projet */}
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: project.color || '#3B82F6' }}
        />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {project.name}
              </CardTitle>
              {project.description && (
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={`${statusConfig.color} text-xs`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              
              {/* Menu d'actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(project)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Voir détails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {project.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onArchive?.(project.id)}>
                      <Archive className="w-4 h-4 mr-2" />
                      Marquer terminé
                    </DropdownMenuItem>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-red-500">Supprimer</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Le projet "{project.name}" et toutes ses tâches seront définitivement supprimés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete?.(project.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <Badge className={`${priorityConfig.color} text-xs w-fit`}>
            {priorityConfig.label}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Progression</span>
              <span className="text-gray-600">{project.progress || 0}%</span>
            </div>
            <Progress 
              value={project.progress || 0} 
              className="h-2"
            />
          </div>

          {/* Équipe */}
          {teamMembers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Équipe</span>
                <Badge variant="outline" className="text-xs">
                  {teamMembers.length} membre{teamMembers.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 4).map((member) => (
                  <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {member.first_name[0]}{member.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{teamMembers.length - 4}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            {project.start_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Début: {format(parseISO(project.start_date), 'dd/MM/yyyy', { locale: fr })}</span>
              </div>
            )}
            {project.end_date && (
              <div className={`flex items-center gap-2 text-sm ${
                isOverdue ? 'text-red-600' : 'text-gray-600'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>Fin: {format(parseISO(project.end_date), 'dd/MM/yyyy', { locale: fr })}</span>
                {isOverdue && <Badge className="bg-red-100 text-red-800 text-xs ml-1">En retard</Badge>}
              </div>
            )}
          </div>

          {/* Budget */}
          {project.budget && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4" />
              <span>Budget: {project.budget.toLocaleString('fr-FR')} €</span>
            </div>
          )}

          {/* Statistiques rapides */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {project.progress || 0}%
                </div>
                <div className="text-xs text-gray-500">Terminé</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {teamMembers.length}
                </div>
                <div className="text-xs text-gray-500">Membres</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  project.end_date && !isOverdue ? 'text-green-600' : 
                  isOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {project.end_date ? 
                    Math.max(0, Math.ceil((parseISO(project.end_date) - new Date()) / (1000 * 60 * 60 * 24))) :
                    '∞'
                  }
                </div>
                <div className="text-xs text-gray-500">Jours restants</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
