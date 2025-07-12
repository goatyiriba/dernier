import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Clock, X } from "lucide-react";
import { format, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function EventNotifications({ events }) {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    // Filtrer les événements pour aujourd'hui et demain
    const upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.event_date);
      return (isToday(eventDate) || isTomorrow(eventDate)) && !dismissed.has(event.id);
    });

    setNotifications(upcomingEvents);
  }, [events, dismissed]);

  const dismissNotification = (eventId) => {
    setDismissed(prev => new Set([...prev, eventId]));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 space-y-2"
    >
      <AnimatePresence>
        {notifications.slice(0, 3).map((event) => {
          const eventDate = new Date(event.event_date);
          const isEventToday = isToday(eventDate);
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={isEventToday ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                        {isEventToday ? "Aujourd'hui" : "Demain"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {event.event_type}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {event.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{format(eventDate, "dd MMM", { locale: fr })}</span>
                      {event.event_time && (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{event.event_time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(event.id)}
                  className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {notifications.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 rounded-lg p-2 text-center text-xs text-gray-600"
        >
          +{notifications.length - 3} autres notifications
        </motion.div>
      )}
    </motion.div>
  );
}