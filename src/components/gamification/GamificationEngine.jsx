// ANCIEN SYSTÈME - REMPLACÉ PAR SmartGamificationEngine
// Ce fichier est conservé pour compatibilité mais ne devrait plus être utilisé

import SmartGamificationEngine from './SmartGamificationEngine';

// Export de compatibilité - redirige vers le nouveau système
export class GamificationEngine {
  static async processEmployeeAction(employeeId, actionType, actionDetails = {}) {
    console.warn('⚠️ Using deprecated GamificationEngine - redirecting to SmartGamificationEngine');
    return SmartGamificationEngine.processAction(employeeId, actionType, actionDetails);
  }
}

// Fonctions de compatibilité pour les imports existants
export const logAction = async (employeeId, actionType, actionDetails = {}) => {
  console.warn('⚠️ Using deprecated logAction - redirecting to SmartGamificationEngine');
  return SmartGamificationEngine.processAction(employeeId, actionType, actionDetails);
};

export const processEmployeeAchievements = async (employeeId) => {
  console.warn('⚠️ Using deprecated processEmployeeAchievements - redirecting to SmartGamificationEngine');
  return SmartGamificationEngine.processAction(employeeId, 'achievement_check', {});
};

// Définitions des badges pour compatibilité
export const BADGE_DEFINITIONS = {
  first_login: {
    name: "Première Connexion",
    description: "Bienvenue dans l'équipe !",
    icon: "UserCheck",
    tier: "bronze",
    category: "special",
    criteria: { firstLogin: 1 },
    points: 50
  },
  early_bird: {
    name: "Lève-tôt",
    description: "Arrivé en avance au travail",
    icon: "Sunrise",
    tier: "silver",
    category: "attendance",
    criteria: { earlyArrivals: 5 },
    points: 100
  },
  team_player: {
    name: "Joueur d'Équipe",
    description: "A participé à plusieurs réunions",
    icon: "Users",
    tier: "bronze",
    category: "collaboration",
    criteria: { meetingsAttended: 3 },
    points: 75
  },
  communicator: {
    name: "Communicateur",
    description: "A envoyé plusieurs messages",
    icon: "MessageSquare",
    tier: "bronze",
    category: "collaboration",
    criteria: { messagesSent: 10 },
    points: 80
  },
  task_master: {
    name: "Maître des Tâches",
    description: "A complété plusieurs tâches",
    icon: "CheckCircle",
    tier: "silver",
    category: "performance",
    criteria: { tasksCompleted: 5 },
    points: 120
  },
  innovator: {
    name: "Innovateur",
    description: "A suggéré des idées innovantes",
    icon: "Lightbulb",
    tier: "gold",
    category: "innovation",
    criteria: { ideasSuggested: 2 },
    points: 200
  },
  leader: {
    name: "Leader",
    description: "A dirigé des projets",
    icon: "Crown",
    tier: "platinum",
    category: "leadership",
    criteria: { projectsLed: 1 },
    points: 300
  },
  helper: {
    name: "Aidant",
    description: "A aidé ses collègues",
    icon: "Heart",
    tier: "silver",
    category: "collaboration",
    criteria: { helpProvided: 3 },
    points: 150
  },
  problem_solver: {
    name: "Résolveur de Problèmes",
    description: "A résolu des problèmes complexes",
    icon: "Wrench",
    tier: "gold",
    category: "performance",
    criteria: { problemsSolved: 2 },
    points: 250
  },
  learner: {
    name: "Apprenant",
    description: "A consulté des documents de formation",
    icon: "BookOpen",
    tier: "bronze",
    category: "growth",
    criteria: { documentsViewed: 5 },
    points: 60
  }
};

export default SmartGamificationEngine;