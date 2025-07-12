import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation, SUPPORTED_LANGUAGES } from "../utils/i18n";

export default function LanguageSwitcher({ 
  variant = "outline", 
  size = "default", 
  showLabel = true, 
  className = "" 
}) {
  const { currentLanguage, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // CORRECTION: Utilisation plus robuste avec fallback
  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.fr;

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`gap-2 ${className}`}
        >
          <span className="text-lg">{currentLangInfo.flag}</span>
          {showLabel && (
            <span className="text-sm font-medium">{currentLangInfo.code.toUpperCase()}</span>
          )}
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === lang.code ? 'bg-slate-100' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-slate-500">{lang.code.toUpperCase()}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}