import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User,
  Gift,
  Heart,
  Briefcase,
  GraduationCap,
  PartyPopper,
  Plane,
  AlertCircle,
  Bell,
  Repeat
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const eventTypeIcons = {
  birthday: Gift,
  anniversary: Heart,
  meeting: Briefcase,
  training: GraduationCap,
  celebration: PartyPopper,
  holiday: Plane,
  deadline: AlertCircle,
  other: Calendar
};

const eventTypeColors = {
  birthday: "bg-pink-100 text-pink-800 border-pink-200",
  anniversary: "bg-red-100 text-red-800 border-red-200",
  meeting: "bg-blue-100 text-blue-800 border-blue-200",
  training: "bg-green-100 text-green-800 border-green-200",
  celebration: "bg-purple-100 text-purple-800 border-purple-200",
  holiday: "bg-orange-100 text-orange-800 border-orange-200",
  deadline: "bg-red-100 text-red-800 border-red-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const priorityColors = {
  low: "bg-blue-100 text-blue-800",
  normal: "bg-gray-100 text-gray-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
};

export default function EventDetailsModal({ isOpen, onClose, event, employees }) {
  if (!event) return null;

  const Icon = eventTypeIcons[event.event_type];
  const eventDate = new Date(event.event_date);
  
  const getTargetEmployees = () => {
    if (event.target_audience === 'all') {
      return employees;
    } else if (event.target_audience === 'department_specific') {
      return employees.filter(emp => emp.department === event.department_filter);
    } else if (event.target_audience === 'individual') {
      return employees.filter(emp => emp.id === event.target_employee_id);
    }
    return [];
  };

  const targetEmployees = getTargetEmployees();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: event.color || '#3B82F6' }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges et informations principales */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={eventTypeColors[event.event_type]}>
              {event.event_type === 'birthday' ? '🎂 Anniversaire' :
               event.event_type === 'anniversary' ? '🎉 Anniversaire' :
               event.event_type === 'meeting' ? '💼 Réunion' :
               event.event_type === 'training' ? '🎓 Formation' :
               event.event_type === 'celebration' ? '🎊 Célébration' :
               event.event_type === 'holiday' ? '✈️ Congé' :
               event.event_type === 'deadline' ? '⚠️ Échéance' : '📅 Autre'}
            </Badge>
            
            <Badge className={priorityColors[event.priority]}>
              {event.priority === 'low' ? '🔵 Faible' :
               event.priority === 'normal' ? '⚪ Normale' :
               event.priority === 'high' ? '🔴 Haute' : '🚨 Urgente'}
            </Badge>

            {event.is_recurring && (
              <Badge className="bg-purple-100 text-purple-800">
                <Repeat className="w-3 h-3 mr-1" />
                Récurrent
              </Badge>
            )}

            {event.rsvp_required && (
              <Badge className="bg-green-100 text-green-800">
                <Bell className="w-3 h-3 mr-1" />
                RSVP Requis
              </Badge>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Détails de l'événement */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informations temporelles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date et Heure
              </h3>
              
              <div className="space-y-3 pl-7">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {format(eventDate, "EEEE dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                
                {event.event_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{event.event_time}</span>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audience */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({targetEmployees.length})
              </h3>
              
              <div className="space-y-3 pl-7">
                <div className="text-sm text-gray-600 mb-3">
                  {event.target_audience === 'all' ? 'Tous les employés' :
                   event.target_audience === 'department_specific' ? `Département: ${event.department_filter}` :
                   'Employé spécifique'}
                </div>

                <div className="max-h-40 overflow-y-auto space-y-2">
                  {targetEmployees.slice(0, 10).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={employee.profile_picture} />
                        <AvatarFallback className="text-xs">
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                  ))}
                  
                  {targetEmployees.length > 10 && (
                    <div className="text-sm text-gray-500 pl-11">
                      ... et {targetEmployees.length - 10} autres employés
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Métadonnées */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Informations supplémentaires</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Créé le :</span>
                <span className="ml-2 text-gray-700">
                  {format(new Date(event.created_date), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
              
              {event.is_recurring && (
                <div>
                  <span className="text-gray-500">Récurrence :</span>
                  <span className="ml-2 text-gray-700 capitalize">
                    {event.recurrence_type === 'yearly' ? 'Annuelle' :
                     event.recurrence_type === 'monthly' ? 'Mensuelle' :
                     event.recurrence_type === 'weekly' ? 'Hebdomadaire' : 'Quotidienne'}
                  </span>
                </div>
              )}
              
              <div>
                <span className="text-gray-500">Statut :</span>
                <span className="ml-2">
                  <Badge className={event.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {event.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </span>
              </div>

              <div>
                <span className="text-gray-500">Notifications :</span>
                <span className="ml-2">
                  <Badge className={event.notification_sent ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}>
                    {event.notification_sent ? 'Envoyées' : 'En attente'}
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}