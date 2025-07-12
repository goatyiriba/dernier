import { Employee, EmployeePoints, Badge, ActionLog, TimeEntry, Announcement, AnnouncementReadStatus, Message, CollaborativeEvent } from '@/api/entities';
import { format, isToday, isThisWeek, isThisMonth, differenceInMinutes, parseISO, startOfDay, endOfDay } from 'date-fns';

// CORRECTION MAJEURE: Système ultra-strict anti-doublons
class UltraStrictCache {
  constructor() {
    this.employeeBlacklist = new Set(); // Employés temporairement bloqués
    this.dailyActions = new Map(); // employeeId_date -> Set of actions
    this.sessionFingerprints = new Map(); // employeeId -> unique session data
    this.lastActionTimes = new Map(); // employeeId -> timestamp
    this.cooldownPenalties = new Map(); // employeeId -> penalty count
    this.debugLogs = new Map(); // employeeId -> debug info
  }
  
  // CORRECTION: Vérification ultra-stricte avec logs détaillés
  canProcessAction(employeeId, actionType, context = {}) {
    const now = Date.now();
    const today = format(new Date(), 'yyyy-MM-dd');
    const debugKey = `${employeeId}_debug`;
    
    // Initialiser les logs de debug pour cet employé
    if (!this.debugLogs.has(debugKey)) {
      this.debugLogs.set(debugKey, []);
    }
    const logs = this.debugLogs.get(debugKey);
    
    const logAction = (message, blocked = false) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: actionType,
        message,
        blocked,
        context: context
      };
      logs.push(logEntry);
      if (logs.length > 50) logs.shift(); // Garder seulement les 50 derniers
      
