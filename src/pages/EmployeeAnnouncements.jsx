import React, { useState, useEffect } from 'react';
import { Announcement, Employee, AuthService, AnnouncementReadStatus, Notification as NotificationEntity } from '@/api/supabaseEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, AlertTriangle, Info, Calendar, User as UserIcon, Bell, Video, ExternalLink, X, Loader, AlertCircle } from 'lucide-react';
import { format } from "date-fns";
import EmployeeAnnouncementCard from '../components/announcements/EmployeeAnnouncementCard';
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function EmployeeAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readStatuses, setReadStatuses] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeAnnouncements();
  }, []);

  const initializeAnnouncements = async () => {
    try {
      console.log('📢 Initializing Employee Announcements...');
      setIsLoading(true);
      setError(null);
      
      // Vérifier l'authentification
      const user = await AuthService.me();
      console.log('✅ User authenticated:', user.email);
      
      setCurrentUser(user);
      
      if (!user.is_active) {
        setError('Votre compte n\'est pas encore activé. Contactez votre administrateur.');
        return;
      }
      
      // Charger les données
      await loadAnnouncementData(user);
      
    } catch (error) {
      console.error('❌ Error initializing announcements:', error);
      setError('Erreur de connexion. Veuillez vous reconnecter.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnnouncementData = async (user) => {
    try {
      console.log('📊 Loading announcement data...');
      
      // Trouver l'employé actuel avec gestion d'erreur
      let employeeData = null;
      
      try {
        if (user && user.employee_id) {
          const employeeResults = await Employee.filter({ employee_id: user.employee_id });
          if (employeeResults && employeeResults.length > 0) {
            employeeData = employeeResults[0];
          }
        }
        
        if (!employeeData && user?.email) {
          const employeeResults = await Employee.filter({ email: user.email });
          if (employeeResults && employeeResults.length > 0) {
            employeeData = employeeResults[0];
          }
        }
      } catch (employeeError) {
        console.warn('Warning loading employee data:', employeeError);
        // Continue without employee data
      }

      setCurrentEmployee(employeeData);
      console.log('Employee data:', employeeData);

      // Charger les annonces avec gestion d'erreur
      let allAnns = [];
      let readData = [];
      let visibleAnns = [];

      try {
        allAnns = await Announcement.list("-created_date");
        console.log(`✅ Loaded ${allAnns.length} announcements`);
      } catch (announcementError) {
        console.error('Error loading announcements:', announcementError);
        allAnns = [];
      }

      // Charger les statuts de lecture avec gestion d'erreur
      if (employeeData) {
        try {
          readData = await AnnouncementReadStatus.filter({ employee_id: employeeData.id });
          console.log(`✅ Loaded ${readData.length} read statuses`);
        } catch (readError) {
          console.warn('Warning loading read statuses:', readError);
          readData = [];
        }

        // Filtrer les annonces visibles
        visibleAnns = allAnns.filter(ann => {
          if (!ann.is_published) return false;
          if (ann.expiry_date && new Date(ann.expiry_date) <= new Date()) return false;
          
          if (ann.target_audience === 'all') return true;
          if (ann.target_audience === 'department_specific' && ann.department_filter === employeeData.department) return true;
          
          return false;
        });
      } else {
        // Si pas d'employé, afficher seulement les annonces publiques
        visibleAnns = allAnns.filter(ann => 
          ann.is_published && ann.target_audience === 'all' &&
          (!ann.expiry_date || new Date(ann.expiry_date) > new Date())
        );
      }

      setReadStatuses(readData);
      setAnnouncements(visibleAnns);
      console.log(`✅ Filtered to ${visibleAnns.length} visible announcements`);

      // Charger les notifications avec gestion d'erreur
      try {
        const userNotifications = await NotificationEntity.filter({ user_id: user.id }, "-created_date", 10);
        setNotifications(userNotifications || []);
        console.log("✅ User notifications loaded:", userNotifications?.length || 0);
      } catch (notificationError) {
        console.warn('Warning loading notifications:', notificationError);
        setNotifications([]);
      }

    } catch (error) {
      console.error("❌ Error in loadAnnouncementData:", error);
      throw error;
    }
  };
  
  const markAsRead = async (announcement) => {
    if (!currentEmployee) {
      console.warn("No employee data available to mark announcement as read.");
      return;
    }

    try {
      console.log('📖 Marking announcement as read:', announcement.id);
      
      // Vérifier si déjà lu
      const existingStatus = readStatuses.find(status => 
        status.announcement_id === announcement.id && 
        status.employee_id === currentEmployee.id
      );

      if (existingStatus) {
        console.log('✅ Announcement already marked as read');
        return;
      }

      // Marquer comme lu
      const newReadStatus = await AnnouncementReadStatus.create({
        announcement_id: announcement.id,
        employee_id: currentEmployee.id,
        read_at: new Date().toISOString()
      });

      // Déclencher la gamification avec gestion d'erreur
      try {
        // Import dynamique pour éviter les erreurs de module
        const { useAnnouncementGamification } = await import('../components/gamification/AutoGamificationHooks');
        const { handleAnnouncementRead } = useAnnouncementGamification();
        
        await handleAnnouncementRead({
          announcement_id: announcement.id,
          announcement_created: announcement.created_date,
          read_at: new Date().toISOString(),
          title: announcement.title
        });
      } catch (gamificationError) {
        console.warn('Gamification failed (non-critical):', gamificationError);
        // Continue sans gamification
      }

      setReadStatuses(prev => [...prev, newReadStatus]);
      
      console.log('✅ Announcement marked as read successfully');
      
      toast({
        title: "Marqué comme lu",
        description: "L'annonce a été marquée comme lue",
      });
      
    } catch (error) {
      console.error('❌ Error marking announcement as read:', error);
      toast({ 
        title: "Erreur", 
        description: `Impossible de marquer comme lu : ${error.message || 'Erreur inconnue'}`, 
        variant: "destructive" 
      });
    }
  };

  const handleAnnouncementClick = (announcement) => {
    console.log('👆 Announcement clicked:', announcement.title);
    
    setSelectedAnnouncement(announcement);
    setShowModal(true);
    
    // Marquer comme lu après un court délai
    setTimeout(() => {
      markAsRead(announcement);
    }, 2000);
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await NotificationEntity.update(notification.id, { is_read: true });
        // Recharger les notifications
        if (currentUser) {
          const userNotifications = await NotificationEntity.filter({ user_id: currentUser.id }, "-created_date", 10);
          setNotifications(userNotifications || []);
        }
      }
      
      if (notification.link_to) {
        if (notification.type === 'meeting_request' || notification.link_to.startsWith('http')) {
          window.open(notification.link_to, '_blank', 'noopener,noreferrer');
        } else {
          console.log("Internal navigation to:", notification.link_to);
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-800",
    normal: "bg-blue-100 text-blue-800",
    high: "bg-amber-100 text-amber-800",
    urgent: "bg-red-100 text-red-800"
  };

  const priorityIcons = {
    low: <Info className="w-5 h-5 text-slate-600"/>,
    normal: <Megaphone className="w-5 h-5 text-blue-600"/>,
    high: <AlertTriangle className="w-5 h-5 text-amber-600"/>,
    urgent: <AlertTriangle className="w-5 h-5 text-red-600"/>
  };

  // Interface de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Chargement des annonces...</h3>
            <p className="text-sm text-gray-500 text-center">
              Nous chargeons vos annonces et notifications
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-96 p-8">
          <CardContent className="flex flex-col items-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
            <p className="text-sm text-red-700 text-center">{error}</p>
            <Button onClick={initializeAnnouncements} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Annonces & Notifications</h1>
          <p className="text-slate-600">Dernières nouvelles et mises à jour de l'entreprise.</p>
        </div>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Mes Notifications ({notifications.filter(n => !n.is_read).length} non lues)
            </h2>
            <div className="grid gap-3">
              {notifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ${
                    !notification.is_read ? 'ring-2 ring-blue-200' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="pt-1">
                        {notification.type === 'meeting_request' ? (
                          <Video className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Bell className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            {!notification.is_read && (
                              <Badge className="bg-blue-500 text-white text-xs">Nouveau</Badge>
                            )}
                            {notification.link_to && notification.link_to.startsWith('http') && (
                              <ExternalLink className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-slate-700 mt-1">{notification.message}</p>
                        <p className="text-sm text-slate-500 mt-2">
                          {format(new Date(notification.created_date), "d MMM yyyy à HH:mm")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Announcements Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Annonces Officielles
          </h2>
          <div className="grid gap-6">
            {announcements.length > 0 ? (
              announcements.map(ann => (
                <EmployeeAnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  priorityIcons={priorityIcons}
                  priorityColors={priorityColors}
                  isRead={readStatuses.some(status => 
                    status.announcement_id === ann.id && 
                    status.employee_id === currentEmployee?.id
                  )}
                  onCardClick={() => handleAnnouncementClick(ann)}
                  onMarkAsRead={null}
                />
              ))
            ) : (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800">Aucune annonce</h3>
                  <p className="text-slate-500 mt-2">Il n'y a pas de nouvelles annonces pour le moment.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="relative pr-8">
              <DialogTitle className="text-2xl font-bold text-slate-900 break-words pr-8">
                {selectedAnnouncement.title}
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-0 right-0" 
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[selectedAnnouncement.priority || 'normal']}`}>
                {selectedAnnouncement.priority ? selectedAnnouncement.priority.charAt(0).toUpperCase() + selectedAnnouncement.priority.slice(1) : 'Normal'}
              </span>
              {selectedAnnouncement.author_name && (
                <span className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> {selectedAnnouncement.author_name}
                </span>
              )}
              {selectedAnnouncement.created_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {format(new Date(selectedAnnouncement.created_date), "d MMM yyyy")}
                </span>
              )}
            </div>
            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none mb-4 text-slate-700 leading-relaxed" 
                 dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}>
            </div>
            {selectedAnnouncement.link && (
              <p className="text-sm mt-4">
                <a 
                  href={selectedAnnouncement.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Plus d'informations <ExternalLink className="w-4 h-4" />
                </a>
              </p>
            )}
            <DialogFooter className="mt-4 flex justify-end">
              <Button onClick={() => setShowModal(false)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}