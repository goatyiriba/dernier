import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/api/supabaseEntities';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AttendanceHeatmap({ employee }) {
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    if (employee) {
      loadAttendanceData();
    }
  }, [employee, selectedMonth]);

  const loadAttendanceData = async () => {
    // Éviter les appels trop fréquents (minimum 30 secondes)
    const now = Date.now();
    if (now - lastFetchTime < 30000) {
      console.log('🚫 AttendanceHeatmap: Rate limiting - skip API call');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Utiliser le cache local d'abord
      const cacheKey = `attendance_${employee.id}_${format(selectedMonth, 'yyyy-MM')}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (cachedData && cacheTimestamp) {
        const cacheAge = now - parseInt(cacheTimestamp);
        
        // Utiliser le cache si moins de 10 minutes
        if (cacheAge < 600000) {
          console.log('📦 AttendanceHeatmap: Utilisation du cache');
          setTimeEntries(JSON.parse(cachedData));
          setIsLoading(false);
          return;
        }
      }

      console.log('📊 AttendanceHeatmap: Chargement des données de présence pour', employee.email);
      
      // Charger les entrées de temps pour cet employé avec retry logic
      let entries = [];
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          entries = await TimeEntry.filter({ employee_id: employee.id });
          console.log(`✅ Données de présence chargées: ${entries.length} entrées`);
          break;
        } catch (apiError) {
          retryCount++;
          console.error(`❌ Tentative ${retryCount}/${maxRetries} échouée:`, apiError);
          
          if (apiError.message?.includes('Rate limit') || apiError.response?.status === 429) {
            console.log('⚠️ Rate limit détecté, attente avant retry...');
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          } else if (apiError.message?.includes('Network Error') || !navigator.onLine) {
            console.log('🌐 Problème réseau détecté');
            // En cas d'erreur réseau, essayer d'utiliser le cache même expiré
            if (cachedData) {
              console.log('📦 Utilisation du cache expiré à cause du problème réseau');
              setTimeEntries(JSON.parse(cachedData));
              setError('Données en cache (problème réseau)');
              setIsLoading(false);
              return;
            }
            throw new Error('Problème de connexion réseau');
          } else if (retryCount >= maxRetries) {
            throw apiError;
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }

      // Mettre en cache les données récupérées
      localStorage.setItem(cacheKey, JSON.stringify(entries));
      localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
      
      setTimeEntries(entries);
      setLastFetchTime(now);
      
    } catch (error) {
      console.error("❌ Erreur chargement données de présence:", error);
      
      let errorMessage = 'Erreur de chargement';
      
      if (error.message?.includes('Network Error') || !navigator.onLine) {
        errorMessage = 'Problème de connexion';
      } else if (error.message?.includes('Rate limit')) {
        errorMessage = 'Limite de débit atteinte';
      } else if (error.response?.status === 404) {
        errorMessage = 'Données non trouvées';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erreur serveur';
      }
      
      setError(errorMessage);
      
      // Essayer d'utiliser des données en cache même anciennes
      const cacheKey = `attendance_${employee.id}_${format(selectedMonth, 'yyyy-MM')}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        console.log('📦 Utilisation du cache ancien en fallback');
        setTimeEntries(JSON.parse(cachedData));
        setError(`${errorMessage} (données en cache)`);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    return eachDayOfInterval({ start, end });
  };

  const getAttendanceForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeEntries.find(entry => entry.date === dateStr);
  };

  const getIntensityColor = (entry) => {
    if (!entry) return 'bg-gray-100 border-gray-200'; // Pas de données
    
    if (entry.status === 'incomplete') {
      return 'bg-red-200 border-red-300'; // Entrée incomplète
    }

    if (!entry.check_in_time || !entry.check_out_time) {
      return 'bg-yellow-200 border-yellow-300'; // Données manquantes
    }

    try {
      // Calculer les heures travaillées
      const checkIn = new Date(`${entry.date}T${entry.check_in_time}`);
      const checkOut = new Date(`${entry.date}T${entry.check_out_time}`);
      const hoursWorked = differenceInHours(checkOut, checkIn);

      // Couleurs basées sur les heures travaillées
      if (hoursWorked >= 8) return 'bg-green-500 border-green-600'; // Journée complète
      if (hoursWorked >= 6) return 'bg-green-400 border-green-500'; // Bonne journée
      if (hoursWorked >= 4) return 'bg-green-300 border-green-400'; // Demi-journée
      if (hoursWorked >= 1) return 'bg-green-200 border-green-300'; // Peu d'heures
      
      return 'bg-gray-200 border-gray-300'; // Très peu ou pas d'heures
    } catch (timeError) {
      console.warn('Erreur calcul heures travaillées:', timeError);
      return 'bg-yellow-200 border-yellow-300'; // Erreur de calcul
    }
  };

  const getTooltipContent = (date, entry) => {
    const dayName = format(date, 'EEEE d MMMM', { locale: fr });
    
    if (!entry) {
      return (
        <div className="text-center">
          <p className="font-medium">{dayName}</p>
          <p className="text-sm text-gray-500">Aucune données</p>
        </div>
      );
    }

    if (entry.status === 'incomplete') {
      return (
        <div className="text-center">
          <p className="font-medium">{dayName}</p>
          <p className="text-sm text-red-600">⚠️ Entrée incomplète</p>
          <p className="text-sm">Arrivée: {entry.check_in_time || 'N/A'}</p>
          <p className="text-sm">Départ: Non enregistré</p>
        </div>
      );
    }

    let hoursWorked = 0;
    try {
      if (entry.check_in_time && entry.check_out_time) {
        const checkIn = new Date(`${entry.date}T${entry.check_in_time}`);
        const checkOut = new Date(`${entry.date}T${entry.check_out_time}`);
        hoursWorked = differenceInHours(checkOut, checkIn);
      }
    } catch (timeError) {
      console.warn('Erreur calcul tooltip:', timeError);
    }

    return (
      <div className="text-center">
        <p className="font-medium">{dayName}</p>
        <div className="mt-1 space-y-1">
          <p className="text-sm">
            <span className="text-green-600">📥</span> Arrivée: {entry.check_in_time || 'N/A'}
          </p>
          <p className="text-sm">
            <span className="text-blue-600">📤</span> Départ: {entry.check_out_time || 'N/A'}
          </p>
          <p className="text-sm font-medium">
            ⏱️ Total: {hoursWorked}h
          </p>
        </div>
      </div>
    );
  };

  const changeMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const days = getDaysInMonth();
  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: fr });

  if (isLoading && timeEntries.length === 0) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="grid grid-cols-7 gap-1">
            {Array(31).fill(0).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && timeEntries.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Présences</h4>
          <button
            onClick={loadAttendanceData}
            className="text-xs text-blue-600 hover:text-blue-800"
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'Réessayer'}
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-xs text-red-600">❌ {error}</p>
          <p className="text-xs text-gray-500 mt-1">Cliquez sur "Réessayer"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-700">Présences</h4>
          {error && (
            <span className="text-xs text-orange-600" title={error}>⚠️</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <span className="text-xs font-medium text-gray-600 min-w-[80px] text-center">
            {monthName}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            disabled={format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
          >
            →
          </button>
        </div>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours de la semaine */}
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-xs text-gray-400 text-center font-medium mb-1">
              {day}
            </div>
          ))}
          
          {/* Cases des jours */}
          {days.map((date) => {
            const entry = getAttendanceForDay(date);
            const colorClass = getIntensityColor(entry);
            const isToday = isSameDay(date, new Date());
            
            return (
              <Tooltip key={date.toISOString()}>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      w-3 h-3 rounded-sm border cursor-pointer transition-all duration-200 hover:scale-110
                      ${colorClass}
                      ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                    `}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {getTooltipContent(date, entry)}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Légende */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Moins</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-100 border border-gray-200 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-200 border border-green-300 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-300 border border-green-400 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-400 border border-green-500 rounded-sm"></div>
          <div className="w-2 h-2 bg-green-500 border border-green-600 rounded-sm"></div>
        </div>
        <span>Plus</span>
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-center">
          <span className="text-orange-600">{error}</span>
        </div>
      )}
    </div>
  );
}