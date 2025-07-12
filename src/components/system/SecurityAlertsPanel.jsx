import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  Clock,
  MapPin,
  User,
  Smartphone
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const severityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200"
};

const severityIcons = {
  low: <Shield className="w-4 h-4" />,
  medium: <AlertTriangle className="w-4 h-4" />,
  high: <AlertTriangle className="w-4 h-4" />,
  critical: <AlertTriangle className="w-4 h-4" />
};

export default function SecurityAlertsPanel({ alerts }) {
  const handleResolveAlert = async (alertId) => {
    // Cette fonction sera implémentée plus tard
    console.log('Resolving alert:', alertId);
  };

  const handleInvestigateAlert = async (alertId) => {
    // Cette fonction sera implémentée plus tard
    console.log('Investigating alert:', alertId);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Alertes de Sécurité Actives
          {alerts.length > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-100' :
                      alert.severity === 'high' ? 'bg-orange-100' :
                      alert.severity === 'medium' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {severityIcons[alert.severity]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {alert.title}
                        </h4>
                        <Badge variant="outline" className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {alert.ip_address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>IP: {alert.ip_address}</span>
                          </div>
                        )}
                        {alert.user_id && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>User ID: {alert.user_id}</span>
                          </div>
                        )}
                        {alert.device_info && (
                          <div className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3" />
                            <span>{alert.device_info}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(alert.created_date), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleInvestigateAlert(alert.id)}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Enquêter
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleResolveAlert(alert.id)}
                    className="text-xs bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Résoudre
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune alerte active
              </h3>
              <p className="text-gray-500 text-sm">
                Votre système est sécurisé - aucune menace détectée
              </p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}