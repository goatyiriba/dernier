import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

export default function ColorPicker({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const presetColors = [
    '#4F46E5', '#7C3AED', '#DC2626', '#059669', '#D97706', '#0891B2',
    '#BE123C', '#9333EA', '#C2410C', '#0D9488', '#CA8A04', '#0284C7'
  ];

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="pr-12"
          />
          <div 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-md border-2 border-gray-300"
            style={{ backgroundColor: value || '#000000' }}
          />
        </div>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Couleurs prédéfinies</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {presetColors.map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-md border-2 border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        onChange(color);
                        setIsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Sélecteur de couleur</Label>
                <input
                  type="color"
                  value={value || '#000000'}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}