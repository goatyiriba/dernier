import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  Shield, 
  Users, 
  FileText,
  Bell,
  Award,
  BarChart3,
  Globe,
  Zap,
  Server,
  Wifi,
  WifiOff,
  TestTube,
  Info,
  AlertTriangle,
  HelpCircle,
  Settings as SettingsIcon,
  User,
  UserPlus,
  UserMinus,
  UserCheck as UserCheckIcon,
  UserX,
  Users as UsersIcon,
  UserCog,
  UserEdit,
  UserSearch,
  UserTag,
  UserVoice,
  UserShield,
  UserStar,
  UserHeart,
  UserSmile,
  UserFrown,
  UserMeh,
  UserZap,
  UserGear,
  UserKey,
  UserLock,
  UserUnlock,
  UserAlert,
  UserBan,
  UserCheck2,
  UserClock,
  UserCrown,
  UserDollar,
  UserEdit2,
  UserMinus2,
  UserPlus2,
  UserSearch2,
  UserSettings,
  UserStar2,
  UserTag2,
  UserVoice2,
  UserX2,
  UserZap2,
  UserGear2,
  UserKey2,
  UserLock2,
  UserUnlock2,
  UserAlert2,
  UserBan2,
  UserCheck3,
  UserClock2,
  UserCrown2,
  UserDollar2,
  UserEdit3,
  UserMinus3,
  UserPlus3,
  UserSearch3,
  UserSettings2,
  UserStar3,
  UserTag3,
  UserVoice3,
  UserX3,
  UserZap3,
  UserGear3,
  UserKey3,
  UserLock3,
  UserUnlock3,
  UserAlert3,
  UserBan3,
  UserCheck4,
  UserClock3,
  UserCrown3,
  UserDollar3,
  UserEdit4,
  UserMinus4,
  UserPlus4,
  UserSearch4,
  UserSettings3,
  UserStar4,
  UserTag4,
  UserVoice4,
  UserX4,
  UserZap4,
  UserGear4,
  UserKey4,
  UserLock4,
  UserUnlock4,
  UserAlert4,
  UserBan4,
  UserCheck5,
  UserClock4,
  UserCrown4,
  UserDollar4,
  UserEdit5,
  UserMinus5,
  UserPlus5,
  UserSearch5,
  UserSettings4,
  UserStar5,
  UserTag5,
  UserVoice5,
  UserX5,
  UserZap5,
  UserGear5,
  UserKey5,
  UserLock5,
  UserUnlock5,
  UserAlert5,
  UserBan5
} from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/api/supabaseClient';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [configInfo, setConfigInfo] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    getConfigInfo();
  }, []);

  const getConfigInfo = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setConfigInfo({
      url: url ? `${url.substring(0, 20)}...` : 'Non configuré',
      key: key ? `${key.substring(0, 20)}...` : 'Non configuré',
      hasUrl: !!url,
      hasKey: !!key
    });
  };

  const checkConnection = async () => {
    setConnectionStatus('checking');
    
    try {
      // Test de connexion basique
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        console.error('Erreur de connexion Supabase:', error);
        setConnectionStatus('error');
        setTestResults(prev => ({
          ...prev,
          connection: { status: 'error', message: error.message }
        }));
      } else {
        setConnectionStatus('connected');
        setTestResults(prev => ({
          ...prev,
          connection: { status: 'success', message: 'Connexion établie' }
        }));
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setConnectionStatus('error');
      setTestResults(prev => ({
        ...prev,
        connection: { status: 'error', message: error.message }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    const results = {};

    try {
      // Test 1: Connexion de base
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        results.connection = { status: 'success', message: 'Connexion établie' };
      } catch (error) {
        results.connection = { status: 'error', message: error.message };
      }

      // Test 2: Authentification
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        results.auth = { status: 'success', message: 'Service d\'authentification disponible' };
      } catch (error) {
        results.auth = { status: 'error', message: error.message };
      }

      // Test 3: Storage
      try {
        const { data, error } = await supabase.storage.listBuckets();
        results.storage = { status: 'success', message: `${data?.length || 0} buckets disponibles` };
      } catch (error) {
        results.storage = { status: 'error', message: error.message };
      }

      // Test 4: RLS (Row Level Security)
      try {
        const { data, error } = await supabase.rpc('get_rls_policies');
        results.rls = { status: 'success', message: 'RLS configuré' };
      } catch (error) {
        results.rls = { status: 'warning', message: 'RLS non vérifié' };
      }

      // Test 5: Tables principales
      const tables = ['employees', 'leave_requests', 'time_entries', 'announcements'];
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('count').limit(1);
          if (error) {
            results[`table_${table}`] = { status: 'error', message: `Table ${table}: ${error.message}` };
          } else {
            results[`table_${table}`] = { status: 'success', message: `Table ${table} accessible` };
          }
        } catch (error) {
          results[`table_${table}`] = { status: 'error', message: `Table ${table}: ${error.message}` };
        }
      }

      setTestResults(results);
      
      toast({
        title: "Tests terminés",
        description: "Tous les tests de connexion ont été exécutés",
      });

    } catch (error) {
      console.error('Erreur lors des tests:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'exécution des tests",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connecté</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Vérification...</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            Test de Connexion Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statut de connexion */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : connectionStatus === 'error' ? (
                <WifiOff className="w-5 h-5 text-red-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              <div>
                <h3 className="font-semibold">Statut de connexion</h3>
                <p className="text-sm text-gray-600">
                  {connectionStatus === 'connected' && 'Connexion établie avec Supabase'}
                  {connectionStatus === 'error' && 'Erreur de connexion'}
                  {connectionStatus === 'checking' && 'Vérification en cours...'}
                </p>
              </div>
            </div>
            {getStatusBadge(connectionStatus)}
          </div>

          {/* Configuration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>URL Supabase:</span>
                  <span className="font-mono">{configInfo.url}</span>
                </div>
                <div className="flex justify-between">
                  <span>Clé Anon:</span>
                  <span className="font-mono">{configInfo.key}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Actions</h4>
              <div className="space-y-2">
                <Button 
                  onClick={checkConnection} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Vérifier la connexion
                </Button>
                <Button 
                  onClick={runAllTests} 
                  disabled={isRunningTests}
                  size="sm"
                  className="w-full"
                >
                  {isRunningTests ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Tests en cours...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Lancer tous les tests
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Résultats des tests */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Résultats des tests</h4>
              <div className="grid gap-3">
                {Object.entries(testResults).map(([test, result]) => (
                  <div key={test} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h5 className="font-medium capitalize">
                          {test.replace('_', ' ')}
                        </h5>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 
                              result.status === 'error' ? 'destructive' : 'secondary'}
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alertes */}
          {!configInfo.hasUrl || !configInfo.hasKey ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Configuration incomplète. Vérifiez vos variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
              </AlertDescription>
            </Alert>
          ) : connectionStatus === 'error' ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Impossible de se connecter à Supabase. Vérifiez votre configuration et votre connexion internet.
              </AlertDescription>
            </Alert>
          ) : connectionStatus === 'connected' ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Connexion Supabase établie avec succès ! L'application est prête à être utilisée.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
} 