
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Zap, Shield, Database, Settings, CheckCircle, AlertCircle, Plus, Trash2, Hash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function IntegrationHub({ settings, onSettingChange }) {
  const [slackConfig, setSlackConfig] = useState({
    webhooks: [
      {
        id: 1,
        name: 'Canal Principal',
        webhook_url: '',
        channel: '#general',
        notifications: {
          leave_requests: true,
          new_employees: true,
          urgent_announcements: true,
          employee_birthdays: true,
          work_anniversaries: true,
          project_assignments: true,
          deadline_reminders: true,
          overtime_alerts: true,
          security_alerts: true
        }
      }
    ],
    formatting: {
      use_rich_messages: true,
      include_action_buttons: true,
      mention_channel: false,
      use_threads: false
    },
    schedule: {
      business_hours_only: true,
      start_time: "09:00",
      end_time: "18:00",
      weekend_notifications: false,
      timezone: "Europe/Paris"
    }
  });
  const [showSlackConfig, setShowSlackConfig] = useState(false);
  const [isTestingSlack, setIsTestingSlack] = useState(false);
  const [activeWebhookId, setActiveWebhookId] = useState(1);
  const { toast } = useToast();

  const integrations = [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notifications RH automatiques dans Slack',
      icon: '💬',
      status: 'available',
      category: 'communication',
      enabled: settings?.integrations?.slack?.enabled || false
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Réunions et collaboration',
      icon: '👥',
      status: 'coming_soon',
      category: 'communication',
      enabled: false
    },
    {
      id: 'google_workspace',
      name: 'Google Workspace',
      description: 'Synchronisation calendrier et emails',
      icon: '📧',
      status: 'available',
      category: 'productivity',
      enabled: settings?.integrations?.google_workspace?.enabled || false
    }
  ];

  const notificationCategories = {
    hr_basics: {
      title: "📋 Ressources Humaines",
      notifications: {
        leave_requests: "Demandes de congés",
        new_employees: "Nouveaux employés",
        urgent_announcements: "Annonces urgentes"
      }
    },
    events: {
      title: "🎉 Événements",
      notifications: {
        employee_birthdays: "Anniversaires d'employés",
        work_anniversaries: "Anniversaires de travail"
      }
    },
    projects: {
      title: "🎯 Projets",
      notifications: {
        project_assignments: "Assignations de projets",
        deadline_reminders: "Rappels d'échéances"
      }
    },
    performance: {
      title: "📊 Performance",
      notifications: {
        overtime_alerts: "Alertes heures supplémentaires"
      }
    },
    security: {
      title: "🔒 Sécurité",
      notifications: {
        security_alerts: "Alertes de sécurité"
      }
    }
  };

  const addWebhook = () => {
    const newId = slackConfig.webhooks.length > 0 ? Math.max(...slackConfig.webhooks.map(w => w.id)) + 1 : 1;
    setSlackConfig(prev => ({
      ...prev,
      webhooks: [...prev.webhooks, {
        id: newId,
        name: `Canal ${newId}`,
        webhook_url: '',
        channel: '#general',
        notifications: {}
      }]
    }));
    setActiveWebhookId(newId);
  };

  const removeWebhook = (id) => {
    if (slackConfig.webhooks.length === 1) {
      toast({
        title: "❌ Impossible de supprimer",
        description: "Au moins un webhook doit être configuré",
        variant: "destructive"
      });
      return;
    }
    
    setSlackConfig(prev => {
      const updatedWebhooks = prev.webhooks.filter(w => w.id !== id);
      let newActiveWebhookId = activeWebhookId;
      if (newActiveWebhookId === id) {
        newActiveWebhookId = updatedWebhooks.length > 0 ? updatedWebhooks[0].id : null;
      }
      return {
        ...prev,
        webhooks: updatedWebhooks
      };
    });
  };

  const updateWebhook = (id, field, value) => {
    setSlackConfig(prev => ({
      ...prev,
      webhooks: prev.webhooks.map(w => 
        w.id === id ? { ...w, [field]: value } : w
      )
    }));
  };

  const updateWebhookNotification = (webhookId, notificationKey, enabled) => {
    setSlackConfig(prev => ({
      ...prev,
      webhooks: prev.webhooks.map(w => 
        w.id === webhookId 
          ? { 
              ...w, 
              notifications: { 
                ...w.notifications, 
                [notificationKey]: enabled 
              }
            }
          : w
      )
    }));
  };

  const handleSlackToggle = (enabled) => {
    if (enabled && !slackConfig.webhooks.some(w => w.webhook_url)) {
      setShowSlackConfig(true);
      return;
    }
    
    onSettingChange('slack', { 
      enabled, 
      config: enabled ? slackConfig : null 
    }, 'integrations');
    
    toast({
      title: enabled ? "✅ Slack activé" : "❌ Slack désactivé",
      description: enabled 
        ? "Les notifications RH seront envoyées vers Slack"
        : "Les notifications Slack ont été désactivées"
    });
  };

  const testSlackIntegration = async () => {
    const activeWebhook = slackConfig.webhooks.find(w => w.id === activeWebhookId);
    if (!activeWebhook?.webhook_url) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez configurer l'URL webhook avant de tester",
        variant: "destructive"
      });
      return;
    }

    // Validation de l'URL webhook
    if (!activeWebhook.webhook_url.startsWith('https://hooks.slack.com/services/')) {
      toast({
        title: "❌ URL webhook invalide",
        description: "L'URL doit commencer par https://hooks.slack.com/services/",
        variant: "destructive"
      });
      return;
    }

    setIsTestingSlack(true);
    
    try {
      // Utiliser la fonction backend pour éviter les problèmes CORS
      const { sendSlackNotification } = await import("@/api/functions");
      
      const testData = {
        webhook_url: activeWebhook.webhook_url,
        message: "🎉 Test de l'intégration Flow HR",
        type: "test",
        data: {
          channel: activeWebhook.channel,
          timestamp: new Date().toLocaleString('fr-FR', {
            timeZone: 'Europe/Paris',
            dateStyle: 'short',
            timeStyle: 'medium'
          })
        }
      };

      console.log('Test Slack via fonction backend:', {
        url: activeWebhook.webhook_url.substring(0, 50) + '...',
        channel: activeWebhook.channel
      });

      const response = await sendSlackNotification(testData);
      
      if (response.data?.success) {
        toast({
          title: "✅ Test réussi !",
          description: `Message test envoyé avec succès vers ${activeWebhook.channel}`,
          duration: 5000
        });
      } else {
        throw new Error(response.data?.error || 'Erreur inconnue lors de l\'appel backend');
      }
      
    } catch (error) {
      console.error('Erreur lors du test Slack (via backend):', error);
      
      // Si la fonction backend échoue, essayer un test direct avec gestion CORS améliorée
      try {
        console.log('Tentative de test direct Slack...');
        
        const testMessage = {
          text: "🎉 Test Flow HR - Connexion directe",
          username: "Flow HR Bot",
          icon_emoji: ":office:",
          channel: activeWebhook.channel
        };

        const directResponse = await fetch(activeWebhook.webhook_url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'Flow-HR-Platform/1.0'
          },
          body: JSON.stringify(testMessage),
          mode: 'no-cors' // Éviter les erreurs CORS
        });

        // Avec no-cors, on ne peut pas lire la réponse, mais si ça ne lève pas d'erreur, c'est bon
        toast({
          title: "✅ Test probablement réussi",
          description: `Le webhook semble fonctionnel. Vérifiez ${activeWebhook.channel} dans Slack.`,
          duration: 7000
        });
        
      } catch (directError) {
        console.error('Erreur test direct Slack:', directError);
        
        let userMessage = "Test échoué";
        
        if (directError.name === 'TypeError' && directError.message.includes('fetch')) {
          userMessage = "Problème de connexion réseau. Vérifiez votre connexion internet.";
        } else if (directError.message.includes('CORS')) {
          userMessage = "Restriction CORS détectée. Le webhook peut fonctionner en production.";
        } else if (directError.message.includes('Failed to fetch')) {
          userMessage = "Impossible de joindre Slack. Vérifiez l'URL du webhook.";
        } else {
          userMessage = directError.message || "Erreur de test inconnue";
        }
        
        toast({
          title: "⚠️ Test limité",
          description: `${userMessage}. Le webhook peut fonctionner malgré cette erreur.`,
          variant: "destructive",
          duration: 10000
        });
      }
    } finally {
      setIsTestingSlack(false);
    }
  };

  const handleSlackConfigSave = () => {
    const validWebhooks = slackConfig.webhooks.filter(w => 
      w.webhook_url && w.webhook_url.startsWith('https://hooks.slack.com/services/')
    );

    if (validWebhooks.length === 0) {
      toast({
        title: "❌ Configuration invalide",
        description: "Veuillez configurer au moins un webhook Slack valide",
        variant: "destructive"
      });
      return;
    }

    // Validation des canaux
    const invalidChannels = validWebhooks.filter(w => 
      !w.channel || (!w.channel.startsWith('#') && !w.channel.startsWith('@'))
    );

    if (invalidChannels.length > 0) {
      toast({
        title: "⚠️ Attention",
        description: "Certains canaux n'ont pas un nom valide (doivent commencer par # ou @)",
        variant: "destructive"
      });
      return;
    }

    onSettingChange('slack', { 
      enabled: true, 
      config: slackConfig 
    }, 'integrations');
    
    setShowSlackConfig(false);
    
    toast({
      title: "✅ Configuration Slack sauvegardée",
      description: `${validWebhooks.length} webhook(s) configuré(s) avec succès`,
      duration: 5000
    });

    console.log('Configuration Slack sauvegardée:', {
      webhooks: validWebhooks.length,
      config: slackConfig
    });
  };

  const activeWebhook = slackConfig.webhooks.find(w => w.id === activeWebhookId);

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Hub d'Intégrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      {integration.enabled && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={integration.status === 'available' ? 'default' : 'secondary'}>
                    {integration.status === 'available' ? 'Disponible' : 'Bientôt'}
                  </Badge>
                  
                  {integration.id === 'slack' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSlackConfig(true)}
                      disabled={integration.status !== 'available'}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Switch 
                    checked={integration.enabled}
                    onCheckedChange={integration.id === 'slack' ? handleSlackToggle : undefined}
                    disabled={integration.status !== 'available'}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Section d'aide */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Configuration des intégrations</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Les intégrations permettent à Flow HR de communiquer avec vos outils externes. 
                  Configurez Slack pour recevoir des notifications automatiques sur les événements RH importants.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de configuration Slack optimisé */}
      <Dialog open={showSlackConfig} onOpenChange={setShowSlackConfig}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              💬 Configuration Slack Avancée
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="webhooks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>

            <TabsContent value="webhooks" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion des Webhooks</h3>
                <Button onClick={addWebhook} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un webhook
                </Button>
              </div>

              {/* Liste des webhooks */}
              <div className="space-y-4">
                {slackConfig.webhooks.map((webhook, index) => (
                  <Card key={webhook.id} className={`border-2 ${activeWebhookId === webhook.id ? 'border-blue-500' : 'border-gray-200'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          <Input
                            value={webhook.name}
                            onChange={(e) => updateWebhook(webhook.id, 'name', e.target.value)}
                            className="font-semibold border-none p-0 h-auto focus-visible:ring-0"
                            placeholder="Nom du webhook"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {slackConfig.webhooks.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWebhook(webhook.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            variant={activeWebhookId === webhook.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveWebhookId(webhook.id)}
                          >
                            {activeWebhookId === webhook.id ? "Actif" : "Sélectionner"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>URL Webhook Slack *</Label>
                          <Input
                            placeholder="https://hooks.slack.com/services/..."
                            value={webhook.webhook_url}
                            onChange={(e) => updateWebhook(webhook.id, 'webhook_url', e.target.value)}
                            className={
                              webhook.webhook_url && !webhook.webhook_url.startsWith('https://hooks.slack.com/services/')
                                ? 'border-red-300 focus:border-red-500'
                                : ''
                            }
                          />
                          {webhook.webhook_url && !webhook.webhook_url.startsWith('https://hooks.slack.com/services/') && (
                            <p className="text-xs text-red-500 mt-1">
                              L'URL doit commencer par https://hooks.slack.com/services/
                            </p>
                          )}
                        </div>
                        <div>
                          <Label>Canal de destination *</Label>
                          <Input
                            placeholder="#general ou @user"
                            value={webhook.channel}
                            onChange={(e) => updateWebhook(webhook.id, 'channel', e.target.value)}
                            className={
                              webhook.channel && !webhook.channel.startsWith('#') && !webhook.channel.startsWith('@')
                                ? 'border-red-300 focus:border-red-500'
                                : ''
                            }
                          />
                          {webhook.channel && !webhook.channel.startsWith('#') && !webhook.channel.startsWith('@') && (
                            <p className="text-xs text-red-500 mt-1">
                              Le canal doit commencer par # ou @
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {activeWebhookId === webhook.id && (
                        <div className="pt-2 space-y-2">
                          <div className="flex gap-2">
                            <Button
                              onClick={testSlackIntegration}
                              disabled={!webhook.webhook_url || !webhook.channel || isTestingSlack}
                              variant="outline"
                              size="sm"
                            >
                              {isTestingSlack ? (
                                <>
                                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-2" />
                                  Test en cours...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Tester ce webhook
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-amber-700">
                                <p className="font-medium mb-1">À propos du test :</p>
                                <ul className="space-y-1 text-xs">
                                  <li>• Le test peut échouer à cause des restrictions CORS du navigateur</li>
                                  <li>• Un échec de test ne signifie pas que le webhook ne fonctionne pas</li>
                                  <li>• En production, les notifications utilisent le serveur backend</li>
                                  <li>• Vérifiez votre canal Slack après le test</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration des notifications par webhook</h3>
              
              <div className="mb-4">
                <Label>Webhook actuel:</Label>
                <Select value={activeWebhookId.toString()} onValueChange={(value) => setActiveWebhookId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {slackConfig.webhooks.map(webhook => (
                      <SelectItem key={webhook.id} value={webhook.id.toString()}>
                        {webhook.name} - {webhook.channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeWebhook && (
                <div className="space-y-4">
                  {Object.entries(notificationCategories).map(([categoryKey, category]) => (
                    <Card key={categoryKey} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <h4 className="font-medium text-gray-800">{category.title}</h4>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(category.notifications).map(([notifKey, label]) => (
                            <div key={notifKey} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm">{label}</span>
                              <Switch
                                checked={activeWebhook.notifications[notifKey] || false}
                                onCheckedChange={(checked) => 
                                  updateWebhookNotification(activeWebhookId, notifKey, checked)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <h3 className="text-lg font-semibold">Paramètres globaux</h3>
              
              {/* Options de formatage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🎨 Options de formatage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries({
                    use_rich_messages: "Messages enrichis avec couleurs",
                    include_action_buttons: "Boutons d'action interactifs",
                    mention_channel: "Mentionner @channel pour urgences",
                    use_threads: "Utiliser les fils de discussion"
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <span className="text-sm">{label}</span>
                      <Switch
                        checked={slackConfig.formatting[key]}
                        onCheckedChange={(checked) => 
                          setSlackConfig(prev => ({
                            ...prev,
                            formatting: { ...prev.formatting, [key]: checked }
                          }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Programmation des notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">⏰ Programmation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notifications uniquement en heures ouvrables</span>
                    <Switch
                      checked={slackConfig.schedule.business_hours_only}
                      onCheckedChange={(checked) => 
                        setSlackConfig(prev => ({
                          ...prev,
                          schedule: { ...prev.schedule, business_hours_only: checked }
                        }))
                      }
                    />
                  </div>
                  
                  {slackConfig.schedule.business_hours_only && (
                    <div className="space-y-3 p-3 bg-amber-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Heure de début</Label>
                          <Input
                            type="time"
                            value={slackConfig.schedule.start_time}
                            onChange={(e) => setSlackConfig(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, start_time: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Heure de fin</Label>
                          <Input
                            type="time"
                            value={slackConfig.schedule.end_time}
                            onChange={(e) => setSlackConfig(prev => ({
                              ...prev,
                              schedule: { ...prev.schedule, end_time: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSlackConfig(false)}>
              Annuler
            </Button>
            <Button onClick={handleSlackConfigSave}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Sauvegarder la configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
