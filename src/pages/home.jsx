import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";
import { 
  Building2, 
  Users, 
  ArrowRight,
  Loader2,
  CheckCircle,
  Chrome,
  Settings,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromLogout = urlParams.get('logout') === 'true';
    const isNewUser = urlParams.get('is_new_user') === 'true';
    
    if (fromLogout) {
      setShowLogoutMessage(true);
      navigate(createPageUrl("Home"), { replace: true });
      setTimeout(() => setShowLogoutMessage(false), 5000);
      setCheckingAuth(false);
    } else if (isNewUser) {
      navigate(createPageUrl("PendingApproval"), { replace: true });
      return;
    } else {
      setTimeout(() => {
        checkExistingAuth();
      }, 500);
    }
  }, [location]);

  const checkExistingAuth = async () => {
    try {
      const user = await User.me();
      
      if (user && !user.is_active) {
        navigate(createPageUrl("PendingApproval"));
        return;
      }
      
      if (user && user.is_active) {
        if (user.role === 'admin' || user.email === 'syllacloud@gmail.com') {
          navigate(createPageUrl("AdminDashboard"));
        } else {
          navigate(createPageUrl("EmployeeDashboard"));
        }
      } else {
        setCheckingAuth(false);
      }
    } catch (error) {
      setCheckingAuth(false);
    }
  };

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);
    setIsLoading(true);
    
    try {
      localStorage.setItem('selectedRole', role);
      await User.login();
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setIsLoading(false);
      setSelectedRole(null);
      
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleStepClick = (step, role) => {
    if (step === 1) {
      setCurrentStep(2);
      setSelectedRole(role);
      setTimeout(() => {
        handleRoleSelection(role);
      }, 800);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-white/80">Vérification de votre connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Effet de bruit/grain */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          
          {/* Message de déconnexion */}
          <AnimatePresence>
            {showLogoutMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-center"
              >
                <div className="flex items-center justify-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Déconnexion réussie</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo et titre principal */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="text-white text-xl font-medium">Bicents Organisation Management</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <p className="text-lg text-white/80 max-w-sm mx-auto">
                Suivez ces étapes pour accéder à votre espace ou pour demander un accès à l'organisation.
              </p>
            </motion.div>
          </div>

          {/* Étapes d'inscription */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="space-y-4"
          >
            {/* Étape 1 - Sélection du rôle */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative group cursor-pointer transition-all duration-300 ${
                currentStep >= 1 ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-4 p-6 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300">
                <div className="flex-shrink-0 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-lg">Sign up your account</div>
                  <div className="text-white/70 text-sm mt-1">Choose your role to get started</div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </div>
              
              {/* Dropdown des rôles */}
              <AnimatePresence>
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleStepClick(1, 'admin')}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">Administration</div>
                        <div className="text-white/60 text-sm">Accès complet à la gestion</div>
                      </div>
                      {isLoading && selectedRole === 'admin' && (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleStepClick(1, 'employee')}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 text-left"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">Employé</div>
                        <div className="text-white/60 text-sm">Espace personnel</div>
                      </div>
                      {isLoading && selectedRole === 'employee' && (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Étape 2 */}
            <motion.div
              animate={{ 
                opacity: currentStep >= 2 ? 1 : 0.5,
                scale: currentStep >= 2 ? 1 : 0.95 
              }}
              transition={{ duration: 0.3 }}
              className={`relative transition-all duration-300 ${
                currentStep >= 2 ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 2 ? 'bg-white text-black' : 'bg-white/20 text-white/60'
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <div className="text-white/80 font-medium">Set up your workspace</div>
                  <div className="text-white/50 text-sm">Configure your environment</div>
                </div>
                {currentStep >= 2 && isLoading && (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                )}
              </div>
            </motion.div>

            {/* Étape 3 */}
            <motion.div
              animate={{ 
                opacity: currentStep >= 3 ? 1 : 0.5,
                scale: currentStep >= 3 ? 1 : 0.95 
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`relative transition-all duration-300 ${
                currentStep >= 3 ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep >= 3 ? 'bg-white text-black' : 'bg-white/20 text-white/60'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <div className="text-white/80 font-medium">Set up your profile</div>
                  <div className="text-white/50 text-sm">Complete your information</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Note de bas de page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-white/60 text-sm">
              Connectez-vous avec Google pour une expérience sécurisée
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}