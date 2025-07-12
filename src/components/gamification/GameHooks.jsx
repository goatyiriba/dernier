
import { useState, useEffect } from 'react';
import { AuthService } from '@/api/supabaseEntities';
import { logAction, processEmployeeAchievements, processTimeViolations, processUnreadMessagesViolation } from './GamificationEngine';
import NotificationHelper from '../notifications/NotificationHelper';

/**
 * Helper function to create a generic notification.
 * In a real application, this would typically interact with a Notification entity
 * or a dedicated notification service. For the purpose of this example,
 * and since NotificationHelper's exact generic method is not defined,
 * we'll assume a basic logging or direct interaction with a notification storage.
 * If NotificationHelper had a generic `create` method, it would be used here.
 */
const createNotification = async ({ employee_id, title, message, type, severity }) => {
  // This is a placeholder implementation.
  // In a full system, this would likely:
  // 1. Persist the notification to a database (e.g., using a Notification entity model).
  // 2. Potentially trigger real-time notification delivery (e.g., websockets, push).
  console.log(`[Notification] Creating notification for employee ${employee_id}:`, { title, message, type, severity });
  // Example if NotificationHelper had a generic 'create' method:
  // await NotificationHelper.create({ employee_id, title, message, type, severity });
  return { success: true }; // Simulate success
};

/**
 * Hook pour surveiller et appliquer automatiquement les pénalités
 */
export const useGamificationEnforcement = (employeeId) => {
  const [violations, setViolations] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (employeeId) {
      // Vérifier les violations toutes les heures
      const checkViolations = async () => {
        setIsProcessing(true);
        try {
          // processTimeViolations is assumed to be imported from GamificationEngine
          const result = await processTimeViolations(employeeId);
          if (result && result.violations.length > 0) {
            setViolations(result.violations);
            
            // Créer une notification pour l'employé
            await createNotification({
              employee_id: employeeId,
              title: "⚠️ Violations de pointage détectées",
              message: `${result.violations.length} violation(s) détectée(s). Points perdus: ${result.totalPenalty}`,
              type: "violation_alert",
              severity: "high"
            });
          }
        } catch (error) {
          console.error('Error checking violations:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      // Vérification immédiate
      checkViolations();
      
      // Puis toutes les heures
      const interval = setInterval(checkViolations, 60 * 60 * 1000); // Every hour
      return () => clearInterval(interval);
    }
  }, [employeeId]);

  return { violations, isProcessing };
};

/**
 * Hook pour surveiller les messages non lus
 */
export const useMessageViolationMonitor = (employeeId) => {
  useEffect(() => {
    if (employeeId) {
      // Vérifier les messages non lus toutes les 30 minutes
      const checkUnreadMessages = async () => {
        // processUnreadMessagesViolation is assumed to be imported from GamificationEngine
        await processUnreadMessagesViolation(employeeId);
      };

      // Initial check
      checkUnreadMessages();

      // Set up interval for subsequent checks
      const interval = setInterval(checkUnreadMessages, 30 * 60 * 1000); // Every 30 minutes
      return () => clearInterval(interval);
    }
  }, [employeeId]);
};

/**
 * Hook pour la gestion automatique des actions gamifiées
 */
export function useGameAction() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erreur chargement utilisateur pour gamification:', error);
    }
  };

  /**
   * Enregistrer une action gamifiée
   */
  const recordAction = async (actionType, details = {}, qualityScore = 50) => {
    if (!currentUser?.employee_id) {
      console.warn('Pas d\'employee_id pour enregistrer l\'action gamifiée');
      return null;
    }

    setIsLoading(true);
    try {
      // Log de l'action
      const actionResult = await logAction(
        currentUser.employee_id,
        actionType,
        {
          ...details,
          timestamp: new Date().toISOString(),
          user_id: currentUser.id
        },
        qualityScore
      );

      if (actionResult.success) {
        // Vérifier les nouveaux achievements
        const achievementResult = await processEmployeeAchievements(currentUser.employee_id);
        
        if (achievementResult.success && achievementResult.newBadges.length > 0) {
          // Notifier des nouveaux badges
          for (const badge of achievementResult.newBadges) {
            await NotificationHelper.notifyEmployeeOfBadgeEarned(
              currentUser.id,
              badge.badge_name,
              badge.points_value
            );
          }
        }

        // Vérifier level up
        if (achievementResult.success && achievementResult.currentLevel > (details.previousLevel || 0)) {
          await NotificationHelper.notifyEmployeeOfLevelUp(
            currentUser.id,
            achievementResult.currentLevel,
            achievementResult.totalPoints
          );
        }

        return {
          success: true,
          points: actionResult.points,
          newBadges: achievementResult.newBadges || [],
          newLevel: achievementResult.currentLevel
        };
      }

      return actionResult;
    } catch (error) {
      console.error('Erreur enregistrement action gamifiée:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recordAction,
    currentUser,
    isLoading
  };
}

/**
 * Hook pour suivre les statistiques de gamification d'un employé
 */
export function useEmployeeGamification(employeeId) {
  const [badges, setBadges] = useState([]);
  const [employeePoints, setEmployeePoints] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employeeId) {
      loadGamificationData();
    }
  }, [employeeId]);

  const loadGamificationData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger en parallèle
      const [badgesData, pointsData, actionsData] = await Promise.all([
        Badge.filter({ employee_id: employeeId, is_active: true }),
        EmployeePoints.filter({ employee_id: employeeId }),
        ActionLog.filter({ 
          employee_id: employeeId 
        }, '-created_date', 20)
      ]);

      setBadges(badgesData);
      setEmployeePoints(pointsData[0] || null);
      setRecentActions(actionsData);

    } catch (err) {
      console.error('Erreur chargement données gamification:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadGamificationData();
  };

  return {
    badges,
    employeePoints,
    recentActions,
    isLoading,
    error,
    refreshData
  };
}

