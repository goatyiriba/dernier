import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Plus, 
  Minus, 
  RotateCcw, 
  Target, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  Zap,
  Award,
  Clock,
  MessageCircle,
  Calendar,
  Users,
  Shield
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const DEFAULT_POINTS_RULES = {
  // Points positifs
  positive_rules: {
    early_checkin: { points: 10, active: true, description: "Pointage d'entrée anticipé" },
    on_time_checkin: { points: 5, active: true, description: "Pointage d'entrée à l'heure" },
    perfect_day: { points: 15, active: true, description: "Journée parfaite (entrée + sortie à l'heure)" },
    weekly_streak: { points: 30, active: true, description: "Série hebdomadaire parfaite" },
    monthly_streak: { points: 100, active: true, description: "Série mensuelle parfaite" },
    read_announcement: { points: 5, active: true, description: "Lecture d'une annonce" },
    document_view: { points: 3, active: true, description: "Consultation d'un document" },
    message_sent: { points: 2, active: true, description: "Envoi d'un message" },
    survey_completed: { points: 25, active: true, description: "Sondage complété" },
    meeting_attended: { points: 15, active: true, description: "Participation à une réunion" },
    overtime_worked: { points: 20, active: true, description: "Heures supplémentaires" }
  },
  
  // Points négatifs (pénalités)
  negative_rules: {
    late_checkin: { points: -100, active: true, description: "Pointage d'entrée en retard" },
    no_checkin: { points: -150, active: true, description: "Absence de pointage d'entrée" },
    late_checkout: { points: -100, active: true, description: "Pointage de sortie en retard" },
    no_checkout: { points: -100, active: true, description: "Absence de pointage de sortie" },
    exceed_time_window: { points: -500, active: true, description: "Dépassement critique de la plage horaire" },
    unread_messages: { points: -20, active: true, description: "Messages non lus (par message)" },
    no_platform_access: { points: -50, active: true, description: "Absence de connexion (par jour)" },
    weekend_violation: { points: -200, active: true, description: "Pointage weekend non autorisé" },
    location_violation: { points: -150, active: true, description: "Pointage sans géolocalisation" },
    missed_meeting: { points: -30, active: true, description: "Absence à une réunion" },
    incomplete_survey: { points: -15, active: true, description: "Sondage non complété" }
  },
  
  // Multiplicateurs et bonus
  multipliers: {
    repeat_offense: 2.0,
    critical_violation: 5.0,
    excellence_bonus: 1.5,
    team_collaboration: 1.2
  },
  
  // Paramètres avancés
  advanced_settings: {
    allow_negative_points: true,
    daily_points_cap: 1000,
    weekly_reset: false,
    streak_bonus_multiplier: 1.1,
    team_bonus_enabled: true,
    seasonal_events_multiplier: 2.0
  }
};

