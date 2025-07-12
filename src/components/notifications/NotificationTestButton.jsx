import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  MessageSquare,
  Mail,
  Slack
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { testSlackNotification } from "@/api/functions";
import { testTelegramNotification } from "@/api/functions";
import { testEmailNotification } from "@/api/functions";

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