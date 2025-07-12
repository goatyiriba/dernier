import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Video, 
  Clock, 
  MessageSquare,
  Send,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Edit,
  Target,
  Award,
  Activity,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import AvatarGenerator from "../ui/AvatarGenerator";

export default function EventDetailsModal({ 
  isOpen, 
  onClose, 
  event, 
  comments = [],
  employees = [],
  currentEmployee,
  onAddComment,
  onUpdateStatus
}) {
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  if (!event) return null;

  const creator = employees.find(e => e.id === event.created_by);
  const collaborators = event.collaborators 
    ? employees.filter(e => event.collaborators.includes(e.id))
    : [];

  const isCreator = event.created_by === currentEmployee?.id;
  const isCollaborator = event.collaborators?.includes(currentEmployee?.id);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      await onAddComment(event.id, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Accepté';
      case 'rejected': return 'Refusé';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl pr-8">{event.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
                <Badge className={getPriorityColor(event.priority)}>
                  Priorité {event.priority}
                </Badge>
                {isCreator && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Award className="w-3 h-3 mr-1" />
                    Créateur
                  </Badge>
                )}
                {isCollaborator && !isCreator && (
                  <Badge className="bg-green-100 text-green-800">
                    <Users className="w-3 h-3 mr-1" />
                    Collaborateur
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="collaborators">Collaborateurs</TabsTrigger>
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="comments">
              Commentaires
              {comments.length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {comments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Onglet Détails */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">
                      {event.description || 'Aucune description fournie'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Créé par</h3>
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <AvatarGenerator
                      firstName={creator?.first_name}
                      lastName={creator?.last_name}
                      email={creator?.email}
                      department={creator?.department}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">
                        {creator ? `${creator.first_name} ${creator.last_name}` : 'Créateur inconnu'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {creator?.position} • {creator?.department}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">Début</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.start_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  {event.end_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">Fin</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.end_date), 'EEEE d MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.meeting_type === 'virtual' && event.meeting_link && (
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Réunion virtuelle</p>
                        <a 
                          href={event.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Rejoindre la réunion
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progression */}
                {event.progress_percentage !== undefined && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        Progression
                      </h4>
                      <span className="text-sm text-gray-600">
                        {event.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={event.progress_percentage} className="h-3" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions du créateur */}
            {isCreator && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Actions de gestion</h4>
                <div className="flex gap-2">
                  {event.status === 'pending' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onUpdateStatus(event.id, 'in_progress')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Démarrer
                    </Button>
                  )}
                  
                  {event.status === 'in_progress' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onUpdateStatus(event.id, 'completed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Terminer
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(event.id, 'paused')}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Mettre en pause
                      </Button>
                    </>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => onUpdateStatus(event.id, 'cancelled')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Onglet Collaborateurs */}
          <TabsContent value="collaborators">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Collaborateurs ({collaborators.length})
              </h3>
              
              <div className="grid gap-4">
                {collaborators.map(collaborator => {
                  const response = event.responses?.find(r => r.employee_id === collaborator.id);
                  
                  return (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <AvatarGenerator
                          firstName={collaborator.first_name}
                          lastName={collaborator.last_name}
                          email={collaborator.email}
                          department={collaborator.department}
                          size="md"
                        />
                        <div>
                          <p className="font-medium">
                            {collaborator.first_name} {collaborator.last_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {collaborator.position} • {collaborator.department}
                          </p>
                          {response?.message && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{response.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {response ? (
                          <>
                            <Badge className={getStatusColor(response.response)}>
                              {getStatusLabel(response.response)}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              {format(new Date(response.response_date), 'dd/MM à HH:mm')}
                            </p>
                          </>
                        ) : (
                          <Badge variant="outline">En attente</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {collaborators.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun collaborateur</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Onglet Tâches */}
          <TabsContent value="tasks">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tâches</h3>
              
              {event.tasks && event.tasks.length > 0 ? (
                <div className="space-y-3">
                  {event.tasks.map((task, index) => {
                    const assignee = employees.find(e => e.id === task.assigned_to);
                    
                    return (
                      <div
                        key={task.id || index}
                        className="p-4 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {assignee && (
                              <div className="flex items-center gap-2">
                                <AvatarGenerator
                                  firstName={assignee.first_name}
                                  lastName={assignee.last_name}
                                  email={assignee.email}
                                  size="xs"
                                />
                                <span>{assignee.first_name} {assignee.last_name}</span>
                              </div>
                            )}
                          </div>
                          
                          {task.deadline && (
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3 h-3" />
                              {format(new Date(task.deadline), 'dd/MM/yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune tâche définie</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Onglet Commentaires */}
          <TabsContent value="comments">
            <div className="space-y-4">
              {/* Nouveau commentaire */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Ajouter un commentaire</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrivez votre commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isAddingComment}
                    size="sm"
                  >
                    {isAddingComment ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Liste des commentaires */}
              <div className="space-y-3">
                {comments.map((comment, index) => {
                  const author = employees.find(e => e.id === comment.author_id);
                  
                  return (
                    <div
                      key={comment.id}
                      className="p-4 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AvatarGenerator
                          firstName={author?.first_name}
                          lastName={author?.last_name}
                          email={author?.email}
                          department={author?.department}
                          size="sm"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">
                              {author ? `${author.first_name} ${author.last_name}` : 'Auteur inconnu'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(comment.created_date), 'dd/MM à HH:mm')}
                            </p>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          
                          {comment.comment_type !== 'comment' && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {comment.comment_type === 'question' ? 'Question' :
                               comment.comment_type === 'suggestion' ? 'Suggestion' :
                               comment.comment_type === 'update' ? 'Mise à jour' :
                               comment.comment_type === 'issue' ? 'Problème' :
                               comment.comment_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun commentaire</p>
                    <p className="text-sm">Soyez le premier à commenter cet événement</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}