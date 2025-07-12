import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Eye, Maximize } from "lucide-react";
import { motion } from "framer-motion";

export default function LivePreview({ settings, previewMode, onPreviewModeChange }) {
  const previewStyles = {
    '--preview-primary': settings?.primary_color || '#4F46E5',
    '--preview-secondary': settings?.secondary_color || '#059669',
    '--preview-accent': settings?.accent_color || '#DC2626',
    '--preview-background': settings?.background_color || '#F8FAFC',
    '--preview-radius': `${settings?.ui_preferences?.border_radius || 12}px`,
    '--preview-spacing': `${settings?.ui_preferences?.spacing || 16}px`
  };

  const previewContent = (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden"
      style={previewStyles}
    >
      {/* Header Preview */}
      <div 
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ backgroundColor: settings?.header_background || '#FFFFFF' }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: settings?.primary_color || '#4F46E5' }}
          >
            {settings?.app_name?.[0] || 'F'}
          </div>
          <span className="font-semibold text-sm">{settings?.app_name || 'Flow HR'}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
        </div>
      </div>

      {/* Sidebar Preview */}
      <div className="flex h-32">
        <div 
          className="w-16 p-2 border-r space-y-2"
          style={{ backgroundColor: settings?.sidebar_color || '#FFFFFF' }}
        >
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i}
              className="w-8 h-6 rounded opacity-70"
              style={{ 
                backgroundColor: i === 1 ? settings?.primary_color : '#E5E7EB',
                borderRadius: settings?.ui_preferences?.border_radius || 12
              }}
            />
          ))}
        </div>

        {/* Main Content Preview */}
        <div 
          className="flex-1 p-3 space-y-2"
          style={{ backgroundColor: settings?.background_color || '#F8FAFC' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-16 h-4 rounded"
              style={{ 
                backgroundColor: settings?.primary_color || '#4F46E5',
                borderRadius: settings?.ui_preferences?.border_radius || 12
              }}
            />
            <div 
              className="w-12 h-4 rounded opacity-60"
              style={{ 
                backgroundColor: settings?.secondary_color || '#059669',
                borderRadius: settings?.ui_preferences?.border_radius || 12
              }}
            />
          </div>
          
          {[1, 2].map(i => (
            <div 
              key={i}
              className="bg-white p-2 shadow-sm"
              style={{ borderRadius: settings?.ui_preferences?.border_radius || 12 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: settings?.accent_color || '#DC2626' }}
                />
                <div className="w-20 h-2 bg-gray-200 rounded" />
              </div>
              <div className="w-full h-1 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-500" />
            Aperçu en Temps Réel
          </CardTitle>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('desktop')}
              className="h-8 px-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('tablet')}
              className="h-8 px-2"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPreviewModeChange('mobile')}
              className="h-8 px-2"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div
          key={previewMode}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`mx-auto border-2 border-gray-300 rounded-2xl overflow-hidden ${
            previewMode === 'desktop' ? 'w-full' :
            previewMode === 'tablet' ? 'w-48' :
            'w-32'
          }`}
        >
          {previewContent}
        </motion.div>
        
        <div className="mt-4 text-center">
          <Badge variant="outline" className="text-xs">
            Aperçu {previewMode === 'desktop' ? 'Bureau' : previewMode === 'tablet' ? 'Tablette' : 'Mobile'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}