import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar,
  MapPin,
  Clock,
  MessageCircle,
  Video,
  PhoneCall
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  employee, 
  getConnectionStatus, 
  formatLastSeen 
}) {
  if (!employee) return null;

  const connectionStatus = getConnectionStatus(employee);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Profil de l'employé
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={employee.profile_picture} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {employee.first_name?.[0]}{employee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${
                    connectionStatus?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}></div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h2>
                  <p className="text-lg text-blue-600 font-medium">{employee.position}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="outline" className="font-normal">
                      {employee.department}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`font-normal ${
                        connectionStatus?.isOnline 
                          ? 'border-green-500 text-green-700 bg-green-50' 
                          : 'border-gray-400 text-gray-600'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        connectionStatus?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      {connectionStatus?.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {connectionStatus?.isOnline 
                      ? 'En ligne maintenant' 
                      : `Dernière activité: ${formatLastSeen(employee)}`
                    }
                  </p>
                </div>
              </div>
              
              {/* Actions rapides */}
              <div className="flex gap-3 mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Envoyer un message
                </Button>
                <Button variant="outline">
                  <PhoneCall className="w-4 h-4 mr-2" />
                  Appel
                </Button>
                <Button variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Vidéo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                )}
                {employee.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium">{employee.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Détails de l'emploi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Département</p>
                    <p className="font-medium">{employee.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Poste</p>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                </div>
                {employee.start_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date d'embauche</p>
                      <p className="font-medium">
                        {format(new Date(employee.start_date), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
                {employee.status && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compétences */}
          {employee.skills && employee.skills.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Compétences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {employee.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact d'urgence */}
          {employee.emergency_contact && (
            <Card className="border-0 shadow-sm bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Contact d'urgence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {employee.emergency_contact.name && (
                    <p><span className="font-medium">Nom:</span> {employee.emergency_contact.name}</p>
                  )}
                  {employee.emergency_contact.phone && (
                    <p><span className="font-medium">Téléphone:</span> {employee.emergency_contact.phone}</p>
                  )}
                  {employee.emergency_contact.relationship && (
                    <p><span className="font-medium">Relation:</span> {employee.emergency_contact.relationship}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card className="border-0 shadow-sm bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">ID Employé</p>
                  <p className="font-medium">{employee.employee_id || employee.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {format(new Date(employee.created_date), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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