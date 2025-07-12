

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Employee, Notification, User, LeaveRequest, TimeEntry, Announcement, AnnouncementReadStatus, AppSettings } from "@/api/entities";
import {
  LayoutDashboard,
  Users,
  Calendar,
  TrendingUp,
  Building2,
  Menu,
  Settings,
  Clock,
  FileText,
  Megaphone,
  LogOut,
  Shield,
  UserPlus,
  Database,
  Bell,
  Video,
  DollarSign,
  HelpCircle,
  FileQuestion,
  Target,
  Palette,
  MessageCircle,
  BarChart3,
  X,
  User as UserIcon,
  Award,
  Trophy,
  Crown, // Added Crown import
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cachedApiCall, apiCache } from "@/components/utils/apiCache";

import LanguageProvider, { useTranslation } from "@/components/utils/i18n";
import NotificationSystem from "@/components/notifications/NotificationSystem";
import MessageNotificationSystem from "@/components/notifications/MessageNotificationSystem";
import { globalLogger } from "@/components/utils/globalLogger";
import ActivityTracker from "@/components/tracking/ActivityTracker";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import AvatarGenerator from "@/components/ui/AvatarGenerator";
import { format } from 'date-fns';

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [appSettings, setAppSettings] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [counters, setCounters] = useState({
    pendingLeaves: 0,
    incompleteTimeEntries: 0,
    urgentAnnouncements: 0,
    pendingUsers: 0,
    myPendingLeaves: 0,
    unreadAnnouncements: 0
  });
  const { toast } = useToast();

  const { t, isRTL } = useTranslation();

  useEffect(() => {
    document.documentElement.classList.add('light');

    globalLogger.logUserAction('app_startup', {
      page: currentPageName,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });

    if (location.pathname.includes(createPageUrl("PendingApproval"))) {
      setIsLoading(false);
      return;
    }

    if (location.pathname.includes(createPageUrl("Home")) || location.pathname === '/') {
      setIsLoading(false);
      setAppSettings({
        app_name: 'Flow HR',
        company_name: 'Flow HR',
        primary_color: '#4F46E5',
        secondary_color: '#059669',
        accent_color: '#DC2626',
        background_color: '#F8FAFC',
        text_color: '#1E293B',
        sidebar_color: '#FFFFFF',
        header_background: '#FFFFFF',
        enable_dark_mode: false,
        enable_custom_css: false,
        is_active: true
      });
      return;
    }

    checkAuth();
    loadAppSettings();
  }, [location.pathname]);

  useEffect(() => {
    if (currentUser) {
      fetchEmployeeDetails();
      fetchNotifications();
      fetchCounters();

      const interval = setInterval(() => {
        fetchNotifications();
        fetchCounters();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const applySettings = (settings) => {
    document.title = settings.app_name || 'Flow HR';

    if (settings.favicon_url) {
      let favicon = document.querySelector("link[rel~='icon']");
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
    }

    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primary_color || '#4F46E5');
    root.style.setProperty('--secondary-color', settings.secondary_color || '#059669');
    root.style.setProperty('--accent-color', settings.accent_color || '#DC2626');
    root.style.setProperty('--background-color', settings.background_color || '#F8FAFC');
    root.style.setProperty('--text-color', settings.text_color || '#1E293B');
    root.style.setProperty('--sidebar-color', settings.sidebar_color || '#FFFFFF');
    root.style.setProperty('--header-background', settings.header_background || '#FFFFFF');

    if (settings.enable_custom_css && settings.custom_css) {
      let customStyleElement = document.getElementById('custom-branding-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-branding-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = settings.custom_css;
    } else {
        const customStyleElement = document.getElementById('custom-branding-styles');
        if (customStyleElement) {
            document.head.removeChild(customStyleElement);
        }
    }

    if (settings.enable_dark_mode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
  };

  const loadAppSettings = async () => {
    const cachedSettings = localStorage.getItem('appSettings');
    const lastSettingsLoad = localStorage.getItem('lastSettingsLoad');
    const now = Date.now();
    const fiveMinutesAgo = now - 300000;

    if (cachedSettings && lastSettingsLoad && parseInt(lastSettingsLoad) > fiveMinutesAgo) {
      try {
        const settings = JSON.parse(cachedSettings);
        setAppSettings(settings);
        applySettings(settings);
        console.log("Using cached app settings");
        return;
      } catch (error) {
        console.warn("Failed to parse cached settings:", error);
      }
    }

    try {
      console.log("Loading app settings from API...");

      await new Promise(resolve => setTimeout(resolve, 1000));

      const settingsList = await AppSettings.list();
      console.log("Settings loaded:", settingsList);

      const activeSettings = settingsList.find(s => s.is_active) || settingsList[0];

      if (activeSettings) {
        setAppSettings(activeSettings);
        applySettings(activeSettings);

        localStorage.setItem('appSettings', JSON.stringify(activeSettings));
        localStorage.setItem('lastSettingsLoad', now.toString());

        console.log("Active settings found and cached:", activeSettings);
      } else {
        console.log("No settings found, using defaults");
        const defaultSettings = {
          app_name: 'Flow HR',
          company_name: 'Mon Entreprise',
          primary_color: '#4F46E5',
          secondary_color: '#059669',
          accent_color: '#DC2626',
          background_color: '#F8FAFC',
          text_color: '#1E293B',
          sidebar_color: '#FFFFFF',
          header_background: '#FFFFFF',
          enable_dark_mode: false,
          enable_custom_css: false,
          is_active: true
        };
        setAppSettings(defaultSettings);
        applySettings(defaultSettings);
      }
    } catch (error) {
      console.error("Error loading app settings:", error);

      if (error.message && error.message.includes('429')) {
        console.warn("Rate limit hit for app settings, using fallback");

        if (cachedSettings) {
          try {
            const settings = JSON.parse(cachedSettings);
            setAppSettings(settings);
            applySettings(settings);
            console.log("Using expired cached settings due to rate limit");
            return;
          } catch (parseError) {
            console.warn("Failed to parse cached settings:", parseError);
          }
        }
      }

      const defaultSettings = {
        app_name: 'Flow HR',
        company_name: 'Mon Entreprise',
        primary_color: '#4F46E5',
        secondary_color: '#059669',
        accent_color: '#DC2626',
        background_color: '#F8FAFC',
        text_color: '#1E293B',
        sidebar_color: '#FFFFFF',
        header_background: '#FFFFFF',
        enable_dark_mode: false,
        enable_custom_css: false,
        is_active: true
      };
      setAppSettings(defaultSettings);
      applySettings(defaultSettings);
    }
  };

  const fetchCounters = async () => {
    if (!currentUser) return;

    try {
      const isAdmin = currentUser.role === 'admin' || currentUser.email === 'syllacloud@gmail.com';

      if (isAdmin) {
        try {
          const leaveRequests = await cachedApiCall(LeaveRequest, 'list');
          await new Promise(resolve => setTimeout(resolve, 3000));

          const timeEntries = await cachedApiCall(TimeEntry, 'list');
          await new Promise(resolve => setTimeout(resolve, 3000));

          const announcements = await cachedApiCall(Announcement, 'list');
          await new Promise(resolve => setTimeout(resolve, 3000));

          let allUsers = [];
          const cachedUsers = localStorage.getItem('layoutCachedUsers');
          const lastCacheTime = localStorage.getItem('layoutUserCacheTime');
          const now = Date.now();
          const fiveMinutesAgo = now - 300000;

          if (cachedUsers && lastCacheTime && parseInt(lastCacheTime) > fiveMinutesAgo) {
            allUsers = JSON.parse(cachedUsers);
          } else {
            try {
              await new Promise(resolve => setTimeout(resolve, 2000));
              allUsers = await cachedApiCall(User, 'list');
              localStorage.setItem('layoutCachedUsers', JSON.stringify(allUsers));
              localStorage.setItem('layoutUserCacheTime', now.toString());
            } catch (userError) {
              console.warn("Could not load users for layout, using old cache:", userError);
              if (cachedUsers) {
                allUsers = JSON.parse(cachedUsers);
              }
            }
          }

          setCounters({
            pendingLeaves: leaveRequests.filter(r => r.status === "Pending").length,
            incompleteTimeEntries: timeEntries.filter(t => t.status === "incomplete").length,
            urgentAnnouncements: announcements.filter(a => a.is_published && a.priority === "urgent").length,
            pendingUsers: allUsers.filter(u => !u.is_active && u.email !== 'syllacloud@gmail.com').length,
            myPendingLeaves: 0,
            unreadAnnouncements: 0
          });
        } catch (adminError) {
          console.error("Error fetching admin counters:", adminError);
          setCounters(prevCounters => ({
            ...prevCounters,
            ...(Object.values(prevCounters).every(v => v === 0) && {
              pendingLeaves: 0,
              incompleteTimeEntries: 0,
              urgentAnnouncements: 0,
              pendingUsers: 0,
              myPendingLeaves: 0,
              unreadAnnouncements: 0
            })
          }));
        }
      } else {
        let employeeData = null;

        try {
          if (currentUser.employee_id) {
            const employeeResults = await cachedApiCall(Employee, 'filter', { filters: { employee_id: currentUser.employee_id } });
            if (employeeResults.length > 0) {
              employeeData = employeeResults[0];
            }
          }

          if (!employeeData) {
            const employeeResults = await cachedApiCall(Employee, 'filter', { filters: { email: currentUser.email } });
            if (employeeResults.length > 0) {
              employeeData = employeeResults[0];
            }
          }

          if (employeeData) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const leaveRequests = await cachedApiCall(LeaveRequest, 'filter', { filters: { employee_id: employeeData.id } });

            await new Promise(resolve => setTimeout(resolve, 2000));
            const announcements = await cachedApiCall(Announcement, 'list');

            let readStatuses = [];
            try {
              readStatuses = await cachedApiCall(AnnouncementReadStatus, 'filter', { filters: { employee_id: employeeData.id } });
            } catch (error) {
              console.warn("Could not load read statuses:", error);
            }

            const visibleAnnouncements = announcements.filter(ann =>
              ann.is_published &&
              (!ann.expiry_date || new Date(ann.expiry_date) > new Date()) &&
              (ann.target_audience === 'all' ||
              (ann.target_audience === 'department_specific' && ann.department_filter === employeeData.department))
            );

            const readAnnouncementIds = new Set(readStatuses.map(r => r.announcement_id));
            const unreadCount = visibleAnnouncements.filter(ann => !readAnnouncementIds.has(ann.id)).length;
            const pendingLeaves = leaveRequests.filter(r => r.status === "Pending").length;

            setCounters({
              pendingLeaves: 0,
              incompleteTimeEntries: 0,
              urgentAnnouncements: 0,
              pendingUsers: 0,
              myPendingLeaves: pendingLeaves,
              unreadAnnouncements: unreadCount
            });
          } else {
            setCounters({
              pendingLeaves: 0,
              incompleteTimeEntries: 0,
              urgentAnnouncements: 0,
              pendingUsers: 0,
              myPendingLeaves: 0,
              unreadAnnouncements: 0
            });
          }
        } catch (employeeError) {
          console.error("Error fetching employee counters:", employeeError);
          setCounters(prevCounters => ({
            ...prevCounters,
            ...(Object.values(prevCounters).every(v => v === 0) && {
              pendingLeaves: 0,
              incompleteTimeEntries: 0,
              urgentAnnouncements: 0,
              pendingUsers: 0,
              myPendingLeaves: 0,
              unreadAnnouncements: 0
            })
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch counters", error);
      if (error.message && error.message.includes('429')) {
        console.warn("Rate limit hit for counters, will retry on next interval");
        setTimeout(() => {
          fetchCounters();
        }, 60000);
      }
    }
  };

  const createAdminNavigationItems = () => [
    {
      title: t('nav.dashboard'),
      url: createPageUrl("AdminDashboard"),
      icon: LayoutDashboard,
    },
    {
      title: t('nav.employees'),
      url: createPageUrl("Employees"),
      icon: Users,
    },
    {
      title: t('nav.timeTracking'),
      url: createPageUrl("TimeTracking"),
      icon: Clock,
      counter: counters.incompleteTimeEntries
    },
    {
      title: t('nav.leaveManagement'),
      url: createPageUrl("LeaveManagement"),
      icon: Calendar,
      counter: counters.pendingLeaves
    },
    {
      title: t('nav.performance'),
      url: createPageUrl("Performance"),
      icon: TrendingUp,
    },
    {
      title: '🏆 Classement',
      url: createPageUrl("Leaderboard"),
      icon: Trophy,
    },
    {
      title: 'Gamification',
      url: createPageUrl("GamificationAdmin"),
      icon: Award,
    },
    {
      title: '⭐ Employé Semaine',
      url: createPageUrl("EmployeeOfTheWeekManager"),
      icon: Crown,
    },
    {
      title: t('nav.events'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("Events"),
      icon: Calendar,
    },
    {
      title: t('nav.collaborativeCalendar'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("AdminCalendarTracking"),
      icon: Calendar,
    },
    {
      title: t('nav.finance'),
      url: createPageUrl("Finance"),
      icon: DollarSign,
    },
    {
      title: 'Sondages',
      url: createPageUrl("Surveys"),
      icon: FileText,
    },
    {
      title: t('nav.announcements'),
      url: createPageUrl("Announcements"),
      icon: Megaphone,
      counter: counters.urgentAnnouncements
    },
    {
      title: t('nav.messages'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("Messages"),
      icon: MessageCircle,
    },
    {
      title: 'Analyse Messages',
      url: createPageUrl("AdminMessages"),
      icon: BarChart3,
    },
    {
      title: t('nav.documents'),
      url: createPageUrl("Documents"),
      icon: FileText,
    },
    {
      title: 'System Monitoring',
      url: createPageUrl("SystemMonitoring"),
      icon: Database,
    },
    {
      title: 'Admin Management',
      url: createPageUrl("AdminManagement"),
      icon: UserPlus,
      counter: counters.pendingUsers
    },
    {
      title: 'Platform Customizer',
      url: createPageUrl("PlatformCustomizer"),
      icon: Settings,
    },
    {
      title: 'Branding Settings',
      url: createPageUrl("BrandingSettings"),
      icon: Palette,
    },
    {
      title: 'Documentation Dev',
      url: createPageUrl("DeveloperDocs"),
      icon: HelpCircle,
    },
    {
      title: t('nav.help'),
      url: createPageUrl("AdminHelp"),
      icon: HelpCircle,
    },
    {
      title: t("nav.notificationSettings"),
      url: createPageUrl("NotificationSettings"),
      icon: Bell,
      counter: 0,
      description: "Configurer Slack et Telegram"
    }
  ];

  const createEmployeeNavigationItems = () => [
    {
      title: 'Mon Tableau de Bord',
      url: createPageUrl("EmployeeDashboard"),
      icon: LayoutDashboard,
    },
    {
      title: t('nav.timeTracking'),
      url: createPageUrl("TimeClock"),
      icon: Clock,
    },
    {
      title: 'Mes Congés',
      url: createPageUrl("MyLeave"),
      icon: Calendar,
      counter: counters.myPendingLeaves
    },
    {
      title: '🏆 Classement',
      url: createPageUrl("Leaderboard"),
      icon: Trophy,
    },
    {
      title: t('nav.events'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("Events"),
      icon: Calendar,
    },
    {
      title: t('nav.collaborativeCalendar'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("CollaborativeCalendar"),
      icon: Calendar,
    },
    {
      title: 'Mes Sondages',
      url: createPageUrl("EmployeeSurveys"),
      icon: FileText,
    },
    {
      title: 'Mon Équipe',
      url: createPageUrl("MyTeam"),
      icon: Users,
    },
    {
      title: t('nav.messages'), // CORRECTION: Utiliser la traduction
      url: createPageUrl("Messages"),
      icon: MessageCircle,
    },
    {
      title: 'Mes Évaluations',
      url: createPageUrl("EmployeePerformance"),
      icon: TrendingUp,
    },
    {
      title: t('nav.documents'),
      url: createPageUrl("EmployeeDocuments"),
      icon: FileText,
    },
    {
      title: t('nav.announcements'),
      url: createPageUrl("EmployeeAnnouncements"),
      icon: Megaphone,
      counter: counters.unreadAnnouncements
    },
    {
      title: t('nav.help'),
      url: createPageUrl("EmployeeHelp"),
      icon: HelpCircle,
    },
    {
      title: t("nav.myNotifications"), // CORRECTION: Utiliser la bonne clé de traduction
      url: createPageUrl("NotificationSettings"),
      icon: Bell,
      counter: 0,
      description: "Notifications personnalisées"
    }
  ];

  const fetchEmployeeDetails = async () => {
    if (currentUser && currentUser.employee_id) {
      try {
        const results = await Employee.filter({ employee_id: currentUser.employee_id });
        if(results.length > 0) {
          setEmployeeDetails(results[0]);
        } else {
          setEmployeeDetails(null);
        }
      } catch (e) {
        console.error("Failed to fetch employee details for layout", e);
        setEmployeeDetails(null);
      }
    } else {
      setEmployeeDetails(null);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const userNotifications = await cachedApiCall(Notification, 'filter', {
        filters: { user_id: currentUser.id },
        sortBy: "-created_date",
        limit: 10
      });
      setNotifications(userNotifications || []);
      setUnreadCount((userNotifications || []).filter(n => !n.is_read).length);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
      if (e.message && e.message.includes('429')) {
        console.warn("Notifications rate limited, skipping update");
      } else if (e.message && e.message.includes('Network Error')) {
        console.warn("Network error loading notifications, using empty state");
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  };

  const checkAuth = async () => {
    try {
      const user = await User.me();
      console.log("Layout - checkAuth - User:", user);

      const isMainAdmin = user.email === 'syllacloud@gmail.com';
      if (isMainAdmin && (!user.is_active || user.role !== 'admin')) {
          await User.update(user.id, { is_active: true, role: 'admin' });
          const updatedUser = await User.me();
          setCurrentUser(updatedUser);
      } else {
        setCurrentUser(user);
      }

      if (!user.is_active) {
          console.log("Layout - User not active, redirecting to pending approval:", user);
          navigate(createPageUrl("PendingApproval"));
          return;
      }

      // CORRECTION: Pages admin-only vs pages partagées
      const adminOnlyPages = [
        "AdminDashboard", "Employees", "TimeTracking", "LeaveManagement",
        "Performance", "Finance", "Surveys", "Announcements", "Documents",
        "SystemMonitoring", "AdminManagement", "PlatformCustomizer",
        "BrandingSettings", "DeveloperDocs", "AdminHelp", "AdminMessages",
        "AdminCalendarTracking", "GamificationAdmin", "EmployeeOfTheWeekManager" // Added new page
      ];

      // CORRECTION: Pages accessibleà à tous les utilisateurs actifs
      const sharedPages = [
        "Messages", "Events", "CollaborativeCalendar", "NotificationSettings", 
        "Leaderboard" // Leaderboard accessible aux employés
      ];

      const isAdminOnlyPage = adminOnlyPages.some(p => location.pathname.includes(createPageUrl(p)));
      const userIsAdmin = user.role === 'admin' || isMainAdmin;

      if (location.pathname === '/' || location.pathname === '') {
        navigate(createPageUrl("Home"));
        return;
      }

      // CORRECTION: Vérification d'accès uniquement pour les pages admin-only
      if (isAdminOnlyPage && !userIsAdmin) {
        toast({
          title: 'Accès Refusé',
          description: 'Vous n\'avez pas les permissions pour accéder à cette page.',
          variant: "destructive"
        });
        navigate(createPageUrl("Home"));
        return;
      }

    } catch (error) {
      const errorMessage = (error && error.message) ? error.message : String(error);
      if (!errorMessage.includes('401')) {
        console.error("Authentication check failed with an unexpected error:", error);
      }
      setCurrentUser(null);

      const urlParams = new URLSearchParams(window.location.search);
      const isNewUser = urlParams.get('is_new_user') === 'true';

      if (isNewUser) {
        console.log("Layout - New user detected from URL params, redirecting to PendingApproval");
        navigate(createPageUrl("PendingApproval"));
        return;
      }

      navigate(createPageUrl("Home"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      globalLogger.logUserAction('user_logout', {
        userId: currentUser?.id,
        email: currentUser?.email,
        timestamp: new Date().toISOString()
      });

      localStorage.removeItem('lastUserLoadTime');
      localStorage.removeItem('cachedUsers');
      localStorage.removeItem('layoutCachedUsers');
      localStorage.removeItem('layoutUserCacheTime');
      localStorage.removeItem('appSettings');
      localStorage.removeItem('lastSettingsLoad');

      setCurrentUser(null);
      setEmployeeDetails(null);
      setNotifications([]);
      setUnreadCount(0);
      setCounters({
        pendingLeaves: 0,
        incompleteTimeEntries: 0,
        urgentAnnouncements: 0,
        pendingUsers: 0,
        myPendingLeaves: 0,
        unreadAnnouncements: 0
      });

      await User.logout();

      navigate(createPageUrl("Home"));

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error) {
      console.error("Logout error:", error);

      navigate(createPageUrl("Home"));

      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté",
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await Notification.update(notification.id, { is_read: true });
        fetchNotifications();
      }
      if (notification.link_to) {
        if (notification.type === 'meeting_request' || notification.link_to.startsWith('http')) {
           window.open(notification.link_to, '_blank', 'noopener,noreferrer');
        } else {
          navigate(notification.link_to);
        }
      }
    } catch (e) {
      console.error("Failed to handle notification click", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (location.pathname.includes(createPageUrl("PendingApproval"))) {
      return children;
  }

  if (location.pathname.includes(createPageUrl("Home")) || location.pathname === '/') {
    return children;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'syllacloud@gmail.com';
  const navigationItems = isAdmin ? createAdminNavigationItems() : createEmployeeNavigationItems();
  const portalTitle = isAdmin ? 'Admin Portal' : 'Employee Portal';
  const appName = appSettings?.app_name || 'Flow HR';
  const companyName = appSettings?.company_name || 'Flow HR';

  console.log("Current counters:", counters);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --gemini-primary: #4285F4;
          --gemini-secondary: #34A853;
          --gemini-accent: #FBBC04;
          --gemini-danger: #EA4335;
          --gemini-purple: #9C27B0;
          --gemini-teal: #00BCD4;
          --gemini-surface: #FFFFFF;
          --gemini-surface-variant: #F8F9FA;
          --gemini-outline: #E8EAED;
          --gemini-on-surface: #202124;
          --gemini-on-surface-variant: #5F6368;
          --gemini-shadow: 0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15);
          --gemini-shadow-elevated: 0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 8px 24px 4px rgba(60, 64, 67, 0.15);
          --gemini-border-radius: 12px;
          --gemini-border-radius-large: 24px;
        }

        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
          line-height: 1.5;
          color: var(--gemini-on-surface);
        }

        h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: 400;
        }
        h2 {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 400;
        }
        h3 {
          font-size: clamp(1.25rem, 2.5vw, 1.5rem);
          font-weight: 500;
        }
        h4 {
          font-size: clamp(1.125rem, 2vw, 1.25rem);
          font-weight: 500;
        }

        .gemini-card {
          background: var(--gemini-surface);
          border-radius: var(--gemini-border-radius);
          box-shadow: var(--gemini-shadow);
          border: 1px solid var(--gemini-outline);
          transition: all 0.2s ease;
          margin-bottom: 1rem;
        }

        .gemini-card:hover {
          box-shadow: var(--gemini-shadow-elevated);
          transform: translateY(-1px);
        }

        .responsive-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        @media (max-width: 640px) {
          .responsive-grid {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }
        }

        .gemini-button-primary {
          background: linear-gradient(135deg, var(--gemini-primary) 0%, #1976D2 100%);
          color: white;
          border-radius: var(--gemini-border-radius);
          font-weight: 500;
          padding: clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px);
          border: none;
          box-shadow: var(--gemini-shadow);
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 640px) {
          .gemini-button-primary {
            font-size: 0.875rem;
            padding: 8px 16px;
          }
        }

        .responsive-modal {
          width: 90vw;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        @media (max-width: 640px) {
          .responsive-modal {
            width: 95vw;
            margin: 1rem;
          }
        }

        .responsive-table {
          width: 100%;
          overflow-x: auto;
        }

        .responsive-table table {
          min-width: 600px;
        }

        @media (max-width: 768px) {
          .responsive-table {
            font-size: 0.875rem;
          }
        }

        .mobile-nav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        .mobile-nav {
          position: fixed;
          top: 0;
          left: 0;
          height: 100%;
          width: 280px;
          background: white;
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          overflow-y: auto;
          box-shadow: var(--gemini-shadow-elevated);
        }

        .mobile-nav.open {
          transform: translateX(0);
        }

        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .responsive-padding {
          padding: clamp(1rem, 4vw, 2rem);
        }

        .responsive-margin {
          margin: clamp(0.5rem, 2vw, 1rem);
        }

        .responsive-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .responsive-form {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }
        }

        .safe-area {
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
        }

        .gemini-title {
          background: linear-gradient(135deg, var(--gemini-primary), var(--gemini-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .gemini-subtitle {
          color: var(--gemini-on-surface-variant);
          font-weight: 400;
          font-size: 1.125rem;
        }

        .gemini-sidebar {
          background: linear-gradient(180deg, var(--gemini-surface) 0%, var(--gemini-surface-variant) 100%);
          border-right: 1px solid var(--gemini-outline);
          backdrop-filter: blur(10px);
        }

        .gemini-nav-item {
          border-radius: var(--gemini-border-radius);
          margin: 2px 0;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .gemini-nav-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--gemini-primary), var(--gemini-secondary));
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .gemini-nav-item.active::before {
          opacity: 0.1;
        }

        .gemini-nav-item:hover::before {
          opacity: 0.05;
        }

        .gemini-badge {
          background: linear-gradient(135deg, var(--gemini-accent) 0%, #F9AB00 100%);
          color: var(--gemini-on-surface);
          border-radius: 12px;
          font-weight: 500;
          font-size: 0.75rem;
          padding: 4px 8px;
          box-shadow: var(--gemini-shadow);
        }

        .gemini-badge-success {
          background: linear-gradient(135deg, var(--gemini-secondary) 0%, #0F9D58 100%);
          color: white;
        }

        .gemini-badge-danger {
          background: linear-gradient(135deg, var(--gemini-danger) 0%, #D33B2C 100%);
          color: white;
        }

        .gemini-avatar {
          border: 3px solid var(--gemini-outline);
          box-shadow: var(--gemini-shadow);
          transition: all 0.2s ease;
        }

        .gemini-avatar:hover {
          box-shadow: var(--gemini-shadow-elevated);
        }

        .gemini-fade-in {
          animation: gemini-fade-in 0.4s ease-out;
        }

        @keyframes gemini-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gemini-slide-in {
          animation: gemini-slide-in 0.3s ease-out;
        }

        @keyframes gemini-slide-in {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      <div className={`flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <Sidebar className="gemini-sidebar">
            <SidebarHeader className="border-b border-gray-200 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center overflow-hidden gemini-avatar`}>
                    {appSettings?.logo_url ? (
                      <img
                        src={appSettings.logo_url}
                        alt={appName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg lg:text-xl">
                        {appName?.[0] || 'F'}
                      </span>
                    )}
                  </div>
                  <div className="hidden xl:block">
                    <h2 className="font-semibold text-base lg:text-lg text-gray-900 gemini-title">{portalTitle}</h2>
                    <p className="text-xs lg:text-sm text-gray-500 gemini-subtitle">{appName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <LanguageSwitcher
                    variant="ghost"
                    size="sm"
                    showLabel={false}
                    className="h-8 w-8 p-0"
                  />
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2 lg:p-4">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`group w-full rounded-xl transition-all duration-300 gemini-nav-item ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500 active'
                              : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 gemini-slide-in">
                            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                              <span className="font-medium text-xs lg:text-sm truncate">{item.title}</span>
                            </div>
                            {item.counter > 0 && (
                              <Badge className="gemini-badge-danger text-white text-xs h-5 w-5 lg:h-6 lg:w-6 flex items-center justify-center rounded-full animate-pulse flex-shrink-0">
                                {item.counter > 99 ? '99+' : item.counter}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 p-2 lg:p-4 bg-gradient-to-r from-white to-gray-50">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-left m-0 p-1 lg:p-2 flex items-center gap-2 lg:gap-3 flex-grow rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 gemini-card group w-full">
                      <div className="relative w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
                        <div className="relative">
                          <AvatarGenerator
                            firstName={employeeDetails?.first_name || currentUser?.full_name?.split(' ')[0]}
                            lastName={employeeDetails?.last_name || currentUser?.full_name?.split(' ')[1]}
                            email={currentUser?.email}
                            department={employeeDetails?.department}
                            profilePicture={employeeDetails?.profile_picture}
                            size="default"
                            style={employeeDetails?.avatar_style || 'auto'}
                            className="ring-2 ring-white ring-offset-1 shadow-md"
                          />

                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 hidden lg:block">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700 transition-colors">
                            {employeeDetails ?
                              `${employeeDetails.first_name} ${employeeDetails.last_name}` :
                              (currentUser.full_name || currentUser.email)
                            }
                          </p>
                          <div className="flex gap-1">
                            {isAdmin && (
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Admin"></div>
                            )}
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="En ligne"></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                            {isAdmin ? (
                              <Badge className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              employeeDetails?.department ? (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-blue-200 text-blue-700 bg-blue-50">
                                  <Building2 className="w-3 h-3 mr-1" />
                                  {employeeDetails.department}
                                </Badge>
                              ) : (
                                <Badge className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700">
                                  <UserIcon className="w-3 h-3 mr-1" />
                                  Employé
                                </Badge>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs">
                              {currentUser?.last_login && currentUser.last_login !== 'Jamais' ?
                                format(new Date(currentUser.last_login), 'HH:mm') :
                                'Maintenant'
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 lg:hidden">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {employeeDetails ?
                            `${employeeDetails.first_name} ${employeeDetails.last_name}` :
                            (currentUser.full_name || currentUser.email)
                          }
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {isAdmin ? (
                            <Badge className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700">
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {employeeDetails?.department || 'Employé'}
                            </Badge>
                          )}
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full ml-1"></div>
                        </div>
                      </div>

                      <div className="hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent className="w-60 lg:w-72 mb-2 gemini-card shadow-xl border-0" side="top" align="start">
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <AvatarGenerator
                            firstName={employeeDetails?.first_name || currentUser?.full_name?.split(' ')[0]}
                            lastName={employeeDetails?.last_name || currentUser?.full_name?.split(' ')[1]}
                            email={currentUser?.email}
                            department={employeeDetails?.department}
                            profilePicture={employeeDetails?.profile_picture}
                            size="lg"
                            style={employeeDetails?.avatar_style || 'auto'}
                            className="ring-2 ring-white shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm lg:text-base">
                            {employeeDetails ?
                              `${employeeDetails.first_name} ${employeeDetails.last_name}` :
                              (currentUser.full_name || currentUser.email)
                            }
                          </h3>
                          <p className="text-xs lg:text-sm text-gray-600 truncate">{currentUser.email}</p>
                          <div className="flex items-center gap-1 lg:gap-2 mt-1 flex-wrap">
                            {isAdmin ? (
                              <Badge className="text-xs px-2 py-0.5 bg-red-100 text-red-700 border border-red-200">
                                <Shield className="w-3 h-3 mr-1" />
                                Administrateur
                              </Badge>
                            ) : (
                              <>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-200 text-blue-700">
                                  {employeeDetails?.position || 'Employé'}
                                </Badge>
                                {employeeDetails?.department && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-green-200 text-green-700">
                                    {employeeDetails.department}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 lg:p-3 bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                      <div className="grid grid-cols-3 gap-2 lg:gap-3 text-center">
                        <div className="p-2 rounded-lg bg-white/80">
                          <div className="text-sm lg:text-lg font-bold text-blue-600">
                            {currentUser?.last_login && currentUser.last_login !== 'Jamais' ?
                              format(new Date(currentUser.last_login), 'dd/MM') :
                              'Aujourd\'hui'
                            }
                          </div>
                          <div className="text-xs text-gray-500">Dernière visite</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80">
                          <div className="text-sm lg:text-lg font-bold text-green-600 flex items-center justify-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            En ligne
                          </div>
                          <div className="text-xs text-gray-500">Statut</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/80">
                          <div className="text-sm lg:text-lg font-bold text-purple-600">
                            {employeeDetails?.employee_id ?
                              employeeDetails.employee_id.slice(-4) :
                              currentUser.id.slice(-4)
                            }
                          </div>
                          <div className="text-xs text-gray-500">ID</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-1 lg:p-2">
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("MyProfile")} className="flex items-center cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                          <UserIcon className="w-4 h-4 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-900 text-sm">{t('nav.profile')}</span>
                            <p className="text-xs text-gray-500 truncate">Gérer mes informations</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </DropdownMenuItem>

                      {isAdmin ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl("SystemMonitoring")} className="flex items-center cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50 transition-all duration-200">
                              <Database className="w-4 h-4 mr-2 lg:mr-3 text-red-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm">Système</span>
                                <p className="text-xs text-gray-500 truncate">Monitoring & Logs</p>
                              </div>
                              {counters.pendingUsers > 0 && (
                                <Badge className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                  {counters.pendingUsers}
                                </Badge>
                              )}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl("AdminManagement")} className="flex items-center cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 transition-all duration-200">
                              <Users className="w-4 h-4 mr-2 lg:mr-3 text-purple-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm">Utilisateurs</span>
                                <p className="text-xs text-gray-500 truncate">Gestion des accès</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl("TimeClock")} className="flex items-center cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 transition-all duration-200">
                              <Clock className="w-4 h-4 mr-2 lg:mr-3 text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm">Pointage</span>
                                <p className="text-xs text-gray-500 truncate">Pointer arrivée/départ</p>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl("MyLeave")} className="flex items-center cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-amber-50 transition-all duration-200">
                              <Calendar className="w-4 h-4 mr-2 lg:mr-3 text-amber-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-gray-900 text-sm">Mes Congés</span>
                                <p className="text-xs text-gray-500 truncate">Demandes et solde</p>
                              </div>
                              {counters.myPendingLeaves > 0 && (
                                <Badge className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                                  {counters.myPendingLeaves}
                                </Badge>
                              )}
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </div>

                    <DropdownMenuSeparator className="my-1" />

                    <div className="p-1 lg:p-2">
                      <div className="px-2 lg:px-3 py-1 lg:py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Préférences
                      </div>
                      <LanguageSwitcher
                        variant="ghost"
                        size="sm"
                        showLabel={true}
                        className="w-full justify-start hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-sm"
                      />
                    </div>

                    <DropdownMenuSeparator className="my-1" />

                    <div className="p-1 lg:p-2">
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer p-2 lg:p-3 rounded-lg hover:bg-red-50 transition-all duration-200">
                        <LogOut className="w-4 h-4 mr-2 lg:mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm">{t('nav.logout')}</span>
                          <p className="text-xs text-red-400 truncate">Se déconnecter de l'app</p>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Menu Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="mobile-nav-overlay lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Menu Mobile */}
        <div className={`mobile-nav lg:hidden ${isMobileMenuOpen ? 'open' : ''} safe-area`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {appSettings?.logo_url ? (
                    <img src={appSettings.logo_url} alt={appName} className="w-full h-full object-contain rounded-2xl" />
                  ) : (
                    <span>{appName?.[0] || 'F'}</span>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{portalTitle}</h2>
                  <p className="text-sm text-gray-500">{appName}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="touch-target"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 touch-target ${
                    location.pathname === item.url
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.counter > 0 && (
                    <Badge className="bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                      {item.counter > 99 ? '99+' : item.counter}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {employeeDetails?.profile_picture ? (
                    <img src={employeeDetails.profile_picture} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-white font-medium text-sm">
                      {currentUser.full_name?.[0] || currentUser.email?.[0] || 'U'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {currentUser.full_name || currentUser.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Admin' : (employeeDetails?.department || 'Employee')}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Link
                  to={createPageUrl("MyProfile")}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors touch-target"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('nav.profile')}</span>
                </Link>

                <LanguageSwitcher
                  variant="outline"
                  size="sm"
                  showLabel={true}
                  className="w-full justify-start"
                />

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors w-full text-left touch-target"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header Mobile */}
          <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-3 lg:hidden safe-area">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="touch-target"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-lg font-semibold text-gray-900 gemini-title truncate">{currentPageName}</h1>
              </div>
              <div className="flex items-center gap-2">
                {currentUser && <NotificationSystem currentUser={currentUser} />}
                {currentUser && <MessageNotificationSystem currentUser={currentUser} />}
                <LanguageSwitcher
                  variant="ghost"
                  size="sm"
                  showLabel={false}
                  className="h-10 w-10 touch-target"
                />
              </div>
            </div>
          </header>

          {/* Système de notifications pour desktop */}
          <div className="hidden lg:block absolute top-4 right-4 z-50">
            <div className="flex items-center gap-3">
              {currentUser && <NotificationSystem currentUser={currentUser} />}
              {currentUser && <MessageNotificationSystem currentUser={currentUser} />}
            </div>
          </div>

          <div className="flex-1 overflow-auto responsive-padding gemini-fade-in">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ActivityTracker />
      <LanguageProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </LanguageProvider>
    </div>
  );
}

