
import React, { useState, useEffect, useRef } from "react";
import { AuthService } from "@/api/supabaseEntities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, // Added DropdownMenuItem
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Megaphone,
  MessageCircle,
  Target,
  Gift,
  // Settings, // Removed as per outline
  // Trash2, // Removed as per outline
  // CheckCheck // Removed as per outline (button is gone)
} from "lucide-react";
import { format } from "date-fns"; // Only format is needed now
// import { fr } from "date-fns/locale"; // Not needed with the new date format
import { AnimatePresence, motion } from "framer-motion"; // AnimatePresence is still used for the bell badge
import { useToast } from "@/components/ui/use-toast"; // Still used for error toasts

// Helper functions (kept as is, though some might not be used directly in the new UI presentation)
const getNotificationIcon = (type) => {
  const iconMap = {
    announcement_read: Megaphone,
    leave_request: Calendar,
    new_announcement: Megaphone,
    meeting_request: Users,
    new_survey: FileText,
    event_reminder: Calendar,
    message: MessageCircle,
    system_alert: AlertCircle,
    employee_action: Users,
    admin_response: CheckCircle,
    time_tracking: Clock,
    gamification_rewards: Gift,
    deadline_reminders: Target,
    performance_reviews: Target,
    document_updates: FileText,
    birthday_wishes: Gift,
    work_anniversaries: Gift,
    overtime_alerts: Clock,
    security_alerts: AlertCircle,
    team_updates: Users,
    project_assignments: Target,
    task_updates: Target,
    survey_invitations: FileText,
    urgent_messages: MessageCircle,
    schedule_changes: Calendar
  };
  return iconMap[type] || Bell;
};

const getNotificationColor = (type, priority) => {
  if (priority === 'urgent') return 'text-red-600 bg-red-50';
  
  const colorMap = {
    announcement_read: 'text-blue-600 bg-blue-50',
    leave_request: 'text-orange-600 bg-orange-50',
    new_announcement: 'text-purple-600 bg-purple-50',
    meeting_request: 'text-green-600 bg-green-50',
    message: 'text-pink-600 bg-pink-50',
    system_alert: 'text-red-600 bg-red-50',
    gamification_rewards: 'text-yellow-600 bg-yellow-50',
    time_tracking: 'text-indigo-600 bg-indigo-50'
  };
  return colorMap[type] || 'text-gray-600 bg-gray-50';
};

export default function NotificationSystem({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // lastCheck and intervalRef are removed as per new polling logic
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser?.id) {
      loadNotifications();
      // Actualiser les notifications toutes les 5 minutes au lieu de 30 secondes
      const interval = setInterval(loadNotifications, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [currentUser]); // currentUser as dependency to re-initiate if user changes

  const loadNotifications = async () => {
    if (!currentUser?.id || isLoading) return;
    
    setIsLoading(true);
    console.log(`🔔 Chargement notifications pour user: ${currentUser.id}`);

    try {
      // CORRECTION: Utiliser le cache API avec gestion d'erreur robuste
      // Directly using Notification.filter with new parameters
      const userNotifications = await AuthService.getNotifications(currentUser.id);
      
      console.log(`📬 ${userNotifications?.length || 0} notifications trouvées`);

      if (userNotifications && Array.isArray(userNotifications)) {
        // Sort by created_date (newest first) already handled by '-created_date'
        // But if API doesn't guarantee, a client-side sort is safer:
        const sortedNotifications = userNotifications.sort((a, b) => 
          new Date(b.created_date) - new Date(a.created_date)
        );
        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter(n => !n.is_read).length);
        console.log(`📊 Notifications: ${sortedNotifications.length} total, ${sortedNotifications.filter(n => !n.is_read).length} non lues`);
      } else {
        console.warn('Invalid notifications data received, using empty state');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("❌ Erreur chargement notifications:", error);
      
      // Gestion spécifique des erreurs réseau
      if (error.message && error.message.includes('Network Error')) {
        console.warn("Network error - keeping existing notifications state");
        // Do not clear notifications on network error to preserve existing data
      } else if (error.message && error.message.includes('429')) {
        console.warn("Rate limited - skipping notification update");
      } else {
        // For other errors, use empty state
        setNotifications([]);
        setUnreadCount(0);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await AuthService.markNotificationAsRead(notificationId);
      
      // Optimistic UI update
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log(`✅ Notification ${notificationId} marquée comme lue`);
    } catch (error) {
      console.error("❌ Erreur marquage notification comme lue:", error);
      if (error.message && error.message.includes('Network Error')) {
        console.warn("Network error marking notification as read.");
        toast({
          title: "Erreur réseau",
          description: "Veuillez vérifier votre connexion pour marquer la notification comme lue.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de marquer la notification comme lue.",
          variant: "destructive"
        });
      }
    }
  };

  // markAllAsRead and deleteNotification functions are no longer triggered from UI
  // but keeping them in case they are called from other parts of the application.
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      
      for (const notification of unreadNotifications) {
        await AuthService.markNotificationAsRead(notification.id);
      }
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      toast({
        title: "✅ Toutes les notifications ont été marquées comme lues",
        duration: 2000,
      });
      
      console.log(`✅ ${unreadNotifications.length} notifications marquées comme lues`);
    } catch (error) {
      console.error("❌ Erreur marquage toutes notifications:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications comme lues",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await AuthService.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.is_read ? Math.max(0, prev - 1) : prev;
      });
      
      toast({
        title: "🗑️ Notification supprimée",
        duration: 2000,
      });
      
      console.log(`🗑️ Notification ${notificationId} supprimée`);
    } catch (error) {
      console.error("❌ Erreur suppression notification:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      });
    }
  };

  // handleNotificationClick function removed as logic is integrated into DropdownMenuItem onClick

  if (!currentUser) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" // Changed from "sm" to "icon"
          className="relative" // Simplified class, removed "notification-bell" and hover styles
        >
          <Bell className="w-5 h-5 text-gray-700" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full animate-pulse" // Simplified badge styling
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 overflow-y-auto" // Simplified styling, removed Card related classes
      >
        <div className="p-3 border-b"> {/* Replaced CardHeader with div */}
          <h3 className="font-semibold flex items-center justify-between">
            <span>Notifications</span>
            {isLoading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <DropdownMenuItem 
              key={notification.id}
              className={`p-3 cursor-pointer border-b last:border-b-0 ${
                !notification.is_read ? 'bg-blue-50' : '' // Simplified unread background
              }`}
              onClick={async () => { // Integrated handleNotificationClick logic
                if (!notification.is_read) {
                  await markAsRead(notification.id);
                }
                if (notification.link_to) {
                  if (notification.link_to.startsWith('http')) {
                    window.open(notification.link_to, '_blank', 'noopener,noreferrer'); // Added rel for security
                  } else {
                    setIsOpen(false); // Close dropdown before navigating
                    window.location.href = notification.link_to;
                  }
                }
              }}
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm leading-tight">{notification.title}</p>
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-tight">{notification.message}</p>
                <p className="text-xs text-gray-400">
                  {format(new Date(notification.created_date), "d MMM yyyy à HH:mm")}
                </p>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune notification</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
