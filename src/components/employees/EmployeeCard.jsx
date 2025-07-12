
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  Trash2,
  MoreVertical,
  Edit,
  Eye,
  Calendar,
  MapPin,
  Activity,
  Clock,
  Briefcase,
  Users,
  UserX,
  Power,
  PowerOff
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AvatarGenerator, { EmployeeAvatar } from '../ui/AvatarGenerator';

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-700 border-slate-200",
  "On Leave": "bg-amber-100 text-amber-700 border-amber-200",
  Terminated: "bg-red-100 text-red-700 border-red-200"
};

const departmentColors = {
  Engineering: "from-blue-500 to-indigo-600",
  Marketing: "from-pink-500 to-rose-500", 
  Sales: "from-green-500 to-emerald-600",
  HR: "from-purple-500 to-violet-600",
  Finance: "from-yellow-500 to-orange-500",
  Operations: "from-gray-500 to-slate-600",
  Design: "from-indigo-500 to-purple-600",
  Legal: "from-slate-600 to-gray-700"
};

export default function EmployeeCard({ employee, onView, onEdit, onDelete, onToggleStatus }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(employee.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting employee:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
      await onToggleStatus(employee.id, newStatus);
      setShowDeactivateDialog(false);
    } catch (error) {
      console.error("Error updating employee status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Calculate tenure
  const tenureDays = employee.start_date ? differenceInDays(new Date(), new Date(employee.start_date)) : 0;
  const tenureYears = Math.floor(tenureDays / 365);
  const tenureMonths = Math.floor((tenureDays % 365) / 30);

  // Get department gradient
  const departmentGradient = departmentColors[employee.department] || "from-gray-400 to-gray-600";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="h-full"
      >
        <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-500 h-full">
          {/* Status indicator bar - plus fin et élégant */}
          <div className={`absolute top-0 left-0 right-0 h-0.5 ${
            employee.status === 'Active' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
            employee.status === 'On Leave' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
            'bg-gradient-to-r from-slate-300 to-gray-400'
          }`} />

          {/* Gradient subtil d'arrière-plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-slate-50/30 opacity-60" />

          <CardContent className="relative p-6 flex flex-col h-full justify-between">
            {/* Header Section - Plus compact et élégant */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* CORRECTION: Utilisation du nouveau système d'avatar */}
                  <div className="relative">
                    <EmployeeAvatar 
                      employee={employee}
                      size="lg"
                      showStatus={true}
                    />
                  </div>
                  
                  {/* Info principale plus lisible */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-slate-900 truncate leading-tight group-hover:text-blue-700 transition-colors">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-slate-600 font-medium text-sm truncate">{employee.position}</p>
                    
                    {/* Badges plus compacts */}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs px-2 py-1 font-medium rounded-lg ${statusColors[employee.status] || statusColors.Inactive}`}>
                        {employee.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs px-2 py-1 rounded-lg border-slate-200 text-slate-600">
                        {employee.department}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Menu actions plus discret */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => onView(employee)} className="p-3">
                      <Eye className="w-4 h-4 mr-3" />
                      Voir Détails
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(employee)} className="p-3">
                      <Edit className="w-4 h-4 mr-3" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeactivateDialog(true)}
                      className="text-amber-600 focus:text-amber-600 focus:bg-amber-50 p-3"
                    >
                      {employee.status === 'Active' ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-3" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-3" />
                          Activer
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 p-3"
                    >
                      <Trash2 className="w-4 h-4 mr-3" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Informations clés - Design plus épuré */}
            <div className="space-y-3 flex-1 py-4">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors group/item">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={`mailto:${employee.email}`} 
                     className="text-sm text-slate-700 hover:text-blue-600 transition-colors truncate block font-medium group-hover/item:text-blue-600">
                    {employee.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              {employee.phone && (
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors group/item">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <a href={`tel:${employee.phone}`} 
                       className="text-sm text-slate-700 hover:text-green-600 transition-colors font-medium group-hover/item:text-green-600">
                      {employee.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Ancienneté */}
              {employee.start_date && (
                <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">Ancienneté</p>
                    <p className="text-sm text-slate-700 font-semibold">
                      {tenureYears > 0 ? `${tenureYears} an${tenureYears > 1 ? 's' : ''}` : `${tenureMonths} mois`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - Plus modernes */}
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <Button 
                onClick={() => onView(employee)}
                variant="outline"
                size="sm"
                className="flex-1 bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 rounded-lg h-9 text-sm font-medium transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                Voir
              </Button>
              <Button 
                onClick={() => onEdit(employee)}
                variant="outline"
                size="sm"
                className="flex-1 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 rounded-lg h-9 text-sm font-medium transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Supprimer l'Employé
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement <strong>{employee.first_name} {employee.last_name}</strong> ? 
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate/Activate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              {employee.status === 'Active' ? (
                <>
                  <PowerOff className="w-5 h-5" />
                  Désactiver l'Employé
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  Activer l'Employé
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {employee.status === 'Active' ? (
                <>
                  Êtes-vous sûr de vouloir désactiver <strong>{employee.first_name} {employee.last_name}</strong> ? 
                  L'employé ne pourra plus accéder au système mais ses données seront conservées.
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir réactiver <strong>{employee.first_name} {employee.last_name}</strong> ? 
                  L'employé retrouvera l'accès au système.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isUpdatingStatus}
              className={employee.status === 'Active' ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}
            >
              {isUpdatingStatus ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Mise à jour...
                </>
              ) : employee.status === 'Active' ? (
                <>
                  <PowerOff className="w-4 h-4 mr-2" />
                  Désactiver
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Activer
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