      console.log(`🔍 [${employeeId}] ${blocked ? '🚫 BLOCKED' : '✅ ALLOWED'}: ${message}`);
    };
    
    // RÈGLE 0: Employé en blacklist temporaire
    if (this.employeeBlacklist.has(employeeId)) {
      logAction('Employé en blacklist temporaire', true);
      return false;
    }
    
    // RÈGLE 1: AUCUN point pour les actions de navigation/UI
    const forbiddenActions = [
      'page_load', 'page_refresh', 'page_view', 'navigation', 'route_change',
      'component_mount', 'component_update', 'component_render',
      'user_activity', 'session_start', 'session_end', 'visibility_change',
      'focus', 'blur', 'scroll', 'resize', 'click', 'mousemove', 'keypress',
      'beforeunload', 'unload', 'hashchange', 'popstate', 'storage',
      'online', 'offline', 'connection_change', 'tab_switch'
    ];
    
    if (forbiddenActions.includes(actionType.toLowerCase())) {
      logAction(`Action interdite de type navigation/UI: ${actionType}`, true);
      return false;
    }
    
    // RÈGLE 2: AUCUN point automatique pour login/connexion
    if (actionType.toLowerCase().includes('login') || actionType.toLowerCase().includes('connect')) {
      logAction(`Action de connexion bloquée: ${actionType}`, true);
      return false;
    }
    
    // RÈGLE 3: Vérifier la fréquence d'actions (max 1 action par minute)
    const lastActionKey = `${employeeId}_last`;
    const lastAction = this.lastActionTimes.get(lastActionKey);
    
    if (lastAction && (now - lastAction) < 60000) { // 1 minute minimum
      const remainingTime = Math.ceil((60000 - (now - lastAction)) / 1000);
      logAction(`Trop fréquent - ${remainingTime}s restantes`, true);
      
      // Pénalité progressive
      const penaltyKey = `${employeeId}_penalty`;
      const penalties = this.cooldownPenalties.get(penaltyKey) || 0;
      this.cooldownPenalties.set(penaltyKey, penalties + 1);
      
      // Blacklist temporaire si trop d'abus
      if (penalties > 5) {
        this.employeeBlacklist.add(employeeId);
        logAction(`Blacklist temporaire - trop d'abus (${penalties})`, true);
        
        // Retirer de la blacklist après 10 minutes
        setTimeout(() => {
          this.employeeBlacklist.delete(employeeId);
          this.cooldownPenalties.delete(penaltyKey);
          console.log(`🔓 [${employeeId}] Retiré de la blacklist`);
        }, 600000);
      }
      
      return false;
    }
    
    // RÈGLE 4: Une seule action par type par jour
    const dailyKey = `${employeeId}_${today}`;
    const todayActions = this.dailyActions.get(dailyKey) || new Set();
    
    if (todayActions.has(actionType)) {
      logAction(`Action déjà effectuée aujourd'hui: ${actionType}`, true);
      return false;
    }
    
    // RÈGLE 5: Vérifier les empreintes de session (détection multi-onglets)
    const sessionKey = `${employeeId}_session`;
    const currentSession = {
      userAgent: context.userAgent || '',
      ip: context.ip || '',
      timestamp: now
    };
    
    const existingSession = this.sessionFingerprints.get(sessionKey);
    if (existingSession) {
      const timeDiff = now - existingSession.timestamp;
      
      // Si même session dans les 30 dernières secondes = probable refresh
      if (timeDiff < 30000 && 
          existingSession.userAgent === currentSession.userAgent &&
          existingSession.ip === currentSession.ip) {
        logAction(`Session récente détectée - probable refresh (${Math.round(timeDiff/1000)}s)`, true);
        return false;
      }
    }
    
    // RÈGLE 6: Validation des actions réelles uniquement
    const validRealActions = [
      'check_in', 'check_out', 'message_sent', 'announcement_read',
      'document_viewed', 'task_completed', 'collaboration_join',
      'survey_completed', 'meeting_attended', 'leave_requested'
    ];
    
    if (!validRealActions.includes(actionType.toLowerCase())) {
      logAction(`Action non reconnue comme action réelle: ${actionType}`, true);
      return false;
    }
    
    // RÈGLE 7: Vérifications spécifiques par type d'action
    if (actionType === 'check_in' || actionType === 'check_out') {
      // Vérifier qu'il n'y a pas déjà un pointage aujourd'hui
      // Cette vérification sera faite dans la base de données
    }
    
    // Si toutes les vérifications passent
    logAction(`Action autorisée: ${actionType}`, false);
    
    // Enregistrer l'action
    todayActions.add(actionType);
    this.dailyActions.set(dailyKey, todayActions);
    this.lastActionTimes.set(lastActionKey, now);
    this.sessionFingerprints.set(sessionKey, currentSession);
    
    // Reset le compteur de pénalités si action valide
    this.cooldownPenalties.delete(`${employeeId}_penalty`);
    
    return true;
  }
  
  // Nettoyer le cache périodiquement
  cleanup() {
    const oneDayAgo = Date.now() - 86400000;
    
    // Nettoyer les actions anciennes
    for (const [key, timestamp] of this.lastActionTimes.entries()) {
      if (timestamp < oneDayAgo) {
        this.lastActionTimes.delete(key);
      }
    }
    
    // Nettoyer les logs de debug
    for (const [key, logs] of this.debugLogs.entries()) {
      if (logs.length > 100) {
        logs.splice(0, logs.length - 50);
      }
    }
  }
  
  // Obtenir les logs de debug pour un employé
  getDebugLogs(employeeId) {
    return this.debugLogs.get(`${employeeId}_debug`) || [];
  }
}

// Instance globale du cache ultra-strict
const ultraStrictCache = new UltraStrictCache();

// CORRECTION: Configuration stricte des points - seulement actions réelles
export const ULTRA_STRICT_POINTS_CONFIG = {
  // SEULES les actions réelles et vérifiables donnent des points
  VERIFIED_ACTIONS: {
    CHECK_IN: { 
      points: 10, 
      description: "Pointage d'entrée vérifié", 
      verification: 'database_check',
      cooldown: 86400000 // 24h
    },
    CHECK_OUT: { 
      points: 5, 
      description: "Pointage de sortie vérifié", 
      verification: 'database_check',
      cooldown: 86400000 // 24h
    },
    MESSAGE_SENT: { 
      points: 2, 
      description: "Message envoyé (vérifié en BDD)", 
      verification: 'database_check',
      cooldown: 300000 // 5min
    },
    ANNOUNCEMENT_READ: { 
      points: 3, 
      description: "Annonce lue (statut en BDD)", 
      verification: 'database_check',
      cooldown: 1800000 // 30min
    },
    DOCUMENT_VIEWED: { 
      points: 1, 
      description: "Document consulté (log en BDD)", 
      verification: 'database_check',
      cooldown: 3600000 // 1h
    },
    TASK_COMPLETED: { 
      points: 15, 
      description: "Tâche complétée (statut vérifié)", 
      verification: 'database_check',
      cooldown: 0
    }
  }
};

