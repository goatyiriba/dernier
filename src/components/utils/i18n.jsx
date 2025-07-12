import React, { createContext, useContext, useState, useEffect } from 'react';

// CORRECTION: Ajout de SUPPORTED_LANGUAGES manquant
export const SUPPORTED_LANGUAGES = {
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  en: {
    code: 'en', 
    name: 'English',
    flag: '🇺🇸'
  }
};

const translations = {
  fr: {
    // Navigation
    nav: {
      dashboard: "Tableau de Bord",
      employees: "Employés", 
      timeTracking: "Suivi du Temps",
      leaveManagement: "Gestion des Congés",
      performance: "Performance",
      finance: "Finance",
      announcements: "Annonces",
      documents: "Documents",
      help: "Aide",
      profile: "Mon Profil",
      logout: "Déconnexion",
      settings: "Paramètres",
      notificationSettings: "Paramètres de Notification",
      myNotifications: "Mes Notifications",
      
      // Pages spécifiques
      timeClock: "Pointage",
      myLeave: "Mes Congés",
      myTeam: "Mon Équipe",
      messages: "Messages",
      events: "Événements",
      calendar: "Calendrier",
      collaborativeCalendar: "Calendrier Collaboratif",
      leaderboard: "Classement",
      gamification: "Gamification"
    },
    
    // Événements et calendrier
    events: {
      title: "Événements",
      createEvent: "Créer un Événement",
      editEvent: "Modifier l'Événement",
      deleteEvent: "Supprimer l'Événement",
      eventDetails: "Détails de l'Événement",
      noEvents: "Aucun événement",
      upcomingEvents: "Événements à Venir",
      pastEvents: "Événements Passés",
      todayEvents: "Événements Aujourd'hui",
      
      // Types d'événements
      birthday: "Anniversaire",
      anniversary: "Anniversaire de Travail",
      meeting: "Réunion",
      training: "Formation",
      celebration: "Célébration",
      holiday: "Vacances",
      deadline: "Échéance",
      other: "Autre",
      
      // Statuts
      pending: "En Attente",
      confirmed: "Confirmé",
      cancelled: "Annulé",
      completed: "Terminé"
    },
    
    // Calendrier collaboratif
    collaboration: {
      title: "Calendrier Collaboratif",
      createCollaboration: "Nouvelle Collaboration",
      inviteCollaborators: "Inviter des Collaborateurs",
      myCollaborations: "Mes Collaborations",
      pendingInvitations: "Invitations en Attente",
      acceptInvitation: "Accepter l'Invitation",
      declineInvitation: "Refuser l'Invitation",
      collaborationAccepted: "Collaboration Acceptée",
      collaborationDeclined: "Collaboration Refusée",
      noCollaborations: "Aucune collaboration",
      
      // Statuts de collaboration
      invited: "Invité",
      accepted: "Accepté",
      declined: "Refusé",
      inProgress: "En Cours",
      completed: "Terminé"
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      markAsRead: "Marquer comme Lu",
      markAllAsRead: "Tout Marquer comme Lu",
      noNotifications: "Aucune notification",
      newNotification: "Nouvelle notification",
      
      // Types de notifications
      eventReminder: "Rappel d'Événement",
      collaborationInvite: "Invitation de Collaboration",
      collaborationUpdate: "Mise à jour de Collaboration",
      eventCancelled: "Événement Annulé",
      eventUpdated: "Événement Mis à Jour",
      newMessage: "Nouveau Message",
      leaveApproved: "Congé Approuvé",
      leaveRejected: "Congé Refusé"
    },
    
    // Messages génériques
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      create: "Créer",
      view: "Voir",
      close: "Fermer",
      loading: "Chargement...",
      error: "Erreur",
      success: "Succès",
      warning: "Attention",
      info: "Information",
      yes: "Oui",
      no: "Non",
      ok: "OK",
      search: "Rechercher",
      filter: "Filtrer",
      sort: "Trier",
      export: "Exporter",
      import: "Importer",
      refresh: "Actualiser"
    },
    
    // Messages d'erreur
    errors: {
      generic: "Une erreur s'est produite",
      networkError: "Erreur de connexion",
      notFound: "Non trouvé",
      unauthorized: "Non autorisé",
      forbidden: "Accès interdit",
      serverError: "Erreur serveur",
      validationError: "Erreur de validation",
      formIncomplete: "Veuillez remplir tous les champs requis"
    },
    
    // Messages de succès
    success: {
      saved: "Enregistré avec succès",
      deleted: "Supprimé avec succès",
      updated: "Mis à jour avec succès",
      created: "Créé avec succès",
      sent: "Envoyé avec succès",
      invited: "Invitation envoyée avec succès"
    }
  },
  
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      employees: "Employees",
      timeTracking: "Time Tracking", 
      leaveManagement: "Leave Management",
      performance: "Performance",
      finance: "Finance",
      announcements: "Announcements",
      documents: "Documents",
      help: "Help",
      profile: "My Profile",
      logout: "Logout",
      settings: "Settings",
      notificationSettings: "Notification Settings",
      myNotifications: "My Notifications",
      
      // Pages spécifiques
      timeClock: "Time Clock",
      myLeave: "My Leave",
      myTeam: "My Team",
      messages: "Messages",
      events: "Events",
      calendar: "Calendar",
      collaborativeCalendar: "Collaborative Calendar",
      leaderboard: "Leaderboard",
      gamification: "Gamification"
    },
    
    // Événements et calendrier
    events: {
      title: "Events",
      createEvent: "Create Event",
      editEvent: "Edit Event",
      deleteEvent: "Delete Event",
      eventDetails: "Event Details",
      noEvents: "No events",
      upcomingEvents: "Upcoming Events",
      pastEvents: "Past Events",
      todayEvents: "Today's Events",
      
      // Types d'événements
      birthday: "Birthday",
      anniversary: "Work Anniversary",
      meeting: "Meeting",
      training: "Training",
      celebration: "Celebration",
      holiday: "Holiday",
      deadline: "Deadline",
      other: "Other",
      
      // Statuts
      pending: "Pending",
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed"
    },
    
    // Calendrier collaboratif
    collaboration: {
      title: "Collaborative Calendar",
      createCollaboration: "New Collaboration",
      inviteCollaborators: "Invite Collaborators",
      myCollaborations: "My Collaborations",
      pendingInvitations: "Pending Invitations",
      acceptInvitation: "Accept Invitation",
      declineInvitation: "Decline Invitation",
      collaborationAccepted: "Collaboration Accepted",
      collaborationDeclined: "Collaboration Declined",
      noCollaborations: "No collaborations",
      
      // Statuts de collaboration
      invited: "Invited",
      accepted: "Accepted",
      declined: "Declined",
      inProgress: "In Progress",
      completed: "Completed"
    },
    
    // Notifications
    notifications: {
      title: "Notifications",
      markAsRead: "Mark as Read",
      markAllAsRead: "Mark All as Read",
      noNotifications: "No notifications",
      newNotification: "New notification",
      
      // Types de notifications
      eventReminder: "Event Reminder",
      collaborationInvite: "Collaboration Invite",
      collaborationUpdate: "Collaboration Update",
      eventCancelled: "Event Cancelled",
      eventUpdated: "Event Updated",
      newMessage: "New Message",
      leaveApproved: "Leave Approved",
      leaveRejected: "Leave Rejected"
    },
    
    // Messages génériques
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      view: "View",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      warning: "Warning",
      info: "Information",
      yes: "Yes",
      no: "No",
      ok: "OK",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      export: "Export",
      import: "Import",
      refresh: "Refresh"
    },
    
    // Messages d'erreur
    errors: {
      generic: "An error occurred",
      networkError: "Network error",
      notFound: "Not found",
      unauthorized: "Unauthorized",
      forbidden: "Access forbidden",
      serverError: "Server error",
      validationError: "Validation error",
      formIncomplete: "Please fill in all required fields"
    },
    
    // Messages de succès
    success: {
      saved: "Saved successfully",
      deleted: "Deleted successfully",
      updated: "Updated successfully",
      created: "Created successfully",
      sent: "Sent successfully",
      invited: "Invitation sent successfully"
    }
  }
};

const LanguageContext = createContext();

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    console.error('useTranslation must be used within a LanguageProvider');
    // Fallback pour éviter les erreurs
    return {
      t: (key) => {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      },
      currentLanguage: 'fr',
      language: 'fr',
      setLanguage: () => {},
      isRTL: false,
      availableLanguages: ['fr', 'en']
    };
  }
  return context;
}

export default function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    // Charger la langue depuis le localStorage
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = (key) => {
    try {
      const keys = key.split('.');
      let value = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation missing for key: ${key} in language: ${language}`);
          return key;
        }
      }
      
      return value || key;
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  const changeLanguage = (newLanguage) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('app-language', newLanguage);
    }
  };

  const isRTL = ['ar', 'he', 'fa'].includes(language);

  const value = {
    t,
    language,
    currentLanguage: language, // CORRECTION: Ajout de currentLanguage
    setLanguage: changeLanguage,
    isRTL,
    availableLanguages: Object.keys(translations)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}