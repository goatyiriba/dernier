import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Home,
  LogIn
} from 'lucide-react';
import { supabase } from '@/api/supabaseClient';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the access token and refresh token from URL parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check if there's an error in the URL
      if (error) {
        throw new Error(errorDescription || error);
      }

      // If we have tokens, set the session
      if (accessToken && refreshToken) {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }

        if (data.session) {
          setSuccess(true);
          toast({
            title: "✅ Connexion réussie",
            description: "Vous avez été connecté avec succès",
            duration: 5000,
          });

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/Dashboard');
          }, 2000);
        } else {
          throw new Error("Aucune session n'a été créée");
        }
      } else {
        // No tokens in URL, try to get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setSuccess(true);
          toast({
            title: "✅ Session active",
            description: "Vous êtes déjà connecté",
            duration: 5000,
          });

          setTimeout(() => {
            navigate('/Dashboard');
          }, 2000);
        } else {
          throw new Error("Aucune session trouvée");
        }
      }

    } catch (error) {
      console.error('Auth callback error:', error);
      setError(error.message);
      
      toast({
        title: "❌ Erreur d'authentification",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    handleAuthCallback();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/Login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-center">
              <Loader2 className="w-6 h-6 animate-spin" />
              Traitement de l'authentification...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">
              Veuillez patienter pendant que nous finalisons votre connexion.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-center text-green-600">
              <CheckCircle className="w-6 h-6" />
              Connexion réussie !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              Vous allez être redirigé vers le tableau de bord dans quelques secondes...
            </p>
            <div className="flex justify-center">
              <Button onClick={handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Aller au tableau de bord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Erreur d'authentification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error || "Une erreur s'est produite lors de l'authentification"}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Causes possibles :
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>URL de redirection non configurée dans Supabase</li>
              <li>Session expirée ou invalide</li>
              <li>Problème de configuration d'authentification</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1">
              <Loader2 className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
            <Button onClick={handleGoToLogin} variant="outline" className="flex-1">
              <LogIn className="w-4 h-4 mr-2" />
              Se connecter
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={handleGoHome} variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 