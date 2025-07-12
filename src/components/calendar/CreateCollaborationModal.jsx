import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  Target,
  X,
  UserPlus,
  Send
} from "lucide-react";
import { format } from "date-fns";
import AvatarGenerator from "../ui/AvatarGenerator";

export default function CreateCollaborationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  employees = [], 
  currentEmployee,
  isLoading = false 
}) {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    meeting_type: 'physical',
    meeting_link: '',
    priority: 'medium',
    tags: [],
    collaborators: [],
    message: ''
  });

  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [searchCollaborators, setSearchCollaborators] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formattedData = {
      ...eventData,
      collaborators: selectedCollaborators.map(emp => emp.id),
      message: invitationMessage
    };
    
    onSubmit(formattedData);
  };

  const handleAddCollaborator = (employee) => {
    if (!selectedCollaborators.find(emp => emp.id === employee.id)) {
      setSelectedCollaborators(prev => [...prev, employee]);
    }
  };

  const handleRemoveCollaborator = (employeeId) => {
    setSelectedCollaborators(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const filteredEmployees = employees.filter(emp => {
    if (emp.id === currentEmployee?.id) return false; // Exclure l'utilisateur actuel
    if (selectedCollaborators.find(selected => selected.id === emp.id)) return false; // Exclure les déjà sélectionnés
    
    if (searchCollaborators) {
      const searchTerm = searchCollaborators.toLowerCase();
      return (
        emp.first_name.toLowerCase().includes(searchTerm) ||
        emp.last_name.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.department?.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });

  const resetForm = () => {
    setEventData({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      location: '',
      meeting_type: 'physical',
      meeting_link: '',
      priority: 'medium',
      tags: [],
      collaborators: [],
      message: ''
    });
    setSelectedCollaborators([]);
    setInvitationMessage('');
    setSearchCollaborators('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="w-6 h-6 text-purple-600" />
            Créer un Événement Collaboratif
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  Titre de l'événement *
                </Label>
                <Input
                  id="title"
                  placeholder="ex: Réunion de planification projet X"
                  value={eventData.title}
                  onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez l'objectif et le contenu de cet événement..."
                  value={eventData.description}
                  onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 h-24"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Priorité</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-800' },
                    { value: 'medium', label: 'Moyenne', color: 'bg-blue-100 text-blue-800' },
                    { value: 'high', label: 'Élevée', color: 'bg-orange-100 text-orange-800' },
                    { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' }
                  ].map(priority => (
                    <Badge
                      key={priority.value}
                      className={`cursor-pointer transition-all ${
                        eventData.priority === priority.value 
                          ? priority.color + ' ring-2 ring-offset-1' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                      onClick={() => setEventData(prev => ({ ...prev, priority: priority.value }))}
                    >
                      {priority.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="start_date" className="text-sm font-medium">
                  Date et heure de début *
                </Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={eventData.start_date}
                  onChange={(e) => setEventData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="end_date" className="text-sm font-medium">
                  Date et heure de fin
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={eventData.end_date}
                  onChange={(e) => setEventData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Type de réunion</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={eventData.meeting_type === 'physical' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEventData(prev => ({ ...prev, meeting_type: 'physical' }))}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Physique
                  </Button>
                  <Button
                    type="button"
                    variant={eventData.meeting_type === 'virtual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEventData(prev => ({ ...prev, meeting_type: 'virtual' }))}
                    className="flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Virtuelle
                  </Button>
                  <Button
                    type="button"
                    variant={eventData.meeting_type === 'hybrid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEventData(prev => ({ ...prev, meeting_type: 'hybrid' }))}
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Hybride
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  {eventData.meeting_type === 'virtual' ? 'Lien de réunion' : 'Lieu'}
                </Label>
                <Input
                  id="location"
                  placeholder={
                    eventData.meeting_type === 'virtual' 
                      ? "https://meet.google.com/..." 
                      : "Salle de réunion A, Bureau principal..."
                  }
                  value={eventData.meeting_type === 'virtual' ? eventData.meeting_link : eventData.location}
                  onChange={(e) => setEventData(prev => ({ 
                    ...prev, 
                    [eventData.meeting_type === 'virtual' ? 'meeting_link' : 'location']: e.target.value 
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Sélection des collaborateurs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Inviter des collaborateurs</Label>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {selectedCollaborators.length} sélectionné{selectedCollaborators.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* Collaborateurs sélectionnés */}
            {selectedCollaborators.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-3">Collaborateurs invités:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedCollaborators.map(collaborator => (
                    <div
                      key={collaborator.id}
                      className="flex items-center gap-2 bg-white rounded-full px-3 py-2 border border-blue-200"
                    >
                      <AvatarGenerator
                        firstName={collaborator.first_name}
                        lastName={collaborator.last_name}
                        email={collaborator.email}
                        department={collaborator.department}
                        size="xs"
                      />
                      <span className="text-sm font-medium">
                        {collaborator.first_name} {collaborator.last_name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collaborator.id)}
                        className="h-5 w-5 p-0 hover:bg-red-100"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Recherche de collaborateurs */}
            <div>
              <Input
                placeholder="Rechercher des employés à inviter..."
                value={searchCollaborators}
                onChange={(e) => setSearchCollaborators(e.target.value)}
                className="mb-3"
              />
              
              <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                {filteredEmployees.slice(0, 10).map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleAddCollaborator(employee)}
                  >
                    <div className="flex items-center gap-3">
                      <AvatarGenerator
                        firstName={employee.first_name}
                        lastName={employee.last_name}
                        email={employee.email}
                        department={employee.department}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-sm">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {employee.position} • {employee.department}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm">
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun employé trouvé</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message d'invitation */}
          <div>
            <Label htmlFor="invitation_message" className="text-sm font-medium">
              Message d'invitation personnalisé
            </Label>
            <Textarea
              id="invitation_message"
              placeholder="Ajoutez un message personnalisé pour vos invitations..."
              value={invitationMessage}
              onChange={(e) => setInvitationMessage(e.target.value)}
              className="mt-1 h-20"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ce message sera envoyé avec l'invitation à tous les collaborateurs
            </p>
          </div>

          <DialogFooter className="flex gap-2 pt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={isLoading || !eventData.title || !eventData.start_date}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Création...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Créer et Inviter
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}