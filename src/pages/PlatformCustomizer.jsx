
import React, { useState, useEffect } from "react";
import { Employee, AuthService } from "@/api/supabaseEntities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Settings,
  Globe,
  Shield,
  Zap,
  Database,
  Bell,
  Users,
  Clock,
  BarChart3,
  Sparkles,
  Wand2,
  Paintbrush,
  Layout,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  Save,
  Undo,
  Redo,
  Copy,
  Heart,
  Star,
  Lightbulb,
  Rocket,
  Crown,
  Award,
  Target,
  TrendingUp,
  Activity,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Image,
  Music,
  Video,
  FileText,
  Lock,
  Key,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Minus,
  RotateCcw,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
  Grid,
  List as ListIcon,
  Layers,
  Move,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sun,
  Moon,
  Contrast,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Server,
  Cloud,
  CloudOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Composants de prévisualisation
import LivePreview from "../components/customizer/LivePreview";
import ColorPicker from "../components/customizer/ColorPicker";
import TemplateGallery from "../components/customizer/TemplateGallery";
import AdvancedSettings from "../components/customizer/AdvancedSettings";
import PerformanceOptimizer from "../components/customizer/PerformanceOptimizer";
import IntegrationHub from "../components/customizer/IntegrationHub";
import AIAssistant from "../components/customizer/AIAssistant";
import BackupRestore from "../components/customizer/BackupRestore";

