import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistant({ settings, onRecommendationApply, systemHealth }) {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'perf1',
      type: 'performance',
      title: 'Optimisation détectée',
      description: 'Activez la compression pour améliorer les temps de chargement de 23%',
      impact: 'high',
      action: () => onRecommendationApply('compression', true, 'performance_settings')
    },
    {
      id: 'ui1',
      type: 'ui',
      title: 'Expérience utilisateur',
      description: 'Réduisez le rayon des bordures pour un style plus moderne',
      impact: 'medium',
      action: () => onRecommendationApply('border_radius', 8, 'ui_preferences')
    },
    {
      id: 'sec1',
      type: 'security',
      title: 'Sécurité renforcée',
      description: 'Activez l\'authentification à deux facteurs pour tous les utilisateurs',
      impact: 'high',
      action: () => onRecommendationApply('security', true, 'modules')
    }
  ]);

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'performance': return TrendingUp;
      case 'ui': return Lightbulb;
      case 'security': return Zap;
      default: return Sparkles;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Assistant IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {recommendations.map((rec, index) => {
              const IconComponent = getRecommendationIcon(rec.type);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 bg-white rounded-lg border border-purple-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact}
                      </Badge>
                      <Button size="sm" onClick={rec.action}>
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}