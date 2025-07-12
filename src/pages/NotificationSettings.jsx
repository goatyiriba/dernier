
import React, { useState, useEffect } from "react";
import { NotificationSettings as NotificationSettingsEntity, Employee, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Send,
  Settings,
  Bell,
  BellRing,
  BellOff,
  Smartphone,
  Clock,
  Calendar,
  Shield,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Zap,
  Globe,
  Users,
  MessageCircle,
  Loader2,
  RefreshCw,
  Save,
  PlayCircle,
  StopCircle,
  Volume2,
  VolumeX,
  Megaphone,
  Target,
  Activity,
  Mail, // New icon for email
  Award, // New icon for work anniversaries
  Timer, // New icon for overtime alerts
  Star, // New icon for gamification rewards
  FileText, // New icon for survey invitations / document updates
  Slack // New icon for Slack platform card header
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { testSlackNotification } from '@/api/functions';
import { testTelegramNotification } from '@/api/functions';

// Helper component for testing notifications
const NotificationTestButton = ({ platform, formData, employee, settings, toast, onTestComplete }) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!employee) {
      toast({
        title: "Configuration requise",
        description: "Profil employé requis pour tester les notifications",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    let success = false;
    let message = "";

    try {
      let result;
      const employeeName = `${employee.first_name} ${employee.last_name}`;
      const baseMessage = `🔔 Test de notification ${platform.charAt(0).toUpperCase() + platform.slice(1)} depuis Flow HR!`;

      if (platform === 'slack') {
        if (!formData.platforms_enabled.slack || !formData.slack_webhook_url) {
          throw new Error('Configuration Slack incomplète');
        }
        result = await testSlackNotification({
          webhook_url: formData.slack_webhook_url,
          channel: formData.slack_channel,
          employee_name: employeeName,
          message: baseMessage
        });
      }
      else if (platform === 'telegram') {
        if (!formData.platforms_enabled.telegram || !formData.telegram_bot_token || !formData.telegram_chat_id) {
          throw new Error('Configuration Telegram incomplète');
        }
        result = await testTelegramNotification({
          bot_token: formData.telegram_bot_token,
          chat_id: formData.telegram_chat_id,
          employee_name: employeeName,
          message: baseMessage
        });
      }
      else if (platform === 'email') {
        if (!formData.platforms_enabled.email) {
          throw new Error('Notifications email désactivées');
        }
        const response = await fetch('/functions/sendPersonalNotification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: employee.id,
            notification_type: 'system_maintenance',
            title: `Test de notification ${platform}`,
            message: `Ceci est un test de notification par ${platform} depuis Flow HR. Votre configuration fonctionne correctement !`,
            urgency: 'normal',
            data: { test: true }
          })
        });
        result = { data: await response.json() };
        if (!response.ok) {
          throw new Error(result.data.error || `Erreur lors de l'envoi du test ${platform}`);
        }
      }

      if (result.data && result.data.success) {
        toast({
          title: "✅ Notification envoyée",
          description: `Test ${platform} envoyé avec succès!`,
        });
        success = true;
        message = `Test ${platform} envoyé avec succès!`;

        // Update test counter for the main settings entity
        if (settings && settings.id) {
          try {
            await NotificationSettingsEntity.update(settings.id, {
              test_notifications_sent: (settings.test_notifications_sent || 0) + 1,
              last_notification_test: new Date().toISOString()
            });
            console.log('✅ Statistiques de test mises à jour');
          } catch (statsError) {
            console.warn('⚠️ Erreur mise à jour statistiques:', statsError);
          }
        }
      } else {
        throw new Error(result.data?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error(`Erreur test ${platform}:`, error);
      message = error.message || `Impossible d'envoyer le test ${platform}`;
      toast({
        title: "❌ Erreur de test",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
      onTestComplete(platform, { success, message });
    }
  };

  const isDisabled = isTesting || !formData.platforms_enabled[platform] ||
                     (platform === 'slack' && !formData.slack_webhook_url) ||
                     (platform === 'telegram' && (!formData.telegram_bot_token || !formData.telegram_chat_id)) ||
                     (platform === 'email' && !employee?.email);

  return (
    <Button
      onClick={handleTest}
      disabled={isDisabled}
      className={`w-full ${platform === 'slack' ? 'bg-purple-600 hover:bg-purple-700' :
                          platform === 'telegram' ? 'bg-blue-600 hover:bg-blue-700' :
                          'bg-green-600 hover:bg-green-700'}`}
    >
      {isTesting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        platform === 'slack' ? <MessageSquare className="w-4 h-4 mr-2" /> :
        platform === 'telegram' ? <Send className="w-4 h-4 mr-2" /> :
        <Mail className="w-4 h-4 mr-2" />
      )}
      {isTesting ? "Envoi..." : `Tester ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
    </Button>
  );
};


export default function NotificationSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [settings, setSettings] = useState(null); // This is the NotificationSettingsEntity instance
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Removed isTesting state for individual platforms as it's now handled in NotificationTestButton
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [showWebhookUrl, setShowWebhookUrl] = useState({ slack: false, telegram: false });
  // const [showTestModal, setShowTestModal] = useState(false); // Unused
  // const [testPlatform, setTestPlatform] = useState(null); // Unused
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    slack_webhook_url: "",
    slack_channel: "",
    telegram_bot_token: "",
    telegram_chat_id: "",
    telegram_username: "",
    notification_types: {
      leave_status: true,
      time_reminders: true,
      announcements: true,
      schedule_changes: true,
      performance_reviews: false,
      team_updates: false,
      urgent_messages: true,
      meeting_invitations: true,
      project_assignments: true,
      task_updates: true,
      survey_invitations: false,
      document_updates: false,
      event_reminders: true,
      birthday_wishes: true,
      work_anniversaries: true,
      overtime_alerts: true,
      deadline_reminders: true,
      system_maintenance: false,
      security_alerts: true,
      gamification_rewards: false
    },
    notification_schedule: {
      enabled: false,
      start_time: "08:00",
      end_time: "18:00",
      weekend_notifications: false,
      timezone: "Europe/Paris"
    },
    platforms_enabled: {
      slack: false,
      telegram: false,
      email: true
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin' || user.email === 'syllacloud@gmail.com');

      if (user.employee_id) {
        const employeeData = await Employee.filter({ id: user.employee_id });
        if (employeeData.length > 0) {
          setEmployee(employeeData[0]);
          await loadNotificationSettings(employeeData[0].id);
        }
      } else if (user.role === 'admin' || user.email === 'syllacloud@gmail.com') {
        // Pour les admins sans employee_id, créer un profil temporaire
        setEmployee({
          id: 'admin-profile',
          first_name: user.first_name || 'Admin',
          last_name: user.last_name || 'System',
          email: user.email,
          department: 'Administration'
        });
        await loadNotificationSettings('admin-profile');
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos informations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationSettings = async (employeeId) => {
    try {
      const existingSettings = await NotificationSettingsEntity.filter({ employee_id: employeeId });

      if (existingSettings.length > 0) {
        const setting = existingSettings[0];
        setSettings(setting);
        setFormData({
          slack_webhook_url: setting.slack_webhook_url || "",
          slack_channel: setting.slack_channel || "",
          telegram_bot_token: setting.telegram_bot_token || "",
          telegram_chat_id: setting.telegram_chat_id || "",
          telegram_username: setting.telegram_username || "",
          notification_types: setting.notification_types || formData.notification_types,
          notification_schedule: setting.notification_schedule || formData.notification_schedule,
          platforms_enabled: setting.platforms_enabled || formData.platforms_enabled
        });
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    }
  };

  const handleSave = async () => {
    if (!employee) {
      toast({
        title: "Erreur",
        description: "Profil employé non trouvé",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const settingsData = {
        employee_id: employee.id,
        ...formData,
        is_admin: isAdmin,
        is_active: true
      };

      if (settings) {
        await NotificationSettingsEntity.update(settings.id, settingsData);
      } else {
        const newSettings = await NotificationSettingsEntity.create(settingsData);
        setSettings(newSettings);
      }

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences de notifications ont été mises à jour",
        duration: 3000
      });

      await loadNotificationSettings(employee.id);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // handleTestNotification function removed as its logic is now within NotificationTestButton


  const handleTestAllNotifications = async () => {
    if (!employee) {
      toast({
        title: "Configuration requise",
        description: "Profil employé requis pour tester les notifications",
        variant: "destructive"
      });
      return;
    }

    // Vérifier qu'au moins une plateforme est configurée
    const hasSlack = formData.platforms_enabled.slack && formData.slack_webhook_url;
    const hasTelegram = formData.platforms_enabled.telegram && formData.telegram_bot_token && formData.telegram_chat_id;
    const hasEmail = formData.platforms_enabled.email;

    if (!hasSlack && !hasTelegram && !hasEmail) {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer au moins une plateforme de notification pour effectuer le test complet.",
        variant: "destructive"
      });
      return;
    }

    setIsTestingAll(true);

    try {
      const response = await fetch('/functions/sendPersonalNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee_id: employee.id,
          notification_type: 'system_maintenance',
          title: 'Test complet des notifications',
          message: 'Ceci est un test de toutes les notifications disponibles dans Flow HR. Chaque type de notification devrait apparaître sur les plateformes configurées.',
          urgency: 'normal',
          data: { test: true },
          test_all_types: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Test complet réussi!",
          description: `${result.message || 'Notifications de test envoyées.'} - Vérifiez vos plateformes configurées.`,
          duration: 10000
        });

        // Afficher les détails dans la console pour debug
        console.log('Résultats du test complet:', result.all_results);

        // Mettre à jour le compteur de tests
        if (settings) {
          try {
            await NotificationSettingsEntity.update(settings.id, {
              test_notifications_sent: (settings.test_notifications_sent || 0) + 20, // 20 types testés
              last_notification_test: new Date().toISOString()
            });
            console.log('✅ Statistiques de test complet mises à jour');
          } catch (statsError) {
            console.warn('⚠️ Erreur mise à jour statistiques du test complet:', statsError);
          }
        }
      } else {
        throw new Error(result.error || `Erreur inconnue lors du test complet (Statut: ${response.status})`);
      }
    } catch (error) {
      console.error('Erreur test complet:', error);
      toast({
        title: "❌ Erreur du test complet",
        description: error.message || "Impossible d'envoyer le test complet",
        variant: "destructive"
      });
    } finally {
      setIsTestingAll(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "URL copiée dans le presse-papiers",
      duration: 2000
    });
  };

  const NotificationTypeCard = ({ type, title, description, icon: Icon, enabled, onChange, isNew = false, isAdmin = false }) => (
    <Card className={`relative overflow-hidden hover:shadow-md transition-all duration-200 ${isNew ? 'border-green-200 bg-green-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{title}</h4>
                {isNew && <Badge className="text-xs bg-green-500 text-white">Nouveau</Badge>}
                {isAdmin && <Badge className="text-xs bg-purple-500 text-white">Admin</Badge>}
              </div>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onChange}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </CardContent>
    </Card>
  );

  // CORRECTION: Fonction pour rendre les tests de notification avec vérification
  const renderNotificationTest = (platform, notificationSettings) => {
    // Vérifier que platform est bien une string
    if (typeof platform !== 'string') {
      console.error('Platform is not a string:', platform);
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ❌ Erreur: Type de plateforme invalide
        </div>
      );
    }

    return (
      <NotificationTestButton
        platform={platform}
        formData={formData} // Pass formData directly
        employee={employee} // Pass employee directly
        settings={notificationSettings} // Pass notificationSettings (the entity from DB)
        toast={toast} // Pass toast function
        onTestComplete={(platformName, result) => {
          console.log(`Test completed for ${platformName}:`, result);
          // Optional: update test stats if needed, or rely on NotificationTestButton to do it.
          // The NotificationTestButton already handles updating settings.test_notifications_sent
        }}
      />
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Chargement des paramètres
                </h3>
                <p className="text-sm text-gray-500">
                  Configuration de vos notifications...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700">
              Profil employé non trouvé. Contactez votre administrateur pour configurer votre profil.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {isAdmin ? 'Paramètres Notifications Admin' : 'Paramètres de Notifications'}
              </h1>
              <p className="text-xl text-blue-100 font-medium">
                Configurez vos notifications Slack, Telegram et Email
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  <Bell className="w-4 h-4 mr-2" />
                  {employee.first_name} {employee.last_name}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Users className="w-4 h-4 mr-2" />
                  {employee.department}
                </Badge>
                {isAdmin && (
                  <Badge className="bg-red-500 text-white border-red-300">
                    <Shield className="w-4 h-4 mr-2" />
                    Administrateur
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:border-white/40 transition-all duration-300 shadow-lg"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="platforms">Plateformes</TabsTrigger>
            <TabsTrigger value="types">Types de Notifications</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
          </TabsList>

          {/* Configuration des plateformes */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Configuration Slack */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Slack className="w-6 h-6 text-white" /> {/* Using Slack icon as per outline */}
                      </div>
                      Configuration Slack
                      <Switch
                        checked={formData.platforms_enabled.slack}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          platforms_enabled: { ...prev.platforms_enabled, slack: checked }
                        }))}
                        className="data-[state=checked]:bg-purple-600 ml-auto"
                      />
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="slack_webhook">URL du Webhook Slack</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="slack_webhook"
                          type={showWebhookUrl.slack ? "text" : "password"}
                          placeholder="https://hooks.slack.com/services/..."
                          value={formData.slack_webhook_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, slack_webhook_url: e.target.value }))}
                          disabled={!formData.platforms_enabled.slack}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowWebhookUrl(prev => ({ ...prev, slack: !prev.slack }))}
                        >
                          {showWebhookUrl.slack ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {formData.slack_webhook_url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(formData.slack_webhook_url)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="slack_channel">Canal Slack (optionnel)</Label>
                      <Input
                        id="slack_channel"
                        placeholder="#general ou @username"
                        value={formData.slack_channel}
                        onChange={(e) => setFormData(prev => ({ ...prev, slack_channel: e.target.value }))}
                        disabled={!formData.platforms_enabled.slack}
                        className="mt-2"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      {renderNotificationTest('slack', settings)} {/* CORRECTION: Render test button */}
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Comment obtenir votre webhook Slack :</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Allez sur <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">api.slack.com/apps</a></li>
                          <li>Créez une nouvelle app ou utilisez une existante</li>
                          <li>Activez les "Incoming Webhooks"</li>
                          <li>Créez un nouveau webhook pour votre canal</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Configuration Telegram */}
              <motion.div
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-6 h-6 text-white" /> {/* Using MessageSquare icon as per outline */}
                      </div>
                      Configuration Telegram
                      <Switch
                        checked={formData.platforms_enabled.telegram}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          platforms_enabled: { ...prev.platforms_enabled, telegram: checked }
                        }))}
                        className="data-[state=checked]:bg-blue-600 ml-auto"
                      />
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="telegram_bot_token">Token du Bot Telegram</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          id="telegram_bot_token"
                          type={showWebhookUrl.telegram ? "text" : "password"}
                          placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                          value={formData.telegram_bot_token}
                          onChange={(e) => setFormData(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                          disabled={!formData.platforms_enabled.telegram}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowWebhookUrl(prev => ({ ...prev, telegram: !prev.telegram }))}
                        >
                          {showWebhookUrl.telegram ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telegram_chat_id">ID du Chat</Label>
                      <Input
                        id="telegram_chat_id"
                        placeholder="123456789 ou -123456789"
                        value={formData.telegram_chat_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                        disabled={!formData.platforms_enabled.telegram}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="telegram_username">Nom d'utilisateur (optionnel)</Label>
                      <Input
                        id="telegram_username"
                        placeholder="@votre_username"
                        value={formData.telegram_username}
                        onChange={(e) => setFormData(prev => ({ ...prev, telegram_username: e.target.value }))}
                        disabled={!formData.platforms_enabled.telegram}
                        className="mt-2"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      {renderNotificationTest('telegram', settings)} {/* CORRECTION: Render test button */}
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Comment configurer Telegram :</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Contactez <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">@BotFather</a> sur Telegram</li>
                          <li>Créez un nouveau bot avec /newbot</li>
                          <li>Obtenez votre token de bot</li>
                          <li>Envoyez un message à votre bot</li>
                          <li>Visitez https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates pour obtenir votre chat_id</li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Configuration Email */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      Notifications Email
                      <Switch
                        checked={formData.platforms_enabled.email}
                        onCheckedChange={(checked) => setFormData(prev => ({
                          ...prev,
                          platforms_enabled: { ...prev.platforms_enabled, email: checked }
                        }))}
                        className="data-[state=checked]:bg-green-600 ml-auto"
                      />
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Configuration automatique</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Les notifications par email utilisent automatiquement votre adresse email professionnelle :
                        <strong> {employee?.email || currentUser?.email || 'N/A'}</strong>
                      </p>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Avantages des notifications email :</strong>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Templates HTML professionnels</li>
                          <li>Historique complet conservé</li>
                          <li>Compatible avec tous les clients email</li>
                          <li>Aucune configuration requise</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="pt-4 border-t">
                      {renderNotificationTest('email', settings)} {/* CORRECTION: Render test button */}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Section Test des Notifications - This section is replaced by the individual test buttons within platform cards now. */}
            {/* Keeping the "Test TOUS" button and related instructions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Tests Complétés des Notifications
              </h3>

              {/* The individual test cards (Slack, Telegram, Email) are removed here
                  as they are now part of the platform configuration cards above. */}
              {/* Removed:
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">...</Card>
                <Card className="p-4">...</Card>
                <Card className="p-4">...</Card>
              </div>
              <div className="flex gap-4 mt-6">
                <Button>...</Button>
                <Button>...</Button>
                <Button>...</Button>
              </div>
              */}

              <Separator className="my-6" />

              <Button
                onClick={handleTestAllNotifications}
                disabled={isTestingAll}
                variant="secondary"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
              >
                {isTestingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Test en cours...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Tester TOUS les types de notifications
                  </>
                )}
              </Button>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Le test complet enverra un exemple de chaque type de notification (20 au total) vers toutes vos plateformes configurées.
                  Cela peut prendre quelques minutes.
                </AlertDescription>
              </Alert>

              {/* Instructions d'aide pour Telegram - This was already present, kept it here but the primary instructions are in the Telegram card */}
              {formData.platforms_enabled.telegram && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pour Telegram :</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                      <li>Créez un bot via @BotFather sur Telegram</li>
                      <li>Copiez le token du bot dans le champ ci-dessus</li>
                      <li>Démarrez une conversation avec votre bot</li>
                      <li>Envoyez /start à votre bot</li>
                      <li>Récupérez votre Chat ID via @userinfobot</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          {/* Types de notifications */}
          <TabsContent value="types" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-blue-600" />
                    Types de Notifications {isAdmin && <Badge className="bg-purple-500 text-white">Admin</Badge>}
                  </CardTitle>
                  <p className="text-gray-600">Choisissez les types de notifications que vous souhaitez recevoir</p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Notifications de base */}
                    <NotificationTypeCard
                      type="leave_status"
                      title="Statut des Congés"
                      description="Approbation/refus de vos demandes de congé"
                      icon={Calendar}
                      enabled={formData.notification_types.leave_status}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, leave_status: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="time_reminders"
                      title="Rappels de Pointage"
                      description="Rappels pour pointer à l'arrivée/départ"
                      icon={Clock}
                      enabled={formData.notification_types.time_reminders}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, time_reminders: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="announcements"
                      title="Nouvelles Annonces"
                      description="Annonces importantes de l'entreprise"
                      icon={Megaphone}
                      enabled={formData.notification_types.announcements}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, announcements: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="schedule_changes"
                      title="Changements d'Horaire"
                      description="Modifications de planning ou d'horaires"
                      icon={RefreshCw}
                      enabled={formData.notification_types.schedule_changes}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, schedule_changes: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="performance_reviews"
                      title="Évaluations Performance"
                      description="Nouvelles évaluations et feedbacks"
                      icon={Target}
                      enabled={formData.notification_types.performance_reviews}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, performance_reviews: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="team_updates"
                      title="Mises à jour Équipe"
                      description="Nouvelles de votre équipe et département"
                      icon={Users}
                      enabled={formData.notification_types.team_updates}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, team_updates: checked }
                      }))}
                    />

                    <NotificationTypeCard
                      type="urgent_messages"
                      title="Messages Urgents"
                      description="Communications urgentes nécessitant attention immédiate"
                      icon={AlertTriangle}
                      enabled={formData.notification_types.urgent_messages}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, urgent_messages: checked }
                      }))}
                    />

                    {/* New Notification Types */}
                    <NotificationTypeCard
                      type="meeting_invitations"
                      title="Invitations aux Réunions"
                      description="Nouvelles invitations et rappels de réunions"
                      icon={Calendar}
                      enabled={formData.notification_types.meeting_invitations}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, meeting_invitations: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="project_assignments"
                      title="Affectations de Projets"
                      description="Nouveaux projets et tâches assignés"
                      icon={Target}
                      enabled={formData.notification_types.project_assignments}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, project_assignments: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="task_updates"
                      title="Mises à jour des Tâches"
                      description="Changements de statut des tâches"
                      icon={CheckCircle}
                      enabled={formData.notification_types.task_updates}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, task_updates: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="survey_invitations"
                      title="Invitations aux Sondages"
                      description="Nouveaux sondages et questionnaires"
                      icon={FileText}
                      enabled={formData.notification_types.survey_invitations}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, survey_invitations: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="document_updates"
                      title="Nouveaux Documents"
                      description="Documents et politiques mis à jour"
                      icon={FileText}
                      enabled={formData.notification_types.document_updates}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, document_updates: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="event_reminders"
                      title="Rappels d'Événements"
                      description="Événements d'entreprise et occasions spéciales"
                      icon={Calendar}
                      enabled={formData.notification_types.event_reminders}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, event_reminders: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="birthday_wishes"
                      title="Souhaits d'Anniversaire"
                      description="Vos anniversaires et ceux de l'équipe"
                      icon={Activity}
                      enabled={formData.notification_types.birthday_wishes}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, birthday_wishes: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="work_anniversaries"
                      title="Anniversaires de Travail"
                      description="Célébrations d'ancienneté dans l'entreprise"
                      icon={Award}
                      enabled={formData.notification_types.work_anniversaries}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, work_anniversaries: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="overtime_alerts"
                      title="Alertes Heures Supplémentaires"
                      description="Notification pour les heures supplémentaires"
                      icon={Timer}
                      enabled={formData.notification_types.overtime_alerts}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, overtime_alerts: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="deadline_reminders"
                      title="Rappels d'Échéances"
                      description="Échéances de projets et tâches importantes"
                      icon={AlertTriangle}
                      enabled={formData.notification_types.deadline_reminders}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, deadline_reminders: checked }
                      }))}
                      isNew={true}
                    />

                    <NotificationTypeCard
                      type="gamification_rewards"
                      title="Récompenses Gamification"
                      description="Nouveaux badges et récompenses"
                      icon={Star}
                      enabled={formData.notification_types.gamification_rewards}
                      onChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_types: { ...prev.notification_types, gamification_rewards: checked }
                      }))}
                      isNew={true}
                    />

                    {isAdmin && (
                      <>
                        <NotificationTypeCard
                          type="system_maintenance"
                          title="Maintenance Système"
                          description="Notifications de maintenance et mises à jour"
                          icon={Settings}
                          enabled={formData.notification_types.system_maintenance}
                          onChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notification_types: { ...prev.notification_types, system_maintenance: checked }
                          }))}
                          isAdmin={true}
                        />

                        <NotificationTypeCard
                          type="security_alerts"
                          title="Alertes de Sécurité"
                          description="Tentatives de connexion suspectes et alertes"
                          icon={Shield}
                          enabled={formData.notification_types.security_alerts}
                          onChange={(checked) => setFormData(prev => ({
                            ...prev,
                            notification_types: { ...prev.notification_types, security_alerts: checked }
                          }))}
                          isAdmin={true}
                        />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Planification */}
          <TabsContent value="schedule" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-green-600" />
                    Planification des Notifications
                    <Switch
                      checked={formData.notification_schedule.enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_schedule: { ...prev.notification_schedule, enabled: checked }
                      }))}
                      className="data-[state=checked]:bg-green-600 ml-auto"
                    />
                  </CardTitle>
                  <p className="text-gray-600">
                    Définissez quand recevoir vos notifications
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="start_time">Heure de début</Label>
                      <Input
                        id="start_time"
                        type="time"
                        value={formData.notification_schedule.start_time}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notification_schedule: { ...prev.notification_schedule, start_time: e.target.value }
                        }))}
                        disabled={!formData.notification_schedule.enabled}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="end_time">Heure de fin</Label>
                      <Input
                        id="end_time"
                        type="time"
                        value={formData.notification_schedule.end_time}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          notification_schedule: { ...prev.notification_schedule, end_time: e.target.value }
                        }))}
                        disabled={!formData.notification_schedule.enabled}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select
                      value={formData.notification_schedule.timezone}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        notification_schedule: { ...prev.notification_schedule, timezone: value }
                      }))}
                      disabled={!formData.notification_schedule.enabled}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles (GMT-8)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Notifications le weekend</h4>
                      <p className="text-sm text-gray-500">Recevoir des notifications samedi et dimanche</p>
                    </div>
                    <Switch
                      checked={formData.notification_schedule.weekend_notifications}
                      onCheckedChange={(checked) => setFormData(prev => ({
                        ...prev,
                        notification_schedule: { ...prev.notification_schedule, weekend_notifications: checked }
                      }))}
                      disabled={!formData.notification_schedule.enabled}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>

                  {formData.notification_schedule.enabled && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Les notifications seront envoyées uniquement entre{" "}
                        <strong>{formData.notification_schedule.start_time}</strong> et{" "}
                        <strong>{formData.notification_schedule.end_time}</strong>
                        {!formData.notification_schedule.weekend_notifications && " du lundi au vendredi"}.
                        Les messages urgents peuvent ignorer ces règles.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Status et statistiques */}
        {settings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-purple-600" />
                  Statistiques et État
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {settings.test_notifications_sent || 0}
                    </div>
                    <div className="text-sm text-gray-600">Tests envoyés</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(formData.platforms_enabled).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-gray-600">Plateformes actives</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.values(formData.notification_types).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-gray-600">Types activés</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {settings.notification_stats?.total_sent || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total envoyées</div>
                  </div>
                </div>

                {settings.last_notification_test && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Dernier test : {format(new Date(settings.last_notification_test), 'dd/MM/yyyy à HH:mm')}
                    </p>
                  </div>
                )}

                {/* Platform status indicators */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3">État des plateformes</h4>
                  <div className="flex flex-wrap gap-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.platforms_enabled.slack ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Slack {formData.platforms_enabled.slack ? '✓' : '×'}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.platforms_enabled.telegram ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Telegram {formData.platforms_enabled.telegram ? '✓' : '×'}</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      formData.platforms_enabled.email ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email {formData.platforms_enabled.email ? '✓' : '×'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
