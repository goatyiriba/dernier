import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, ExternalLink } from 'lucide-react';
import { format } from "date-fns";

export default function EmployeeAnnouncementCard({ 
  announcement, 
  priorityIcons, 
  priorityColors, 
  isRead, 
  onCardClick,
  onMarkAsRead 
}) {
  
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    }
  };

  const handleMarkAsRead = (e) => {
    e?.stopPropagation();
    if (onMarkAsRead) {
      onMarkAsRead(announcement);
    }
  };

  if (!announcement) {
    return null;
  }

  return (
    <Card 
      className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isRead ? 'opacity-70' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="pt-1">
              {priorityIcons?.[announcement.priority] || priorityIcons?.normal}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xl text-slate-900 line-clamp-2">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors?.[announcement.priority] || priorityColors?.normal}>
                    {announcement.priority || 'normal'}
                  </Badge>
                  {announcement.link && (
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
              
              <div className="text-slate-700 line-clamp-3">
                {announcement.content ? (
                  <div dangerouslySetInnerHTML={{ 
                    __html: announcement.content.length > 200 
                      ? announcement.content.substring(0, 200) + '...' 
                      : announcement.content 
                  }} />
                ) : (
                  <p>Contenu non disponible</p>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {announcement.created_date 
                        ? format(new Date(announcement.created_date), "d MMM yyyy")
                        : 'Date inconnue'
                      }
                    </span>
                  </div>
                  {announcement.author_name && (
                    <span className="text-slate-600">
                      Par {announcement.author_name}
                    </span>
                  )}
                </div>
                
                {onMarkAsRead && (
                  <Button 
                    size="sm"
                    variant={isRead ? "secondary" : "default"}
                    onClick={handleMarkAsRead}
                    disabled={isRead}
                    className={`transition-colors ${
                      isRead 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isRead ? "Lu" : "Marquer comme lu"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}