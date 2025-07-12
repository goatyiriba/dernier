import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Settings, 
  Clock, 
  Shield, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  Info,
  Timer,
  Users
} from "lucide-react";

export default function TimeSettingsModal({ isOpen, onClose, onSubmit, settings }) {
  const [formData, setFormData] = useState({
    check_in_start: "07:00",
    check_in_end: "10:00",
    check_out_start: "16:00",
    check_out_end: "20:00",
    allow_early_checkin: false,
    allow_late_checkout: false,
    require_location: true,
    max_work_hours: 10,
    break_duration_limit: 120,
    overtime_threshold: 8,
    minimum_break_duration: 30,
    auto_checkout_enabled: false,
    auto_checkout_time: "19:00",
    weekend_access: false,
    holiday_access: false,
    ip_whitelist: "",
    location_radius: 100,
    is_active: true
  });

  useEffect(() => {
    if (settings && isOpen) {
      setFormData({
        check_in_start: settings.check_in_start || "07:00",
        check_in_end: settings.check_in_end || "10:00",
        check_out_start: settings.check_out_start || "16:00",
        check_out_end: settings.check_out_end || "20:00",
        allow_early_checkin: settings.allow_early_checkin || false,
        allow_late_checkout: settings.allow_late_checkout || false,
        require_location: settings.require_location ?? true,
        max_work_hours: settings.max_work_hours || 10,
        break_duration_limit: settings.break_duration_limit || 120,
        overtime_threshold: settings.overtime_threshold || 8,
        minimum_break_duration: settings.minimum_break_duration || 30,
        auto_checkout_enabled: settings.auto_checkout_enabled || false,
        auto_checkout_time: settings.auto_checkout_time || "19:00",
        weekend_access: settings.weekend_access || false,
        holiday_access: settings.holiday_access || false,
        ip_whitelist: settings.ip_whitelist || "",
        location_radius: settings.location_radius || 100,
        is_active: settings.is_active ?? true
      });
    }
  }, [settings, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Settings className="w-6 h-6 text-indigo-600" />
            Paramètres de Pointage
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="time-rules" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="time-rules" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horaires
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localisation
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Avancé
              </TabsTrigger>
            </TabsList>

            {/* Onglet Règles Horaires */}
            <TabsContent value="time-rules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Plages Horaires Autorisées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plage de pointage d'entrée */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Pointage d'entrée - Début</Label>
                      <Input
                        type="time"
                        value={formData.check_in_start}
                        onChange={(e) => handleInputChange('check_in_start', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Pointage d'entrée - Fin</Label>
                      <Input
                        type="time"
                        value={formData.check_in_end}
                        onChange={(e) => handleInputChange('check_in_end', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Plage de pointage de sortie */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Pointage de sortie - Début</Label>
                      <Input
                        type="time"
                        value={formData.check_out_start}
                        onChange={(e) => handleInputChange('check_out_start', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Pointage de sortie - Fin</Label>
                      <Input
                        type="time"
                        value={formData.check_out_end}
                        onChange={(e) => handleInputChange('check_out_end', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Exceptions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Autoriser le pointage anticipé</Label>
                        <p className="text-sm text-gray-600">Permettre aux employés de pointer avant l'heure de début</p>
                      </div>
                      <Switch
                        checked={formData.allow_early_checkin}
                        onCheckedChange={(checked) => handleInputChange('allow_early_checkin', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Autoriser la sortie tardive</Label>
                        <p className="text-sm text-gray-600">Permettre aux employés de pointer après l'heure limite</p>
                      </div>
                      <Switch
                        checked={formData.allow_late_checkout}
                        onCheckedChange={(checked) => handleInputChange('allow_late_checkout', checked)}
                      />
                    </div>
                  </div>

                  {/* Limites de travail */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Heures max par jour</Label>
                      <Input
                        type="number"
                        min="1"
                        max="24"
                        value={formData.max_work_hours}
                        onChange={(e) => handleInputChange('max_work_hours', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Seuil heures supplémentaires</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.overtime_threshold}
                        onChange={(e) => handleInputChange('overtime_threshold', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Sécurité */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Contrôles de Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contrôle d'accès */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Accès weekend</Label>
                        <p className="text-sm text-gray-600">Autoriser le pointage les weekends</p>
                      </div>
                      <Switch
                        checked={formData.weekend_access}
                        onCheckedChange={(checked) => handleInputChange('weekend_access', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Accès jours fériés</Label>
                        <p className="text-sm text-gray-600">Autoriser le pointage les jours fériés</p>
                      </div>
                      <Switch
                        checked={formData.holiday_access}
                        onCheckedChange={(checked) => handleInputChange('holiday_access', checked)}
                      />
                    </div>
                  </div>

                  {/* Checkout automatique */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Checkout automatique</Label>
                        <p className="text-sm text-gray-600">Pointer automatiquement la sortie à une heure donnée</p>
                      </div>
                      <Switch
                        checked={formData.auto_checkout_enabled}
                        onCheckedChange={(checked) => handleInputChange('auto_checkout_enabled', checked)}
                      />
                    </div>

                    {formData.auto_checkout_enabled && (
                      <div>
                        <Label className="text-sm font-medium">Heure de checkout automatique</Label>
                        <Input
                          type="time"
                          value={formData.auto_checkout_time}
                          onChange={(e) => handleInputChange('auto_checkout_time', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Liste blanche IP */}
                  <div>
                    <Label className="text-sm font-medium">Adresses IP autorisées (optionnel)</Label>
                    <Input
                      placeholder="192.168.1.0/24, 10.0.0.1 (séparées par des virgules)"
                      value={formData.ip_whitelist}
                      onChange={(e) => handleInputChange('ip_whitelist', e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Laissez vide pour autoriser toutes les adresses IP
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Localisation */}
            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Contrôles de Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <Label className="font-medium">Géolocalisation obligatoire</Label>
                      <p className="text-sm text-gray-600">Exiger la localisation GPS pour le pointage</p>
                    </div>
                    <Switch
                      checked={formData.require_location}
                      onCheckedChange={(checked) => handleInputChange('require_location', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Rayon autorisé (mètres)</Label>
                    <Input
                      type="number"
                      min="10"
                      max="1000"
                      value={formData.location_radius}
                      onChange={(e) => handleInputChange('location_radius', parseInt(e.target.value))}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Distance maximale autorisée depuis le bureau principal
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Information</p>
                        <p className="text-blue-700">
                          La géolocalisation permet de vérifier que les employés pointent depuis 
                          des lieux autorisés et aide à détecter le télétravail.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Avancé */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-purple-600" />
                    Paramètres Avancés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gestion des pauses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Durée pause minimale (minutes)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        value={formData.minimum_break_duration}
                        onChange={(e) => handleInputChange('minimum_break_duration', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Limite pause totale (minutes)</Label>
                      <Input
                        type="number"
                        min="30"
                        max="300"
                        value={formData.break_duration_limit}
                        onChange={(e) => handleInputChange('break_duration_limit', parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Activation du système */}
                  <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                    <div>
                      <Label className="font-medium">Système actif</Label>
                      <p className="text-sm text-gray-600">Activer/désactiver toutes les règles de pointage</p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>

                  {/* Résumé des paramètres */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Résumé de la Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Pointage d'entrée:</span>
                        <span className="font-medium ml-2">{formData.check_in_start} - {formData.check_in_end}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pointage de sortie:</span>
                        <span className="font-medium ml-2">{formData.check_out_start} - {formData.check_out_end}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Heures max/jour:</span>
                        <span className="font-medium ml-2">{formData.max_work_hours}h</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Géolocalisation:</span>
                        <span className="font-medium ml-2">{formData.require_location ? 'Obligatoire' : 'Optionnelle'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex gap-2 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Settings className="w-4 h-4 mr-2" />
              Sauvegarder les Paramètres
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}