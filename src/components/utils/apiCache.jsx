
// CORRECTION: Amélioration du système de cache pour les activités en temps réel
class APICache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 120000; // CORRECTION: Réduit à 2 minutes pour plus de réactivité
    this.requestHistory = new Map();
    this.activityCacheTimeout = 30000; // Cache spécial pour les activités: 30 secondes
  }

  generateKey(entity, method, params = {}) {
    return `${entity}_${method}_${JSON.stringify(params)}`;
  }

  canMakeRequest(key) {
    const now = Date.now();
    const lastRequest = this.requestHistory.get(key);
    
    // CORRECTION: Réduire le délai pour les données d'activités
    const minDelay = key.includes('activity') || key.includes('Employee') ? 15000 : 20000; // 15s pour activités/employés, 20s pour le reste
    
    if (lastRequest && (now - lastRequest) < minDelay) {
      console.log(`⏱️ Rate limiting: Skipping request for ${key}, last request was ${Math.round((now - lastRequest)/1000)}s ago`);
      return false;
    }
    
    return true;
  }

  get(key) {
    const cached = this.cache.get(key);
    if (cached) {
      // CORRECTION: Cache plus court pour les données d'activités
      const timeout = key.includes('activity') || key.includes('Employee') ? this.activityCacheTimeout : this.cacheTimeout;
      
      if (Date.now() - cached.timestamp < timeout) {
        console.log(`📦 Cache hit for ${key} (${Math.round((Date.now() - cached.timestamp)/1000)}s old)`);
        return cached.data;
      } else {
        this.cache.delete(key);
        console.log(`⏰ Cache expired for ${key}`);
      }
    }
    return null;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    console.log(`💾 Cache set for ${key} with ${Array.isArray(data) ? data.length : 'unknown'} items`);
  }

  recordRequest(key) {
    this.requestHistory.set(key, Date.now());
  }

  // CORRECTION: Méthode pour forcer le rafraîchissement des activités
  clearActivityCache() {
    for (const key of this.cache.keys()) {
      if (key.includes('activity') || key.includes('Employee') || key.includes('TimeEntry') || key.includes('LeaveRequest')) {
        this.cache.delete(key);
      }
    }
    for (const key of this.requestHistory.keys()) {
      if (key.includes('activity') || key.includes('Employee') || key.includes('TimeEntry') || key.includes('LeaveRequest')) {
        this.requestHistory.delete(key);
      }
    }
    console.log("🧹 Activity cache cleared for fresh data");
  }

  clearEntity(entity) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(entity)) {
        this.cache.delete(key);
      }
    }
    for (const key of this.requestHistory.keys()) {
      if (key.startsWith(entity)) {
        this.requestHistory.delete(key);
      }
    }
    console.log(`🗑️ Cache cleared for entity: ${entity}`);
  }

  clear() {
    this.cache.clear();
    this.requestHistory.clear();
    console.log("🚮 All cache cleared");
  }

  // CORRECTION: Méthode pour obtenir les statistiques de performance
  getPerformanceStats() {
    const totalCached = this.cache.size;
    const totalRequests = this.requestHistory.size;
    const cacheHitRate = totalRequests > 0 ? Math.round((totalCached / totalRequests) * 100) : 0;
    
    return {
      cached_items: totalCached,
      total_requests: totalRequests,
      hit_rate: cacheHitRate,
      cache_size: JSON.stringify([...this.cache.entries()]).length
    };
  }

  // CORRECTION: Méthode pour expliquer le rate limiting
  getRateLimitInfo() {
    return {
      purpose: "Protection contre la surcharge du serveur",
      mechanism: "Limitation des requêtes API par minute",
      fallback: "Utilisation du cache local pour maintenir les performances",
      benefits: [
        "Stabilité du système",
        "Réduction de la latence",
        "Économie de bande passante",
        "Meilleure expérience utilisateur"
      ],
      cache_strategy: "Les données sont automatiquement mises en cache et rafraîchies intelligemment"
    };
  }
}

export const apiCache = new APICache();

// CORRECTION: Fonction pour vider le cache spécifique aux employés après repointage
export function clearEmployeeActivityCache() {
  // Vider le cache API
  apiCache.clearEntity('Employee');
  apiCache.clearEntity('TimeEntry');
  
  // Vider le cache localStorage
  localStorage.removeItem('employees_cache');
  localStorage.removeItem('users_cache');
  localStorage.removeItem('employees_cache_timestamp');
  localStorage.removeItem('layoutCachedUsers');
  localStorage.removeItem('layoutUserCacheTime');
  
  console.log("🔄 Cache d'activité employés vidé après repointage");
  
  // CORRECTION: Déclencher un événement pour forcer le rafraîchissement
  window.dispatchEvent(new CustomEvent('employeeActivityUpdated', {
    detail: { 
      action: 'cache_cleared',
      timestamp: Date.now() 
    }
  }));
}

// CORRECTION: Fonction améliorée avec gestion des erreurs et retry intelligent
export async function cachedApiCall(entity, method, params = {}, retryCount = 0) {
  const cacheKey = apiCache.generateKey(entity.name, method, params);
  
  // Essayer de récupérer du cache d'abord
  const cachedData = apiCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Vérifier le rate limiting local
  if (!apiCache.canMakeRequest(cacheKey)) {
    // Retourner les données en cache même si expirées plutôt que de faire échouer
    const expiredCache = apiCache.cache.get(cacheKey);
    if (expiredCache) {
      console.log(`Using expired cache for ${cacheKey} to avoid rate limiting`);
      return expiredCache.data;
    }
    
    // Si pas de cache du tout, attendre un peu et réessayer
    if (retryCount < 1) {
      console.log(`Waiting before retry for ${cacheKey}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return cachedApiCall(entity, method, params, retryCount + 1);
    }
    
    throw new Error(`Rate limited and no cache available: ${cacheKey}`);
  }

  try {
    // Enregistrer la tentative de requête
    apiCache.recordRequest(cacheKey);
    
    let result;
    const startTime = Date.now();
    
    switch (method) {
      case 'list':
        result = await entity.list(params.sortBy, params.limit);
        break;
      case 'filter':
        result = await entity.filter(params.filters, params.sortBy, params.limit);
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`API call ${cacheKey} completed in ${duration}ms with ${Array.isArray(result) ? result.length : 'unknown'} items`);
    
    // CORRECTION: Stocker dans le cache seulement si on a des données valides
    if (result !== null && result !== undefined) {
      apiCache.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error(`API call failed for ${cacheKey}:`, error);
    
    if (error.message.includes('429') && retryCount < 2) {
      const waitTime = (retryCount + 1) * 5000; // 5s, 10s
      console.warn(`Rate limit hit for ${entity.name}.${method}, retrying in ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return cachedApiCall(entity, method, params, retryCount + 1);
    }
    
    // En cas d'erreur, essayer de retourner des données en cache même expirées
    const expiredCache = apiCache.cache.get(cacheKey);
    if (expiredCache) {
      console.warn(`API call failed for ${cacheKey}, using expired cache (${Math.round((Date.now() - expiredCache.timestamp)/1000)}s old)`);
      return expiredCache.data;
    }
    
    // Si vraiment aucune donnée disponible, retourner un tableau vide pour éviter les erreurs
    if (method === 'list' || method === 'filter') {
      console.warn(`Returning empty array for failed ${cacheKey}`);
      return [];
    }
    
    throw error;
  }
}
