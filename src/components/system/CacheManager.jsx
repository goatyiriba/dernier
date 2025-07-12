
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  RefreshCw,
  Database,
  Activity,
  Terminal,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Download,
  Upload,
  Settings,
  Cpu,
  MemoryStick,
  Clock,
  Zap,
  Filter
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Gestionnaire de cache intelligent central
class IntelligentCacheManager {
  constructor() {
    this.caches = {
      api: new Map(),
      user: new Map(),
      entities: new Map(),
      layout: new Map(),
      settings: new Map()
    };
    this.logs = [];
    this.listeners = new Set();
    this.maxLogs = 1000;
    this.startTime = Date.now();

    // Surveiller localStorage
    this.monitorLocalStorage();

    this.log('SYSTEM', 'Cache Manager initialized', 'success');
  }

  // Ajouter un log avec timestamp et couleur
  log(category, message, level = 'info', data = null) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      category: category.toUpperCase(),
      message,
      level,
      data,
      relativeTime: Date.now() - this.startTime
    };

    this.logs.unshift(logEntry);

    // Limiter le nombre de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notifier les listeners
    this.notifyListeners();

    // Log dans la console du navigateur aussi
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${category}] ${message}`, data || '');
  }

  // Surveiller localStorage pour changements
  monitorLocalStorage() {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    localStorage.setItem = (key, value) => {
      this.log('STORAGE', `LocalStorage SET: ${key}`, 'info', { key, size: value.length });
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key) => {
      this.log('STORAGE', `LocalStorage REMOVE: ${key}`, 'warn');
      return originalRemoveItem.call(localStorage, key);
    };

    localStorage.clear = () => {
      this.log('STORAGE', 'LocalStorage CLEARED', 'error');
      return originalClear.call(localStorage);
    };
  }

  // Ajouter un listener pour les mises à jour
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notifier tous les listeners
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.logs);
      } catch (error) {
        console.error('Error in cache manager listener:', error);
      }
    });
  }

  // Obtenir les statistiques du cache
  getCacheStats() {
    const localStorageSize = JSON.stringify(localStorage).length;
    const memorySize = Object.values(this.caches).reduce((total, cache) => {
      return total + JSON.stringify([...cache.entries()]).length;
    }, 0);

    return {
      localStorage: {
        size: localStorageSize,
        keys: Object.keys(localStorage).length,
        items: Object.keys(localStorage).map(key => ({
          key,
          size: localStorage.getItem(key)?.length || 0,
          type: this.detectCacheType(key)
        }))
      },
      memory: {
        size: memorySize,
        caches: Object.entries(this.caches).map(([name, cache]) => ({
          name,
          size: cache.size,
          memorySize: JSON.stringify([...cache.entries()]).length
        }))
      },
      logs: {
        total: this.logs.length,
        levels: this.logs.reduce((acc, log) => {
          acc[log.level] = (acc[log.level] || 0) + 1;
          return acc;
        }, {})
      }
    };
  }

  // Détecter le type de cache basé sur la clé
  detectCacheType(key) {
    if (key.startsWith('file_')) return 'file';
    if (key.startsWith('cached')) return 'entity';
    if (key.includes('User')) return 'user';
    if (key.includes('Settings')) return 'settings';
    return 'other';
  }

  // Vider un type de cache spécifique
  clearCacheType(type) {
    let cleared = 0;

    if (type === 'localStorage') {
      const keys = Object.keys(localStorage);
      localStorage.clear();
      cleared = keys.length;
      this.log('CACHE', `Cleared localStorage: ${cleared} items`, 'warn');
    } else if (type === 'memory') {
      Object.values(this.caches).forEach(cache => {
        cleared += cache.size;
        cache.clear();
      });
      this.log('CACHE', `Cleared memory cache: ${cleared} items`, 'warn');
    } else if (this.caches[type]) {
      cleared = this.caches[type].size;
      this.caches[type].clear();
      this.log('CACHE', `Cleared ${type} cache: ${cleared} items`, 'warn');
    }

    return cleared;
  }

  // Vider tout le cache
  clearAll() {
    const stats = this.getCacheStats();
    let totalCleared = 0;

    // Vider localStorage
    localStorage.clear();
    totalCleared += stats.localStorage.keys;

    // Vider les caches mémoire
    Object.values(this.caches).forEach(cache => {
      totalCleared += cache.size;
      cache.clear();
    });

    this.log('CACHE', `TOTAL CACHE CLEARED: ${totalCleared} items`, 'error');

    return totalCleared;
  }

  // Optimiser le cache (supprimer les entrées expirées)
  optimize() {
    let optimized = 0;
    const now = Date.now();

    // Nettoyer localStorage des entrées expirées
    Object.keys(localStorage).forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed.timestamp && parsed.ttl && (now - parsed.timestamp) > parsed.ttl) {
            localStorage.removeItem(key);
            optimized++;
          }
        }
      } catch (error) {
        // Ignorer les erreurs de parsing
      }
    });

    this.log('CACHE', `Cache optimized: ${optimized} expired items removed`, 'success');
    return optimized;
  }
}

// Instance globale du gestionnaire de cache
const cacheManager = new IntelligentCacheManager();

export default function CacheManager() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const logsEndRef = useRef(null);
  const { toast } = useToast();

  // Charger les stats et logs
  const refreshStats = () => {
    const newStats = cacheManager.getCacheStats();
    setStats(newStats);
    cacheManager.log('SYSTEM', 'Stats refreshed', 'info');
  };

  // Filtrer les logs
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, categoryFilter]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (isAutoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, isAutoScroll]);

  // S'abonner aux mises à jour des logs
  useEffect(() => {
    const unsubscribe = cacheManager.addListener((newLogs) => {
      setLogs([...newLogs]);
    });

    // Charger les logs initiaux et stats
    setLogs([...cacheManager.logs]);
    refreshStats();

    // Rafraîchir les stats toutes les 5 secondes
    const interval = setInterval(refreshStats, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Actions de cache
  const handleClearCache = (type) => {
    const cleared = cacheManager.clearCacheType(type);
    refreshStats();
    toast({
      title: "🗑️ Cache vidé",
      description: `${cleared} éléments supprimés du cache ${type}`,
    });
  };

  const handleClearAll = () => {
    const cleared = cacheManager.clearAll();
    refreshStats();
    toast({
      title: "🗑️ Tout le cache vidé",
      description: `${cleared} éléments supprimés au total`,
      variant: "destructive"
    });
  };

  const handleOptimize = () => {
    const optimized = cacheManager.optimize();
    refreshStats();
    toast({
      title: "⚡ Cache optimisé",
      description: `${optimized} éléments expirés supprimés`,
    });
  };

  const clearAllCaches = () => {
    try {
      // Supprimer tous les caches localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('apiCache_') ||
          key.startsWith('cached') ||
          key.includes('Cache') ||
          key.includes('lastLoad')
        )) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Vider le cache mémoire si il existe
      // Assuming window.apiCache is an external cache that might exist.
      // The IntelligentCacheManager's internal caches are handled by clearCacheType('memory')
      // or clearAll()
      if (window.apiCache) {
        window.apiCache.clear();
      }

      toast({
        title: "✅ Cache vidé",
        description: `${keysToRemove.length} entrées de cache spécifiques supprimées`,
      });

      // Recharger les métriques
      refreshStats();

    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de vider le cache complètement",
        variant: "destructive"
      });
    }
  };

  // Télécharger les logs
  const downloadLogs = () => {
    const logsData = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cache-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    cacheManager.log('SYSTEM', 'Logs downloaded', 'info');
  };

  // Couleurs pour les niveaux de log
  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  // Couleurs pour les catégories
  const getCategoryColor = (category) => {
    switch (category) {
      case 'SYSTEM': return 'text-purple-400';
      case 'CACHE': return 'text-orange-400';
      case 'STORAGE': return 'text-cyan-400';
      case 'API': return 'text-green-400';
      case 'USER': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Obtenir les catégories uniques
  const uniqueCategories = [...new Set(logs.map(log => log.category))];

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Database className="w-6 h-6 text-blue-600" />
            Gestionnaire de Cache Intelligent
          </CardTitle>
          <p className="text-gray-600">
            Surveillance en temps réel du cache système avec console de logs avancée
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Console Live
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                Cache Stats
              </TabsTrigger>
              <TabsTrigger value="management" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Gestion
              </TabsTrigger>
            </TabsList>

            {/* Console de logs en temps réel */}
            <TabsContent value="logs" className="space-y-4">
              {/* Filtres */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-64">
                  <Input
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-md"
                >
                  <option value="all">Tous les niveaux</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-white border rounded-md"
                >
                  <option value="all">Toutes catégories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoScroll(!isAutoScroll)}
                  className={isAutoScroll ? 'bg-green-50 text-green-700' : ''}
                >
                  {isAutoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
                </Button>
                <Button variant="outline" size="sm" onClick={downloadLogs}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Console style terminal */}
              <div className="bg-black rounded-lg p-4 font-mono text-sm h-96 overflow-y-auto">
                <div className="mb-2 text-green-400 border-b border-gray-700 pb-2">
                  Flow HR System Console - {logs.length} entrées
                </div>
                <AnimatePresence>
                  {filteredLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="py-1 hover:bg-gray-900 px-2 rounded transition-colors"
                    >
                      <span className="text-gray-500 text-xs">
                        [{format(new Date(log.timestamp), 'HH:mm:ss.SSS')}]
                      </span>{' '}
                      <span className={`font-bold ${getCategoryColor(log.category)}`}>
                        [{log.category}]
                      </span>{' '}
                      <span className={getLevelColor(log.level)}>
                        {log.level.toUpperCase()}:
                      </span>{' '}
                      <span className="text-green-400">
                        {log.message}
                      </span>
                      {log.data && (
                        <div className="text-gray-400 text-xs ml-4 mt-1">
                          └─ {JSON.stringify(log.data)}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={logsEndRef} />
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total Logs</p>
                      <p className="text-lg font-bold">{logs.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-500">Warnings</p>
                      <p className="text-lg font-bold">
                        {logs.filter(l => l.level === 'warn').length}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-500">Erreurs</p>
                      <p className="text-lg font-bold">
                        {logs.filter(l => l.level === 'error').length}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-lg font-bold">
                        {formatTime(Date.now() - cacheManager.startTime)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Statistiques du cache */}
            <TabsContent value="cache" className="space-y-6">
              {stats && (
                <div className="space-y-6">
                  {/* LocalStorage Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-blue-600" />
                        LocalStorage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatBytes(stats.localStorage.size)}
                          </p>
                          <p className="text-sm text-gray-500">Taille totale</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {stats.localStorage.keys}
                          </p>
                          <p className="text-sm text-gray-500">Clés stockées</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {Math.round(stats.localStorage.size / stats.localStorage.keys || 0)}
                          </p>
                          <p className="text-sm text-gray-500">Taille moyenne</p>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stats.localStorage.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.type}</Badge>
                              <span className="font-mono text-sm">{item.key}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatBytes(item.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Memory Cache Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MemoryStick className="w-5 h-5 text-green-600" />
                        Cache Mémoire
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {stats.memory.caches.map((cache, index) => (
                          <Card key={index} className="p-4">
                            <h4 className="font-semibold capitalize">{cache.name}</h4>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Éléments:</span>
                                <span className="font-bold">{cache.size}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Taille:</span>
                                <span className="font-bold">{formatBytes(cache.memorySize)}</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Gestion du cache */}
            <TabsContent value="management" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Actions rapides */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-600" />
                      Actions Rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={refreshStats}
                      className="w-full"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualiser les Stats
                    </Button>

                    <Button
                      onClick={handleOptimize}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Cpu className="w-4 h-4 mr-2" />
                      Optimiser le Cache
                    </Button>

                    <Button
                      onClick={() => handleClearCache('localStorage')}
                      className="w-full bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Vider LocalStorage (Complet)
                    </Button>

                    <Button
                      onClick={clearAllCaches}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Vider Caches Spécifiques (LS & Window)
                    </Button>

                    <Button
                      onClick={() => handleClearCache('memory')}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Vider Cache Mémoire
                    </Button>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <Button
                          onClick={handleClearAll}
                          className="w-full bg-red-600 hover:bg-red-700 mt-2"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          ⚠️ VIDER TOUT LE CACHE
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logs Maximum: {cacheManager.maxLogs}
                      </label>
                      <input
                        type="range"
                        min="100"
                        max="5000"
                        step="100"
                        value={cacheManager.maxLogs}
                        onChange={(e) => {
                          cacheManager.maxLogs = parseInt(e.target.value);
                          cacheManager.log('SYSTEM', `Max logs set to ${e.target.value}`, 'info');
                        }}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Surveillance Active</h4>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">LocalStorage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Cache Mémoire</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">API Calls</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Exporter le gestionnaire pour utilisation globale
export { cacheManager };
