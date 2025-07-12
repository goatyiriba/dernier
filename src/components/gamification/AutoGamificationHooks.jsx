import React, { useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import UltraSecureGamificationEngine from './SmartGamificationEngine';

// CORRECTION MAJEURE: Suppression totale de la gamification automatique sur login/navigation

// Hook vide - AUCUNE gamification automatique
export function useDailyLoginGamification() {
  // CORRECTION: Ce hook ne fait plus RIEN pour éviter les points automatiques
  console.log('🔕 useDailyLoginGamification: Hook désactivé - pas de gamification automatique');
  
  // Retourner une fonction vide
  return () => {};
}

// Hook vide - AUCUNE gamification sur navigation
export function usePageViewGamification() {
  // CORRECTION: Ce hook ne fait plus RIEN
  console.log('🔕 usePageViewGamification: Hook désactivé - pas de gamification sur navigation');
  
  return () => {};
}

// Hook vide - AUCUNE gamification sur activité
export function useActivityGamification() {
  // CORRECTION: Ce hook ne fait plus RIEN
  console.log('🔕 useActivityGamification: Hook désactivé - pas de gamification sur activité');
  
  return () => {};
}

// CORRECTION: Fonction pour gamification manuelle UNIQUEMENT
export async function processManualGamificationAction(actionType, actionData = {}) {
  try {
    console.log('🎯 Gamification manuelle demandée:', actionType);
    
    // Obtenir l'utilisateur actuel
    const user = await User.me();
    if (!user || !user.employee_id) {
      console.log('❌ Utilisateur non connecté ou sans employee_id');
      return { success: false, reason: 'Utilisateur non valide' };
    }
    
    // Ajouter des métadonnées de contexte
    const enrichedData = {
      ...actionData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      manual: true, // Marquer comme action manuelle
      ip: 'client', // IP côté client
      sessionId: `manual_${Date.now()}`
    };
    
    // Processus avec le moteur ultra-sécurisé
    const result = await UltraSecureGamificationEngine.processAction(
      user.employee_id,
      actionType,
      enrichedData
    );
    
    console.log('📊 Résultat gamification manuelle:', result);
    return result;
    
  } catch (error) {
    console.error('💥 Erreur gamification manuelle:', error);
    return { 
      success: false, 
      reason: 'Erreur système',
      error: error.message 
    };
  }
}

// CORRECTION: Hook pour les actions spécifiques et vérifiables
export function useVerifiedActionGamification() {
  
  // Fonction pour déclencher manuellement une action vérifiée
  const triggerVerifiedAction = async (actionType, verificationData = {}) => {
    try {
      console.log(`🔍 Action vérifiée demandée: ${actionType}`);
      
      // Seules certaines actions sont autorisées
      const allowedActions = [
        'check_in', 'check_out', 'message_sent', 
        'announcement_read', 'document_viewed', 'task_completed'
      ];
      
      if (!allowedActions.includes(actionType)) {
        console.log(`❌ Action non autorisée: ${actionType}`);
        return { success: false, reason: 'Action non autorisée' };
      }
      
      // Processus avec vérification
      return await processManualGamificationAction(actionType, verificationData);
      
    } catch (error) {
      console.error('Erreur action vérifiée:', error);
      return { success: false, reason: 'Erreur action vérifiée' };
    }
  };
  
  return { triggerVerifiedAction };
}

// CORRECTION: Hook pour debug - voir les logs d'un employé
export function useGamificationDebug() {
  const getEmployeeDebugLogs = async () => {
    try {
      const user = await User.me();
      if (!user?.employee_id) return [];
      
      return UltraSecureGamificationEngine.getDebugLogs(user.employee_id);
    } catch (error) {
      console.error('Erreur debug logs:', error);
      return [];
    }
  };
  
  return { getEmployeeDebugLogs };
}

// Export des fonctions utiles
export {
  UltraSecureGamificationEngine,
  processManualGamificationAction as processGamificationAction
};

// Export par défaut
export default {
  useDailyLoginGamification,
  usePageViewGamification,
  useActivityGamification,
  useVerifiedActionGamification,
  useGamificationDebug,
  processManualGamificationAction
};