import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function TemplateGallery({ onApplyTemplate }) {
  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Design moderne et épuré',
      primary: '#6366F1',
      secondary: '#10B981',
      accent: '#F59E0B',
      background: '#F8FAFC',
      preview: '/api/placeholder/200/150',
      premium: false
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      description: 'Thème sombre élégant',
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#F97316',
      background: '#0F172A',
      preview: '/api/placeholder/200/150',
      premium: true
    },
    {
      id: 'nature',
      name: 'Nature',
      description: 'Couleurs naturelles apaisantes',
      primary: '#059669',
      secondary: '#84CC16',
      accent: '#F59E0B',
      background: '#F0FDF4',
      preview: '/api/placeholder/200/150',
      premium: false
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-500" />
          Galerie de Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onApplyTemplate(template)}
            >
              <Card className="hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: template.accent }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{template.name}</h3>
                    {template.premium && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Appliquer
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}