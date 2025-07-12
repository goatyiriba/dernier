
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter, 
  Eye,
  Clock,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import UserStatusIndicator from './UserStatusIndicator';
import ActivityHistoryModal from './ActivityHistoryModal';
import { getTeamStatus } from '@/api/functions';

export default function TeamStatusPanel() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadTeamStatus();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(() => {
      loadTeamStatus();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const loadTeamStatus = async () => {
    try {
      const { data } = await getTeamStatus();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('❌ Erreur chargement statuts équipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.real_time_status === statusFilter);
    }

    // Trier par statut puis par nom
    filtered.sort((a, b) => {
      const statusOrder = { online: 0, active: 1, idle: 2, away: 3, offline: 4 };
      const statusDiff = statusOrder[a.real_time_status] - statusOrder[b.real_time_status];
      if (statusDiff !== 0) return statusDiff;
      
      return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
    });

    setFilteredEmployees(filtered);
  };

  const getStatusCounts = () => {
    const counts = {
      online: 0,
      active: 0,
      idle: 0,
      away: 0,
      offline: 0,
      total: employees.length
    };

    employees.forEach(emp => {
      counts[emp.real_time_status] = (counts[emp.real_time_status] || 0) + 1;
    });

    return counts;
  };

  const getLastSeenText = (employee) => {
    if (!employee.seconds_since_activity) return 'Jamais vu';
    
    const seconds = employee.seconds_since_activity;
    if (seconds < 60) return 'Il y a moins d\'une minute';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return `Il y a ${Math.floor(seconds / 86400)}j`;
  };

  const handleViewHistory = (employee) => {
    setSelectedEmployee(employee);
    setShowHistoryModal(true);
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Statut de l'Équipe
              <Badge variant="outline" className="ml-2">
                {statusCounts.total} employés
              </Badge>
            </CardTitle>
            <div className="text-sm text-gray-500">
              Mis à jour: {format(lastUpdate, 'HH:mm:ss')}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Statistiques de statut */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{statusCounts.online}</div>
              <div className="text-sm text-green-700">En ligne</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.idle}</div>
              <div className="text-sm text-yellow-700">Inactif</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{statusCounts.away}</div>
              <div className="text-sm text-orange-700">Absent</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{statusCounts.offline}</div>
              <div className="text-sm text-gray-700">Hors ligne</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((statusCounts.online / statusCounts.total) * 100) || 0}%
              </div>
              <div className="text-sm text-blue-700">Disponibilité</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="online">En ligne</option>
              <option value="idle">Inactif</option>
              <option value="away">Absent</option>
              <option value="offline">Hors ligne</option>
            </select>
          </div>

          {/* Liste des employés */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredEmployees.map((employee) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={employee.profile_picture} />
                        <AvatarFallback>
                          {employee.first_name?.[0]}{employee.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">
                        <UserStatusIndicator 
                          status={employee.real_time_status}
                          lastActivity={employee.last_activity_formatted}
                          size="md"
                          showTooltip={true}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{employee.position}</span>
                        <span>•</span>
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getLastSeenText(employee)}
                        </div>
                        {employee.is_mobile && (
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            Mobile
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <UserStatusIndicator 
                      status={employee.real_time_status}
                      lastActivity={employee.last_activity_formatted}
                      showLabel={true}
                      showTooltip={false}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewHistory(employee)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucun employé trouvé</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal d'historique d'activité */}
      {showHistoryModal && selectedEmployee && (
        <ActivityHistoryModal
          employee={selectedEmployee}
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </>
  );
}
