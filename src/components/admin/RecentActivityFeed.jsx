import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, TrendingUp, User, FileText, AlertCircle, Activity, CheckCircle2, ArrowUpCircle, Circle, Users, Megaphone, UserPlus, LogIn, LogOut, Timer, Bell } from "lucide-react";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const getActivityIcon = (type) => {
  switch (type) {
    case 'leave_request':
      return { icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'time_entry_incomplete':
      return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' };
    case 'time_entry_recent':
      return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'urgent_announcement':
      return { icon: Megaphone, color: 'text-red-600', bg: 'bg-red-50' };
    case 'new_employee':
      return { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-50' };
    case 'survey_response':
      return { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' };
    case 'user_login':
      return { icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-50' };
    case 'user_logout':
      return { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-50' };
    case 'performance_review':
      return { icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    case 'document_upload':
      return { icon: FileText, color: 'text-green-600', bg: 'bg-green-50' };
    case 'notification_sent':
      return { icon: Bell, color: 'text-orange-600', bg: 'bg-orange-50' };
    default:
      return { icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

const getStatusBadge = (status) => {
  const variants = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    Denied: "bg-red-100 text-red-800 border-red-200",
    checked_in: "bg-blue-100 text-blue-800 border-blue-200",
    checked_out: "bg-gray-100 text-gray-800 border-gray-200",
    incomplete: "bg-red-100 text-red-800 border-red-200",
    published: "bg-green-100 text-green-800 border-green-200",
    Draft: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    active: "bg-green-100 text-green-800 border-green-200",
    online: "bg-green-100 text-green-800 border-green-200",
    offline: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };
  return variants[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'urgent':
      return "bg-red-100 text-red-800 border-red-200 animate-pulse";
    case 'high':
      return "bg-orange-100 text-orange-800 border-orange-200";
    case 'medium':
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// CORRECTION: Fonction robuste pour formater les dates avec validation complète
const formatActivityTime = (timeString) => {
  if (!timeString) {
    console.warn("formatActivityTime: timeString is null or undefined");
    return "Date inconnue";
  }
  
  try {
    let date;
    
    // Si c'est déjà un objet Date
    if (timeString instanceof Date) {
      date = timeString;
    }
    // Si c'est une string avec format ISO
    else if (typeof timeString === 'string') {
      if (timeString.includes('T')) {
        date = parseISO(timeString);
      } else {
        // Essayer de parser comme date normale
        date = new Date(timeString);
      }
    }
    // Si c'est un timestamp
    else if (typeof timeString === 'number') {
      date = new Date(timeString);
    }
    // Si c'est un objet quelconque, essayer de le convertir
    else {
      console.warn("formatActivityTime: Unexpected timeString type:", typeof timeString, timeString);
      date = new Date(String(timeString));
    }
    
    // Vérifier que la date est valide
    if (!isValid(date) || isNaN(date.getTime())) {
      console.warn("formatActivityTime: Invalid date created:", date, "from:", timeString);
      return "Date invalide";
    }
    
    // Vérifier que la date n'est pas dans le futur lointain ou le passé lointain
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    
    if (date < oneYearAgo || date > oneYearFromNow) {
      console.warn("formatActivityTime: Date seems unrealistic:", date);
      return "Date suspecte";
    }
    
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: fr 
    });
  } catch (error) {
    console.error("formatActivityTime: Error formatting date:", error, "timeString:", timeString);
    return "Erreur de format";
  }
};

// CORRECTION: Fonction pour valider et nettoyer les activités
const validateActivity = (activity) => {
  if (!activity || typeof activity !== 'object') {
    return null;
  }

  // Vérifier les propriétés essentielles
  if (!activity.id || !activity.title || !activity.description) {
    console.warn("validateActivity: Missing essential properties:", activity);
    return null;
  }

  // Valider et nettoyer le timestamp
  let validTime = null;
  if (activity.time) {
    try {
      let testDate;
      if (activity.time instanceof Date) {
        testDate = activity.time;
      } else if (typeof activity.time === 'string') {
        testDate = activity.time.includes('T') ? parseISO(activity.time) : new Date(activity.time);
      } else if (typeof activity.time === 'number') {
        testDate = new Date(activity.time);
      } else {
        testDate = new Date(String(activity.time));
      }

      if (isValid(testDate) && !isNaN(testDate.getTime())) {
        validTime = testDate.toISOString();
      } else {
        console.warn("validateActivity: Invalid time in activity:", activity.time, activity);
        validTime = new Date().toISOString(); // Fallback à maintenant
      }
    } catch (error) {
      console.error("validateActivity: Error processing time:", error, activity.time);
      validTime = new Date().toISOString(); // Fallback à maintenant
    }
  } else {
    validTime = new Date().toISOString(); // Fallback à maintenant
  }

  return {
    ...activity,
    time: validTime,
    priority: activity.priority || 'normal',
    status: activity.status || 'unknown',
    isRecent: Boolean(activity.isRecent),
    type: activity.type || 'unknown'
  };
};

export default function RecentActivityFeed({ activities, isLoading, lastUpdated, onRefresh }) {
  // CORRECTION: Validation et nettoyage complet des activités
  const validActivities = (activities || [])
    .map(validateActivity) // Valider chaque activité
    .filter(activity => activity !== null) // Supprimer les activités invalides
    .filter(activity => activity.type !== "system_info") // Exclure les infos système
    .sort((a, b) => {
      // Priorité d'abord
      const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'normal': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Puis par récence (activités récentes en premier)
      if (a.isRecent !== b.isRecent) {
        return a.isRecent ? -1 : 1;
      }
      
      // Puis par timestamp - avec gestion d'erreur
      try {
        const dateA = new Date(a.time);
        const dateB = new Date(b.time);
        
        if (isValid(dateA) && isValid(dateB)) {
          return dateB - dateA;
        } else {
          console.warn("Invalid dates in sort:", a.time, b.time);
          return 0;
        }
      } catch (error) {
        console.error("Error sorting activities by date:", error);
        return 0;
      }
    })
    // Déduplication avancée pour les pointages
    .reduce((unique, activity) => {
      if (activity.type === 'time_entry_recent') {
        // Vérifier s'il y a déjà une activité similaire dans les 5 dernières minutes
        const isDuplicate = unique.some(existing => {
          if (existing.type !== activity.type || existing.employee_name !== activity.employee_name || existing.status !== activity.status) {
            return false;
          }
          
          try {
            const existingTime = new Date(existing.time).getTime();
            const activityTime = new Date(activity.time).getTime();
            return Math.abs(existingTime - activityTime) < 300000; // 5 minutes
          } catch (error) {
            console.error("Error comparing times for deduplication:", error);
            return false;
          }
        });
        
        if (!isDuplicate) {
          unique.push(activity);
        }
      } else {
        unique.push(activity);
      }
      
      return unique;
    }, [])
    .slice(0, 15); // Limiter à 15 activités max

  const systemInfo = (activities || []).find(activity => activity && activity.type === "system_info");

  // CORRECTION: Statistiques en temps réel avec validation
  const activityStats = {
    total: validActivities.length,
    urgent: validActivities.filter(a => a.priority === 'urgent').length,
    recent: validActivities.filter(a => a.isRecent).length,
    pending: validActivities.filter(a => a.status === 'Pending').length
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Activité Récente
            {validActivities.length > 0 && (
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* CORRECTION: Statistiques rapides avec validation */}
            <div className="flex items-center gap-2">
              {activityStats.urgent > 0 && (
                <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
                  {activityStats.urgent} urgent
                </Badge>
              )}
              {activityStats.recent > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {activityStats.recent} récent
                </Badge>
              )}
              <Badge variant="outline" className="bg-slate-50 text-slate-700">
                {validActivities.length} activité{validActivities.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            {/* CORRECTION: Indicateur de mise à jour en temps réel avec validation */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>
                  Live • {
                    (() => {
                      try {
                        return format(lastUpdated, 'HH:mm:ss');
                      } catch (error) {
                        console.error("Error formatting lastUpdated:", error);
                        return "??:??:??";
                      }
                    })()
                  }
                </span>
              </div>
            )}
            
            {/* Bouton de rafraîchissement manuel */}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="text-gray-500 hover:text-gray-700"
              >
                <Clock className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 max-h-96 overflow-y-auto">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))
        ) : validActivities.length > 0 ? (
          <AnimatePresence>
            {validActivities.map((activity, index) => {
              const { icon: Icon, color, bg } = getActivityIcon(activity.type);
              
              return (
                <motion.div
                  key={`${activity.type}-${activity.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                    activity.isRecent 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 shadow-sm' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`relative w-10 h-10 ${bg} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                    {activity.isRecent && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-bounce"></div>
                    )}
                    {activity.priority === 'urgent' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      {activity.priority !== 'normal' && (
                        <Badge className={`${getPriorityBadge(activity.priority)} text-xs px-2 py-0`}>
                          {activity.priority}
                        </Badge>
                      )}
                      {activity.isRecent && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0">
                          NOUVEAU
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.description}
                    </p>
                    {activity.employee_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        👤 {activity.employee_name}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <Badge variant="outline" className={`${getStatusBadge(activity.status)} text-xs mb-1`}>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {formatActivityTime(activity.time)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Système au Calme
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">
              {systemInfo ? systemInfo.description : "Aucune nouvelle activité détectée dans les 7 derniers jours. L'équipe semble bien organisée !"}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>
                Surveillance active • Dernière vérification: {
                  (() => {
                    try {
                      return lastUpdated ? format(lastUpdated, 'HH:mm') : 'En cours...';
                    } catch (error) {
                      return 'En cours...';
                    }
                  })()
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}