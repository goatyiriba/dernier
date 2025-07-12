import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, LogOut, CheckCircle, AlertCircle, Mail, Phone, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PendingApprovalPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [timeWaiting, setTimeWaiting] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRedirectTime, setAutoRedirectTime] = useState(30 * 60); // 30 minutes en secondes
  const [showCountdown, setShowCountdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    
    // Mise à jour du temps d'attente toutes les minutes
    const interval = setInterval(() => {
      updateWaitingTime();
      checkAutoRedirect();
    }, 60000);
    
    // Countdown timer chaque seconde quand on approche de la limite
    const countdownInterval = setInterval(() => {
      if (autoRedirectTime > 0) {
        setAutoRedirectTime(prev => prev - 1);
        if (autoRedirectTime <= 300) { // Afficher countdown dans les 5 dernières minutes
          setShowCountdown(true);
        }
      } else {
        handleAutoLogout();
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      console.log("PendingApproval - User data:", user);
      setCurrentUser(user);
      updateWaitingTime(user);
      
      // Si l'utilisateur est maintenant actif, rediriger
      if (user.is_active) {
        console.log("User is now active, redirecting...");
        navigate(createPageUrl("Home"));
        return;
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
      // Si erreur de chargement, rediriger vers home
      navigate(createPageUrl("Home"));
    } finally {
      setIsLoading(false);
    }
  };

  const updateWaitingTime = (user = currentUser) => {
    if (user && user.created_date) {
      const createdDate = new Date(user.created_date);
      const now = new Date();
      const diffInMinutes = differenceInMinutes(now, createdDate);
      const diffInHours = differenceInHours(now, createdDate);
      const diffInDays = differenceInDays(now, createdDate);
      
      if (diffInDays > 0) {
        setTimeWaiting(`${diffInDays} jour${diffInDays > 1 ? 's' : ''}`);
      } else if (diffInHours > 0) {
        setTimeWaiting(`${diffInHours} heure${diffInHours > 1 ? 's' : ''}`);
      } else if (diffInMinutes > 0) {
        setTimeWaiting(`${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`);
      } else {
        setTimeWaiting('Quelques instants');
      }
    }
  };

  const checkAutoRedirect = async () => {
    // Vérifier si l'utilisateur a été approuvé
    try {
      const user = await User.me();
      if (user.is_active) {
        navigate(createPageUrl("Home"));
      }
    } catch (error) {
      console.log("User check failed, will retry...");
    }
  };

  const handleAutoLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error during auto logout:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const handleManualLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("Home"));
    } catch (error) {
      console.error("Error during logout:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    await loadUserData();
  };

  const getRegistrationDate = () => {
    if (currentUser && currentUser.created_date) {
      return format(new Date(currentUser.created_date), 'PPPp', { locale: fr });
    }
    return 'Date inconnue';
  };

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Animation de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue dans Flow HR !
          </h1>
          <p className="text-lg text-gray-600">
            Votre inscription a été soumise avec succès
          </p>
        </motion.div>

        {/* Carte principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-2"></div>
            
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 px-4 py-2">
                  En attente d'approbation
                </Badge>
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Votre compte est en cours de validation
              </CardTitle>
              
              <CardDescription className="text-base text-gray-600 leading-relaxed">
                Un administrateur doit approuver votre demande avant que vous puissiez accéder à la plateforme.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informations utilisateur */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  Informations de votre demande
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{currentUser?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600">Inscription</p>
                      <p className="font-medium text-gray-900">{getRegistrationDate()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600">Temps d'attente</p>
                      <p className="font-medium text-gray-900">{timeWaiting}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-gray-600">Statut</p>
                      <p className="font-medium text-amber-600">En attente</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Countdown si proche de l'expiration */}
              {showCountdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-red-800 font-medium">Session expirée dans</p>
                      <p className="text-2xl font-bold text-red-600">{formatCountdown(autoRedirectTime)}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Prochaines étapes */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Prochaines étapes :</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Un administrateur va examiner votre demande d'inscription</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Vous recevrez une notification par email une fois approuvé</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Vous pourrez alors accéder à votre espace de travail</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={handleRefreshStatus}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Vérifier le statut
                </Button>
                
                <Button 
                  onClick={handleManualLogout}
                  variant="outline"
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>

              {/* Note sur le timing */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Votre session expirera automatiquement dans 30 minutes pour des raisons de sécurité.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800">
                <strong>Besoin d'aide ?</strong> Contactez votre administrateur ou l'équipe RH pour plus d'informations.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}