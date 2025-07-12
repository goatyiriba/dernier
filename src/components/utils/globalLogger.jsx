// Logger global pour capturer toutes les actions système
import { cacheManager } from '../system/CacheManager';

class GlobalLogger {
  constructor() {
    this.isEnabled = true;
    this.initializeInterceptors();
  }

  // Intercepter les appels API
  initializeInterceptors() {
    // Intercepter fetch pour les appels API
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [url, options] = args;
      const startTime = Date.now();
      
      try {
        cacheManager.log('API', `REQUEST: ${options?.method || 'GET'} ${url}`, 'info', {
          url,
          method: options?.method || 'GET',
          timestamp: new Date().toISOString()
        });

        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        cacheManager.log('API', `RESPONSE: ${response.status} ${url} (${duration}ms)`, 
          response.ok ? 'success' : 'error', {
          status: response.status,
          duration,
          url
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        cacheManager.log('API', `ERROR: ${url} (${duration}ms)`, 'error', {
          error: error.message,
          duration,
          url
        });
        throw error;
      }
    };

    // Intercepter les erreurs globales
    window.addEventListener('error', (event) => {
      cacheManager.log('ERROR', `Global error: ${event.error?.message || event.message}`, 'error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Intercepter les promesses rejetées
    window.addEventListener('unhandledrejection', (event) => {
      cacheManager.log('ERROR', `Unhandled promise rejection: ${event.reason}`, 'error', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // Intercepter les changements de route
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      cacheManager.log('NAVIGATION', `Navigation to: ${args[2]}`, 'info', {
        state: args[0],
        title: args[1],
        url: args[2]
      });
      return originalPushState.apply(this, args);
    };

    history.replaceState = function(...args) {
      cacheManager.log('NAVIGATION', `Replace state: ${args[2]}`, 'info', {
        state: args[0],
        title: args[1],
        url: args[2]
      });
      return originalReplaceState.apply(this, args);
    };
  }

  // Logger les actions utilisateur
  logUserAction(action, details = {}) {
    if (this.isEnabled) {
      cacheManager.log('USER', `User action: ${action}`, 'info', {
        action,
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  // Logger les opérations sur les entités
  logEntityOperation(entity, operation, data = {}) {
    if (this.isEnabled) {
      const level = operation.includes('delete') ? 'warn' : 'info';
      cacheManager.log('ENTITY', `${entity}.${operation}`, level, {
        entity,
        operation,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Logger les événements de performance
  logPerformance(metric, value, unit = 'ms') {
    if (this.isEnabled) {
      cacheManager.log('PERFORMANCE', `${metric}: ${value}${unit}`, 'info', {
        metric,
        value,
        unit,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Logger les opérations de cache
  logCacheOperation(operation, details = {}) {
    if (this.isEnabled) {
      cacheManager.log('CACHE', `Cache ${operation}`, 'info', {
        operation,
        ...details,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Activer/désactiver le logger
  setEnabled(enabled) {
    this.isEnabled = enabled;
    cacheManager.log('SYSTEM', `Global logger ${enabled ? 'enabled' : 'disabled'}`, 'info');
  }
}

// Instance globale
export const globalLogger = new GlobalLogger();

// Fonction utilitaire pour les composents
export const logUserAction = (action, details) => {
  globalLogger.logUserAction(action, details);
};

export const logEntityOperation = (entity, operation, data) => {
  globalLogger.logEntityOperation(entity, operation, data);
};

export const logPerformance = (metric, value, unit) => {
  globalLogger.logPerformance(metric, value, unit);
};

export const logCacheOperation = (operation, details) => {
  globalLogger.logCacheOperation(operation, details);
};