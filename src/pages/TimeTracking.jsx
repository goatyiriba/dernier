import React, { useState, useEffect } from "react";
import { TimeEntry, Employee } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Calendar, 
  User, 
  Search,
  AlertCircle,
  CheckCircle,
  Download,
  MapPin,
  Activity,
  TrendingUp,
  Users,
  Filter,
  Globe,
  Settings,
  LogOut,
  Play,
  Square,
  RotateCcw,
  Timer,
  Zap,
  Target,
  Award,
  Eye,
  Edit,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Wifi,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import TimeEntryCard from "../components/time/TimeEntryCard";
import AdminCheckoutModal from "../components/time/AdminCheckoutModal";
import TimeSettingsModal from "../components/time/TimeSettingsModal";

export default function TimeTracking() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [timeSettings, setTimeSettings] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEntryForCheckout, setSelectedEntryForCheckout] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    loadTimeSettings();
    const intervalId = setInterval(loadData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const loadData = async () => {
    try {
      const [timeData, employeeData] = await Promise.all([
        TimeEntry.list("-created_date"),
        Employee.list()
      ]);
      
      setTimeEntries(timeData);
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error loading time tracking data:", error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données de pointage",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimeSettings = async () => {
    try {
      const settings = await TimeSettings.list();
      if (settings.length > 0) {
        setTimeSettings(settings[0]);
      } else {
        const defaultSettings = await TimeSettings.create({
          check_in_start: "07:00",
          check_in_end: "10:00",
          check_out_start: "16:00",
          check_out_end: "20:00",
          allow_early_checkin: false,
          allow_late_checkout: false,
          require_location: true,
          max_work_hours: 10,
          break_duration_limit: 120,
          is_active: true
        });
        setTimeSettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading time settings:", error);
    }
  };

  const handleAdminCheckout = (entry) => {
    setSelectedEntryForCheckout(entry);
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (checkoutData) => {
    if (!selectedEntryForCheckout) return;

    try {
      const checkoutTime = checkoutData.checkout_time;
      const checkinTime = selectedEntryForCheckout.check_in_time;
      
      const checkin = new Date(`${selectedEntryForCheckout.date}T${checkinTime}`);
      const checkout = new Date(`${selectedEntryForCheckout.date}T${checkoutTime}`);
      const hoursWorked = (checkout - checkin) / (1000 * 60 * 60);

      const updateData = {
        check_out_time: checkoutTime,
        status: 'checked_out',
        hours_worked: Math.round(hoursWorked * 100) / 100,
        checkout_address: checkoutData.address || 'Défini par admin',
        checkout_device_info: 'Admin checkout',
        checkout_ip_address: 'Admin',
        notes: (selectedEntryForCheckout.notes || '') + 
               `\n[ADMIN CHECKOUT] Pointage de sortie défini par un administrateur le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}.` +
               (checkoutData.notes ? ` Note: ${checkoutData.notes}` : '')
      };

      await TimeEntry.update(selectedEntryForCheckout.id, updateData);
      
      setShowCheckoutModal(false);
      setSelectedEntryForCheckout(null);
      loadData();

      toast({
        title: "✅ Pointage de sortie défini",
        description: `Sortie enregistrée à ${checkoutTime} pour ${getEmployeeName(selectedEntryForCheckout.employee_id)}`,
        duration: 4000,
      });

    } catch (error) {
      console.error("Erreur lors du checkout admin:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de définir le pointage de sortie",
        variant: "destructive"
      });
    }
  };

  const handleResetTimeEntry = async (entryId, employeeName) => {
    try {
      const entry = timeEntries.find(e => e.id === entryId);
      if (!entry) {
        toast({
          title: "❌ Erreur",
          description: "Entrée de temps introuvable.",
          variant: "destructive"
        });
        return;
      }

      await TimeEntry.update(entryId, {
        check_out_time: null,
        status: 'checked_in',
        hours_worked: null,
        checkout_address: null,
        checkout_device_info: null,
        checkout_ip_address: null,
        notes: (entry.notes ? entry.notes + '\n' : '') + 
               `[RESET] Pointage réinitialisé le ${format(new Date(), 'dd/MM/yyyy à HH:mm')} par un administrateur.`
      });

      loadData();

      toast({
        title: "✅ Pointage réinitialisé",
        description: `${employeeName} peut maintenant pointer à nouveau sa sortie.`,
        duration: 4000,
      });

    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de réinitialiser le pointage",
        variant: "destructive"
      });
    }
  };

  const handleCompleteReset = async (entryId, employeeName) => {
    try {
      const entry = timeEntries.find(e => e.id === entryId);
      if (!entry) {
        toast({
          title: "❌ Erreur",
          description: "Entrée de temps introuvable.",
          variant: "destructive"
        });
        return;
      }

      const confirmed = window.confirm(
        `Êtes-vous sûr de vouloir supprimer complètement le pointage de ${employeeName} ? Cette action est irréversible.`
      );

      if (!confirmed) return;

      await TimeEntry.delete(entryId);

      loadData();

      toast({
        title: "✅ Pointage supprimé complètement",
        description: `${employeeName} peut maintenant créer un nouveau pointage pour aujourd'hui.`,
        duration: 4000,
      });

    } catch (error) {
      console.error("Erreur lors de la réinitialisation complète:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de supprimer complètement le pointage",
        variant: "destructive"
      });
    }
  };

  const handleSettingsUpdate = async (newSettings) => {
    try {
      if (timeSettings?.id) {
        await TimeSettings.update(timeSettings.id, newSettings);
      } else {
        await TimeSettings.create(newSettings);
      }
      
      await loadTimeSettings();
      setShowSettingsModal(false);
      
      toast({
        title: "✅ Paramètres mis à jour",
        description: "Les règles de pointage ont été mises à jour",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erreur mise à jour paramètres:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  };

  const onRefresh = () => {
    loadData();
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Employé inconnu";
  };

  const getLocationStats = () => {
    const locations = {};
    timeEntries.forEach(entry => {
      if (entry.date === selectedDate) {
        const location = entry.address || 'Non défini';
        const isRemote = entry.ip_address && !entry.ip_address.startsWith('192.168');
        const locationType = isRemote ? 'Télétravail' : 'Bureau';
        
        if (!locations[locationType]) {
          locations[locationType] = 0;
        }
        locations[locationType]++;
      }
    });
    return locations;
  };

  const filteredEntries = timeEntries.filter(entry => {
    const employeeName = getEmployeeName(entry.employee_id);
    const isRemote = entry.ip_address && !entry.ip_address.startsWith('192.168');
    const locationType = isRemote ? 'remote' : 'office';
    
    const matchesSearch = searchTerm === "" || 
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = selectedDate === "" || entry.date === selectedDate;
    const matchesStatus = selectedStatus === "all" || entry.status === selectedStatus;
    const matchesEmployee = selectedEmployee === "all" || entry.employee_id === selectedEmployee;
    const matchesLocation = selectedLocation === "all" || 
      (selectedLocation === "remote" && isRemote) ||
      (selectedLocation === "office" && !isRemote);
    
    return matchesSearch && matchesDate && matchesStatus && matchesEmployee && matchesLocation;
  });

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return getEmployeeName(a.employee_id).localeCompare(getEmployeeName(b.employee_id));
      case "status":
        const statusOrder = { 'checked_in': 0, 'on_break': 1, 'checked_out': 2, 'incomplete': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      case "location":
        const aRemote = a.ip_address && !a.ip_address.startsWith('192.168');
        const bRemote = b.ip_address && !b.ip_address.startsWith('192.168');
        return aRemote === bRemote ? 0 : aRemote ? 1 : -1;
      default:
        return new Date(b.created_date || b.date) - new Date(a.created_date || a.date);
    }
  });

  const todayEntries = timeEntries.filter(entry => entry.date === format(new Date(), 'yyyy-MM-dd'));
  const incompleteEntries = timeEntries.filter(entry => entry.status === "incomplete");
  const locationStats = getLocationStats();
  
  const stats = {
    totalToday: todayEntries.length,
    checkedIn: todayEntries.filter(e => e.status === "checked_in").length,
    checkedOut: todayEntries.filter(e => e.status === "checked_out").length,
    onBreak: todayEntries.filter(e => e.status === "on_break").length,
    incomplete: incompleteEntries.length,
    remoteWork: Object.keys(locationStats).includes('Télétravail') ? locationStats['Télétravail'] : 0,
    officeWork: Object.keys(locationStats).includes('Bureau') ? locationStats['Bureau'] : 0,
    activeEmployees: employees.filter(e => e.status === "Active").length,
    attendanceRate: employees.length > 0 ? Math.round((todayEntries.length / employees.length) * 100) : 0
  };

  const StatsCard = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onClick={onClick}
      className={`cursor-pointer relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-0 group ${onClick ? 'hover:border-blue-200' : ''}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
        color === 'blue' ? 'from-blue-400 to-blue-600' :
        color === 'green' ? 'from-green-400 to-emerald-600' :
        color === 'amber' ? 'from-amber-400 to-orange-600' :
        color === 'purple' ? 'from-purple-400 to-purple-600' :
        color === 'red' ? 'from-red-400 to-red-600' :
        'from-gray-400 to-gray-600'
      }`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
            color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200' :
            color === 'green' ? 'bg-gradient-to-br from-green-100 to-emerald-200' :
            color === 'amber' ? 'bg-gradient-to-br from-amber-100 to-orange-200' :
            color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200' :
            color === 'red' ? 'bg-gradient-to-br from-red-100 to-red-200' :
            'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}>
            <Icon className={`w-7 h-7 ${
              color === 'blue' ? 'text-blue-600' :
              color === 'green' ? 'text-green-600' :
              color === 'amber' ? 'text-amber-600' :
              color === 'purple' ? 'text-purple-600' :
              color === 'red' ? 'text-red-600' :
              'text-gray-600'
            }`} />
          </div>
          
          {trend && (
            <Badge className={`px-2 py-1 text-xs font-medium ${
              trend.type === 'up' ? 'bg-green-100 text-green-700' :
              trend.type === 'down' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {trend.value}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 font-medium">Chargement du suivi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
        
        {/* Header Hero intelligent */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-8 lg:p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                    Suivi du Temps
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    Gestion intelligente des pointages avec contrôles avancés
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.checkedIn}</div>
                  <div className="text-sm text-blue-100">En cours</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                  <div className="text-sm text-blue-100">Présence</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.remoteWork}</div>
                  <div className="text-sm text-blue-100">Télétravail</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{stats.incomplete}</div>
                  <div className="text-sm text-blue-100">À corriger</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 xl:flex-col items-center xl:items-end">
              <div className="text-right">
                <p className="text-3xl font-bold">{format(new Date(), "HH:mm")}</p>
                <p className="text-blue-200">{format(new Date(), "dd MMMM yyyy")}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowSettingsModal(true)}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </Button>
                
                <Button
                  onClick={onRefresh}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Actualiser
                </Button>
              </div>
              
              {timeSettings && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Règles actives</span>
                  </div>
                  <div className="space-y-1 text-xs text-blue-100">
                    <div>Pointage: {timeSettings.check_in_start} - {timeSettings.check_in_end}</div>
                    <div>Sortie: {timeSettings.check_out_start} - {timeSettings.check_out_end}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Statistiques avancées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <StatsCard
            title="Total Aujourd'hui"
            value={stats.totalToday}
            subtitle="pointages"
            icon={Calendar}
            color="blue"
            trend={{ type: 'up', value: '+12%' }}
          />
          
          <StatsCard
            title="En Cours"
            value={stats.checkedIn}
            subtitle="actifs"
            icon={Play}
            color="green"
            trend={{ type: 'stable', value: 'Stable' }}
          />
          
          <StatsCard
            title="Terminés"
            value={stats.checkedOut}
            subtitle="journées"
            icon={CheckCircle}
            color="blue"
          />
          
          <StatsCard
            title="En Pause"
            value={stats.onBreak}
            subtitle="employés"
            icon={Timer}
            color="amber"
          />
          
          <StatsCard
            title="À Corriger"
            value={stats.incomplete}
            subtitle="entrées"
            icon={AlertCircle}
            color="red"
            onClick={() => setSelectedStatus("incomplete")}
          />
          
          <StatsCard
            title="Télétravail"
            value={stats.remoteWork}
            subtitle="employés"
            icon={Globe}
            color="purple"
            onClick={() => setSelectedLocation("remote")}
          />
        </div>

        {/* Filtres avancés */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-indigo-600" />
                Filtres Intelligents
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  {filteredEntries.length} résultats
                </Badge>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Vue:</Label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { value: 'grid', icon: Activity, label: 'Grille' },
                    { value: 'list', icon: Users, label: 'Liste' },
                    { value: 'timeline', icon: Clock, label: 'Timeline' }
                  ].map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value)}
                      className={`px-3 py-2 rounded-md flex items-center gap-2 text-sm transition-all ${
                        viewMode === mode.value 
                          ? 'bg-white shadow-sm text-indigo-600 font-medium' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span className="hidden sm:block">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher employé, lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-white/80 border-gray-200 focus:border-indigo-300 transition-colors"
                />
              </div>
              
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12 bg-white/80 border-gray-200 focus:border-indigo-300"
              />
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-12 bg-white/80 border-gray-200">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="checked_in">🟢 En cours</SelectItem>
                  <SelectItem value="checked_out">🔵 Terminé</SelectItem>
                  <SelectItem value="on_break">🟡 En pause</SelectItem>
                  <SelectItem value="incomplete">🔴 Incomplet</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-12 bg-white/80 border-gray-200">
                  <SelectValue placeholder="Employé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les employés</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 bg-white/80 border-gray-200">
                  <SelectValue placeholder="Localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les localisations</SelectItem>
                  <SelectItem value="office">🏢 Bureau</SelectItem>
                  <SelectItem value="remote">🏠 Télétravail</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 bg-white/80 border-gray-200">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                  <SelectItem value="status">Statut</SelectItem>
                  <SelectItem value="location">Localisation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                setSelectedStatus("all");
                setSelectedEmployee("all");
                setSelectedLocation("all");
                setSortBy("recent");
              }}
              className="h-10"
            >
              <X className="w-4 h-4 mr-2" />
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>

        {/* Affichage des pointages */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Pointages Récents
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 bg-white/80 px-3 py-2 rounded-lg">
                💡 Fonctions admin: Checkout manuel, Réinitialisation, Reset complet
              </div>
            </div>
          </div>
          
          <div className={`${
            viewMode === 'grid' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' :
            viewMode === 'list' ? 'space-y-4' :
            'space-y-2'
          }`}>
            <AnimatePresence mode="wait">
              {sortedEntries.length > 0 ? (
                sortedEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TimeEntryCard
                      entry={entry}
                      employeeName={getEmployeeName(entry.employee_id)}
                      onResetTimeEntry={handleResetTimeEntry}
                      onAdminCheckout={handleAdminCheckout}
                      onCompleteReset={handleCompleteReset}
                      viewMode={viewMode}
                      timeSettings={timeSettings}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 bg-white/50 rounded-2xl"
                >
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Aucun pointage trouvé
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Modifiez vos filtres pour voir plus de résultats
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("all");
                      setSelectedEmployee("all");
                      setSelectedLocation("all");
                    }}
                    variant="outline"
                  >
                    Réinitialiser les filtres
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de checkout administrateur */}
      <AdminCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => {
          setShowCheckoutModal(false);
          setSelectedEntryForCheckout(null);
        }}
        onSubmit={handleCheckoutSubmit}
        entry={selectedEntryForCheckout}
        employeeName={selectedEntryForCheckout ? getEmployeeName(selectedEntryForCheckout.employee_id) : ""}
      />

      {/* Modal des paramètres de temps */}
      <TimeSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSubmit={handleSettingsUpdate}
        settings={timeSettings}
      />
    </div>
  );
}