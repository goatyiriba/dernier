import React, { useState, useEffect } from 'react';
import { CollaborativeEvent, CollaborationInvitation, Employee, User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Filter,
  Search,
  Download,
  Eye,
  MessageCircle,
  Target,
  Award,
  Zap
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function AdminCalendarTracking() {
  const [events, setEvents] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('30'); // jours
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, dateRange, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, invitationsData, employeesData] = await Promise.all([
        CollaborativeEvent.list('-created_date'),
        CollaborationInvitation.list('-created_date'),
        Employee.list()
      ]);

      setEvents(eventsData);
      setInvitations(invitationsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('❌ Erreur chargement données admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = subDays(new Date(), days);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.created_date);
        return eventDate >= cutoffDate;
      });
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Inconnu';
  };

  const getEmployeeAvatar = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee;
  };

  // Statistiques
  const stats = {
    totalEvents: events.length,
    activeEvents: events.filter(e => e.status === 'in_progress').length,
    completedEvents: events.filter(e => e.status === 'completed').length,
    pendingInvitations: invitations.filter(i => i.status === 'sent').length,
    totalCollaborations: events.reduce((sum, event) => sum + (event.collaborators?.length || 0), 0),
    averageCollaborators: events.length > 0 ? 
      events.reduce((sum, event) => sum + (event.collaborators?.length || 0), 0) / events.length : 0
  };

  // Données pour les graphiques
  const eventsByMonth = events.reduce((acc, event) => {
    const month = format(new Date(event.created_date), 'MMM yyyy', { locale: fr });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const eventsByStatus = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {});

  const collaborationData = Object.entries(eventsByMonth).map(([month, count]) => ({
    month,
    events: count
  }));

  const statusData = Object.entries(eventsByStatus).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Top collaborateurs
  const topCollaborators = employees.map(employee => {
    const collaborationCount = events.filter(event => 
      event.collaborators?.includes(employee.id) || event.created_by === employee.id
    ).length;
    return {
      ...employee,
      collaborationCount
    };
  }).sort((a, b) => b.collaborationCount - a.collaborationCount).slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Suivi des Collaborations
          </h1>
          <p className="text-gray-600 mt-1">
            Tableau de bord administrateur pour le calendrier collaboratif
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          <Button onClick={loadData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">3 derniers mois</option>
                <option value="all">Toutes les dates</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="accepted">Accepté</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalEvents}</div>
                <div className="text-sm text-gray-600">Événements totaux</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.activeEvents}</div>
                <div className="text-sm text-gray-600">En cours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingInvitations}</div>
                <div className="text-sm text-gray-600">Invitations en attente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCollaborations}</div>
                <div className="text-sm text-gray-600">Collaborations totales</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Collaborations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={collaborationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Collaborateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Collaborateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCollaborators.map((employee, index) => (
              <div key={employee.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-500 w-8">
                  #{index + 1}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={employee.profile_picture} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700">
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {employee.department} • {employee.position}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">
                    {employee.collaborationCount}
                  </div>
                  <div className="text-sm text-gray-600">collaborations</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Événements récents */}
      <Card>
        <CardHeader>
          <CardTitle>Événements Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.slice(0, 10).map((event) => {
              const creator = getEmployeeAvatar(event.created_by);
              return (
                <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={creator?.profile_picture} />
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {creator?.first_name?.[0]}{creator?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      Par {getEmployeeName(event.created_by)} • {' '}
                      {format(new Date(event.start_date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {event.collaborators?.length || 0} collaborateurs
                    </Badge>
                    <Badge className={
                      event.status === 'completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}