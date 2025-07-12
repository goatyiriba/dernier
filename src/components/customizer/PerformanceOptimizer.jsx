import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Activity, Database, Cloud } from "lucide-react";

export default function PerformanceOptimizer({ settings, onSettingChange, systemHealth }) {
  const performanceSettings = [
    {
      key: 'lazy_loading',
      label: 'Chargement Différé',
      description: 'Charger les composants à la demande',
      category: 'performance_settings',
      impact: 'high'
    },
    {
      key: 'cache_enabled',
      label: 'Cache Intelligent',
      description: 'Mise en cache des données fréquentes',
      category: 'performance_settings',
      impact: 'high'
    },
    {
      key: 'compression',
      label: 'Compression Gzip',
      description: 'Compresser les ressources',
      category: 'performance_settings',
      impact: 'medium'
    },
    {
      key: 'cdn_enabled',
      label: 'CDN Global',
      description: 'Distribution mondiale des ressources',
      category: 'performance_settings',
      impact: 'high'
    }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Optimiseur de Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Métriques système */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Performance</Label>
              <span className="text-sm font-medium">{systemHealth.performance || 120}ms</span>
            </div>
            <Progress value={Math.max(0, 100 - (systemHealth.performance || 120) / 5)} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Mémoire</Label>
              <span className="text-sm font-medium">{systemHealth.memory || 45}%</span>
            </div>
            <Progress value={systemHealth.memory || 45} />
          </div>
        </div>

        {/* Paramètres de performance */}
        <div className="space-y-4">
          {performanceSettings.map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label>{setting.label}</Label>
                  <Badge className={getImpactColor(setting.impact)}>
                    {setting.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <Switch
                checked={settings?.[setting.category]?.[setting.key] || false}
                onCheckedChange={(checked) => onSettingChange(setting.key, checked, setting.category)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}