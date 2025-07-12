
import React, { useState, useEffect, useMemo } from "react";
import { Employee, User, Notification, EmployeePoints, Leaderboard } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  MapPin,
  Clock,
  Mail,
  Phone,
  Calendar,
  Activity,
  RefreshCw,
  AlertTriangle,
  Building2,
  User as UserIcon,
  Video,
  Target, // New: For Gamification points icon
  Star,   // New: For Gamification level icon
  Award,  // New: For Gamification badges icon
  Flame   // New: For Gamification streak icon
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

import RequestMeetingModal from "../components/team/RequestMeetingModal";
import AttendanceHeatmap from "../components/team/AttendanceHeatmap";

export default function MyTeamPage() {
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedEmployeeForMeeting, setSelectedEmployeeForMeeting] = useState(null);
  const { toast } = useToast();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);
  const [lastApiCall, setLastApiCall] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New state variables for gamification
  const [employeePoints, setEmployeePoints] = useState([]);
  const [employeeOfTheDay, setEmployeeOfTheDay] = useState(null);
  const [employeeOfTheWeek, setEmployeeOfTheWeek] = useState(null);

  // Helper function to fetch and enrich data from Employee and User models
  const _fetchAndEnrichData = async () => {
    let employeeData = [];
    let allUsers = [];
    let currentUserData = null;

    try {
      // Récupérer l'utilisateur actuel
      currentUserData = await User.me();
      setCurrentUser(currentUserData);
      console.log('👤 Utilisateur actuel:', currentUserData);
    } catch (userError) {
      console.error("Error fetching current user:", userError);
    }

    try {
      employeeData = await Employee.list("-created_date");
      // Validation que employeeData est bien un tableau
      if (!Array.isArray(employeeData)) {
        console.error('❌ Employee.list() ne retourne pas un tableau:', employeeData);
        employeeData = [];
      }
    } catch (empError) {
      console.error("Error fetching employees in _fetchAndEnrichData:", empError);
      employeeData = [];
      throw empError;
    }

    try {
      allUsers = await User.list();
      // Validation que allUsers est bien un tableau
      if (!Array.isArray(allUsers)) {
        console.error('❌ User.list() ne retourne pas un tableau:', allUsers);
        allUsers = [];
      }
    } catch (userError) {
      console.warn("Could not fetch users for enrichment (might be empty):", userError);
      allUsers = [];
    }

    // Enrich employees with user data for last_activity
    const enrichedEmployeeData = employeeData.map(employee => {
      let user = allUsers.find(u => u.employee_id === employee.employee_id);
      if (!user) {
        user = allUsers.find(u => u.email === employee.email);
      }
      
      // We still mark the current user for UI purposes, but last_activity will come from backend for everyone
      const isCurrentUser = currentUserData && (
        employee.email === currentUserData.email || 
        (currentUserData.employee_id && employee.employee_id === currentUserData.employee_id) ||
        (employee.id === currentUserData.employee_id)
      );
      
      return {
        ...employee,
        last_activity: user?.last_login || user?.last_activity, // Default from user if not real-time
        user_status: user?.is_active ? 'active' : 'inactive',
        is_current_user: isCurrentUser
      };
    });

    return { enrichedEmployeeData, allUsers };
  };

  // New helper function to fetch gamification data
  const _fetchGamificationData = async () => {
    let points = [];
    let empDay = null;
    let empWeek = null;

    try {
      points = await EmployeePoints.list();
      if (!Array.isArray(points)) {
        console.error('❌ EmployeePoints.list() did not return an array:', points);
        points = [];
      }
    } catch (pointsError) {
      console.warn("Could not fetch employee points:", pointsError);
      points = [];
    }

    try {
      empDay = await Leaderboard.employeeOfTheDay();
    } catch (dayError) {
      console.warn("Could not fetch Employee of the Day:", dayError);
      empDay = null;
    }

    try {
      empWeek = await Leaderboard.employeeOfTheWeek();
    } catch (weekError) {
      console.warn("Could not fetch Employee of the Week:", weekError);
      empWeek = null;
    }
    
    return { points, empDay, empWeek };
  };

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading initial employee data...');
      const { enrichedEmployeeData, allUsers } = await _fetchAndEnrichData();
      const { points, empDay, empWeek } = await _fetchGamificationData(); // Fetch gamification data

      // Validation finale avant setState
      const validEmployeeData = Array.isArray(enrichedEmployeeData) ? enrichedEmployeeData : [];
      const validUsersData = Array.isArray(allUsers) ? allUsers : [];
      const validPointsData = Array.isArray(points) ? points : [];

      setEmployees(validEmployeeData);
      setUsers(validUsersData);
      setEmployeePoints(validPointsData); // Set gamification points
      setEmployeeOfTheDay(empDay); // Set employee of the day
      setEmployeeOfTheWeek(empWeek); // Set employee of the week
      setLastApiCall(Date.now());
      
      localStorage.setItem('employees_cache', JSON.stringify(validEmployeeData));
      localStorage.setItem('users_cache', JSON.stringify(validUsersData));
      localStorage.setItem('employee_points_cache', JSON.stringify(validPointsData)); // Cache points
      localStorage.setItem('employee_of_the_day_cache', JSON.stringify(empDay)); // Cache employee of the day
      localStorage.setItem('employee_of_the_week_cache', JSON.stringify(empWeek)); // Cache employee of the week
      localStorage.setItem('employees_cache_timestamp', Date.now().toString());
      
      console.log('📊 Initial employees, users, and gamification data loaded and cached:', {
        employees: validEmployeeData.length,
        users: validUsersData.length,
        points: validPointsData.length,
        employeeOfTheDay: empDay ? empDay.full_name : 'N/A',
        employeeOfTheWeek: empWeek ? empWeek.full_name : 'N/A'
      });

    } catch (error) {
      console.error('Erreur chargement employés:', error);
      const errorMessage = error.message || "Impossible de charger les données de l'équipe";

      if (errorMessage.includes('Rate limit') || error.response?.status === 429) {
        console.log('⚠️ Rate limit atteint, tentative de chargement depuis le cache');
        const cachedEmployees = localStorage.getItem('employees_cache');
        const cachedUsers = localStorage.getItem('users_cache');
        const cachedPoints = localStorage.getItem('employee_points_cache'); // Retrieve points cache
        const cachedEmpDay = localStorage.getItem('employee_of_the_day_cache'); // Retrieve emp day cache
        const cachedEmpWeek = localStorage.getItem('employee_of_the_week_cache'); // Retrieve emp week cache

        if (cachedEmployees && cachedUsers && cachedPoints && cachedEmpDay && cachedEmpWeek) { // Check if all necessary caches exist
          try {
            const parsedEmployees = JSON.parse(cachedEmployees);
            const parsedUsers = JSON.parse(cachedUsers);
            const parsedPoints = JSON.parse(cachedPoints);
            const parsedEmpDay = JSON.parse(cachedEmpDay);
            const parsedEmpWeek = JSON.parse(cachedEmpWeek);
            
            // Validation des données du cache
            setEmployees(Array.isArray(parsedEmployees) ? parsedEmployees : []);
            setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);
            setEmployeePoints(Array.isArray(parsedPoints) ? parsedPoints : []);
            setEmployeeOfTheDay(parsedEmpDay);
            setEmployeeOfTheWeek(parsedEmpWeek);

            console.log('📦 Données chargées depuis le cache en raison de la limite de débit.');
            toast({
              title: "Information",
              description: "Limite de débit API atteinte. Données chargées depuis le cache.",
              variant: "default"
            });
          } catch (parseError) {
            console.error('Erreur parsing cache:', parseError);
            setEmployees([]);
            setUsers([]);
            setEmployeePoints([]); // Clear points on parse error
            setEmployeeOfTheDay(null);
            setEmployeeOfTheWeek(null);
            setError("Erreur de cache et API indisponible");
          }
        } else {
          setEmployees([]);
          setUsers([]);
          setEmployeePoints([]); // Clear points if no cache
          setEmployeeOfTheDay(null);
          setEmployeeOfTheWeek(null);
          setError("Impossible de charger les données et aucun cache disponible. " + errorMessage);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données et aucun cache disponible.",
            variant: "destructive"
          });
        }
      } else if (errorMessage.includes('Network Error') || !navigator.onLine) {
        console.log('🌐 Problème réseau détecté, tentative de chargement depuis le cache');
        const cachedEmployees = localStorage.getItem('employees_cache');
        const cachedUsers = localStorage.getItem('users_cache');
        const cachedPoints = localStorage.getItem('employee_points_cache'); // Retrieve points cache
        const cachedEmpDay = localStorage.getItem('employee_of_the_day_cache'); // Retrieve emp day cache
        const cachedEmpWeek = localStorage.getItem('employee_of_the_week_cache'); // Retrieve emp week cache

        if (cachedEmployees && cachedUsers && cachedPoints && cachedEmpDay && cachedEmpWeek) {
          try {
            const parsedEmployees = JSON.parse(cachedEmployees);
            const parsedUsers = JSON.parse(cachedUsers);
            const parsedPoints = JSON.parse(cachedPoints);
            const parsedEmpDay = JSON.parse(cachedEmpDay);
            const parsedEmpWeek = JSON.parse(cachedEmpWeek);
            
            setEmployees(Array.isArray(parsedEmployees) ? parsedEmployees : []);
            setUsers(Array.isArray(parsedUsers) ? parsedUsers : []);
            setEmployeePoints(Array.isArray(parsedPoints) ? parsedPoints : []);
            setEmployeeOfTheDay(parsedEmpDay);
            setEmployeeOfTheWeek(parsedEmpWeek);

            console.log('📦 Données chargées depuis le cache en raison du problème réseau.');
            toast({
              title: "Mode hors ligne",
              description: "Problème de connexion détecté. Données chargées depuis le cache local.",
              variant: "default"
            });
          } catch (parseError) {
            console.error('Erreur parsing cache:', parseError);
            setEmployees([]);
            setUsers([]);
            setEmployeePoints([]);
            setEmployeeOfTheDay(null);
            setEmployeeOfTheWeek(null);
          }
        } else {
          setEmployees([]);
          setUsers([]);
          setEmployeePoints([]);
          setEmployeeOfTheDay(null);
          setEmployeeOfTheWeek(null);
          setError("Problème de connexion réseau et aucun cache disponible.");
          toast({
            title: "Erreur réseau",
            description: "Impossible de se connecter au serveur et aucun cache disponible.",
            variant: "destructive"
          });
        }
      } else {
        setEmployees([]);
        setUsers([]);
        setEmployeePoints([]);
        setEmployeeOfTheDay(null);
        setEmployeeOfTheWeek(null);
        setError(errorMessage);
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // CORRECTION: Fonction de rafraîchissement simplifiée avec meilleure gestion d'erreur
  const refreshEmployeeData = async () => {
    const now = Date.now();

    // Rate limiting
    if (now - lastApiCall < 30000) {
      console.log('🚫 Rate limiting - skip API call');
      return;
    }

    if (!navigator.onLine) {
      console.log('🌐 Offline - skip API call');
      return;
    }

    try {
      console.log('🔄 Refreshing employee data...');
      
      // CORRECTION: Appel direct à l'entité Employee au lieu des fonctions complexes
      const employeesData = await Employee.list("-updated_date");
      const usersData = await User.list();
      const { points, empDay, empWeek } = await _fetchGamificationData(); // Refresh gamification data
      
      if (Array.isArray(employeesData)) {
        console.log('📊 Employees data received:', employeesData.length);
        
        // Enrichir avec les données utilisateur
        const enrichedEmployees = employeesData.map(employee => {
          const user = usersData.find(u => 
            u.employee_id === employee.employee_id || 
            u.email === employee.email
          );
          
          const isCurrentUser = currentUser && (
            employee.email === currentUser.email || 
            employee.employee_id === currentUser.employee_id
          );
          
          return {
            ...employee,
            last_activity: user?.last_login || employee.last_activity || employee.updated_date,
            user_status: user?.is_active ? 'active' : 'inactive',
            is_current_user: isCurrentUser
          };
        });
        
        setEmployees(enrichedEmployees);
        setUsers(usersData);
        setEmployeePoints(Array.isArray(points) ? points : []); // Update points
        setEmployeeOfTheDay(empDay); // Update employee of the day
        setEmployeeOfTheWeek(empWeek); // Update employee of the week
        setLastApiCall(now);
        
        // Mettre en cache
        localStorage.setItem('employees_cache', JSON.stringify(enrichedEmployees));
        localStorage.setItem('users_cache', JSON.stringify(usersData));
        localStorage.setItem('employee_points_cache', JSON.stringify(Array.isArray(points) ? points : [])); // Cache points
        localStorage.setItem('employee_of_the_day_cache', JSON.stringify(empDay)); // Cache employee of the day
        localStorage.setItem('employee_of_the_week_cache', JSON.stringify(empWeek)); // Cache employee of the week
        localStorage.setItem('employees_cache_timestamp', now.toString());
        
        console.log('✅ Employee data refreshed successfully');
      }

    } catch (error) {
      console.error('❌ Employee data refresh error:', error.message);
      
      // Utiliser le cache en cas d'erreur
      try {
        const cachedEmployees = localStorage.getItem('employees_cache');
        const cachedUsers = localStorage.getItem('users_cache');
        const cachedPoints = localStorage.getItem('employee_points_cache');
        const cachedEmpDay = localStorage.getItem('employee_of_the_day_cache');
        const cachedEmpWeek = localStorage.getItem('employee_of_the_week_cache');
        
        if (cachedEmployees && cachedUsers && cachedPoints && cachedEmpDay && cachedEmpWeek) {
          setEmployees(JSON.parse(cachedEmployees));
          setUsers(JSON.parse(cachedUsers));
          setEmployeePoints(JSON.parse(cachedPoints));
          setEmployeeOfTheDay(JSON.parse(cachedEmpDay));
          setEmployeeOfTheWeek(JSON.parse(cachedEmpWeek));
          console.log('📦 Using cached data due to error');
        }
      } catch (cacheError) {
        console.error('❌ Cache fallback failed:', cacheError);
      }
    }
  };

  // Fonction optimisée pour le bouton de rafraîchissement
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('🔄 Rafraîchissement manuel déclenché');

      // Vérifier la connexion réseau
      if (!navigator.onLine) {
        toast({
          title: "Mode hors ligne",
          description: "Impossible de rafraîchir sans connexion internet.",
          variant: "destructive"
        });
        return;
      }

      // Vider le cache avant le rechargement pour garantir des données fraîches
      localStorage.removeItem('employees_cache');
      localStorage.removeItem('users_cache');
      localStorage.removeItem('employee_points_cache'); // Clear points cache
      localStorage.removeItem('employee_of_the_day_cache'); // Clear emp day cache
      localStorage.removeItem('employee_of_the_week_cache'); // Clear emp week cache
      localStorage.removeItem('employees_cache_timestamp');

      // Forcer le rechargement des données complètes
      const { enrichedEmployeeData, allUsers } = await _fetchAndEnrichData();
      const { points, empDay, empWeek } = await _fetchGamificationData(); // Re-fetch gamification data

      // Validation avant mise à jour des états
      const validEmployeeData = Array.isArray(enrichedEmployeeData) ? enrichedEmployeeData : [];
      const validUsersData = Array.isArray(allUsers) ? allUsers : [];
      const validPointsData = Array.isArray(points) ? points : [];

      // Mettre à jour les états
      setEmployees(validEmployeeData);
      setUsers(validUsersData);
      setEmployeePoints(validPointsData); // Update points
      setEmployeeOfTheDay(empDay); // Update employee of the day
      setEmployeeOfTheWeek(empWeek); // Update employee of the week
      setLastApiCall(Date.now());

      // Mettre en cache les nouvelles données
      localStorage.setItem('employees_cache', JSON.stringify(validEmployeeData));
      localStorage.setItem('users_cache', JSON.stringify(validUsersData));
      localStorage.setItem('employee_points_cache', JSON.stringify(validPointsData));
      localStorage.setItem('employee_of_the_day_cache', JSON.stringify(empDay));
      localStorage.setItem('employee_of_the_week_cache', JSON.stringify(empWeek));
      localStorage.setItem('employees_cache_timestamp', Date.now().toString());

      console.log('✅ Rafraîchissement manuel réussi');

      toast({
        title: "✅ Données mises à jour",
        description: `${validEmployeeData.length} employés rechargés avec succès.`,
        duration: 3000
      });

    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement manuel:', error);

      let errorMessage = "Erreur lors du rafraîchissement";

      if (error.message?.includes('Rate limit') || error.response?.status === 429) {
        errorMessage = "Limite de débit API atteinte. Cette limite protège le système contre la surcharge. Les données sont chargées depuis le cache local. Veuillez patienter quelques instants avant de réessayer.";
      } else if (error.message?.includes('Network Error')) {
        errorMessage = "Problème de connexion réseau. Vérifiez votre connexion.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      setError(errorMessage);

      toast({
        title: "❌ Erreur de rafraîchissement",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Charger d'abord depuis le cache si disponible
    const cachedEmployees = localStorage.getItem('employees_cache');
    const cachedUsers = localStorage.getItem('users_cache');
    const cachedPoints = localStorage.getItem('employee_points_cache');
    const cachedEmpDay = localStorage.getItem('employee_of_the_day_cache');
    const cachedEmpWeek = localStorage.getItem('employee_of_the_week_cache');
    const cacheTimestamp = localStorage.getItem('employees_cache_timestamp');

    if (cachedEmployees && cachedUsers && cachedPoints && cachedEmpDay && cachedEmpWeek && cacheTimestamp) { // Check all caches
      const cacheAge = Date.now() - parseInt(cacheTimestamp);

      try {
        const parsedCachedEmployees = JSON.parse(cachedEmployees);
        const parsedCachedUsers = JSON.parse(cachedUsers);
        const parsedCachedPoints = JSON.parse(cachedPoints);
        const parsedCachedEmpDay = JSON.parse(cachedEmpDay);
        const parsedCachedEmpWeek = JSON.parse(cachedEmpWeek);

        const validCachedEmployees = Array.isArray(parsedCachedEmployees) ? parsedCachedEmployees : [];
        const validCachedUsers = Array.isArray(parsedCachedUsers) ? parsedCachedUsers : [];
        const validCachedPoints = Array.isArray(parsedCachedPoints) ? parsedCachedPoints : [];

        // Utiliser le cache si moins de 5 minutes
        if (cacheAge < 300000) {
          console.log('📦 Utilisation du cache employés (moins de 5 minutes).');
          setEmployees(validCachedEmployees);
          setUsers(validCachedUsers);
          setEmployeePoints(validCachedPoints); // Set points from cache
          setEmployeeOfTheDay(parsedCachedEmpDay); // Set emp day from cache
          setEmployeeOfTheWeek(parsedCachedEmpWeek); // Set emp week from cache
          setLoading(false);
          setLastApiCall(parseInt(cacheTimestamp));

          // Charger les vraies données en arrière-plan si le cache a plus d'1 minute et si en ligne
          if (cacheAge > 60000 && navigator.onLine) {
            console.log('⏳ Cache plus ancien qu\'1 minute, rafraîchissement en arrière-plan...');
            setTimeout(refreshEmployeeData, 1000);
          }
        } else {
          // Cache trop ancien, charger normalement si en ligne
          if (navigator.onLine) {
            console.log('🗑️ Cache trop ancien, chargement des données fraîches.');
            loadEmployees();
          } else {
            console.log('📦 Hors ligne - utilisation du cache expiré.');
            setEmployees(validCachedEmployees);
            setUsers(validCachedUsers);
            setEmployeePoints(validCachedPoints);
            setEmployeeOfTheDay(parsedCachedEmpDay);
            setEmployeeOfTheWeek(parsedCachedEmpWeek);
            setLoading(false);
            setLastApiCall(parseInt(cacheTimestamp));
            toast({
              title: "Mode hors ligne",
              description: "Données chargées depuis le cache local (hors ligne).",
              variant: "default"
            });
          }
        }
      } catch (parseError) {
        console.error('Erreur parsing cache au démarrage:', parseError);
        localStorage.removeItem('employees_cache');
        localStorage.removeItem('users_cache');
        localStorage.removeItem('employee_points_cache');
        localStorage.removeItem('employee_of_the_day_cache');
        localStorage.removeItem('employee_of_the_week_cache');
        localStorage.removeItem('employees_cache_timestamp');
        if (navigator.onLine) {
          console.log('Cache corrompu, chargement initial.');
          loadEmployees();
        } else {
          setError("Cache local corrompu et aucune connexion réseau.");
          setLoading(false);
        }
      }
    } else {
      // Pas de cache, charger normalement si en ligne
      if (navigator.onLine) {
        console.log('🔍 Aucun cache trouvé, chargement initial.');
        loadEmployees();
      } else {
        console.log('🌐 Hors ligne et aucun cache disponible.');
        setError("Aucune connexion réseau et aucun cache disponible.");
        setLoading(false);
      }
    }

    // Écouter les événements de mise à jour d'activité des employés
    const handleEmployeeActivityUpdate = (event) => {
      console.log('🔔 Événement de mise à jour d\'activité employé reçu:', event.detail);
      
      // Forcer un rechargement des données employés
      setTimeout(() => {
        console.log('🔄 Rechargement forcé des données employés suite à un repointage');
        handleManualRefresh();
      }, 1000); // Small delay to ensure event propagation is complete
    };

    // Écouter les changements de statut en temps réel
    const handleTeamStatusUpdate = (event) => {
      console.log('👥 Mise à jour du statut d\'équipe:', event.detail);
      setRealTimeUpdate(prev => prev + 1); // Force re-render des badges de statut
    };

    window.addEventListener('employeeActivityUpdated', handleEmployeeActivityUpdate);
    window.addEventListener('teamStatusUpdate', handleTeamStatusUpdate);

    // Mise à jour temps réel de l'affichage toutes les 30 secondes (pas d'API)
    const displayInterval = setInterval(() => {
      setRealTimeUpdate(prev => prev + 1);
    }, 30000);

    // Rechargement des données toutes les 2 minutes (avec rate limiting et vérification réseau)
    const dataInterval = setInterval(() => {
      if (navigator.onLine) {
        refreshEmployeeData();
      }
    }, 120000);

    // Écouter les changements de connexion réseau
    const handleOnline = () => {
      console.log('🌐 Connexion rétablie');
      toast({
        title: "Connexion rétablie",
        description: "Rechargement des données en cours...",
        variant: "default"
      });
      setTimeout(refreshEmployeeData, 1000);
    };

    const handleOffline = () => {
      console.log('🌐 Connexion perdue');
      toast({
        title: "Mode hors ligne",
        description: "Utilisation des données en cache local.",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      clearInterval(displayInterval);
      clearInterval(dataInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('employeeActivityUpdated', handleEmployeeActivityUpdate);
      window.removeEventListener('teamStatusUpdate', handleTeamStatusUpdate);
    };
  }, []);

  // CORRECTION: Fonction simplifiée pour mise à jour activité utilisateur
  const updateCurrentUserActivity = async () => {
    if (!currentUser) return;

    try {
      // CORRECTION: Mise à jour directe via l'entité Employee
      if (currentUser.employee_id) {
        const employees = await Employee.filter({ employee_id: currentUser.employee_id });
        if (employees.length > 0) {
          await Employee.update(employees[0].id, {
            last_activity: new Date().toISOString(),
            is_online: true
          });
          console.log('✅ Current user activity updated via Employee entity');
        }
      } else if (currentUser.email) {
        const employees = await Employee.filter({ email: currentUser.email });
        if (employees.length > 0) {
          await Employee.update(employees[0].id, {
            last_activity: new Date().toISOString(),
            is_online: true
          });
          console.log('✅ Current user activity updated via Employee entity (email match)');
        }
      }
      
      // Aussi mettre à jour l'utilisateur
      await User.update(currentUser.id, {
        last_login: new Date().toISOString()
      });
      
      // Déclencher un rafraîchissement léger
      setTimeout(() => {
        refreshEmployeeData();
      }, 2000);
      
    } catch (error) {
      console.warn('⚠️ Activity update failed (non-blocking):', error.message);
      // Ne pas bloquer l'interface
    }
  };

  // CORRECTION: Listeners d'activité simplifiés avec debouncing
  useEffect(() => {
    if (!currentUser) return;

    let activityTimeout;
    let lastUpdate = 0;

    const handleUserActivity = () => {
      const now = Date.now();
      // Éviter les mises à jour trop fréquentes
      if (now - lastUpdate < 30000) return; // Minimum 30s entre les mises à jour
      
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        lastUpdate = now;
        updateCurrentUserActivity();
      }, 2000); // Attendre 2s après la dernière activité
    };

    // Event listeners plus légers
    document.addEventListener('click', handleUserActivity, { passive: true });
    document.addEventListener('keypress', handleUserActivity, { passive: true });

    // Mise à jour initiale
    updateCurrentUserActivity();

    // Interval pour mise à jour périodique (moins fréquent)
    const activityInterval = setInterval(() => {
      updateCurrentUserActivity();
    }, 120000); // Toutes les 2 minutes

    return () => {
      clearInterval(activityInterval);
      clearTimeout(activityTimeout);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('keypress', handleUserActivity);
    };
  }, [currentUser]);

  const handleOpenMeetingModal = (employee) => {
    setSelectedEmployeeForMeeting(employee);
    setIsMeetingModalOpen(true);
  };

  const handleCloseMeetingModal = () => {
    setIsMeetingModalOpen(false);
    setSelectedEmployeeForMeeting(null);
  };

  const handleSubmitMeetingRequest = async (link) => {
    try {
      const requester = await User.me();
      const targetEmployee = selectedEmployeeForMeeting;

      if (!requester || !targetEmployee) {
        toast({ title: "Erreur", description: "Données manquantes pour l'invitation.", variant: "destructive" });
        return;
      }

      console.log("Requester:", requester);
      console.log("Target employee:", targetEmployee);

      // Find the user associated with the target employee from the latest users state
      let targetUser = null;

      // Ensure users is an array before filtering
      const usersArray = Array.isArray(users) ? users : [];

      // Try to find by employee_id first
      if (targetEmployee.employee_id) {
        const targetUsersByEmpId = usersArray.filter(u => u.employee_id === targetEmployee.employee_id);
        if (targetUsersByEmpId.length > 0) {
          targetUser = targetUsersByEmpId[0];
        }
      }

      // If not found by employee_id, try by email
      if (!targetUser) {
        const targetUsersByEmail = usersArray.filter(u => u.email === targetEmployee.email);
        if (targetUsersByEmail.length > 0) {
          targetUser = targetUsersByEmail[0];
        }
      }

      console.log("Target user found:", targetUser);

      if (!targetUser) {
        toast({ title: "Erreur", description: "Impossible de trouver l'utilisateur cible.", variant: "destructive" });
        return;
      }

      // Create notification for the target user
      await Notification.create({
        user_id: targetUser.id,
        title: "Nouvelle demande de meeting",
        message: `${requester.full_name || 'Un collègue'} vous a invité à une réunion.`,
        type: "meeting_request",
        link_to: link,
        is_read: false,
      });

      toast({ title: "Succès", description: "Invitation envoyée avec succès !" });
      handleCloseMeetingModal();

    } catch (error) {
      console.error("Failed to send meeting request:", error);
      toast({ title: "Erreur", description: "Échec de l'envoi de l'invitation.", variant: "destructive" });
    }
  };

  // Function to map employee points for faster lookup
  const employeePointsMap = useMemo(() => {
    return employeePoints.reduce((acc, ep) => {
      // Use employee_id first, then fallback to id if employee_id is not present
      // This handles cases where employee object might have 'id' but the points object has 'employee_id'
      const key = ep.employee_id || ep.id;
      if (key) {
        acc[key] = ep;
      }
      return acc;
    }, {});
  }, [employeePoints]);

  // Fonction pour déterminer le statut de connexion VRAIMENT temps réel
  const getConnectionStatus = (employee) => {
    // If the employee object already has real_time_status from backend, use that
    // NOTE: With the simplified refreshEmployeeData, real_time_status might not be present,
    // so the fallback logic will be primarily used.
    if (employee.real_time_status && employee.seconds_since_activity !== undefined) {
      switch (employee.real_time_status) {
        case 'online':
          return { status: 'En ligne', color: 'text-green-700', bgColor: 'bg-green-100', isOnline: true, pulse: true };
        case 'active':
          return { status: 'Actif', color: 'text-blue-700', bgColor: 'bg-blue-100', isOnline: true, pulse: false };
        case 'recent':
          return { status: 'Récent', color: 'text-yellow-700', bgColor: 'bg-yellow-100', isOnline: false, pulse: false };
        case 'inactive':
          return { status: 'Inactif', color: 'text-orange-700', bgColor: 'bg-orange-100', isOnline: false, pulse: false };
        case 'offline':
          return { status: 'Hors ligne', color: 'text-red-700', bgColor: 'bg-red-100', isOnline: false, pulse: false };
        default:
          return { status: 'Inconnu', color: 'text-gray-500', bgColor: 'bg-gray-100', isOnline: false, pulse: false };
      }
    }

    // Fallback if real_time_status not available (e.g., initial load before real-time update)
    const lastActivity = employee.last_activity || employee.updated_date;

    if (!lastActivity) {
      return { 
        status: 'Jamais connecté', 
        color: 'text-gray-500', 
        bgColor: 'bg-gray-100',
        isOnline: false,
        pulse: false
      };
    }

    const now = new Date();
    const lastActivityDate = new Date(lastActivity);
    const diffSeconds = Math.floor((now.getTime() - lastActivityDate.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffSeconds < 60) {
      return { 
        status: 'En ligne', 
        color: 'text-green-700', 
        bgColor: 'bg-green-100',
        isOnline: true,
        pulse: true
      };
    } else if (diffMinutes < 5) {
      return { 
        status: 'Actif', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-100',
        isOnline: true,
        pulse: false
      };
    } else if (diffMinutes < 15) {
      return { 
        status: 'Récent', 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-100',
        isOnline: false,
        pulse: false
      };
    } else if (diffMinutes < 60) {
      return { 
        status: 'Inactif', 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-100',
        isOnline: false,
        pulse: false
      };
    } else {
      return { 
        status: 'Hors ligne', 
        color: 'text-red-700', 
        bgColor: 'bg-red-100',
        isOnline: false,
        pulse: false
      };
    }
  };

  // Fonction pour formater la dernière connexion VRAIMENT temps réel
  const formatLastConnection = (employee) => {
    const lastActivity = employee.last_activity || employee.updated_date;

    if (!lastActivity) return 'Jamais connecté';

    try {
      const now = new Date();
      const lastActivityDate = new Date(lastActivity);
      const diffSeconds = Math.floor((now.getTime() - lastActivityDate.getTime()) / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSeconds < 10) {
        return 'Maintenant';
      } else if (diffSeconds < 60) {
        return `${diffSeconds}s`;
      } else if (diffMinutes < 60) {
        return `${diffMinutes}min`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
      } else if (diffDays < 7) {
        return `${diffDays}j`;
      } else {
        return format(lastActivityDate, 'dd/MM', { locale: fr });
      }
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Erreur';
    }
  };

  // Filtrer les employés avec validation
  const filteredEmployees = useMemo(() => {
    // S'assurer que employees est un tableau
    const employeesArray = Array.isArray(employees) ? employees : [];
    
    return employeesArray.filter(employee => {
      const matchesSearch = searchTerm === "" ||
        `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, selectedDepartment]);

  // Départements avec validation
  const departments = useMemo(() => {
    const employeesArray = Array.isArray(employees) ? employees : [];
    return [...new Set(employeesArray.map(emp => emp.department))].filter(Boolean);
  }, [employees]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <Card className="bg-red-50 border-red-200 shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
            <AlertTriangle className="w-10 h-10 text-red-600" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-red-900">Erreur de chargement</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button onClick={loadEmployees} variant="destructive" className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Rendering with employees:", Array.isArray(employees) ? employees.length : 'not array', employees);
  console.log("Filtered employees:", filteredEmployees.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto responsive-padding space-y-6 lg:space-y-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              Mon Équipe
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Découvrez vos collègues et leur activité en temps réel
            </p>
          </div>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            className="flex items-center gap-2 touch-target w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sm:hidden lg:inline">{isRefreshing ? 'Actualisation...' : 'Actualiser'}</span>
            <span className="hidden sm:inline lg:hidden">{isRefreshing ? '...' : 'Actualiser'}</span>
          </Button>
        </div>

        {/* CORRECTION: Indicateur de statut temps réel amélioré */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-gray-500">
            {filteredEmployees.length} membre{filteredEmployees.length > 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className={`w-2 h-2 rounded-full ${
              (Date.now() - lastApiCall) < 60000 ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}></div>
            <span className="truncate">
              {(Date.now() - lastApiCall) < 60000 ? (
                'Statuts temps réel actifs'
              ) : (
                <span className="flex items-center gap-1" title="Mise à jour des statuts en cours...">
                  Mise à jour des statuts...
                  <button 
                    onClick={() => toast({
                      title: "Système de statut temps réel",
                      description: "Les statuts de connexion sont mis à jour automatiquement toutes les 30 secondes. Vos collègues voient votre statut en temps réel basé sur votre activité sur la plateforme.",
                      duration: 6000
                    })}
                    className="text-blue-500 hover:text-blue-700 ml-1"
                  >
                    ℹ️
                  </button>
                </span>
              )} • {new Date().toLocaleTimeString('fr-FR')} • 
              <span className="hidden sm:inline">Synchronisation automatique</span>
            </span>
          </div>
        </div>

        {/* Statistiques rapides - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs lg:text-sm font-medium">Total équipe</p>
                  <p className="text-xl lg:text-3xl font-bold">{Array.isArray(employees) ? employees.length : 0}</p>
                </div>
                <Users className="w-6 h-6 lg:w-10 lg:h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs lg:text-sm font-medium">En ligne</p>
                  <p className="text-xl lg:text-3xl font-bold">
                    {Array.isArray(employees) ? employees.filter(e => getConnectionStatus(e).isOnline).length : 0}
                  </p>
                </div>
                <Activity className="w-6 h-6 lg:w-10 lg:h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs lg:text-sm font-medium">Départements</p>
                  <p className="text-xl lg:text-3xl font-bold">{departments.length}</p>
                </div>
                <MapPin className="w-6 h-6 lg:w-10 lg:h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-xs lg:text-sm font-medium">Actifs</p>
                  <p className="text-xl lg:text-3xl font-bold">{
                    // Definition of "Actifs" changed to include 'online', 'active', 'recent' from getConnectionStatus
                    Array.isArray(employees) ? employees.filter(e => {
                      const status = getConnectionStatus(e).status;
                      return ['En ligne', 'Actif', 'Récent'].includes(status);
                    }).length : 0
                  }</p>
                </div>
                <UserIcon className="w-6 h-6 lg:w-10 lg:h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee of the Day/Week section */}
        {(employeeOfTheDay || employeeOfTheWeek) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 lg:mb-8">
            {employeeOfTheDay && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200 shadow-lg">
                <CardContent className="p-4 lg:p-6 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                      <AvatarImage src={employeeOfTheDay.profile_picture} />
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-xl font-bold">
                        {`${employeeOfTheDay.first_name?.[0] || '?'}${employeeOfTheDay.last_name?.[0] || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Employé du Jour</p>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">{employeeOfTheDay.full_name}</h3>
                    <p className="text-xs text-gray-600">{employeeOfTheDay.position}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {employeeOfTheWeek && (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 shadow-lg">
                <CardContent className="p-4 lg:p-6 flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                      <AvatarImage src={employeeOfTheWeek.profile_picture} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                        {`${employeeOfTheWeek.first_name?.[0] || '?'}${employeeOfTheWeek.last_name?.[0] || ''}`}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Award className="w-4 h-4 text-white" fill="white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-700">Employé de la Semaine</p>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">{employeeOfTheWeek.full_name}</h3>
                    <p className="text-xs text-gray-600">{employeeOfTheWeek.position}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Filtres et recherche - Responsive */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-6 lg:mb-8">
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par nom, email ou poste..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 lg:min-w-[200px]"
              >
                <option value="all">Tous les départements</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des membres de l'équipe - Responsive Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="responsive-grid">
            <AnimatePresence>
              {filteredEmployees.map((employee) => {
                const connectionStatus = getConnectionStatus(employee);
                
                // CORRECTION: Identifier l'utilisateur actuel différemment (using currentUser context)
                const isCurrentUser = currentUser && (
                  employee.id === currentUser.employee_id || // Match by employee ID if currentUser has it
                  employee.email === currentUser.email // Fallback to email
                );
                
                // Get points data for the current employee from the map
                const currentEmployeePoints = employeePointsMap[employee.employee_id] || employeePointsMap[employee.id] || {};

                return (
                  <motion.div
                    key={`${employee.id}-${realTimeUpdate}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                    className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-lg border transition-all duration-300 cursor-pointer hover:bg-white/90 ${
                      isCurrentUser 
                        ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/50' 
                        : 'border-white/20'
                    }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="relative">
                        <Avatar className="w-12 h-12 lg:w-16 lg:h-16 border-4 border-white shadow-lg">
                          <AvatarImage src={employee.profile_picture} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg lg:text-xl font-bold">
                            {`${employee.first_name?.[0] || '?'}${employee.last_name?.[0] || ''}`}
                          </AvatarFallback>
                        </Avatar>
                        {isCurrentUser && (
                          <div className="absolute -top-2 -right-2 w-5 h-5 lg:w-6 lg:h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-white text-xs font-bold leading-none">✓</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900 text-base lg:text-lg truncate flex items-center gap-2">
                        <span className="truncate">{employee.first_name || 'Prénom'} {employee.last_name || 'Nom'}</span>
                        {isCurrentUser && (
                          <span className="text-xs text-blue-600 font-medium whitespace-nowrap">(Vous)</span>
                        )}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm lg:text-base truncate">{employee.position || 'Poste non défini'}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{employee.department || 'Département'}</Badge>
                    </div>

                    {/* CORRECTION: Status Badge amélioré avec statut temps réel */}
                    <div className="flex justify-end mb-4">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${connectionStatus.color} border-current ${connectionStatus.bgColor} ${
                          connectionStatus.pulse ? 'animate-pulse' : ''
                        } flex items-center gap-1`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          connectionStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        } ${connectionStatus.pulse ? 'animate-ping' : ''}`}></div>
                        {connectionStatus.status}
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{employee.email || 'Email non défini'}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{employee.phone}</span>
                        </div>
                      )}
                      {employee.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs lg:text-sm">Depuis le {format(new Date(employee.start_date), 'd MMM yyyy', { locale: fr })}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{employee.department || 'Département non défini'}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {isCurrentUser ? 
                            'Votre statut est visible par vos collègues' : 
                            `Dernière connexion: ${formatLastConnection(employee)}`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <AttendanceHeatmap employee={employee} />
                    </div>

                    {/* REMPLACÉ: Bouton Meet par affichage des points */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Points Gamification</p>
                              <p className="text-sm text-gray-600">Performance globale</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {/* Récupérer les points depuis l'état employeePoints si disponible */}
                              {currentEmployeePoints.total_points || 0}
                            </div>
                            <div className="text-xs text-gray-500">points totaux</div>
                          </div>
                        </div>
                        
                        {/* Barre de progression et détails */}
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-600">Cette semaine</span>
                            <span className="font-medium text-blue-600">
                              {currentEmployeePoints.points_this_week || 0} pts
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-xs text-gray-600">
                                Niv. {currentEmployeePoints.level || 1}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-purple-500" />
                              <span className="text-xs text-gray-600">
                                {currentEmployeePoints.badges_count || 0} badges
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span className="text-xs text-gray-600">
                                {currentEmployeePoints.streak_days || 0} jours
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 lg:p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun membre trouvé
              </h3>
              <p className="text-gray-600 text-sm lg:text-base">
                {(Array.isArray(employees) ? employees.length : 0) === 0
                  ? "Aucun employé dans la base de données."
                  : "Essayez d'ajuster vos critères de recherche."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <RequestMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={handleCloseMeetingModal}
        onSubmit={handleSubmitMeetingRequest}
        targetEmployee={selectedEmployeeForMeeting}
      />
    </div>
  );
}
