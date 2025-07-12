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

export default SmartGamificationEngine;