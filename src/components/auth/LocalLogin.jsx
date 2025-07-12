import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  LogIn,
  User,
  Lock,
  Mail,
  Loader2,
  Shield,
  Building,
  Users
} from 'lucide-react';
import { localAuthService, localAuth } from '@/api/localAuth';

export default function LocalLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    first_name: '',
    last_name: '',
    department: '',
    position: '',
    role: 'employee'
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    if (localAuth.isAuthenticated()) {
      navigate('/Dashboard');
    }
  }, [navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, session, error: authError } = await localAuthService.signIn(email, password);
      
      if (authError) {
        setError(authError);
        return;
      }

      toast({
        title: "✅ Connexion réussie",
        description: `Bienvenue, ${user.first_name} ${user.last_name} !`,
        duration: 3000,
      });

      // Navigate to appropriate dashboard based on role
      if (user.role === 'admin') {
        navigate('/AdminDashboard');
      } else {
        navigate('/Dashboard');
      }

    } catch (error) {
      setError('Une erreur inattendue s\'est produite');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userData = {
        email,
        password,
        ...signUpData
      };

      const { user, session, error: authError } = await localAuthService.signUp(userData);
      
      if (authError) {
        setError(authError);
        return;
      }

      toast({
        title: "✅ Inscription réussie",
        description: `Compte créé pour ${user.first_name} ${user.last_name} !`,
        duration: 3000,
      });

      // Navigate to dashboard
      navigate('/Dashboard');

    } catch (error) {
      setError('Une erreur inattendue s\'est produite');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (isSignUp) {
      handleSignUp(e);
    } else {
      handleSignIn(e);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setSignUpData({
      first_name: '',
      last_name: '',
      department: '',
      position: '',
      role: 'employee'
    });
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Use default admin credentials
      const { user, session, error: authError } = await localAuthService.signIn(
        'admin@hr-app.local',
        'admin123'
      );
      
      if (authError) {
        setError(authError);
        return;
      }

      toast({
        title: "✅ Connexion démo réussie",
        description: "Connecté en tant qu'administrateur",
        duration: 3000,
      });

      navigate('/AdminDashboard');

    } catch (error) {
      setError('Erreur lors de la connexion démo');
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </CardTitle>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Créez votre compte pour accéder à l\'application' 
              : 'Connectez-vous à votre compte'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Sign Up Additional Fields */}
            {isSignUp && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Prénom
                    </Label>
                    <Input
                      id="first_name"
                      value={signUpData.first_name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Prénom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nom
                    </Label>
                    <Input
                      id="last_name"
                      value={signUpData.last_name}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Département
                    </Label>
                    <Input
                      id="department"
                      value={signUpData.department}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Département"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Poste
                    </Label>
                    <Input
                      id="position"
                      value={signUpData.position}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Poste"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Remember Me (Sign In Only) */}
            {!isSignUp && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label htmlFor="remember" className="text-sm">
                  Se souvenir de moi
                </Label>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {isSignUp ? 'Créer le compte' : 'Se connecter'}
            </Button>
          </form>

          {/* Demo Login Button */}
          {!isSignUp && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou</span>
              </div>
            </div>
          )}

          {!isSignUp && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              <Shield className="w-4 h-4 mr-2" />
              Connexion démo (Admin)
            </Button>
          )}

          {/* Toggle Mode */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={toggleMode}
              className="text-sm"
            >
              {isSignUp 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas de compte ? S\'inscrire'
              }
            </Button>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
            <p className="font-medium mb-1">Compte de démonstration :</p>
            <p>Email: <code>admin@hr-app.local</code></p>
            <p>Mot de passe: <code>admin123</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 