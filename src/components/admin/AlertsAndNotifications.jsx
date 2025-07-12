import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Bell,
  CheckCircle,
  X,
  Eye,
  ArrowRight,
  Flame,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const AlertItem = ({ type, title, description, count, severity, href, onDismiss }) => {
  const severityStyles = {
    critical: {
      bg: 'from-red-500 to-red-600',
      light: 'from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600'
    },
    high: {
      bg: 'from-orange-500 to-amber-500',
      light: 'from-orange-50 to-amber-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600'
    },
    medium: {
      bg: 'from-blue-500 to-indigo-500',
      light: 'from-blue-50 to-indigo-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    low: {
      bg: 'from-gray-500 to-slate-500',
      light: 'from-gray-50 to-slate-100',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: 'text-gray-600'
    }
  };

  const style = severityStyles[severity] || severityStyles.medium;
  
  const getIcon = () => {
    switch(type) {
      case 'leave': return Calendar;
      case 'time': return Clock;
      case 'announcement': return Bell;
      default: return AlertTriangle;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group p-4 rounded-xl bg-gradient-to-r ${style.light} border ${style.border} hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${style.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
          {severity === 'critical' && (
            <Flame className="absolute w-3 h-3 text-yellow-300 animate-pulse" style={{ top: '-2px', right: '-2px' }} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${style.text}`}>{title}</h4>
            {count > 0 && (
              <Badge className={`${style.text} bg-white/80 text-xs px-2 py-0`}>
                {count}
              </Badge>
            )}
            {severity === 'critical' && (
              <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0 animate-pulse">
                URGENT
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          
          <div className="flex items-center gap-2">
            {href && (
              <Link to={href}>
                <Button size="sm" className="text-xs h-7">
                  <Eye className="w-3 h-3 mr-1" />
                  Voir
                </Button>
              </Link>
            )}
            {onDismiss && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs h-7"
                onClick={onDismiss}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Traité
              </Button>
            )}
          </div>
        </div>
        
        {severity === 'critical' && (
          <div className="flex-shrink-0">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function AlertsAndNotifications({ 
  pendingLeaves, 
  incompleteEntries, 
  urgentAnnouncements, 
  detailed = false 
}) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const alerts = [
    ...(pendingLeaves > 0 ? [{
      id: 'pending-leaves',
      type: 'leave',
      title: 'Demandes de Congés',
      description: `${pendingLeaves} demande${pendingLeaves > 1 ? 's' : ''} en attente d'approbation`,
      count: pendingLeaves,
      severity: pendingLeaves > 10 ? 'critical' : pendingLeaves > 5 ? 'high' : 'medium',
      href: createPageUrl('LeaveManagement')
    }] : []),
    
    ...(incompleteEntries > 0 ? [{
      id: 'incomplete-time',
      type: 'time',
      title: 'Pointages Incomplets',
      description: `${incompleteEntries} pointage${incompleteEntries > 1 ? 's' : ''} nécessite${incompleteEntries > 1 ? 'nt' : ''} une correction`,
      count: incompleteEntries,
      severity: incompleteEntries > 5 ? 'high' : 'medium',
      href: createPageUrl('TimeTracking')
    }] : []),
    
    ...(urgentAnnouncements > 0 ? [{
      id: 'urgent-announcements',
      type: 'announcement',
      title: 'Annonces Urgentes',
      description: `${urgentAnnouncements} annonce${urgentAnnouncements > 1 ? 's' : ''} nécessite${urgentAnnouncements > 1 ? 'nt' : ''} votre attention`,
      count: urgentAnnouncements,
      severity: 'high',
      href: createPageUrl('Announcements')
    }] : [])
  ].filter(alert => !dismissedAlerts.has(alert.id));

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              criticalAlerts > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' :
              totalAlerts > 0 ? 'bg-gradient-to-br from-orange-500 to-amber-500' :
              'bg-gradient-to-br from-green-500 to-emerald-600'
            }`}>
              {totalAlerts > 0 ? (
                <AlertTriangle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle className="w-5 h-5 text-white" />
              )}
            </div>
            
            <div>
              <span className="font-semibold">
                {totalAlerts > 0 ? 'Alertes Système' : 'Système OK'}
              </span>
              {totalAlerts > 0 && (
                <Badge className={`ml-2 ${
                  criticalAlerts > 0 ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {totalAlerts} alert{totalAlerts > 1 ? 'es' : 'e'}
                </Badge>
              )}
            </div>
          </div>
          
          {criticalAlerts > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm text-red-600 font-medium">Action Requise</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="popLayout">
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  {...alert}
                  onDismiss={detailed ? () => handleDismiss(alert.id) : undefined}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tout est en ordre !</h3>
              <p className="text-sm text-gray-600">
                Aucune alerte système. Votre plateforme fonctionne parfaitement.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}