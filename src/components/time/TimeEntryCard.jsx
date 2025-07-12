
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Smartphone, 
  Wifi, 
  Navigation, 
  Eye, 
  Edit, 
  Coffee, 
  RefreshCw, 
  Loader2,
  LogOut,
  Play,
  Square,
  Timer,
  Calendar,
  Zap,
  Shield,
  Globe,
  RotateCcw // New import
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const statusConfig = {
  checked_in: {
    color: "bg-gradient-to-r from-green-500 to-emerald-600",
    textColor: "text-white",
    icon: Play,
    label: "🟢 En cours",
    pulse: true
  },
  checked_out: {
    color: "bg-gradient-to-r from-blue-500 to-blue-600",
    textColor: "text-white", 
    icon: Square,
    label: "🔵 Terminé",
    pulse: false
  },
  on_break: {
    color: "bg-gradient-to-r from-orange-500 to-red-600",
    textColor: "text-white",
    icon: Coffee,
    label: "🟡 En pause",
    pulse: true
  },
  incomplete: {
    color: "bg-gradient-to-r from-red-500 to-red-600",
    textColor: "text-white",
    icon: AlertCircle,
    label: "🔴 Incomplet",
    pulse: true
  }
};

export default function TimeEntryCard({ 
  entry, 
  employeeName, 
  onResetTimeEntry, 
  onAdminCheckout,
  onCompleteReset, // New prop for complete reset
  viewMode = "grid",
  timeSettings 
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const status = statusConfig[entry.status] || statusConfig.incomplete;
  const StatusIcon = status.icon;

  const calculateHours = () => {
    if (entry.check_in_time && entry.check_out_time) {
      const checkIn = new Date(`${entry.date}T${entry.check_in_time}`);
      const checkOut = new Date(`${entry.date}T${entry.check_out_time}`);
      const diffMs = checkOut - checkIn;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return "En cours";
  };

  const isRemoteWork = entry.ip_address && !entry.ip_address.startsWith('192.168');
  const isOutsideHours = timeSettings ? checkIfOutsideHours() : false;

  function checkIfOutsideHours() {
    if (!timeSettings || !entry.check_in_time) return false;
    
    const checkinTime = entry.check_in_time;
    const isEarly = checkinTime < timeSettings.check_in_start;
    const isLate = checkinTime > timeSettings.check_in_end;
    
    return (isEarly && !timeSettings.allow_early_checkin) || 
           (isLate && !timeSettings.allow_late_checkout);
  }

  const formatBreakDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const handleResetClick = async (e) => {
    e.stopPropagation();
    
    if (!onResetTimeEntry || entry.status !== 'checked_out') {
      return;
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir réinitialiser le pointage de ${employeeName} ?`
    );

    if (!confirmed) return;

    setIsResetting(true);
    try {
      await onResetTimeEntry(entry.id, employeeName);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    } finally {
      setIsResetting(false);
    }
  };

  const handleAdminCheckoutClick = (e) => {
    e.stopPropagation();
    if (onAdminCheckout) {
      onAdminCheckout(entry);
    }
  };

  // Mode liste compact
  if (viewMode === 'list') {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Avatar/Status */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <StatusIcon className="w-6 h-6 text-white" />
                </div>
                {status.pulse && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Info principale */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate">{employeeName}</h3>
                  <Badge className={`${status.color} ${status.textColor} text-xs px-2 py-1`}>
                    {status.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {entry.check_in_time} {entry.check_out_time ? `- ${entry.check_out_time}` : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(entry.date), 'dd/MM')}
                  </span>
                  <span className="flex items-center gap-1">
                    {isRemoteWork ? <Globe className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    {isRemoteWork ? 'Télétravail' : 'Bureau'}
                  </span>
                </div>
              </div>

              {/* Durée */}
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{calculateHours()}</div>
                <div className="text-xs text-gray-500">durée</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)}>
                <Eye className="w-4 h-4" />
              </Button>
              
              {entry.status === 'checked_in' && onAdminCheckout && (
                <Button variant="outline" size="sm" onClick={handleAdminCheckoutClick}>
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
              
              {entry.status === 'checked_out' && onResetTimeEntry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleResetClick}
                  disabled={isResetting}
                >
                  {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mode timeline
  if (viewMode === 'timeline') {
    return (
      <div className="relative">
        <div className="flex items-center gap-4 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="flex-1 bg-white/90 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{employeeName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {entry.check_in_time} - {entry.check_out_time || 'En cours'}
                </span>
              </div>
              <Badge className={`${status.color} ${status.textColor} text-xs`}>
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode grille (défaut) - Version améliorée
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -2 }}
      >
        <Card className="relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          {/* Barre de statut avec gradient */}
          <div className={`h-2 w-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
          
          {/* Indicateurs d'alerte */}
          <div className="absolute top-4 right-4 flex gap-2">
            {isRemoteWork && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Télétravail détecté</TooltipContent>
              </Tooltip>
            )}
            
            {isOutsideHours && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Pointage hors plage autorisée</TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              {/* En-tête avec employé et statut */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    {status.pulse && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-1">{employeeName}</h3>
                    <p className="text-sm text-gray-600">{format(new Date(entry.date), "EEEE, d MMMM yyyy")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`${status.color} ${status.textColor} shadow-md`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille d'informations principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Entrée</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {entry.check_in_time || "N/A"}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Square className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Sortie</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {entry.check_out_time || "En cours"}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Durée</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-800">
                    {calculateHours()}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Pauses</span>
                  </div>
                  <p className="text-lg font-medium text-orange-800">
                    {entry.break_sessions && entry.break_sessions.length > 0 ? 
                      `${entry.break_sessions.length} pause${entry.break_sessions.length > 1 ? 's' : ''}` :
                      'Aucune'
                    }
                  </p>
                  {entry.total_break_duration > 0 && (
                    <p className="text-xs text-orange-600">
                      {formatBreakDuration(entry.total_break_duration)}
                    </p>
                  )}
                </div>
              </div>

              {/* Informations de localisation */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Localisation
                  </h4>
                  <Badge variant="outline" className={isRemoteWork ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                    {isRemoteWork ? 'Télétravail' : 'Bureau'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600">Adresse:</span>
                      <p className="text-gray-800 font-medium">{entry.address || 'Non définie'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Smartphone className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-gray-600">Appareil:</span>
                      <p className="text-gray-800 font-medium">{entry.device_info || 'Non défini'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions administrateur */}
              <div className="flex flex-wrap gap-2 mt-6"> {/* Updated class for actions container */}
                {/* Checkout manuel pour les pointages en cours */}
                {entry.status === 'checked_in' && onAdminCheckout && (
                  <Button
                    onClick={() => onAdminCheckout(entry)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Pointer Sortie
                  </Button>
                )}
                
                {/* Bouton de réinitialisation pour les pointages terminés (Reprendre Sortie) */}
                {entry.status === 'checked_out' && onResetTimeEntry && (
                  <Button 
                    onClick={handleResetClick}
                    size="sm" 
                    variant="outline"
                    disabled={isResetting}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                  >
                    {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    {isResetting ? 'Reset...' : 'Reprendre Sortie'}
                  </Button>
                )}

                {/* NOUVEAU: Bouton de réinitialisation complète */}
                {onCompleteReset && (
                  <Button
                    onClick={() => onCompleteReset(entry.id, employeeName)}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Reset Complet
                  </Button>
                )}

                {/* Bouton Voir/Masquer détails */}
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showDetails ? 'Masquer' : 'Détails'}
                </Button>

                {entry.status === 'incomplete' && (
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Corriger
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal des détails (gardé identique) */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Détails du pointage - {employeeName}
            </DialogTitle>
            <DialogDescription>
              {format(new Date(entry.date), "EEEE, d MMMM yyyy")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Résumé temporel */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">Entrée</p>
                <p className="text-xl font-bold text-green-800">{entry.check_in_time || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">Sortie</p>
                <p className="text-xl font-bold text-blue-800">{entry.check_out_time || "En cours"}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-700">Durée totale</p>
                <p className="text-xl font-bold text-purple-800">{calculateHours()}</p>
              </div>
            </div>

            {/* Détails des pauses */}
            {entry.break_sessions && entry.break_sessions.length > 0 && (
              <div className="bg-orange-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Coffee className="w-5 h-5 text-orange-600" />
                  <h4 className="font-semibold text-orange-800">
                    Détail des pauses ({entry.break_sessions.length})
                  </h4>
                  <Badge className="bg-orange-200 text-orange-800 ml-auto">
                    Total: {formatBreakDuration(entry.total_break_duration)}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {entry.break_sessions.map((breakSession, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-orange-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-orange-900">
                            {breakSession.reason || `Pause ${index + 1}`}
                          </p>
                          <p className="text-sm text-orange-700">
                            {breakSession.start_time} - {breakSession.end_time || 'En cours'}
                          </p>
                          {breakSession.ended_with_checkout && (
                            <p className="text-xs text-orange-600 mt-1">
                              ⚠️ Terminée avec la sortie
                            </p>
                          )}
                          {breakSession.completed_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Complétée: {format(new Date(breakSession.completed_at), 'HH:mm:ss')}
                            </p>
                          )}
                        </div>
                        {breakSession.duration && (
                          <Badge className="bg-orange-100 text-orange-800">
                            {formatBreakDuration(breakSession.duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informations de localisation détaillées */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Localisation d'entrée
                </h4>
                <div className="space-y-2 pl-6">
                  {entry.address && (
                    <div className="flex items-start gap-2">
                      <Navigation className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-600">{entry.address}</span>
                    </div>
                  )}
                  {entry.ip_address && (
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-slate-600">IP: {entry.ip_address}</span>
                    </div>
                  )}
                  {entry.device_info && (
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-slate-600">{entry.device_info}</span>
                    </div>
                  )}
                  {entry.latitude && entry.longitude && (
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-slate-600">GPS: {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl">
                <h4 className="font-semibold text-sm text-slate-800 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Localisation de sortie
                </h4>
                <div className="space-y-2 pl-6">
                  {entry.checkout_address ? (
                    <>
                      <div className="flex items-start gap-2">
                        <Navigation className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-600">{entry.checkout_address}</span>
                      </div>
                      {entry.checkout_ip_address && (
                        <div className="flex items-center gap-2">
                          <Wifi className="w-3 h-3 text-purple-500" />
                          <span className="text-xs text-slate-600">IP: {entry.checkout_ip_address}</span>
                        </div>
                      )}
                      {entry.checkout_device_info && (
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-3 h-3 text-orange-500" />
                          <span className="text-xs text-slate-600">{entry.checkout_device_info}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      {entry.status === 'checked_out' ? 'Informations non disponibles' : 'Pointage de sortie en attente'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {entry.notes && (
              <div className="bg-amber-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Notes</h4>
                </div>
                <p className="text-amber-700 whitespace-pre-wrap">{entry.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