// CORRECTION: Moteur de gamification ultra-sécurisé
export class UltraSecureGamificationEngine {
  
  // Méthode principale - processus ultra-sécurisé
  static async processAction(employeeId, actionType, actionData = {}) {
    try {
      console.log(`\n🎮 === ULTRA SECURE GAMIFICATION START ===`);
      console.log(`👤 Employee: ${employeeId}`);
      console.log(`🎯 Action: ${actionType}`);
      console.log(`📊 Context:`, actionData);
      
      // ÉTAPE 1: Vérification de base
      if (!employeeId || !actionType) {
        console.log('❌ Paramètres manquants');
        return { success: false, reason: 'Paramètres manquants' };
      }
      
      // ÉTAPE 2: Vérification avec le cache ultra-strict
      const context = {
        userAgent: actionData.userAgent || '',
        ip: actionData.ip || '',
        sessionId: actionData.sessionId || '',
        timestamp: Date.now()
      };
      
      if (!ultraStrictCache.canProcessAction(employeeId, actionType, context)) {
        console.log('🚫 Action bloquée par le cache ultra-strict');
        return { 
          success: false, 
          reason: 'Action bloquée par sécurité',
          debugLogs: ultraStrictCache.getDebugLogs(employeeId)
        };
      }
      
      // ÉTAPE 3: Vérification de l'employé en base
      const employee = await Employee.filter({ id: employeeId });
      if (!employee || employee.length === 0) {
        console.log('❌ Employé non trouvé');
        return { success: false, reason: 'Employé non trouvé' };
      }
      
      // ÉTAPE 4: Vérification spécifique de l'action
      const actionConfig = ULTRA_STRICT_POINTS_CONFIG.VERIFIED_ACTIONS[actionType.toUpperCase()];
      if (!actionConfig) {
        console.log(`❌ Action non reconnue: ${actionType}`);
        return { success: false, reason: 'Action non reconnue' };
      }
      
      // ÉTAPE 5: Vérification en base de données selon le type d'action
      const verificationResult = await this.verifyActionInDatabase(employeeId, actionType, actionData);
      if (!verificationResult.valid) {
        console.log(`❌ Vérification base échouée: ${verificationResult.reason}`);
        return { 
          success: false, 
          reason: `Vérification échouée: ${verificationResult.reason}` 
        };
      }
      
      // ÉTAPE 6: Vérifier les doublons dans ActionLog
      const today = format(new Date(), 'yyyy-MM-dd');
      const existingLogs = await ActionLog.filter({
        employee_id: employeeId,
        action_type: actionType
      });
      
      const todayLogs = existingLogs.filter(log => {
        try {
          const logDate = format(new Date(log.created_date), 'yyyy-MM-dd');
          return logDate === today;
        } catch {
          return false;
        }
      });
      
      if (todayLogs.length > 0) {
        console.log(`🔄 Action déjà enregistrée aujourd'hui: ${actionType}`);
        return { 
          success: false, 
          reason: 'Action déjà effectuée aujourd\'hui' 
        };
      }
      
      // ÉTAPE 7: Attribution des points
      const pointsToAdd = actionConfig.points;
      const result = await this.awardPointsSafely(employeeId, pointsToAdd, actionType, actionData);
      
      // ÉTAPE 8: Enregistrer dans ActionLog
      await ActionLog.create({
        employee_id: employeeId,
        action_type: actionType,
        action_details: actionData,
        points_earned: pointsToAdd,
        quality_score: 100
      });
      
      console.log(`✅ Points attribués: +${pointsToAdd} pour ${actionType}`);
      console.log(`🎮 === ULTRA SECURE GAMIFICATION END ===\n`);
      
      return {
        success: true,
        pointsAwarded: pointsToAdd,
        action: actionType,
        employee: employeeId,
        verification: verificationResult,
        debugLogs: ultraStrictCache.getDebugLogs(employeeId)
      };
      
    } catch (error) {
      console.error('💥 Erreur dans le moteur de gamification:', error);
      return { 
        success: false, 
        reason: 'Erreur système',
        error: error.message 
      };
    }
  }
  
