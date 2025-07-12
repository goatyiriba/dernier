import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  Calendar, 
  User,
  RefreshCw,
  Play,
  Pause,
  Eye,
  ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ActivityItem = ({ activity, index }) => {
  const getIcon = () => {
    switch(activity.type) {
      case 'clock': return Clock;
      case 'leave': return Calendar;
      case 'user': return User;
      default: return Activity;
    }
  };

  const getStatusColor = () => {
    switch(activity.status) {
      case 'checked_in': return 'bg-green-100 text-green-700';
      case 'checked_out': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Denied': return 'bg-red-100 text-red-700';
      case 'incomplete': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
            {activity.title}
          </h4>
          <Badge className={`${getStatusColor()} text-xs px-2 py-0`}>
            {activity.status}
          </Badge>
        </div>
        <p className="text-xs text-gray-600 mb-1">{activity.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {activity.time ? formatDistanceToNow(new Date(activity.time), { 
              addSuffix: true, 
              locale: fr 
            }) : 'Il y a quelques instants'}
          </span>
          <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2">
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function LiveActivityStream({ activities = [] }) {
  const [isLive, setIsLive] = useState(true);
  const [displayedActivities, setDisplayedActivities] = useState(activities.slice(0, 8));

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulation de nouvelles activités
        setDisplayedActivities(prev => {
          const newActivities = [...activities.slice(0, 8)];
          return newActivities;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLive, activities]);

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  const handleRefresh = () => {
    setDisplayedActivities(activities.slice(0, 8));
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Activité en Direct
            {isLive && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">LIVE</span>
              </div>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleLive}
              className="h-8"
            >
              {isLive ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Live
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              className="h-8"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {displayedActivities.length > 0 ? (
              displayedActivities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.type}-${index}`}
                  activity={activity}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">Aucune activité récente</p>
                <p className="text-xs text-gray-500 mt-1">
                  Les nouvelles activités apparaîtront ici automatiquement
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer avec statistiques */}
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-600">{displayedActivities.length} activités</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500">Temps réel</span>
              </div>
            </div>
            
            <Button size="sm" variant="ghost" className="text-xs h-6 px-2">
              Voir tout
              <ArrowUpRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}