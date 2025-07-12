import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Cloud,
  HardDrive,
  Settings,
  ExternalLink,
  Key,
  Info
} from 'lucide-react';
import { supabaseConnection } from '@/api/supabaseFunctions';

export default function SupabaseManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [configurationError, setConfigurationError] = useState(null);
  const { toast } = useToast();

  const handleSync = async (action, description) => {
    setIsLoading(true);
    setSyncResults(null);
    setConfigurationError(null);
    
    try {
      console.log(`🔄 ${description}...`);
      
      const response = await supabaseConnection({
        action: action,
        table: 'employees'
      });

      if (response.data.success) {
        setSyncResults(response.data.data);
        setLastSync(new Date());
        
        toast({
          title: "✅ Synchronisation réussie",
          description: response.data.data.message || description,
          duration: 5000,
        });
      } else {
        // Gestion spéciale des erreurs de configuration
        if (response.data.error && response.data.error.includes('Configuration Supabase incomplète')) {
          setConfigurationError(response.data);
          toast({
            title: "⚙️ Configuration requise",
            description: "Les variables d'environnement Supabase ne sont pas configurées",
            variant: "destructive",
            duration: 8000,
          });
        } else {
          throw new Error(response.data.error || 'Une erreur inconnue est survenue');
        }
      }
    } catch (error) {
      console.error(`❌ Erreur ${description}:`, error);
      
      // Analyser le type d'erreur
      let errorMessage = error.message;
      let isConfigurationIssue = false;
      
      if (error.message.includes('500') || error.message.includes('Configuration Supabase')) {
        isConfigurationIssue = true;
        errorMessage = "Variables d'environnement Supabase manquantes ou incorrectes";
      }
      
      if (isConfigurationIssue) {
        setConfigurationError({
          error: errorMessage,
          config: { url_present: false, key_present: false }
        });
      }
      
      toast({
        title: isConfigurationIssue ? "⚙️ Configuration requise" : "❌ Erreur de synchronisation",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConfigurationError(null);
    
    try {
      console.log('🔍 Test de connexion Supabase...');
      
      const response = await supabaseConnection({
        action: 'test_connection'
      });

      if (response.data.success) {
        toast({
          title: "✅ Connexion réussie",
          description: "Supabase est correctement configuré",
          duration: 5000,
        });
      } else {
        setConfigurationError(response.data);
      }
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      setConfigurationError({
        error: "Impossible de tester la connexion",
        config: { url_present: false, key_present: false }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            Gestionnaire Supabase
            <Badge className="bg-blue-100 text-blue-800">
              Base de données externe
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Synchronisez vos données avec Supabase pour la sauvegarde, la réplication et l'analyse avancée.
          </p>
          {lastSync && (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Dernière synchronisation: {lastSync.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Erreur de configuration */}
      {configurationError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-3">
              <div>
                <strong className="text-red-800">Configuration Supabase requise</strong>
                <p className="text-red-700 mt-1">{configurationError.error}</p>
              </div>
              
              {configurationError.config && (
                <div className="text-sm text-red-600">
                  <p><strong>État de la configuration :</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>SUPABASE_URL : {configurationError.config.url_present ? '✅ Configurée' : '❌ Manquante'}</li>
                    <li>SUPABASE_SERVICE_ROLE_KEY : {configurationError.config.key_present ? '✅ Configurée' : '❌ Manquante'}</li>
                  </ul>
                </div>
              )}
              
              <div className="bg-red-100 p-3 rounded-lg">
                <p className="text-red-800 font-medium mb-2">
                  <Key className="w-4 h-4 inline mr-1" />
                  Pour configurer Supabase :
                </p>
                <ol className="text-red-700 text-sm space-y-1 list-decimal list-inside">
                  <li>Allez dans <strong>Workspace → Settings → Environment Variables</strong></li>
                  <li>Ajoutez <code className="bg-red-200 px-1 rounded">SUPABASE_URL</code> avec votre URL de projet</li>
                  <li>Ajoutez <code className="bg-red-200 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> avec votre clé de service</li>
                  <li>Redémarrez l'application ou attendez quelques minutes</li>
                </ol>
                <div className="mt-3 p-2 bg-red-200 rounded">
                  <p className="text-red-800 text-xs">
                    <Info className="w-3 h-3 inline mr-1" />
                    <strong>Trouvez ces informations dans votre dashboard Supabase :</strong><br/>
                    Settings → API → URL et service_role key
                  </p>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Actions de synchronisation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Synchronisation vers Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Envoyer les données de Base44 vers Supabase.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={testConnection}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                Tester la connexion
              </Button>
              
              <Button
                onClick={() => handleSync('sync_employees', 'Synchronisation des employés')}
                disabled={isLoading || configurationError}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Sync Employés
              </Button>
              
              <Button
                onClick={() => handleSync('backup_to_supabase', 'Sauvegarde complète')}
                disabled={isLoading || configurationError}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Cloud className="w-4 h-4 mr-2" />
                )}
                Sauvegarde complète
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Synchronisation depuis Supabase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Récupérer les données de Supabase vers Base44.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleSync('sync_from_supabase', 'Synchronisation depuis Supabase')}
                disabled={isLoading || configurationError}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Import Employés depuis Supabase
              </Button>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Attention:</strong> Cette opération peut écraser les données existantes.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Résultats de synchronisation */}
      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              Résultats de la dernière synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {syncResults.message && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {syncResults.message}
                  </AlertDescription>
                </Alert>
              )}
              
              {syncResults.total !== undefined && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{syncResults.total || 0}</div>
                    <div className="text-sm text-blue-800">Total</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{syncResults.synced || 0}</div>
                    <div className="text-sm text-green-800">Synchronisés</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{syncResults.errors || 0}</div>
                    <div className="text-sm text-red-800">Erreurs</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guide de configuration */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Shield className="w-5 h-5" />
            Guide de configuration Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-yellow-800">
            <div>
              <p className="font-medium mb-2">1. Créer un projet Supabase :</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-700">
                <li>Allez sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                <li>Créez un nouveau projet</li>
                <li>Notez l'URL et les clés API</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">2. Variables d'environnement nécessaires :</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-yellow-700">
                <li><code className="bg-yellow-200 px-1 rounded">SUPABASE_URL</code> - URL de votre projet Supabase</li>
                <li><code className="bg-yellow-200 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> - Clé de service pour les opérations admin</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium mb-2">3. Configuration dans Base44 :</p>
              <p className="text-yellow-700">
                <strong>Workspace → Settings → Environment Variables</strong>
              </p>
            </div>
            
            <Alert className="bg-yellow-100 border-yellow-300">
              <Info className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                <strong>Sécurité :</strong> La clé service_role donne un accès complet à votre base de données. 
                Ne la partagez jamais et utilisez-la uniquement côté serveur.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}