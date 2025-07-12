import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  User,
  CheckCircle,
  XCircle,
  MessageSquare,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AvatarGenerator from "../ui/AvatarGenerator";

export default function CollaborationInvitationModal({ 
  isOpen, 
  onClose, 
  invitation, 
  event, 
  onRespond, 
  employees = [],
  isLoading = false 
}) {
  const [response, setResponse] = useState('');
  const [responseMessage, setResponseMessage] = useState('');

  const handleRespond = (responseType) => {
    onRespond(invitation?.id, responseType, responseMessage);
    setResponse('');
    setResponseMessage('');
  };

  if (!invitation || !event) {
    return null;
  }

  const sender = employees.find(e => e.id === invitation.sender_id);
  const collaborators = event.collaborators 
    ? employees.filter(e => event.collaborators.includes(e.id))
    : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priority;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-blue-600" />
            Invitation de Collaboration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informations sur l'expéditeur */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">Invitation de:</h3>
              <Badge className="bg-blue-100 text-blue-800">
                {format(new Date(invitation.created_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <AvatarGenerator
                firstName={sender?.first_name}
                lastName={sender?.last_name}
                email={sender?.email}
                department={sender?.department}
                size="md"
                className="ring-2 ring-blue-200"
              />
              <div>
                <p className="font-bold text-blue-900">
                  {sender ? `${sender.first_name} ${sender.last_name}` : 'Expéditeur inconnu'}
                </p>
                <p className="text-sm text-blue-700">
                  {sender?.position} • {sender?.department}
                </p>
                <p className="text-xs text-blue-600">{sender?.email}</p>
              </div>
            </div>
            
            {invitation.message && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Message personnel:</span>
                </div>
                <p className="text-sm text-gray-700 italic">"{invitation.message}"</p>
              </div>
            )}
          </div>

          {/* Détails de l'événement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
              <Badge className={getPriorityColor(event.priority)}>
                Priorité {getPriorityLabel(event.priority)}
              </Badge>
            </div>
            
            {event.description && (
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                {event.description}
              </p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="font-medium">Début:</p>
                    <p className="text-gray-600">
                      {format(new Date(event.start_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>
                
                {event.end_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <p className="font-medium">Fin:</p>
                      <p className="text-gray-600">
                        {format(new Date(event.end_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-medium">Lieu:</p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                )}
                
                {event.meeting_type === 'virtual' && event.meeting_link && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium">Réunion virtuelle:</p>
                      <a 
                        href={event.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        Rejoindre la réunion
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Autres collaborateurs */}
          {collaborators.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Autres collaborateurs invités ({collaborators.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {collaborators.slice(0, 6).map(collaborator => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2"
                  >
                    <AvatarGenerator
                      firstName={collaborator.first_name}
                      lastName={collaborator.last_name}
                      email={collaborator.email}
                      department={collaborator.department}
                      size="xs"
                    />
                    <span className="text-sm">
                      {collaborator.first_name} {collaborator.last_name}
                    </span>
                  </div>
                ))}
                {collaborators.length > 6 && (
                  <Badge variant="outline" className="self-center">
                    +{collaborators.length - 6} autres
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Message de réponse */}
          <div>
            <Label htmlFor="response_message" className="text-sm font-medium">
              Message de réponse (optionnel)
            </Label>
            <Textarea
              id="response_message"
              placeholder="Ajoutez un commentaire à votre réponse..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="mt-1 h-20"
            />
          </div>

          {/* Information sur l'invitation */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800">À propos de cette invitation</p>
                <p className="text-amber-700 mt-1">
                  En acceptant cette invitation, vous rejoindrez cet événement collaboratif et pourrez 
                  participer aux discussions, suivre l'avancement et contribuer aux tâches assignées.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Fermer
          </Button>
          
          <Button
            onClick={() => handleRespond('rejected')}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Refuser
          </Button>
          
          <Button
            onClick={() => handleRespond('accepted')}
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accepter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}