export default function PlatformCustomizer() {
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("appearance");
  const [previewMode, setPreviewMode] = useState("desktop");
  const [aiMode, setAiMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemHealth, setSystemHealth] = useState({});
  const [employeeCount, setEmployeeCount] = useState(0);
  const [customCss, setCustomCss] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  // Système de thèmes prédéfinis
  const predefinedThemes = {
    corporate: {
      name: "Corporate",
      primary: "#1E40AF",
      secondary: "#059669",
      accent: "#DC2626",
      background: "#F8FAFC",
      description: "Professionnel et élégant"
    },
    creative: {
      name: "Creative",
      primary: "#7C3AED",
      secondary: "#F59E0B",
      accent: "#EF4444",
      background: "#FEF3F2",
      description: "Coloré et innovant"
    },
    minimal: {
      name: "Minimal",
      primary: "#374151",
      secondary: "#6B7280",
      accent: "#059669",
      background: "#FFFFFF",
      description: "Simple et épuré"
    },
    tech: {
      name: "Tech",
      primary: "#0EA5E9",
      secondary: "#8B5CF6",
      accent: "#F97316",
      background: "#0F172A",
      description: "Moderne et technologique"
    },
    nature: {
      name: "Nature",
      primary: "#059669",
      secondary: "#84CC16",
      accent: "#F59E0B",
      background: "#F0FDF4",
      description: "Naturel et apaisant"
    }
  };

  // Configuration des modules
  const moduleConfigs = {
    timeTracking: {
      name: "Suivi du temps",
      icon: Clock,
      description: "GPS, reconnaissance faciale, géofencing",
      advanced: true
    },
    performance: {
      name: "Évaluations",
      icon: TrendingUp,
      description: "360°, auto-évaluations, objectifs SMART",
      advanced: true
    },
    notifications: {
      name: "Notifications",
      icon: Bell,
      description: "Push, email, SMS, webhooks",
      advanced: false
    },
    analytics: {
      name: "Analytics",
      icon: BarChart3,
      description: "Tableaux de bord, rapports personnalisés",
      advanced: true
    },
    integration: {
      name: "Intégrations",
      icon: Globe,
      description: "API, webhooks, connecteurs tiers",
      advanced: true
    },
    security: {
      name: "Sécurité",
      icon: Shield,
      description: "2FA, SSO, audit logs, RBAC",
      advanced: true
    }
  };

  useEffect(() => {
    loadData();
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const user = await AuthService.me();
      setCurrentUser(user);

      // Charger les paramètres actuels
      const settingsList = await AuthService.getAppSettings();
      const activeSettings = settingsList.find(s => s.is_active) || createDefaultSettings();
      
      setSettings(activeSettings);
      setOriginalSettings({ ...activeSettings });
      setCustomCss(activeSettings.custom_css || "");
      setIsDarkMode(activeSettings.enable_dark_mode || false);

      // Charger les statistiques
      const employees = await AuthService.getEmployees();
      setEmployeeCount(employees.length);

    } catch (error) {
      console.error("Error loading customizer data:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const metrics = await AuthService.getSystemMetrics();
      const latestMetrics = metrics.reduce((acc, metric) => {
        acc[metric.metric_name] = metric.value;
        return acc;
      }, {});
      
      setSystemHealth({
        performance: latestMetrics.response_time || 120,
        memory: latestMetrics.memory_usage || 45,
        cpu: latestMetrics.cpu_usage || 30,
        storage: latestMetrics.storage_usage || 25,
        uptime: latestMetrics.uptime || 99.9
      });
    } catch (error) {
      console.error("Error checking system health:", error);
    }
  };

  const createDefaultSettings = () => ({
    app_name: "Flow HR",
    company_name: "Mon Entreprise",
    primary_color: "#4F46E5",
    secondary_color: "#059669",
    accent_color: "#DC2626",
    background_color: "#F8FAFC",
    text_color: "#1E293B",
    sidebar_color: "#FFFFFF",
    header_background: "#FFFFFF",
    enable_dark_mode: false,
    enable_custom_css: false,
    custom_css: "",
    is_active: true,
    modules: {
      timeTracking: true,
      performance: true,
      notifications: true,
      analytics: false,
      integration: false,
      security: true
    },
    ui_preferences: {
      animation_speed: 300,
      border_radius: 12,
      spacing: 16,
      font_size: 14,
      sidebar_collapsed: false,
      show_tooltips: true,
      compact_mode: false
    },
    performance_settings: {
      lazy_loading: true,
      cache_enabled: true,
      compression: true,
      cdn_enabled: false
    }
  });

  const handleSettingChange = (key, value, nested = null) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      if (nested) {
        newSettings[nested] = { ...newSettings[nested], [key]: value };
      } else {
        newSettings[key] = value;
      }
      return newSettings;
    });
    setHasChanges(true);
  };

  const applyTheme = (themeKey) => {
    const theme = predefinedThemes[themeKey];
    if (theme) {
      setSettings(prev => ({
        ...prev,
        primary_color: theme.primary,
        secondary_color: theme.secondary,
        accent_color: theme.accent,
        background_color: theme.background
      }));
      setHasChanges(true);
      
      toast({
        title: "🎨 Thème appliqué",
        description: `Le thème "${theme.name}" a été appliqué avec succès`,
      });
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      if (settings.id) {
        await AuthService.updateAppSettings(settings.id, {
          ...settings,
          custom_css: customCss
        });
      } else {
        await AuthService.createAppSettings({
          ...settings,
          custom_css: customCss
        });
      }

      setOriginalSettings({ ...settings });
      setHasChanges(false);
      
      // Appliquer les changements immédiatement
      applySettingsToDOM(settings);
      
      toast({
        title: "✅ Paramètres sauvegardés",
        description: "Vos personnalisations ont été appliquées avec succès",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings({ ...originalSettings });
    setHasChanges(false);
    toast({
      title: "🔄 Paramètres réinitialisés",
      description: "Retour aux derniers paramètres sauvegardés",
    });
  };

  const applySettingsToDOM = (settingsToApply) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settingsToApply.primary_color);
    root.style.setProperty('--secondary-color', settingsToApply.secondary_color);
    root.style.setProperty('--accent-color', settingsToApply.accent_color);
    root.style.setProperty('--background-color', settingsToApply.background_color);
    root.style.setProperty('--text-color', settingsToApply.text_color);
    
    if (settingsToApply.enable_dark_mode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const generateAIRecommendations = async () => {
    // Simuler des recommandations IA basées sur l'utilisation
    const recommendations = [
      {
        type: "performance",
        title: "Optimisation détectée",
        description: "Activez la compression pour améliorer les temps de chargement de 23%",
        action: () => handleSettingChange('compression', true, 'performance_settings')
      },
      {
        type: "ui",
        title: "Expérience utilisateur",
        description: "Réduisez le rayon des bordures pour un style plus moderne",
        action: () => handleSettingChange('border_radius', 8, 'ui_preferences')
      },
      {
        type: "security",
        title: "Sécurité renforcée",
        description: "Activez l'authentification à deux facteurs pour tous les utilisateurs",
        action: () => handleSettingChange('security', true, 'modules')
      }
    ];

    return recommendations;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Chargement du configurateur...</p>
            <p className="text-gray-600">Préparation de votre espace de personnalisation</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête futuriste */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Platform Customizer AI
                  </h1>
                  <p className="text-xl text-purple-100 font-medium">
                    Personnalisez votre expérience RH avec l'intelligence artificielle
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Système optimal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{employeeCount} utilisateurs actifs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>{systemHealth.uptime || 99.9}% uptime</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setAiMode(!aiMode)}
                  variant={aiMode ? "secondary" : "outline"}
                  className={`${aiMode ? 'bg-white/20 text-white' : 'bg-white/10 text-white border-white/30'} backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {aiMode ? "Mode IA Activé" : "Activer l'IA"}
                </Button>
                
                <Button
                  onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  {previewMode === 'desktop' ? <Monitor className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                  {previewMode === 'desktop' ? 'Desktop' : 'Mobile'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={resetSettings}
                  disabled={!hasChanges}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 backdrop-blur-sm disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                
                <Button
                  onClick={saveSettings}
                  disabled={!hasChanges || isSaving}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          </div>
          
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              Modifications non sauvegardées
            </motion.div>
          )}
        </motion.div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel de configuration - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-6 bg-white/80 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50 shadow-lg">
                  <TabsTrigger value="appearance" className="rounded-xl">
                    <Palette className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Apparence</span>
                  </TabsTrigger>
                  <TabsTrigger value="modules" className="rounded-xl">
                    <Grid className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Modules</span>
                  </TabsTrigger>
                  <TabsTrigger value="performance" className="rounded-xl">
                    <Zap className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Performance</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="rounded-xl">
                    <Shield className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Sécurité</span>
                  </TabsTrigger>
                  <TabsTrigger value="integrations" className="rounded-xl">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">API</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="rounded-xl">
                    <Code className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Avancé</span>
                  </TabsTrigger>
                </TabsList>

                {/* Contenu des onglets */}
                <div className="mt-6">
                  <TabsContent value="appearance" className="space-y-6">
                    {/* Thèmes prédéfinis */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          Thèmes Prédéfinis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(predefinedThemes).map(([key, theme]) => (
                            <motion.div
                              key={key}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all duration-300"
                              onClick={() => applyTheme(key)}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex gap-1">
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }}></div>
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                                </div>
                                <span className="font-semibold">{theme.name}</span>
                              </div>
                              <p className="text-sm text-gray-600">{theme.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Personnalisation des couleurs */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Paintbrush className="w-5 h-5 text-purple-500" />
                          Couleurs Personnalisées
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ColorPicker
                            label="Couleur Primaire"
                            value={settings?.primary_color}
                            onChange={(color) => handleSettingChange('primary_color', color)}
                          />
                          <ColorPicker
                            label="Couleur Secondaire"
                            value={settings?.secondary_color}
                            onChange={(color) => handleSettingChange('secondary_color', color)}
                          />
                          <ColorPicker
                            label="Couleur d'Accent"
                            value={settings?.accent_color}
                            onChange={(color) => handleSettingChange('accent_color', color)}
                          />
                          <ColorPicker
                            label="Arrière-plan"
                            value={settings?.background_color}
                            onChange={(color) => handleSettingChange('background_color', color)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Préférences UI */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layout className="w-5 h-5 text-green-500" />
                          Interface Utilisateur
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Vitesse d'animation (ms)</Label>
                            <Slider
                              value={[settings?.ui_preferences?.animation_speed || 300]}
                              onValueChange={([value]) => handleSettingChange('animation_speed', value, 'ui_preferences')}
                              max={1000}
                              min={100}
                              step={50}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-500">
                              {settings?.ui_preferences?.animation_speed || 300}ms
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Rayon des bordures (px)</Label>
                            <Slider
                              value={[settings?.ui_preferences?.border_radius || 12]}
                              onValueChange={([value]) => handleSettingChange('border_radius', value, 'ui_preferences')}
                              max={24}
                              min={0}
                              step={2}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-500">
                              {settings?.ui_preferences?.border_radius || 12}px
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Taille de police (px)</Label>
                            <Slider
                              value={[settings?.ui_preferences?.font_size || 14]}
                              onValueChange={([value]) => handleSettingChange('font_size', value, 'ui_preferences')}
                              max={20}
                              min={12}
                              step={1}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-500">
                              {settings?.ui_preferences?.font_size || 14}px
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Espacement (px)</Label>
                            <Slider
                              value={[settings?.ui_preferences?.spacing || 16]}
                              onValueChange={([value]) => handleSettingChange('spacing', value, 'ui_preferences')}
                              max={32}
                              min={8}
                              step={2}
                              className="w-full"
                            />
                            <div className="text-sm text-gray-500">
                              {settings?.ui_preferences?.spacing || 16}px
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isDarkMode}
                              onCheckedChange={(checked) => {
                                setIsDarkMode(checked);
                                handleSettingChange('enable_dark_mode', checked);
                              }}
                            />
                            <Label>Mode sombre</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={settings?.ui_preferences?.compact_mode || false}
                              onCheckedChange={(checked) => handleSettingChange('compact_mode', checked, 'ui_preferences')}
                            />
                            <Label>Mode compact</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={settings?.ui_preferences?.show_tooltips || true}
                              onCheckedChange={(checked) => handleSettingChange('show_tooltips', checked, 'ui_preferences')}
                            />
                            <Label>Afficher les info-bulles</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="modules" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Grid className="w-5 h-5 text-blue-500" />
                          Modules Disponibles
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(moduleConfigs).map(([key, module]) => (
                            <motion.div
                              key={key}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 border-2 border-gray-200 rounded-xl"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <module.icon className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{module.name}</h3>
                                    {module.advanced && (
                                      <Badge variant="outline" className="text-xs">
                                        <Crown className="w-3 h-3 mr-1" />
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Switch
                                  checked={settings?.modules?.[key] || false}
                                  onCheckedChange={(checked) => handleSettingChange(key, checked, 'modules')}
                                />
                              </div>
                              <p className="text-sm text-gray-600">{module.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-6">
                    <PerformanceOptimizer
                      settings={settings}
                      onSettingChange={handleSettingChange}
                      systemHealth={systemHealth}
                    />
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-red-500" />
                          Paramètres de Sécurité
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Authentification à deux facteurs</Label>
                                <p className="text-sm text-gray-500">Sécurité renforcée pour tous les comptes</p>
                              </div>
                              <Switch />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Sessions multiples</Label>
                                <p className="text-sm text-gray-500">Autoriser plusieurs connexions simultanées</p>
                              </div>
                              <Switch defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label>Logs d'audit</Label>
                                <p className="text-sm text-gray-500">Enregistrer toutes les actions importantes</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Durée de session (minutes)</Label>
                              <Input type="number" defaultValue={480} />
                            </div>

                            <div className="space-y-2">
                              <Label>Tentatives de connexion max</Label>
                              <Input type="number" defaultValue={5} />
                            </div>

                            <div className="space-y-2">
                              <Label>Politique de mots de passe</Label>
                              <Select defaultValue="medium">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Basique (6 caractères)</SelectItem>
                                  <SelectItem value="medium">Moyen (8 caractères + majuscules)</SelectItem>
                                  <SelectItem value="high">Fort (12 caractères + symboles)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="integrations" className="space-y-6">
                    <IntegrationHub
                      settings={settings}
                      onSettingChange={handleSettingChange}
                    />
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-6">
                    <AdvancedSettings
                      settings={settings}
                      customCss={customCss}
                      onCssChange={setCustomCss}
                      onSettingChange={handleSettingChange}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          </div>

          {/* Panel de prévisualisation - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="sticky top-6"
            >
              <LivePreview
                settings={settings}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
              />

              {/* Assistant IA */}
              {aiMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6"
                >
                  <AIAssistant
                    settings={settings}
                    onRecommendationApply={handleSettingChange}
                    systemHealth={systemHealth}
                  />
                </motion.div>
              )}

              {/* Sauvegarde et restauration */}
              <div className="mt-6">
                <BackupRestore
                  settings={settings}
                  onRestore={setSettings}
                  onBackupCreated={() => toast({
                    title: "💾 Sauvegarde créée",
                    description: "Configuration sauvegardée avec succès"
                  })}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
