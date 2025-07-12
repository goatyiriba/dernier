import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Users, 
  Clock, 
  MapPin,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Send,
  UserPlus,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  Info,
  Star,
  Target,
  Award,
  Zap,
  Play,
  Crown
} from "lucide-react";
import { 
  CollaborativeEvent,
  CollaborationInvitation,
  CollaborationComment,
  Employee,
  User as UserEntity,
  Notification
} from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek, endOfWeek, isToday, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import AvatarGenerator from "../components/ui/AvatarGenerator";
import CreateCollaborationModal from "../components/calendar/CreateCollaborationModal";
import CollaborationInvitationModal from "../components/calendar/CollaborationInvitationModal";
import EventDetailsModal from "../components/calendar/EventDetailsModal";

export default function CollaborativeCalendar() {
  // États principaux
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [collaborativeEvents, setCollaborativeEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);
  
  // États de filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // États des modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  
  // États de chargement
  const [isCreating, setIsCreating] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();

  // CORRECTION: Fonction de debug simplifiée
  const addDebugLog = (message, type = 'info', data = null) => {
    const timestamp = format(new Date(), 'HH:mm:ss');
    const logEntry = {
      timestamp,
      message,
      type,
      data,
      id: Date.now() + Math.random()
    };
    
    console.log(`📅 [${timestamp}] ${type.toUpperCase()}: ${message}`, data || '');
    
    setDebugLogs(prev => {
      const newLogs = [logEntry, ...prev];
      return newLogs.slice(0, 20);
    });
  };

  useEffect(() => {
    addDebugLog('Composant CollaborativeCalendar monté');
    initializeCalendar();
    
    // Actualisation automatique toutes les 2 minutes
    const interval = setInterval(() => {
      refreshCalendar();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const initializeCalendar = async () => {
    try {
      addDebugLog('🚀 Initialisation du calendrier collaboratif');
      setIsLoading(true);
      setError(null);
      
      // CORRECTION: Authentification simplifiée avec gestion d'erreur
      addDebugLog('🔐 Authentification utilisateur');
      let user;
      try {
        user = await UserEntity.me();
        addDebugLog('✅ Utilisateur authentifié', 'success', {
          id: user.id,
          email: user.email,
          is_active: user.is_active,
          employee_id: user.employee_id
        });
      } catch (authError) {
        addDebugLog('❌ Erreur authentification', 'error', authError.message);
        setError(`Erreur d'authentification: ${authError.message}`);
        return;
      }
      
      setCurrentUser(user);
      
      // CORRECTION: Vérification simple du statut
      if (!user.is_active) {
        addDebugLog('❌ Compte non activé', 'error');
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // CORRECTION: Recherche employé simplifiée
      await findCurrentEmployee(user);
      
      // CORRECTION: Chargement des données avec gestion d'erreur
      await loadCalendarData(user);
      
    } catch (error) {
      addDebugLog('❌ Erreur critique initialisation', 'error', error.message);
      setError(`Erreur d'initialisation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const findCurrentEmployee = async (user) => {
    try {
      addDebugLog('👤 Recherche employé actuel');
      let employee = null;
      
      // CORRECTION: Recherche par ID d'abord
      if (user.employee_id) {
        addDebugLog(`🔍 Recherche par employee_id: ${user.employee_id}`);
        try {
          const employeeResults = await Employee.filter({ id: user.employee_id });
          if (employeeResults && employeeResults.length > 0) {
            employee = employeeResults[0];
            addDebugLog('✅ Employé trouvé par ID', 'success', {
              id: employee.id,
              name: `${employee.first_name} ${employee.last_name}`
            });
          }
        } catch (filterError) {
          addDebugLog('⚠️ Erreur filtre par ID', 'warning', filterError.message);
        }
      }
      
      // CORRECTION: Recherche par email si pas trouvé
      if (!employee && user.email) {
        addDebugLog(`🔍 Recherche par email: ${user.email}`);
        try {
          const employeeResults = await Employee.filter({ email: user.email });
          if (employeeResults && employeeResults.length > 0) {
            employee = employeeResults[0];
            addDebugLog('✅ Employé trouvé par email', 'success', {
              id: employee.id,
              name: `${employee.first_name} ${employee.last_name}`
            });
          }
        } catch (filterError) {
          addDebugLog('⚠️ Erreur filtre par email', 'warning', filterError.message);
        }
      }

      if (!employee) {
        addDebugLog('❌ Aucun employé trouvé', 'error');
        throw new Error('Aucun profil employé trouvé. Contactez votre administrateur.');
      }

      setCurrentEmployee(employee);
      addDebugLog('👤 Employé actuel défini', 'success');
      
    } catch (error) {
      addDebugLog('❌ Erreur recherche employé', 'error', error.message);
      throw error;
    }
  };

  const loadCalendarData = async (user) => {
    try {
      addDebugLog('📊 Chargement données calendrier');
      
      // CORRECTION: Chargement avec gestion d'erreur individuelle
      
      // 1. Charger employés (nécessaire pour les invitations)
      addDebugLog('👥 Chargement employés');
      try {
        const employeeResults = await Employee.list();
        setEmployees(employeeResults || []);
        addDebugLog(`✅ ${employeeResults?.length || 0} employés chargés`, 'success');
      } catch (error) {
        addDebugLog('⚠️ Erreur chargement employés', 'warning', error.message);
        setEmployees([]);
      }
      
      // Attendre que currentEmployee soit défini
      if (!currentEmployee) {
        addDebugLog('⏳ Attente définition employé actuel');
        return;
      }
      
      // 2. Charger événements collaboratifs
      addDebugLog('📅 Chargement événements collaboratifs');
      try {
        const allEvents = await CollaborativeEvent.list("-created_date");
        
        // CORRECTION: Filtrer les événements pertinents pour cet utilisateur
        const userEvents = (allEvents || []).filter(event => {
          // L'utilisateur est le créateur
          if (event.created_by === currentEmployee.id) return true;
          
          // L'utilisateur est dans les collaborateurs
          if (event.collaborators && Array.isArray(event.collaborators) && 
              event.collaborators.includes(currentEmployee.id)) return true;
          
          return false;
        });
        
        setCollaborativeEvents(userEvents);
        addDebugLog(`✅ ${userEvents.length} événements chargés`, 'success');
      } catch (error) {
        addDebugLog('⚠️ Erreur chargement événements', 'warning', error.message);
        setCollaborativeEvents([]);
      }
      
      // 3. Charger invitations
      addDebugLog('📨 Chargement invitations');
      try {
        // Invitations reçues
        const receivedInvitations = await CollaborationInvitation.filter({ 
          receiver_id: currentEmployee.id 
        });
        
        // Invitations envoyées
        const sentInvitations = await CollaborationInvitation.filter({ 
          sender_id: currentEmployee.id 
        });
        
        const allInvitations = [
          ...(receivedInvitations || []), 
          ...(sentInvitations || [])
        ];
        
        setInvitations(allInvitations);
        addDebugLog(`✅ ${allInvitations.length} invitations chargées`, 'success');
      } catch (error) {
        addDebugLog('⚠️ Erreur chargement invitations', 'warning', error.message);
        setInvitations([]);
      }
      
      // 4. Charger commentaires
      addDebugLog('💬 Chargement commentaires');
      try {
        const commentResults = await CollaborationComment.list("-created_date");
        setComments(commentResults || []);
        addDebugLog(`✅ ${commentResults?.length || 0} commentaires chargés`, 'success');
      } catch (error) {
        addDebugLog('⚠️ Erreur chargement commentaires', 'warning', error.message);
        setComments([]);
      }
      
      addDebugLog('✅ Données calendrier chargées avec succès', 'success');
      
    } catch (error) {
      addDebugLog('❌ Erreur chargement données calendrier', 'error', error.message);
      throw error;
    }
  };

  const refreshCalendar = async () => {
    try {
      addDebugLog('🔄 Rafraîchissement calendrier');
      if (currentUser && currentEmployee) {
        await loadCalendarData(currentUser);
      }
    } catch (error) {
      addDebugLog('❌ Erreur rafraîchissement', 'error', error.message);
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      setIsCreating(true);
      addDebugLog('📅 Création événement collaboratif', 'info', eventData);
      
      if (!currentEmployee) {
        throw new Error('Employé non trouvé');
      }

      const newEvent = await CollaborativeEvent.create({
        ...eventData,
        created_by: currentEmployee.id,
        status: 'pending',
        progress_percentage: 0
      });

      addDebugLog('✅ Événement créé', 'success', { id: newEvent.id });

      // Envoyer des invitations aux collaborateurs
      if (eventData.collaborators && eventData.collaborators.length > 0) {
        await sendInvitations(newEvent.id, eventData.collaborators, eventData.message);
      }

      await refreshCalendar();
      setShowCreateModal(false);

      toast({
        title: "✅ Événement créé",
        description: "L'événement collaboratif a été créé avec succès",
        duration: 3000,
      });

    } catch (error) {
      addDebugLog('❌ Erreur création événement', 'error', error.message);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const sendInvitations = async (eventId, collaboratorIds, message = '') => {
    try {
      addDebugLog('📨 Envoi invitations', 'info', { eventId, collaboratorIds });
      
      if (!currentEmployee) {
        throw new Error('Employé non trouvé');
      }

      const invitationPromises = collaboratorIds.map(async (collaboratorId) => {
        // Créer l'invitation
        const invitation = await CollaborationInvitation.create({
          event_id: eventId,
          sender_id: currentEmployee.id,
          receiver_id: collaboratorId,
          message: message || 'Vous êtes invité à participer à cet événement collaboratif',
          status: 'sent',
          invitation_type: 'collaboration',
          urgency: 'medium',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

        // Créer une notification
        try {
          await Notification.create({
            user_id: collaboratorId,
            title: '🤝 Nouvelle invitation de collaboration',
            message: `${currentEmployee.first_name} ${currentEmployee.last_name} vous invite à collaborer`,
            type: 'collaboration_invite',
            link_to: `/collaborative-calendar`,
            metadata: JSON.stringify({ 
              invitation_id: invitation.id,
              event_id: eventId 
            })
          });
        } catch (notifError) {
          addDebugLog('⚠️ Erreur création notification', 'warning', notifError.message);
        }

        return invitation;
      });

      await Promise.all(invitationPromises);
      addDebugLog('✅ Invitations envoyées', 'success');

    } catch (error) {
      addDebugLog('❌ Erreur envoi invitations', 'error', error.message);
      throw error;
    }
  };

  const handleInvitationResponse = async (invitationId, response, responseMessage = '') => {
    try {
      setIsResponding(true);
      addDebugLog('📨 Réponse invitation', 'info', { invitationId, response });

      // Mettre à jour l'invitation
      await CollaborationInvitation.update(invitationId, {
        status: response,
        response_message: responseMessage,
        responded_at: new Date().toISOString()
      });

      // Si accepté, ajouter l'utilisateur aux collaborateurs de l'événement
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation && response === 'accepted') {
        const event = collaborativeEvents.find(e => e.id === invitation.event_id);
        if (event) {
          const updatedCollaborators = [...(event.collaborators || [])];
          if (!updatedCollaborators.includes(currentEmployee.id)) {
            updatedCollaborators.push(currentEmployee.id);
          }

          await CollaborativeEvent.update(event.id, {
            collaborators: updatedCollaborators,
            responses: [
              ...(event.responses || []),
              {
                employee_id: currentEmployee.id,
                response: response,
                response_date: new Date().toISOString(),
                message: responseMessage
              }
            ]
          });
        }
      }

      await refreshCalendar();
      setShowInvitationModal(false);

      toast({
        title: response === 'accepted' ? "✅ Invitation acceptée" : "❌ Invitation refusée",
        description: `Votre réponse a été enregistrée`,
        duration: 3000,
      });

    } catch (error) {
      addDebugLog('❌ Erreur réponse invitation', 'error', error.message);
      toast({
        title: "❌ Erreur",
        description: "Impossible de répondre à l'invitation",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleAddComment = async (eventId, commentContent, commentType = 'comment') => {
    try {
      addDebugLog('💬 Ajout commentaire', 'info', { eventId, commentContent });

      if (!currentEmployee) {
        throw new Error('Employé non trouvé');
      }

      await CollaborationComment.create({
        event_id: eventId,
        author_id: currentEmployee.id,
        content: commentContent,
        comment_type: commentType
      });

      await refreshCalendar();

      toast({
        title: "✅ Commentaire ajouté",
        description: "Votre commentaire a été publié",
        duration: 2000,
      });

    } catch (error) {
      addDebugLog('❌ Erreur ajout commentaire', 'error', error.message);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'ajouter le commentaire",
        variant: "destructive"
      });
    }
  };

  const handleUpdateEventStatus = async (eventId, newStatus) => {
    try {
      setIsUpdating(true);
      addDebugLog('🔄 Mise à jour statut événement', 'info', { eventId, newStatus });

      await CollaborativeEvent.update(eventId, {
        status: newStatus
      });

      await refreshCalendar();

      toast({
        title: "✅ Statut mis à jour",
        description: `L'événement est maintenant ${newStatus}`,
        duration: 2000,
      });

    } catch (error) {
      addDebugLog('❌ Erreur mise à jour statut', 'error', error.message);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // CORRECTION: Fonctions utilitaires
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Employé inconnu';
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <Star className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Target className="w-4 h-4 text-blue-500" />;
      case 'low': return <Info className="w-4 h-4 text-gray-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // Filtrage des événements
  const filteredEvents = collaborativeEvents.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const eventDate = new Date(event.start_date);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today': return isToday(eventDate);
        case 'week': {
          const weekStart = startOfWeek(today, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
          return eventDate >= weekStart && eventDate <= weekEnd;
        }
        case 'month': {
          return eventDate.getMonth() === today.getMonth() && 
                 eventDate.getFullYear() === today.getFullYear();
        }
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Filtrage des invitations
  const pendingInvitations = invitations.filter(inv => 
    inv.receiver_id === currentEmployee?.id && 
    ['sent', 'viewed'].includes(inv.status)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement du calendrier collaboratif...</p>
          
          {/* Debug logs pendant le chargement */}
          {debugLogs.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-4 max-w-md mx-auto text-left max-h-64 overflow-y-auto">
              <h4 className="font-semibold text-sm mb-2">Debug:</h4>
              {debugLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className={
                    log.type === 'error' ? 'text-red-600' :
                    log.type === 'success' ? 'text-green-600' :
                    log.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Erreur de connexion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3">
              <Button onClick={initializeCalendar} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Réessayer
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setError(null)}
                className="flex-1"
              >
                Ignorer l'erreur
              </Button>
            </div>
            
            {/* Debug logs en cas d'erreur */}
            {debugLogs.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">Voir les détails techniques</summary>
                <div className="mt-2 bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                  {debugLogs.map((log) => (
                    <div key={log.id} className="text-xs py-1 border-b border-gray-200">
                      <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                      <span className={
                        log.type === 'error' ? 'text-red-600' :
                        log.type === 'success' ? 'text-green-600' :
                        log.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                    Calendrier Collaboratif
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    Organisez et participez à des événements collaboratifs
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{collaborativeEvents.length}</div>
                  <div className="text-sm text-blue-100">Événements</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{pendingInvitations.length}</div>
                  <div className="text-sm text-blue-100">Invitations</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">
                    {collaborativeEvents.filter(e => e.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-blue-100">En cours</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">
                    {collaborativeEvents.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-blue-100">Terminés</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">{format(new Date(), "HH:mm")}</p>
                <p className="text-blue-200">{format(new Date(), "EEEE, d MMMM yyyy", { locale: fr })}</p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau
                </Button>
                
                <Button
                  onClick={refreshCalendar}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtres et recherche */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white border-gray-200"
                />
              </div>
              
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white h-12"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Accepté</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
                
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white h-12"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="today">Aujourd'hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Invitations */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Invitations en attente */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-orange-600" />
                  Invitations en attente
                  {pendingInvitations.length > 0 && (
                    <Badge className="bg-orange-100 text-orange-800">
                      {pendingInvitations.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInvitations.map((invitation, index) => {
                    const event = collaborativeEvents.find(e => e.id === invitation.event_id);
                    const sender = employees.find(e => e.id === invitation.sender_id);
                    
                    return (
                      <motion.div
                        key={invitation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors"
                        onClick={() => {
                          setSelectedInvitation(invitation);
                          setSelectedEvent(event);
                          setShowInvitationModal(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {sender && (
                            <AvatarGenerator
                              firstName={sender.first_name}
                              lastName={sender.last_name}
                              email={sender.email}
                              department={sender.department}
                              size="sm"
                              className="ring-2 ring-orange-200"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-orange-900 text-sm truncate">
                              {event?.title || 'Événement'}
                            </p>
                            <p className="text-xs text-orange-700">
                              De: {sender ? `${sender.first_name} ${sender.last_name}` : 'Inconnu'}
                            </p>
                            <p className="text-xs text-orange-600 mt-1">
                              {format(new Date(invitation.created_date), 'dd/MM/yyyy à HH:mm')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvitationResponse(invitation.id, 'accepted');
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInvitationResponse(invitation.id, 'rejected');
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Refuser
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {pendingInvitations.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune invitation en attente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal - Événements */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Liste des événements */}
            <div className="grid gap-6">
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
                  const eventComments = comments.filter(c => c.event_id === event.id);
                  const isCreator = event.created_by === currentEmployee?.id;
                  const isCollaborator = event.collaborators?.includes(currentEmployee?.id);
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                <Badge className={getStatusColor(event.status)}>
                                  {getStatusLabel(event.status)}
                                </Badge>
                                {getPriorityIcon(event.priority)}
                              </div>
                              
                              <p className="text-gray-600 mb-4">{event.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {format(new Date(event.start_date), 'dd/MM/yyyy à HH:mm')}
                                </div>
                                
                                {event.end_date && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    Jusqu'au {format(new Date(event.end_date), 'dd/MM/yyyy à HH:mm')}
                                  </div>
                                )}
                                
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                )}
                                
                                {event.meeting_type === 'virtual' && event.meeting_link && (
                                  <div className="flex items-center gap-1">
                                    <Video className="w-4 h-4" />
                                    Réunion virtuelle
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowDetailsModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              
                              {isCreator && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implémenter l'édition
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {/* Collaborateurs */}
                          {event.collaborators && event.collaborators.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Collaborateurs:</p>
                              <div className="flex flex-wrap gap-2">
                                {event.collaborators.map(collaboratorId => {
                                  const collaborator = employees.find(e => e.id === collaboratorId);
                                  return collaborator && (
                                    <div key={collaboratorId} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                                      <AvatarGenerator
                                        firstName={collaborator.first_name}
                                        lastName={collaborator.last_name}
                                        email={collaborator.email}
                                        department={collaborator.department}
                                        size="xs"
                                      />
                                      <span className="text-sm">{collaborator.first_name} {collaborator.last_name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Progression */}
                          {event.progress_percentage !== undefined && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Progression</span>
                                <span className="text-sm text-gray-500">{event.progress_percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${event.progress_percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                          
                          {/* Actions rapides */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {eventComments.length > 0 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {eventComments.length} commentaire{eventComments.length > 1 ? 's' : ''}
                                </Badge>
                              )}
                              
                              {isCreator && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <Crown className="w-3 h-3 mr-1" />
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
                            
                            <div className="flex items-center gap-2">
                              {isCreator && event.status === 'pending' && (
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleUpdateEventStatus(event.id, 'in_progress')}
                                  disabled={isUpdating}
                                >
                                  <Play className="w-3 h-3 mr-1" />
                                  Démarrer
                                </Button>
                              )}
                              
                              {isCreator && event.status === 'in_progress' && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleUpdateEventStatus(event.id, 'completed')}
                                  disabled={isUpdating}
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Terminer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {filteredEvents.length === 0 && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-16">
                    <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Aucun événement trouvé
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                        ? 'Modifiez vos filtres pour voir plus de résultats'
                        : 'Créez votre premier événement collaboratif'
                      }
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un événement
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCollaborationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        employees={employees}
        currentEmployee={currentEmployee}
        isLoading={isCreating}
      />

      <CollaborationInvitationModal
        isOpen={showInvitationModal}
        onClose={() => setShowInvitationModal(false)}
        invitation={selectedInvitation}
        event={selectedEvent}
        onRespond={handleInvitationResponse}
        employees={employees}
        isLoading={isResponding}
      />

      <EventDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        event={selectedEvent}
        comments={comments.filter(c => c.event_id === selectedEvent?.id)}
        employees={employees}
        currentEmployee={currentEmployee}
        onAddComment={handleAddComment}
        onUpdateStatus={handleUpdateEventStatus}
      />
    </div>
  );
}