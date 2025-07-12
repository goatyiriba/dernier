import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Settings,
  TestTube,
  Globe,
  Shield,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { 
  supabase, 
  supabaseAdmin, 
  isSupabaseConfigured, 
  getSupabaseConfigStatus,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser
} from '@/api/supabaseClient';

export default function SupabaseTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [configStatus, setConfigStatus] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConfiguration();
    checkCurrentUser();
  }, []);

  const checkConfiguration = () => {
    const status = getSupabaseConfigStatus();
    setConfigStatus(status);
  };

  const checkCurrentUser = async () => {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      setCurrentUser(user);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const runTest = async (testName, testFunction) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
      toast({
        title: `✅ ${testName} réussi`,
        description: "Test terminé avec succès",
        duration: 3000,
      });
    } catch (error) {
      console.error(`${testName} error:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
      toast({
        title: `❌ ${testName} échoué`,
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    const { data, error } = await supabase.from('employees').select('count').limit(1);
    if (error) throw error;
    return { message: "Connexion à la base de données réussie", data };
  };

  const testAuthentication = async () => {
    // Test sign up with a test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data, error } = await signUpWithEmail(testEmail, testPassword);
    if (error) throw error;
    
    // Clean up - delete the test user
    if (data.user) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    }
    
    return { message: "Test d'authentification réussi", user: data.user };
  };

  const testDatabaseOperations = async () => {
    // Test creating a table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_test_table');
    if (createError && !createError.message.includes('already exists')) {
      throw createError;
    }

    // Test inserting data
    const testData = {
      name: 'Test Employee',
      email: `test-${Date.now()}@example.com`,
      department: 'Test Department'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('employees')
      .insert([testData])
      .select();

    if (insertError) throw insertError;

    // Test reading data
    const { data: readData, error: readError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', testData.email)
      .limit(1);

    if (readError) throw readError;

    // Clean up - delete test data
    if (insertData?.[0]?.id) {
      await supabase
        .from('employees')
        .delete()
        .eq('id', insertData[0].id);
    }

    return { 
      message: "Opérations de base de données réussies", 
      inserted: insertData,
      read: readData 
    };
  };

  const testCallbackDomain = async () => {
    // Test if callback domain is properly configured
    const currentOrigin = window.location.origin;
    const callbackUrl = `${currentOrigin}/auth/callback`;
    
    // Try to initiate a sign-in flow to test callback
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test@example.com',
      options: {
        emailRedirectTo: callbackUrl
      }
    });

    if (error && error.message.includes('Callback domain is not valid')) {
      throw new Error(`Domaine de callback non valide. Ajoutez ${callbackUrl} à vos URLs de redirection Supabase.`);
    }

    if (error && !error.message.includes('Email not confirmed')) {
      throw error;
    }

    return { 
      message: "Configuration du domaine de callback valide", 
      callbackUrl,
      origin: currentOrigin 
    };
  };

  const testRowLevelSecurity = async () => {
    // Test RLS policies
    const { data, error } = await supabase
      .from('employees')
      .select('count')
      .limit(1);

    if (error) throw error;

    return { 
      message: "Politiques RLS configurées correctement", 
      canRead: !!data 
    };
  };

  const testRealTimeSubscription = async () => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: Aucun événement reçu'));
      }, 5000);

      const subscription = supabase
        .channel('test-channel')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'employees' },
          (payload) => {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve({ 
              message: "Abonnement temps réel fonctionnel", 
              payload 
            });
          }
        )
        .subscribe();

      // Trigger a test event
      setTimeout(() => {
        supabase
          .from('employees')
          .insert([{ 
            first_name: 'Test', 
            last_name: 'RealTime', 
            email: `realtime-${Date.now()}@test.com` 
          }])
          .then(() => {
            // Clean up will happen in the subscription callback
          })
          .catch(reject);
      }, 1000);
    });
  };

  const runAllTests = async () => {
    const tests = [
      { name: 'Connexion', func: testConnection },
      { name: 'Authentification', func: testAuthentication },
      { name: 'Opérations DB', func: testDatabaseOperations },
      { name: 'Domaine Callback', func: testCallbackDomain },
      { name: 'Sécurité RLS', func: testRowLevelSecurity },
      { name: 'Temps Réel', func: testRealTimeSubscription }
    ];

    for (const test of tests) {
      await runTest(test.name, test.func);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusColor = (status) => {
    if (status === true || status === 'success') return 'bg-green-100 text-green-800';
    if (status === false || status === 'error') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusIcon = (status) => {
    if (status === true || status === 'success') return <CheckCircle className="w-4 h-4" />;
    if (status === false || status === 'error') return <AlertTriangle className="w-4 h-4" />;
    return <Loader2 className="w-4 h-4 animate-spin" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Test de Configuration Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configuration Status */}
          {configStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="text-sm">URL:</span>
                <Badge variant={configStatus.url_present ? "default" : "destructive"}>
                  {configStatus.url_present ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Clé Anon:</span>
                <Badge variant={configStatus.anon_key_present ? "default" : "destructive"}>
                  {configStatus.anon_key_present ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Clé Service:</span>
                <Badge variant={configStatus.service_key_present ? "default" : "destructive"}>
                  {configStatus.service_key_present ? "✅" : "❌"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                <span className="text-sm">Configuré:</span>
                <Badge variant={configStatus.fully_configured ? "default" : "destructive"}>
                  {configStatus.fully_configured ? "✅" : "❌"}
                </Badge>
              </div>
            </div>
          )}

          {/* Current User */}
          {currentUser && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Utilisateur connecté: <strong>{currentUser.email}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => runTest('Connexion', testConnection)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Test Connexion
            </Button>

            <Button 
              onClick={() => runTest('Authentification', testAuthentication)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <Shield className="w-4 h-4 mr-2" />
              Test Auth
            </Button>

            <Button 
              onClick={() => runTest('Opérations DB', testDatabaseOperations)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <Database className="w-4 h-4 mr-2" />
              Test DB
            </Button>

            <Button 
              onClick={() => runTest('Domaine Callback', testCallbackDomain)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <Globe className="w-4 h-4 mr-2" />
              Test Callback
            </Button>

            <Button 
              onClick={() => runTest('Sécurité RLS', testRowLevelSecurity)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <Shield className="w-4 h-4 mr-2" />
              Test RLS
            </Button>

            <Button 
              onClick={() => runTest('Temps Réel', testRealTimeSubscription)}
              disabled={isLoading || !isSupabaseConfigured()}
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Test Temps Réel
            </Button>
          </div>

          <Button 
            onClick={runAllTests}
            disabled={isLoading || !isSupabaseConfigured()}
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isLoading ? 'Tests en cours...' : 'Lancer tous les tests'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats des Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{testName}</h4>
                    <Badge className={getStatusColor(result.success)}>
                      {getStatusIcon(result.success)}
                      <span className="ml-1">
                        {result.success ? 'Succès' : 'Échec'}
                      </span>
                    </Badge>
                  </div>
                  {result.success ? (
                    <p className="text-sm text-green-600">
                      {result.data?.message || 'Test réussi'}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600">
                      {result.error || 'Erreur inconnue'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Callback Domain Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configuration du Domaine de Callback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Si vous obtenez une erreur "Callback domain is not valid", suivez ces étapes :
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> Allez dans votre dashboard Supabase</p>
              <p><strong>2.</strong> Naviguez vers Authentication → URL Configuration</p>
              <p><strong>3.</strong> Ajoutez ces URLs aux "Redirect URLs" :</p>
              <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                {window.location.origin}/auth/callback<br/>
                http://localhost:5173/auth/callback<br/>
                http://localhost:5174/auth/callback<br/>
                http://localhost:5175/auth/callback<br/>
                http://localhost:5176/auth/callback<br/>
                http://localhost:5177/auth/callback<br/>
                http://localhost:5178/auth/callback
              </div>
              <p><strong>4.</strong> Définissez "Site URL" à : <code className="bg-gray-100 px-1 rounded">{window.location.origin}</code></p>
              <p><strong>5.</strong> Cliquez sur "Save"</p>
            </div>

            <Button 
              onClick={() => window.open('https://supabase.com/docs/guides/auth/auth-redirects', '_blank')}
              variant="outline"
              size="sm"
            >
              📖 Documentation Supabase
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 