export default function PointsRulesManager({ settings, onSave, isSaving }) {
  const [rules, setRules] = useState(settings?.points_rules || DEFAULT_POINTS_RULES);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeSection, setActiveSection] = useState("positive");
  const { toast } = useToast();

  useEffect(() => {
    if (settings?.points_rules) {
      setRules(settings.points_rules);
    }
  }, [settings]);

  const updateRule = (category, ruleKey, field, value) => {
    const newRules = {
      ...rules,
      [category]: {
        ...rules[category],
        [ruleKey]: {
          ...rules[category][ruleKey],
          [field]: value
        }
      }
    };
    setRules(newRules);
    setHasChanges(true);
  };

  const addCustomRule = (category) => {
    const ruleKey = `custom_rule_${Date.now()}`;
    const newRules = {
      ...rules,
      [category]: {
        ...rules[category],
        [ruleKey]: {
          points: category === 'positive_rules' ? 10 : -10,
          active: true,
          description: "Nouvelle règle personnalisée",
          custom: true
        }
      }
    };
    setRules(newRules);
    setHasChanges(true);
  };

  const deleteCustomRule = (category, ruleKey) => {
    const newRules = { ...rules };
    delete newRules[category][ruleKey];
    setRules(newRules);
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setRules(DEFAULT_POINTS_RULES);
    setHasChanges(true);
    toast({
      title: "🔄 Règles réinitialisées",
      description: "Les règles par défaut ont été restaurées",
      duration: 3000
    });
  };

  const handleSave = async () => {
    try {
      await onSave({ 
        ...settings, 
        points_rules: rules,
        updated_at: new Date().toISOString()
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving rules:", error);
    }
  };

  const getRuleIcon = (ruleKey) => {
    const iconMap = {
      early_checkin: Clock,
      on_time_checkin: Clock,
      late_checkin: Clock,
      no_checkin: AlertTriangle,
      perfect_day: Award,
      weekly_streak: TrendingUp,
      unread_messages: MessageCircle,
      meeting_attended: Users,
      weekend_violation: Calendar,
      location_violation: Shield
    };
    return iconMap[ruleKey] || Target;
  };

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Gestionnaire de Règles de Points
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Configurez les règles d'attribution et de pénalité des points
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50">
                  <Zap className="w-4 h-4 mr-1" />
                  Modifications non sauvegardées
                </Badge>
              )}
              
              <Button 
                variant="outline" 
                onClick={resetToDefaults}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation des sections */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "positive", label: "Points Positifs", icon: TrendingUp, color: "green" },
          { key: "negative", label: "Pénalités", icon: TrendingDown, color: "red" },
          { key: "multipliers", label: "Multiplicateurs", icon: Zap, color: "yellow" },
          { key: "advanced", label: "Paramètres Avancés", icon: Settings, color: "purple" }
        ].map(section => (
          <Button
            key={section.key}
            variant={activeSection === section.key ? "default" : "outline"}
            onClick={() => setActiveSection(section.key)}
            className={`flex items-center gap-2 ${
              activeSection === section.key 
                ? `bg-${section.color}-600 hover:bg-${section.color}-700 text-white` 
                : `border-${section.color}-300 text-${section.color}-700 hover:bg-${section.color}-50`
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Sections de contenu */}
      {activeSection === "positive" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Règles de Points Positifs
                </CardTitle>
                <Button 
                  onClick={() => addCustomRule('positive_rules')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une règle
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rules.positive_rules || {}).map(([ruleKey, rule]) => {
                const Icon = getRuleIcon(ruleKey);
                return (
                  <div key={ruleKey} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={rule.description}
                          onChange={(e) => updateRule('positive_rules', ruleKey, 'description', e.target.value)}
                          className="font-medium border-0 bg-transparent p-0 text-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600">Points:</Label>
                          <Input
                            type="number"
                            value={rule.points}
                            onChange={(e) => updateRule('positive_rules', ruleKey, 'points', parseInt(e.target.value))}
                            className="w-20 text-center"
                            min="0"
                          />
                        </div>
                        <Switch
                          checked={rule.active}
                          onCheckedChange={(checked) => updateRule('positive_rules', ruleKey, 'active', checked)}
                        />
                        {rule.custom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomRule('positive_rules', ruleKey)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === "negative" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Règles de Pénalités (Points Négatifs)
                </CardTitle>
                <Button 
                  onClick={() => addCustomRule('negative_rules')}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une pénalité
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rules.negative_rules || {}).map(([ruleKey, rule]) => {
                const Icon = getRuleIcon(ruleKey);
                return (
                  <div key={ruleKey} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={rule.description}
                          onChange={(e) => updateRule('negative_rules', ruleKey, 'description', e.target.value)}
                          className="font-medium border-0 bg-transparent p-0 text-gray-900"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-600">Pénalité:</Label>
                          <Input
                            type="number"
                            value={rule.points}
                            onChange={(e) => updateRule('negative_rules', ruleKey, 'points', parseInt(e.target.value))}
                            className="w-20 text-center text-red-600 font-bold"
                            max="0"
                          />
                        </div>
                        <Switch
                          checked={rule.active}
                          onCheckedChange={(checked) => updateRule('negative_rules', ruleKey, 'active', checked)}
                        />
                        {rule.custom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomRule('negative_rules', ruleKey)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Autres sections... */}
      {activeSection === "multipliers" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Multiplicateurs et Bonus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rules.multipliers || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-yellow-200">
                  <Label className="font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setRules({
                      ...rules,
                      multipliers: {
                        ...rules.multipliers,
                        [key]: parseFloat(e.target.value)
                      }
                    })}
                    className="w-24 text-center"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeSection === "advanced" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres Avancés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(rules.advanced_settings || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                  <div>
                    <Label className="font-medium capitalize block">
                      {key.replace(/_/g, ' ')}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {key === 'allow_negative_points' && "Autoriser les points négatifs"}
                      {key === 'daily_points_cap' && "Limite de points par jour"}
                      {key === 'weekly_reset' && "Réinitialisation hebdomadaire"}
                      {key === 'streak_bonus_multiplier' && "Multiplicateur de série"}
                      {key === 'team_bonus_enabled' && "Bonus d'équipe activé"}
                      {key === 'seasonal_events_multiplier' && "Multiplicateur événements saisonniers"}
                    </p>
                  </div>
                  {typeof value === 'boolean' ? (
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) => setRules({
                        ...rules,
                        advanced_settings: {
                          ...rules.advanced_settings,
                          [key]: checked
                        }
                      })}
                    />
                  ) : (
                    <Input
                      type="number"
                      step={key.includes('multiplier') ? "0.1" : "1"}
                      value={value}
                      onChange={(e) => setRules({
                        ...rules,
                        advanced_settings: {
                          ...rules.advanced_settings,
                          [key]: key.includes('multiplier') ? parseFloat(e.target.value) : parseInt(e.target.value)
                        }
                      })}
                      className="w-24 text-center"
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}