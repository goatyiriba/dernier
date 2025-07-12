import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Code, Download, Upload, RefreshCw } from "lucide-react";

export default function AdvancedSettings({ settings, customCss, onCssChange, onSettingChange }) {
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'platform-settings.json';
    link.click();
  };

  const handleImportSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          // Apply imported settings
          Object.keys(importedSettings).forEach(key => {
            onSettingChange(key, importedSettings[key]);
          });
        } catch (error) {
          console.error('Error importing settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-indigo-500" />
          Paramètres Avancés
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CSS Personnalisé */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>CSS Personnalisé</Label>
              <p className="text-sm text-gray-500">Ajouter des styles personnalisés</p>
            </div>
            <Switch
              checked={settings?.enable_custom_css || false}
              onCheckedChange={(checked) => onSettingChange('enable_custom_css', checked)}
            />
          </div>

          {settings?.enable_custom_css && (
            <div className="space-y-2">
              <Textarea
                value={customCss}
                onChange={(e) => onCssChange(e.target.value)}
                placeholder="/* Votre CSS personnalisé ici */"
                className="h-40 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Utilisez des variables CSS comme --primary-color, --secondary-color, etc.
              </p>
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className="space-y-4">
          <Label>Sauvegarde et Restauration</Label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Exporter Config
            </Button>
            <div className="flex-1">
              <Input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
                id="import-settings"
              />
              <Button variant="outline" className="w-full" asChild>
                <label htmlFor="import-settings" className="cursor-pointer flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Importer Config
                </label>
              </Button>
            </div>
          </div>
        </div>

        {/* Réinitialisation */}
        <div className="pt-4 border-t">
          <Button variant="destructive" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser aux Défauts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}