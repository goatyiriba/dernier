import React, { useState, useEffect } from 'react';
import { Event, EventRSVP, Employee, User, Notification } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar,
  Plus,
  Filter,
  Search,
  Users,
  MapPin,
  Clock,
  Bell,
  User as UserIcon,
  Building2,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash,
  Eye,
  Loader,
  RefreshCw
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

import CreateEventModal from '../components/events/CreateEventModal';
import EventDetailsModal from '../components/events/EventDetailsModal';
import EditEventModal from '../components/events/EditEventModal';
import EventCalendar from '../components/events/EventCalendar';
import EventNotifications from '../components/events/EventNotifications';
import { useTranslation } from '../components/utils/i18n';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États d'interface
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewMode, setViewMode] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rsvpStatuses, setRsvpStatuses] = useState({});
  
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    console.log('📅 Events component mounted');
    initializeEvents();
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      const interval = setInterval(() => {
        refreshEvents();
      }, 30000); // Refresh toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [currentEmployee]);

  const initializeEvents = async () => {
    try {
      console.log('🚀 Initializing Events...');
      setIsLoading(true);
      setError(null);
      
      // Step 1: Authentication
      console.log('🔐 Step 1: Authenticating user...');
      const user = await User.me();
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        is_active: user.is_active,
        role: user.role
      });
      
      setCurrentUser(user);
      
      if (!user.is_active) {
        console.log('❌ User not active');
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // Step 2: Load data
      await loadEventsData(user);
      
    } catch (error) {
      console.error('❌ Error initializing events:', error);
      setError(`Erreur de connexion: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventsData = async (user) => {
    try {
      console.log('📊 Loading events data...');
      
      // Step 1: Load employees
      console.log('👥 Step 1: Loading employees...');
      const employeesData = await Employee.list("-created_date", 200).catch(err => {
        console.warn('⚠️ Error loading employees:', err);
        return [];
      });
      
      console.log(`✅ Loaded ${employeesData.length} employees`);
      setEmployees(employeesData || []);

      // Step 2: Find current employee
      console.log('👤 Step 2: Finding current employee...');
      let employee = null;
      
      if (user.employee_id) {
        employee = employeesData.find(emp => emp.id === user.employee_id);
        if (employee) {
          console.log('✅ Found employee by ID:', employee.first_name, employee.last_name);
        }
      }
      
      if (!employee && user.email) {
        employee = employeesData.find(emp => emp.email === user.email);
        if (employee) {
          console.log('✅ Found employee by email:', employee.first_name, employee.last_name);
        }
      }

      if (employee) {
        setCurrentEmployee(employee);
      } else {
        console.warn('⚠️ No employee record found for user');
        // Ne pas bloquer l'interface, permettre la consultation des événements publics
      }

      // Step 3: Load events
      console.log('📅 Step 3: Loading events...');
      await loadEvents(employee);
      
    } catch (error) {
      console.error('❌ Error loading events data:', error);
      throw error;
    }
  };

  const loadEvents = async (employee = null) => {
    try {
      console.log('📅 Loading events...');
      
      // Charger tous les événements actifs
      const allEvents = await Event.list("-event_date", 200).catch(err => {
        console.warn('⚠️ Error loading events:', err);
        return [];
      });
      
      console.log(`📊 Loaded ${allEvents.length} total events`);
      
      // Filtrer les événements visibles
      let visibleEvents = allEvents.filter(event => {
        if (!event.is_active) return false;
        
        // Événements publics (pour tous)
        if (event.target_audience === 'all') return true;
        
        // Si pas d'employé connecté, afficher seulement les événements publics
        if (!employee) return false;
        
        // Événements spécifiques au département
        if (event.target_audience === 'department_specific' && 
            event.department_filter === employee.department) {
          return true;
        }
        
        // Événements individuels
        if (event.target_audience === 'individual' && 
            event.target_employee_id === employee.id) {
          return true;
        }
        
        return false;
      });
      
      console.log(`✅ Filtered to ${visibleEvents.length} visible events`);
      setEvents(visibleEvents);
      
      // Charger les statuts RSVP si employé connecté
      if (employee) {
        await loadRSVPStatuses(employee.id, visibleEvents);
      }
      
    } catch (error) {
      console.error('❌ Error loading events:', error);
      throw error;
    }
  };

  const loadRSVPStatuses = async (employeeId, eventsList) => {
    try {
      console.log('📝 Loading RSVP statuses...');
      
      const rsvpPromises = eventsList
        .filter(event => event.rsvp_required)
        .map(async (event) => {
          try {
            const rsvps = await EventRSVP.filter({ 
              event_id: event.id, 
              employee_id: employeeId 
            });
            return { eventId: event.id, rsvp: rsvps[0] || null };
          } catch (error) {
            console.warn(`Error loading RSVP for event ${event.id}:`, error);
            return { eventId: event.id, rsvp: null };
          }
        });
      
      const rsvpResults = await Promise.all(rsvpPromises);
      
      const rsvpMap = {};
      rsvpResults.forEach(({ eventId, rsvp }) => {
        rsvpMap[eventId] = rsvp;
      });
      
      console.log(`✅ Loaded RSVP statuses for ${Object.keys(rsvpMap).length} events`);
      setRsvpStatuses(rsvpMap);
      
    } catch (error) {
      console.error('❌ Error loading RSVP statuses:', error);
    }
  };

  const refreshEvents = async () => {
    try {
      console.log('🔄 Refreshing events...');
      await loadEvents(currentEmployee);
    } catch (error) {
      console.warn('⚠️ Failed to refresh events:', error);
    }
  };

  const handleCreateEvent = async (eventData) => {
    if (!currentEmployee) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté en tant qu'employé pour créer un événement.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📅 Creating new event...');
      
      const newEvent = await Event.create({
        ...eventData,
        created_by: currentEmployee.id
      });
      
      console.log('✅ Event created:', newEvent);
      
      // Créer des notifications pour les employés concernés
      await createEventNotifications(newEvent);
      
      toast({
        title: "✅ Événement créé",
        description: `"${eventData.title}" a été créé avec succès.`
      });
      
      await refreshEvents();
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('❌ Error creating event:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer l'événement: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateEvent = async (eventId, eventData) => {
    try {
      console.log('📅 Updating event:', eventId);
      
      await Event.update(eventId, eventData);
      
      console.log('✅ Event updated');
      
      toast({
        title: "✅ Événement mis à jour",
        description: "L'événement a été modifié avec succès."
      });
      
      await refreshEvents();
      setShowEditModal(false);
      setSelectedEvent(null);
      
    } catch (error) {
      console.error('❌ Error updating event:', error);
      toast({
        title: "Erreur",
        description: `Impossible de modifier l'événement: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      console.log('🗑️ Deleting event:', eventId);
      
      // Marquer comme inactif plutôt que supprimer
      await Event.update(eventId, { is_active: false });
      
      console.log('✅ Event deleted');
      
      toast({
        title: "✅ Événement supprimé",
        description: "L'événement a été supprimé avec succès."
      });
      
      await refreshEvents();
      setShowDetailsModal(false);
      setSelectedEvent(null);
      
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'événement: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleRSVP = async (eventId, response, comment = '') => {
    if (!currentEmployee) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour répondre.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📝 Submitting RSVP:', { eventId, response });
      
      // Vérifier s'il existe déjà une réponse
      const existingRSVP = rsvpStatuses[eventId];
      
      if (existingRSVP) {
        // Mettre à jour la réponse existante
        await EventRSVP.update(existingRSVP.id, {
          response,
          comment,
          response_date: new Date().toISOString()
        });
      } else {
        // Créer une nouvelle réponse
        await EventRSVP.create({
          event_id: eventId,
          employee_id: currentEmployee.id,
          response,
          comment,
          response_date: new Date().toISOString()
        });
      }
      
      console.log('✅ RSVP submitted');
      
      const responseLabels = {
        attending: "présence confirmée",
        not_attending: "absence confirmée", 
        maybe: "présence incertaine"
      };
      
      toast({
        title: "✅ Réponse enregistrée",
        description: `Votre ${responseLabels[response]} a été enregistrée.`
      });
      
      // Recharger les statuts RSVP
      if (currentEmployee) {
        await loadRSVPStatuses(currentEmployee.id, events);
      }
      
    } catch (error) {
      console.error('❌ Error submitting RSVP:', error);
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer votre réponse: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const createEventNotifications = async (event) => {
    try {
      console.log('🔔 Creating event notifications...');
      
      let targetEmployees = [];
      
      // Déterminer les employés à notifier
      if (event.target_audience === 'all') {
        targetEmployees = employees;
      } else if (event.target_audience === 'department_specific' && event.department_filter) {
        targetEmployees = employees.filter(emp => emp.department === event.department_filter);
      } else if (event.target_audience === 'individual' && event.target_employee_id) {
        const targetEmployee = employees.find(emp => emp.id === event.target_employee_id);
        if (targetEmployee) {
          targetEmployees = [targetEmployee];
        }
      }
      
      // Créer les notifications
      const notificationPromises = targetEmployees.map(employee => {
        const eventDate = format(parseISO(event.event_date), 'dd/MM/yyyy', { locale: fr });
        
        return Notification.create({
          user_id: employee.id,
          title: `📅 Nouvel Événement: ${event.title}`,
          message: `Un événement est prévu pour le ${eventDate}${event.event_time ? ` à ${event.event_time}` : ''}${event.location ? ` - ${event.location}` : ''}`,
          type: "event_reminder",
          link_to: `/events?event=${event.id}`,
          metadata: JSON.stringify({
            event_id: event.id,
            event_type: event.event_type,
            event_date: event.event_date,
            creator_name: currentEmployee ? `${currentEmployee.first_name} ${currentEmployee.last_name}` : 'Système'
          })
        }).catch(err => {
          console.warn(`Failed to create notification for employee ${employee.id}:`, err);
        });
      });
      
      await Promise.all(notificationPromises);
      console.log(`✅ Created notifications for ${targetEmployees.length} employees`);
      
    } catch (error) {
      console.error('❌ Error creating event notifications:', error);
    }
  };

  // Filtrage des événements
  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
      
      return matchesSearch && matchesType;
    });
  };

  // Catégorisation des événements
  const categorizeEvents = (eventsList) => {
    const now = new Date();
    const today = [];
    const upcoming = [];
    const past = [];

    eventsList.forEach(event => {
      const eventDate = parseISO(event.event_date);
      
      if (isToday(eventDate)) {
        today.push(event);
      } else if (eventDate > now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    });

    return { today, upcoming, past };
  };

  const filteredEvents = getFilteredEvents();
  const { today: todayEvents, upcoming: upcomingEvents, past: pastEvents } = categorizeEvents(filteredEvents);

  // Interface de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chargement des événements
          </h3>
          <p className="text-gray-600">
            Récupération des données en cours...
          </p>
        </div>
      </div>
    );
  }

  // Interface d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-6 h-6" />
              Erreur de chargement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={initializeEvents} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Recharger la page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📅 {t('events.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez tous les événements de l'entreprise
          </p>
          {currentEmployee && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {currentEmployee.first_name} {currentEmployee.last_name}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {currentEmployee.department}
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refreshEvents}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          
          {(currentUser?.role === 'admin' || currentEmployee) && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('events.createEvent')}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications d'événements */}
      <EventNotifications events={upcomingEvents.concat(todayEvents)} />

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="birthday">Anniversaires</SelectItem>
                    <SelectItem value="anniversary">Anniversaires de travail</SelectItem>
                    <SelectItem value="meeting">Réunions</SelectItem>
                    <SelectItem value="training">Formations</SelectItem>
                    <SelectItem value="celebration">Célébrations</SelectItem>
                    <SelectItem value="holiday">Vacances</SelectItem>
                    <SelectItem value="deadline">Échéances</SelectItem>
                    <SelectItem value="other">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">
                {filteredEvents.length} événement{filteredEvents.length !== 1 ? 's' : ''}
              </Badge>
              {todayEvents.length > 0 && (
                <Badge className="bg-red-100 text-red-800">
                  {todayEvents.length} aujourd'hui
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface des événements */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Liste
          </TabsTrigger>
        </TabsList>

        {/* Vue Calendrier */}
        <TabsContent value="calendar">
          <EventCalendar
            events={filteredEvents}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setShowDetailsModal(true);
            }}
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
        </TabsContent>

        {/* Vue Liste */}
        <TabsContent value="list" className="space-y-6">
          {/* Événements d'aujourd'hui */}
          {todayEvents.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Bell className="w-5 h-5" />
                  Aujourd'hui ({todayEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {todayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      rsvpStatus={rsvpStatuses[event.id]}
                      currentEmployee={currentEmployee}
                      currentUser={currentUser}
                      onView={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      onEdit={() => {
                        setSelectedEvent(event);
                        setShowEditModal(true);
                      }}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onRSVP={handleRSVP}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Événements à venir */}
          {upcomingEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calendar className="w-5 h-5" />
                  À venir ({upcomingEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {upcomingEvents.slice(0, 10).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      rsvpStatus={rsvpStatuses[event.id]}
                      currentEmployee={currentEmployee}
                      currentUser={currentUser}
                      onView={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      onEdit={() => {
                        setSelectedEvent(event);
                        setShowEditModal(true);
                      }}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onRSVP={handleRSVP}
                    />
                  ))}
                </div>
                {upcomingEvents.length > 10 && (
                  <div className="text-center mt-4">
                    <Button variant="outline">
                      Voir {upcomingEvents.length - 10} autres événements
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Événements passés */}
          {pastEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  Passés ({pastEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {pastEvents.slice(0, 5).map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      rsvpStatus={rsvpStatuses[event.id]}
                      currentEmployee={currentEmployee}
                      currentUser={currentUser}
                      isPast={true}
                      onView={() => {
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                      }}
                      onEdit={() => {
                        setSelectedEvent(event);
                        setShowEditModal(true);
                      }}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onRSVP={handleRSVP}
                    />
                  ))}
                </div>
                {pastEvents.length > 5 && (
                  <div className="text-center mt-4">
                    <Button variant="outline">
                      Voir {pastEvents.length - 5} autres événements passés
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aucun événement */}
          {filteredEvents.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('events.noEvents')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || eventTypeFilter !== 'all' 
                    ? 'Aucun événement ne correspond à vos critères de recherche.'
                    : 'Aucun événement programmé pour le moment.'
                  }
                </p>
                {(currentUser?.role === 'admin' || currentEmployee) && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer le premier événement
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modales */}
      {showCreateModal && (
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
          employees={employees}
          currentEmployee={currentEmployee}
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          rsvpStatus={rsvpStatuses[selectedEvent.id]}
          employees={employees}
          currentEmployee={currentEmployee}
          currentUser={currentUser}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditModal(true);
          }}
          onDelete={() => handleDeleteEvent(selectedEvent.id)}
          onRSVP={handleRSVP}
        />
      )}

      {showEditModal && selectedEvent && (
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onSubmit={(eventData) => handleUpdateEvent(selectedEvent.id, eventData)}
          employees={employees}
          currentEmployee={currentEmployee}
        />
      )}
    </div>
  );
}

// Composant EventCard pour afficher un événement
function EventCard({ 
  event, 
  rsvpStatus, 
  currentEmployee, 
  currentUser,
  isPast = false,
  onView, 
  onEdit, 
  onDelete, 
  onRSVP 
}) {
  const eventDate = parseISO(event.event_date);
  const isToday = isToday(eventDate);
  const isTomorrow = isTomorrow(eventDate);
  
  const canEdit = currentUser?.role === 'admin' || 
                 (currentEmployee && event.created_by === currentEmployee.id);

  const eventTypeColors = {
    birthday: 'bg-pink-100 text-pink-800 border-pink-300',
    anniversary: 'bg-purple-100 text-purple-800 border-purple-300',
    meeting: 'bg-blue-100 text-blue-800 border-blue-300',
    training: 'bg-green-100 text-green-800 border-green-300',
    celebration: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    holiday: 'bg-orange-100 text-orange-800 border-orange-300',
    deadline: 'bg-red-100 text-red-800 border-red-300',
    other: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const priorityColors = {
    low: 'text-green-600',
    normal: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 hover:shadow-md transition-all ${
        isPast ? 'opacity-75 bg-gray-50' : 'bg-white'
      } ${isToday ? 'border-red-300 bg-red-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {event.title}
            </h3>
            <Badge className={eventTypeColors[event.event_type] || eventTypeColors.other}>
              {event.event_type}
            </Badge>
            {event.priority !== 'normal' && (
              <Badge variant="outline" className={`border-current ${priorityColors[event.priority]}`}>
                {event.priority}
              </Badge>
            )}
          </div>
          
          {event.description && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {format(eventDate, 'dd/MM/yyyy', { locale: fr })}
                {isToday && <span className="text-red-600 font-medium ml-1">(Aujourd'hui)</span>}
                {isTomorrow && <span className="text-orange-600 font-medium ml-1">(Demain)</span>}
              </span>
            </div>
            
            {event.event_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{event.event_time}</span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>
                {event.target_audience === 'all' ? 'Tous' :
                 event.target_audience === 'department_specific' ? event.department_filter :
                 'Individuel'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* RSVP Section */}
      {event.rsvp_required && currentEmployee && !isPast && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Votre réponse:
            </span>
            
            {rsvpStatus ? (
              <div className="flex items-center gap-2">
                <Badge 
                  className={
                    rsvpStatus.response === 'attending' ? 'bg-green-100 text-green-800' :
                    rsvpStatus.response === 'not_attending' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }
                >
                  {rsvpStatus.response === 'attending' ? '✅ Je participe' :
                   rsvpStatus.response === 'not_attending' ? '❌ Je ne participe pas' :
                   '❓ Peut-être'}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event.id, rsvpStatus.response === 'attending' ? 'not_attending' : 'attending')}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event.id, 'attending')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Oui
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event.id, 'maybe')}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  ❓ Peut-être
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRSVP(event.id, 'not_attending')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Non
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}