/**
 * Hook pour les actions automatiques de gamification
 */
export function useAutoGameActions() {
  const { recordAction } = useGameAction();

  // Action automatique lors de la connexion
  const onLogin = async () => {
    return await recordAction('login', {
      type: 'daily_login',
      timestamp: new Date().toISOString()
    }, 70);
  };

  // Action automatique lors du pointage
  const onCheckIn = async (isEarly = false, location = null) => {
    const actionType = isEarly ? 'early_checkin' : 'check_in';
    return await recordAction(actionType, {
      isEarly,
      location,
      timestamp: new Date().toISOString()
    }, isEarly ? 90 : 60);
  };

  // Action automatique lors de la lecture d'annonce
  const onAnnouncementRead = async (announcementId, timeSpent = 0) => {
    return await recordAction('announcement_read', {
      announcement_id: announcementId,
      time_spent_seconds: timeSpent,
      timestamp: new Date().toISOString()
    }, Math.min(100, 50 + timeSpent)); // Plus de temps = meilleure qualité
  };

  // Action automatique lors de l'upload de document
  const onDocumentUpload = async (documentType, fileSize = 0) => {
    return await recordAction('document_upload', {
      document_type: documentType,
      file_size: fileSize,
      timestamp: new Date().toISOString()
    }, 80);
  };

  // Action automatique lors de la completion de tâche
  const onTaskCompleted = async (taskId, completedAheadOfTime = false) => {
    return await recordAction('task_completed', {
      task_id: taskId,
      completedAheadOfTime,
      timestamp: new Date().toISOString()
    }, completedAheadOfTime ? 95 : 75);
  };

  // Action automatique lors de participation à réunion
  const onMeetingAttended = async (meetingId, duration = 0) => {
    return await recordAction('meeting_attended', {
      meeting_id: meetingId,
      duration_minutes: duration,
      timestamp: new Date().toISOString()
    }, Math.min(100, 60 + (duration / 60) * 10)); // Plus longue réunion = plus de points
  };

  // Action automatique lors de feedback donné
  const onFeedbackGiven = async (feedbackType, targetId) => {
    return await recordAction('feedback_given', {
      feedback_type: feedbackType,
      target_id: targetId,
      timestamp: new Date().toISOString()
    }, 85);
  };

  // Action automatique lors de l'aide fournie
  const onHelpProvided = async (helpType, recipientId) => {
    return await recordAction('help_provided', {
      help_type: helpType,
      recipient_id: recipientId,
      timestamp: new Date().toISOString()
    }, 90);
  };

  return {
    onLogin,
    onCheckIn,
    onAnnouncementRead,
    onDocumentUpload,
    onTaskCompleted,
    onMeetingAttended,
    onFeedbackGiven,
    onHelpProvided
  };
}

/**
 * Hook pour les défis et objectifs gamifiés
 */
export function useGameChallenges(employeeId) {
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      loadChallenges();
    }
  }, [employeeId]);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      // Calculer les défis basés sur les actions récentes
      const actions = await ActionLog.filter({ employee_id: employeeId });
      const points = await EmployeePoints.filter({ employee_id: employeeId });
      const currentPoints = points[0];

      // Défis basés sur les statistiques actuelles
      const challenges = [];

      // Défi ponctualité
      const punctualActions = actions.filter(a => 
        a.action_type === 'early_checkin' || 
        (a.action_type === 'check_in' && a.action_details?.isEarly)
      ).length;

      if (punctualActions < 10) {
        challenges.push({
          id: 'punctuality_challenge',
          title: 'Défi Ponctualité',
          description: 'Arriver tôt 10 fois ce mois',
          type: 'monthly',
          current: punctualActions,
          target: 10,
          reward: 100,
          progress: (punctualActions / 10) * 100,
          icon: 'Clock',
          color: 'blue'
        });
      }

      // Défi communication
      const communicationActions = actions.filter(a => 
        a.action_type === 'announcement_read' || 
        a.action_type === 'message_sent'
      ).length;

      if (communicationActions < 20) {
        challenges.push({
          id: 'communication_challenge',
          title: 'Défi Communication',
          description: 'Participer à 20 interactions',
          type: 'monthly',
          current: communicationActions,
          target: 20,
          reward: 150,
          progress: (communicationActions / 20) * 100,
          icon: 'MessageCircle',
          color: 'green'
        });
      }

      // Défi apprentissage
      const learningActions = actions.filter(a => 
        a.action_type === 'document_view' || 
        a.action_type === 'survey_completed'
      ).length;

      if (learningActions < 15) {
        challenges.push({
          id: 'learning_challenge',
          title: 'Défi Apprentissage',
          description: 'Consulter 15 ressources',
          type: 'monthly',
          current: learningActions,
          target: 15,
          reward: 120,
          progress: (learningActions / 15) * 100,
          icon: 'BookOpen',
          color: 'purple'
        });
      }

      setActiveChallenges(challenges.filter(c => c.progress < 100));
      setCompletedChallenges(challenges.filter(c => c.progress >= 100));

    } catch (error) {
      console.error('Erreur chargement défis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeChallenges,
    completedChallenges,
    isLoading,
    refreshChallenges: loadChallenges
  };
}