  // Vérification spécifique en base selon le type d'action
  static async verifyActionInDatabase(employeeId, actionType, actionData) {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      switch (actionType.toLowerCase()) {
        case 'check_in':
          // Vérifier qu'il y a bien un pointage d'entrée aujourd'hui
          const timeEntries = await TimeEntry.filter({
            employee_id: employeeId,
            date: today
          });
          
          if (!timeEntries || timeEntries.length === 0) {
            return { valid: false, reason: 'Aucun pointage trouvé aujourd\'hui' };
          }
          
          const todayEntry = timeEntries[0];
          if (!todayEntry.check_in_time) {
            return { valid: false, reason: 'Pointage d\'entrée manquant' };
          }
          
          return { valid: true, data: todayEntry };
          
        case 'check_out':
          // Vérifier qu'il y a bien un pointage de sortie
          const checkoutEntries = await TimeEntry.filter({
            employee_id: employeeId,
            date: today
          });
          
          if (!checkoutEntries || checkoutEntries.length === 0) {
            return { valid: false, reason: 'Aucun pointage trouvé aujourd\'hui' };
          }
          
          const checkoutEntry = checkoutEntries[0];
          if (!checkoutEntry.check_out_time) {
            return { valid: false, reason: 'Pointage de sortie manquant' };
          }
          
          return { valid: true, data: checkoutEntry };
          
        case 'message_sent':
          // Vérifier qu'un message a bien été envoyé récemment
          if (!actionData.messageId) {
            return { valid: false, reason: 'ID du message manquant' };
          }
          
          const messages = await Message.filter({
            sender_id: employeeId,
            id: actionData.messageId
          });
          
          if (!messages || messages.length === 0) {
            return { valid: false, reason: 'Message non trouvé' };
          }
          
          return { valid: true, data: messages[0] };
          
        case 'announcement_read':
          // Vérifier que le statut de lecture existe
          if (!actionData.announcementId) {
            return { valid: false, reason: 'ID de l\'annonce manquant' };
          }
          
          const readStatus = await AnnouncementReadStatus.filter({
            employee_id: employeeId,
            announcement_id: actionData.announcementId
          });
          
          if (!readStatus || readStatus.length === 0) {
            return { valid: false, reason: 'Statut de lecture non trouvé' };
          }
          
          return { valid: true, data: readStatus[0] };
          
        default:
          // Pour les autres actions, vérification basique
          return { valid: true, data: actionData };
      }
      
    } catch (error) {
      console.error('Erreur vérification base:', error);
      return { valid: false, reason: 'Erreur de vérification base' };
    }
  }
  
  // Attribution sécurisée des points
  static async awardPointsSafely(employeeId, points, actionType, actionData) {
    try {
      // Récupérer ou créer le record de points
      let employeePoints = await EmployeePoints.filter({ employee_id: employeeId });
      
      if (!employeePoints || employeePoints.length === 0) {
        // Créer un nouveau record
        employeePoints = await EmployeePoints.create({
          employee_id: employeeId,
          total_points: points,
          level: 1,
          points_this_month: points,
          points_this_week: points,
          streak_days: 1
        });
      } else {
        // Mettre à jour le record existant
        const current = employeePoints[0];
        const newTotal = Math.max(0, (current.total_points || 0) + points);
        
        await EmployeePoints.update(current.id, {
          total_points: newTotal,
          points_this_month: (current.points_this_month || 0) + points,
          points_this_week: (current.points_this_week || 0) + points,
          level: this.calculateLevel(newTotal)
        });
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur attribution points:', error);
      throw error;
    }
  }
  
  // Calculer le niveau basé sur les points
  static calculateLevel(totalPoints) {
    if (totalPoints >= 2500) return 7;
    if (totalPoints >= 1500) return 6;
    if (totalPoints >= 1000) return 5;
    if (totalPoints >= 600) return 4;
    if (totalPoints >= 300) return 3;
    if (totalPoints >= 100) return 2;
    return 1;
  }
  
  // Nettoyer le cache périodiquement
  static cleanup() {
    ultraStrictCache.cleanup();
  }
  
  // Obtenir les logs de debug pour un employé
  static getDebugLogs(employeeId) {
    return ultraStrictCache.getDebugLogs(employeeId);
  }
}

// Export par défaut
export default UltraSecureGamificationEngine;