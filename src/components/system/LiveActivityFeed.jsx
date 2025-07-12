import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  Shield, 
  AlertTriangle,
  Smartphone,
  MapPin,
  Wifi,
  Server,
  Eye
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getLogIcon = (actionType) => {
  switch (actionType) {
    case 'login':
      return <Users className="w-4 h-4 text-green-600" />;
    case 'logout':
      return <Users className="w-4 h-4 text-gray-600" />;
    case 'check_in':
    case 'check_out':
      return <Clock className="w-4 h-4 text-blue-600" />;
    case 'security_alert':
      return <Shield className="w-4 h-4 text-red-600" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    case 'api_call':
      return <Server className="w-4 h-4 text-purple-600" />;
    case 'data_access':
      return <Eye className="w-4 h-4 text-orange-600" />;
    default:
      return <Activity className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getRiskLevelColor = (riskLevel) => {
  switch (riskLevel) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-orange-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatLogTime = (timeString) => {
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: fr 
    });
  } catch (error) {
    return "Format invalide";
  }
};

export default function LiveActivityFeed({ 
  logs, 
  searchTerm, 
  setSearchTerm, 
  filterType, 
  setFilterType, 
  isLoading 
}) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Flux d'Activité en Temps Réel
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par IP, appareil, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-0 focus:bg-white transition-colors"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 h-10 bg-gray-50 border-0">
              <SelectValue placeholder="Type d'action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="login">Connexions</SelectItem>
              <SelectItem value="logout">Déconnexions</SelectItem>
              <SelectItem value="check_in">Pointages entrée</SelectItem>
              <SelectItem value="check_out">Pointages sortie</SelectItem>
              <SelectItem value="api_call">Appels API</SelectItem>
              <SelectItem value="data_access">Accès données</SelectItem>
              <SelectItem value="security_alert">Alertes Sécurité</SelectItem>
              <SelectItem value="error">Erreurs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : logs.length > 0 ? (
              logs.map((log, index) => (
                <motion.div
                  key={log.id || `${log.action_type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getLogIcon(log.action_type)}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getRiskLevelColor(log.risk_level || 'low')}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {log.action_description || `Action ${log.action_type}`}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          {log.ip_address && (
                            <div className="flex items-center gap-1">
                              <Wifi className="w-3 h-3" />
                              <span>{log.ip_address}</span>
                            </div>
                          )}
                          {log.device_info && (
                            <div className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              <span className="truncate max-w-32">{log.device_info}</span>
                            </div>
                          )}
                          {log.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-24">{log.location}</span>
                            </div>
                          )}
                          {log.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{log.duration}ms</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="outline" className={`${getStatusColor(log.status || 'success')} text-xs`}>
                          {log.status || 'success'}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatLogTime(log.created_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Aucune activité trouvée</p>
                <p className="text-gray-400 text-xs mt-1">
                  Les logs d'activité apparaîtront ici en temps réel
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}