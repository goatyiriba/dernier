import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Gift,
  Heart,
  Briefcase,
  GraduationCap,
  PartyPopper,
  Plane,
  AlertCircle
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const eventTypeIcons = {
  birthday: Gift,
  anniversary: Heart,
  meeting: Briefcase,
  training: GraduationCap,
  celebration: PartyPopper,
  holiday: Plane,
  deadline: AlertCircle,
  other: Calendar
};

export default function EventCalendar({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const getEventsForDate = (date) => {
    return events.filter(event => 
      isSameDay(new Date(event.event_date), date)
    );
  };

  const renderCalendarDays = () => {
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayEvents = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      
      days.push(
        <motion.div
          key={day.toString()}
          whileHover={{ scale: 1.02 }}
          className={`min-h-[120px] p-2 border border-gray-100 ${
            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
          } ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <div className={`text-sm font-medium mb-2 ${
            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
          } ${isCurrentDay ? 'text-blue-600' : ''}`}>
            {format(day, 'd')}
            {isCurrentDay && (
              <div className="w-2 h-2 bg-blue-500 rounded-full ml-1 inline-block"></div>
            )}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => {
              const Icon = eventTypeIcons[event.event_type];
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onEventClick(event)}
                  className="px-2 py-1 rounded text-xs cursor-pointer transition-all"
                  style={{ 
                    backgroundColor: event.color || '#3B82F6',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center gap-1 truncate">
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{event.title}</span>
                  </div>
                </motion.div>
              );
            })}
            
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 pl-2">
                +{dayEvents.length - 3} autres
              </div>
            )}
          </div>
        </motion.div>
      );
      
      day = addDays(day, 1);
    }

    return days;
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendrier des Événements
          </CardTitle>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevMonth}
                className="p-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h2 className="text-lg font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </h2>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="p-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <Badge variant="outline">
              {events.length} événements ce mois
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-0 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {renderCalendarDays()}
        </div>
        
        {/* Légende */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="text-sm text-gray-600 font-medium">Légende :</div>
          {Object.entries(eventTypeIcons).map(([type, Icon]) => (
            <div key={type} className="flex items-center gap-1 text-xs">
              <Icon className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 capitalize">
                {type === 'birthday' ? 'Anniversaire' :
                 type === 'anniversary' ? 'Anniversaire Ent.' :
                 type === 'meeting' ? 'Réunion' :
                 type === 'training' ? 'Formation' :
                 type === 'celebration' ? 'Célébration' :
                 type === 'holiday' ? 'Congé' :
                 type === 'deadline' ? 'Échéance' : 'Autre'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}