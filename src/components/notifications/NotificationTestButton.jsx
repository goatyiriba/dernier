import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  BellOff, 
  BellRing, 
  BellPlus, 
  BellMinus, 
  BellX, 
  BellCheck, 
  BellAlert, 
  BellBan, 
  BellClock, 
  BellCrown, 
  BellDollar, 
  BellEdit, 
  BellMinus2, 
  BellPlus2, 
  BellSearch, 
  BellSettings, 
  BellStar, 
  BellTag, 
  BellVoice, 
  BellX2, 
  BellZap, 
  BellGear, 
  BellKey, 
  BellLock, 
  BellUnlock, 
  BellAlert2, 
  BellBan2, 
  BellCheck2, 
  BellClock2, 
  BellCrown2, 
  BellDollar2, 
  BellEdit2, 
  BellMinus3, 
  BellPlus3, 
  BellSearch2, 
  BellSettings2, 
  BellStar2, 
  BellTag2, 
  BellVoice2, 
  BellX3, 
  BellZap2, 
  BellGear2, 
  BellKey2, 
  BellLock2, 
  BellUnlock2, 
  BellAlert3, 
  BellBan3, 
  BellCheck3, 
  BellClock3, 
  BellCrown3, 
  BellDollar3, 
  BellEdit3, 
  BellMinus4, 
  BellPlus4, 
  BellSearch3, 
  BellSettings3, 
  BellStar3, 
  BellTag3, 
  BellVoice3, 
  BellX4, 
  BellZap3, 
  BellGear3, 
  BellKey3, 
  BellLock3, 
  BellUnlock3, 
  BellAlert4, 
  BellBan4, 
  BellCheck4, 
  BellClock4, 
  BellCrown4, 
  BellDollar4, 
  BellEdit4, 
  BellMinus5, 
  BellPlus5, 
  BellSearch4, 
  BellSettings4, 
  BellStar4, 
  BellTag4, 
  BellVoice4, 
  BellX5, 
  BellZap4, 
  BellGear4, 
  BellKey4, 
  BellLock4, 
  BellUnlock4, 
  BellAlert5, 
  BellBan5,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Zap,
  Settings,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Info,
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
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { sendSlackNotification } from "@/api/supabaseFunctions";

// Fonctions de test pour les notifications
const testSlackNotification = async (message) => {
  try {
    const result = await sendSlackNotification(message, 'test');
    return result;
  } catch (error) {
    console.error('Erreur test Slack:', error);
    throw error;
  }
};

const testTelegramNotification = async (message) => {
  // Implémentation Telegram (à configurer)
  console.log('Test Telegram:', message);
  return true;
};

const testEmailNotification = async (message) => {
  // Implémentation Email (à configurer)
  console.log('Test Email:', message);
  return true;
};

export default function NotificationTestButton({ 
  platform, 
  settings, 
  employeeId,
  onTestComplete 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const { toast } = useToast();

  // CORRECTION: Vérification de platform et valeur par défaut
  const platformString = typeof platform === 'string' ? platform : 'unknown';

  const getTestFunction = () => {
    switch (platformString) {
      case 'slack':
        return testSlackNotification;
      case 'telegram':
        return testTelegramNotification;
      case 'email':
        return testEmailNotification;
      default:
        return null;
    }
  };

  const getTestData = () => {
    const baseData = {
      employee_id: employeeId,
      test_message: `Test de notification ${platformString.toUpperCase()} - ${new Date().toLocaleString()}`
    };

    switch (platformString) {
      case 'slack':
        return {
          ...baseData,
          webhook_url: settings?.slack_webhook_url || '',
          channel: settings?.slack_channel || '#general'
        };
      case 'telegram':
        return {
          ...baseData,
          bot_token: settings?.telegram_bot_token || '',
          chat_id: settings?.telegram_chat_id || ''
        };
      case 'email':
        return {
          ...baseData,
          recipient_email: settings?.email || 'test@example.com'
        };
      default:
        return baseData;
    }
  };

  const handleTest = async () => {
    setIsLoading(true);
    setLastResult(null);
    
    try {
      // CORRECTION: Vérification de platform avant utilisation
      if (!platformString || platformString === 'unknown') {
        throw new Error('Plateforme de notification non spécifiée');
      }

      const testFunction = getTestFunction();
      if (!testFunction) {
        throw new Error(`Fonction de test non trouvée pour ${platformString}`);
      }

      const testData = getTestData();
      console.log(`Testing ${platformString} with data:`, testData);
      
      const response = await testFunction(testData);
      console.log(`${platformString} test response:`, response);
      
      // Vérifier la structure de réponse
      if (response && response.data) {
        const result = response.data;
        
        if (result.success) {
          setLastResult({ success: true, message: result.message });
          toast({
            title: "✅ Test réussi",
            description: `Notification ${platformString} envoyée avec succès`,
            duration: 4000
          });
        } else {
          setLastResult({ success: false, message: result.error || result.message });
          toast({
            title: "❌ Test échoué",
            description: result.error || result.message || `Erreur lors du test ${platformString}`,
            variant: "destructive",
            duration: 6000
          });
        }
      } else {
        throw new Error("Réponse de fonction invalide");
      }
      
      if (onTestComplete) {
        onTestComplete(platformString, lastResult);
      }
      
    } catch (error) {
      console.error(`Error testing ${platformString}:`, error);
      
      const errorMessage = error.response?.data?.error || 
                          error.message || 
                          `Erreur inconnue lors du test ${platformString}`;
      
      setLastResult({ success: false, message: errorMessage });
      
      toast({
        title: "❌ Erreur de test",
        description: errorMessage,
        variant: "destructive",
        duration: 6000
      });
      
      if (onTestComplete) {
        onTestComplete(platformString, { success: false, message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlatformIcon = () => {
    switch (platformString) {
      case 'slack':
        return <Slack className="w-4 h-4" />;
      case 'telegram':
        return <MessageSquare className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getPlatformColor = () => {
    switch (platformString) {
      case 'slack':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'telegram':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'email':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const isConfigured = () => {
    if (!settings) return false;
    
    switch (platformString) {
      case 'slack':
        return settings.slack_webhook_url && settings.slack_webhook_url.trim() !== '';
      case 'telegram':
        return settings.telegram_bot_token && settings.telegram_chat_id;
      case 'email':
        return true; // Email est toujours disponible
      default:
        return false;
    }
  };

  // CORRECTION: Vérification de platform avant le rendu
  if (!platformString || platformString === 'unknown') {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
        ❌ Erreur: Plateforme de notification non spécifiée
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleTest}
        disabled={isLoading || !isConfigured()}
        className={`w-full ${getPlatformColor()} text-white`}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Test en cours...
          </>
        ) : (
          <>
            {getPlatformIcon()}
            <span className="ml-2">
              Tester {platformString.charAt(0).toUpperCase() + platformString.slice(1)}
            </span>
          </>
        )}
      </Button>

      {!isConfigured() && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ Configuration incomplète pour {platformString}
        </div>
      )}

      {lastResult && (
        <div className={`p-3 rounded-lg text-sm ${
          lastResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-2">
            {lastResult.success ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`font-medium ${
                lastResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {lastResult.success ? 'Test réussi' : 'Test échoué'}
              </div>
              <div className={`mt-1 ${
                lastResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {lastResult.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}