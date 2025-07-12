import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  Clock,
  Flag,
  User,
  FolderOpen,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  X,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

export default function TaskCard({ 
  task, 
  project, 
  assigneeName, 
  onStatusChange, 
  onEdit,
  onDelete,
  isAdmin,
  canEdit = true,
  listView = false 
}) {
  const getStatusConfig = (status) => {
    const configs = {
      todo: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: Clock,
        label: "À faire"
      },
      in_progress: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: Play,
        label: "En cours"
      },
      review: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: Pause,
        label: "En révision"
      },
      completed: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: CheckCircle,
        label: "Terminé"
      },
      cancelled: { 
        color: "bg-red-100 text-red-800 border-red-200", 
        icon: X,
        label: "Annulé"
      }
    };
    return configs[status] || configs.todo;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: "bg-green-100 text-green-800 border-green-200", label: "Faible" },
      medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Moyenne" },
      high: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Haute" },
      urgent: { color: "bg-red-100 text-red-800 border-red-200", label: "Urgente" }
    };
    return configs[priority] || configs.medium;
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const StatusIcon = statusConfig.icon;

  const isOverdue = task.due_date && isAfter(new Date(), parseISO(task.due_date)) && task.status !== 'completed';
  const isDueSoon = task.due_date && differenceInDays(parseISO(task.due_date), new Date()) <= 3 && task.status !== 'completed';

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getStatusAction = (currentStatus) => {
    const actions = {
      todo: { label: "Commencer", icon: Play },
      in_progress: { label: "En révision", icon: Pause },
      review: { label: "Terminer", icon: CheckCircle }
    };
    return actions[currentStatus];
  };

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: project?.color || '#3B82F6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        <span>{project?.name || 'Projet supprimé'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{assigneeName}</span>
                      </div>
                      {task.due_date && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          <span>{format(parseISO(task.due_date), 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <Badge className={`${priorityConfig.color} text-xs`}>
                  <Flag className="w-3 h-3 mr-1" />
                  {priorityConfig.label}
                </Badge>
                
                <Badge className={`${statusConfig.color} text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>

                {/* Menu d'actions pour liste */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!isAdmin && task.status !== 'completed' && task.status !== 'cancelled' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(task.id, getNextStatus(task.status))}>
                        {getStatusAction(task.status)?.label}
                      </DropdownMenuItem>
                    )}
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={() => onEdit?.(task)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                              <span className="text-red-500">Supprimer</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la tâche ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La tâche "{task.title}" sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete?.(task.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div 
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: project?.color || '#3B82F6' }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                  {task.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FolderOpen className="w-3 h-3" />
                  <span className="truncate">{project?.name || 'Projet supprimé'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Badge className={`${priorityConfig.color} text-xs flex-shrink-0`}>
                <Flag className="w-3 h-3" />
              </Badge>
              
              {/* Menu d'actions pour Kanban */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEdit && (
                    <>
                      <DropdownMenuItem onClick={() => onEdit?.(task)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                            <span className="text-red-500">Supprimer</span>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la tâche ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La tâche "{task.title}" sera définitivement supprimée.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete?.(task.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-3">
              {task.description}
            </p>
          )}

          {/* Assigné à */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {assigneeName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 truncate">{assigneeName}</span>
          </div>

          {/* Date d'échéance */}
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{format(parseISO(task.due_date), 'dd/MM', { locale: fr })}</span>
              {isOverdue && <Badge className="bg-red-100 text-red-800 text-xs ml-1">Retard</Badge>}
              {isDueSoon && !isOverdue && <Badge className="bg-orange-100 text-orange-800 text-xs ml-1">Urgent</Badge>}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Statut et Action */}
          <div className="flex items-center justify-between pt-2">
            <Badge className={`${statusConfig.color} text-xs`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>

            {!isAdmin && task.status !== 'completed' && task.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStatusChange?.(task.id, getNextStatus(task.status))}
                className="h-6 text-xs px-2 hover:bg-blue-50"
              >
                {getStatusAction(task.status)?.label}
              </Button>
            )}
          </div>

          {/* Barre de progression pour les tâches en cours */}
          {task.status === 'in_progress' && task.estimated_hours && task.actual_hours && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progression</span>
                <span>{Math.round((task.actual_hours / task.estimated_hours) * 100)}%</span>
              </div>
              <Progress 
                value={(task.actual_hours / task.estimated_hours) * 100} 
                className="h-1"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}