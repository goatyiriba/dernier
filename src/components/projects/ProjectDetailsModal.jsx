import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Flag,
  DollarSign
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export default function ProjectDetailsModal({ isOpen, onClose, project, tasks, employees }) {
  if (!project) return null;

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

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;

  // Calculer les membres de l'équipe
  const teamMembers = project.team_members 
    ? employees.filter(emp => project.team_members.includes(emp.id))
    : [];

  // Statistiques des tâches
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: project.color || '#3B82F6' }}
            >
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  Priorité {project.priority}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          {project.description && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{project.description}</p>
            </div>
          )}

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Progression */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Progression</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Projet</span>
                  <span className="font-semibold">{project.progress || 0}%</span>
                </div>
                <Progress 
                  value={project.progress || 0} 
                  className="h-3"
                  style={{ '--progress-background': project.color || '#3B82F6' }}
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tâches</span>
                  <span className="font-semibold">{taskCompletionRate}%</span>
                </div>
                <Progress 
                  value={taskCompletionRate} 
                  className="h-3"
                />
              </div>
            </div>

            {/* Dates et Budget */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informations</h3>
              <div className="space-y-3">
                {project.start_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Début:</span>
                    <span className="font-medium">{format(parseISO(project.start_date), 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                )}
                {project.end_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-gray-600">Fin:</span>
                    <span className="font-medium">{format(parseISO(project.end_date), 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">{project.budget.toLocaleString('fr-FR')} €</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Équipe */}
          {teamMembers.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Équipe ({teamMembers.length} membres)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {member.first_name[0]}{member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{member.department}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques des tâches */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Tâches ({totalTasks})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{todoTasks}</div>
                <div className="text-sm text-gray-500">À faire</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{inProgressTasks}</div>
                <div className="text-sm text-blue-600">En cours</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-green-600">Terminées</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{taskCompletionRate}%</div>
                <div className="text-sm text-purple-600">Progression</div>
              </div>
            </div>
          </div>

          {/* Liste des tâches récentes */}
          {tasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Tâches récentes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.slice(0, 10).map((task) => {
                  const assignee = employees.find(emp => emp.id === task.assigned_to);
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600">
                          Assigné à: {assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Non assigné'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? 'Terminé' :
                           task.status === 'in_progress' ? 'En cours' :
                           task.status === 'review' ? 'En révision' :
                           'À faire'}
                        </Badge>
                        <Badge className={`text-xs ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}