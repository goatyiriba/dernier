
import React, { useState, useEffect } from "react";
import { AppSettings } from "@/api/supabaseEntities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Palette,
  Upload,
  Save,
  Eye,
  Settings,
  Image,
  Type,
  Phone,
  Mail,
  MapPin,
  Monitor,
  Smartphone,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import SupabaseManager from '../components/admin/SupabaseManager';

export default function BrandingSettings() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    app_name: "Flow HR",
    app_description: "Système de gestion des ressources humaines",
    company_name: "Mon Entreprise",
    logo_url: "",
    favicon_url: "",
    primary_color: "#4F46E5",
    secondary_color: "#059669",
    accent_color: "#DC2626",
    background_color: "#F8FAFC",
    text_color: "#1E293B",
    sidebar_color: "#FFFFFF",
    header_background: "#FFFFFF",
    enable_dark_mode: false,
    enable_custom_css: false,
    custom_css: "",
    footer_text: "© 2024 Mon Entreprise. Tous droits réservés.",
    contact_email: "",
    contact_phone: "",
    address: "",
    social_linkedin: "",
    social_twitter: "",
    social_facebook: "",
    welcome_message: "Bienvenue dans votre espace RH !",
    login_background: "",
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [loginBgFile, setLoginBgFile] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // State to manage active tab
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settingsList = await AppSettings.getAll();
      let currentSettings = settingsList.find(s => s.is_active);
      
      if (!currentSettings && settingsList.length > 0) {
        currentSettings = settingsList[0];
      }
      
      if (currentSettings) {
        setSettings(currentSettings);
        setFormData({ ...formData, ...currentSettings });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres de branding.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (file, field) => {
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange(field, file_url);
      toast({
        title: "Succès",
        description: "Fichier uploadé avec succès !",
      });
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (settings) {
        await AppSettings.update(settings.id, formData);
      } else {
        const newSettings = await AppSettings.create(formData);
        setSettings(newSettings);
      }
      
      toast({
        title: "Succès",
        description: "Paramètres de branding sauvegardés !",
      });
      
      // Apply changes immediately
      applyBrandingToApp();
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const applyBrandingToApp = () => {
    // Apply CSS variables for immediate preview
    const root = document.documentElement;
    root.style.setProperty('--primary-color', formData.primary_color);
    root.style.setProperty('--secondary-color', formData.secondary_color);
    root.style.setProperty('--accent-color', formData.accent_color);
    root.style.setProperty('--background-color', formData.background_color);
    root.style.setProperty('--text-color', formData.text_color);
    root.style.setProperty('--sidebar-color', formData.sidebar_color);
    root.style.setProperty('--header-background', formData.header_background);
    
    if (formData.enable_custom_css && formData.custom_css) {
      let customStyleElement = document.getElementById('custom-branding-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-branding-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = formData.custom_css;
    }
  };

  const resetToDefaults = () => {
    setFormData({
      app_name: "Flow HR",
      app_description: "Système de gestion des ressources humaines",
      company_name: "Mon Entreprise",
      logo_url: "",
      favicon_url: "",
      primary_color: "#4F46E5",
      secondary_color: "#059669",
      accent_color: "#DC2626",
      background_color: "#F8FAFC",
      text_color: "#1E293B",
      sidebar_color: "#FFFFFF",
      header_background: "#FFFFFF",
      enable_dark_mode: false,
      enable_custom_css: false,
      custom_css: "",
      footer_text: "© 2024 Mon Entreprise. Tous droits réservés.",
      contact_email: "",
      contact_phone: "",
      address: "",
      social_linkedin: "",
      social_twitter: "",
      social_facebook: "",
      welcome_message: "Bienvenue dans votre espace RH !",
      login_background: "",
      is_active: true
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              Paramètres de Branding
            </h1>
            <p className="text-slate-600">
              Personnalisez l'apparence et l'identité de votre application RH
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={resetToDefaults} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={() => setPreviewMode(!previewMode)} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? "Édition" : "Aperçu"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </div>

        {/* Preview Mode Banner */}
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500 text-white p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Mode Aperçu Activé</span>
              <Badge variant="secondary">Les changements sont appliqués temporairement</Badge>
            </div>
            <Button onClick={() => setPreviewMode(false)} variant="secondary" size="sm">
              Retour à l'édition
            </Button>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-2" />
              Couleurs
            </TabsTrigger>
            <TabsTrigger value="logo">
              <Image className="w-4 h-4 mr-2" />
              Logos & Images
            </TabsTrigger>
            <TabsTrigger value="typography">
              <Type className="w-4 h-4 mr-2" />
              Typographie
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Smartphone className="w-4 h-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Monitor className="w-4 h-4 mr-2" />
              Avancé
            </TabsTrigger>
            <TabsTrigger value="backup">
              <Save className="w-4 h-4 mr-2" />
              Sauvegarde
            </TabsTrigger>
            <TabsTrigger value="supabase">
              <Monitor className="w-4 h-4 mr-2" />
              Supabase
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="app_name">Nom de l'Application</Label>
                    <Input
                      id="app_name"
                      value={formData.app_name}
                      onChange={(e) => handleInputChange('app_name', e.target.value)}
                      placeholder="Flow HR"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nom de l'Entreprise</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      placeholder="Mon Entreprise"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="app_description">Description de l'Application</Label>
                  <Textarea
                    id="app_description"
                    value={formData.app_description}
                    onChange={(e) => handleInputChange('app_description', e.target.value)}
                    placeholder="Système de gestion des ressources humaines"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="welcome_message">Message de Bienvenue</Label>
                  <Input
                    id="welcome_message"
                    value={formData.welcome_message}
                    onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                    placeholder="Bienvenue dans votre espace RH !"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer_text">Texte du Footer</Label>
                  <Input
                    id="footer_text"
                    value={formData.footer_text}
                    onChange={(e) => handleInputChange('footer_text', e.target.value)}
                    placeholder="© 2024 Mon Entreprise. Tous droits réservés."
                  />
                </div>

                {/* Contact information, moved here as per new tab structure */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      Informations de Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Email de Contact</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          placeholder="contact@monentreprise.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Téléphone</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          placeholder="+33 1 23 45 67 89"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Rue de la Paix, 75001 Paris, France"
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="social_linkedin">LinkedIn</Label>
                        <Input
                          id="social_linkedin"
                          value={formData.social_linkedin}
                          onChange={(e) => handleInputChange('social_linkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_twitter">Twitter</Label>
                        <Input
                          id="social_twitter"
                          value={formData.social_twitter}
                          onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="social_facebook">Facebook</Label>
                        <Input
                          id="social_facebook"
                          value={formData.social_facebook}
                          onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </CardContent>
            </Card>
          </TabsContent>

          {/* Logos & Images (formerly "branding") */}
          <TabsContent value="logo" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Logos et Images
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Logo Principal */}
                  <div className="space-y-4">
                    <Label>Logo Principal</Label>
                    {formData.logo_url && (
                      <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setLogoFile(file);
                            handleFileUpload(file, 'logo_url');
                          }
                        }}
                        className="text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="space-y-4">
                    <Label>Favicon</Label>
                    {formData.favicon_url && (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <img 
                          src={formData.favicon_url} 
                          alt="Favicon" 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFaviconFile(file);
                            handleFileUpload(file, 'favicon_url');
                          }
                        }}
                        className="text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image de fond de connexion */}
                  <div className="space-y-4">
                    <Label>Fond de Connexion</Label>
                    {formData.login_background && (
                      <div className="w-32 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <img 
                          src={formData.login_background} 
                          alt="Login Background" 
                          className="max-w-full max-h-full object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setLoginBgFile(file);
                            handleFileUpload(file, 'login_background');
                          }
                        }}
                        className="text-sm"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Palette de Couleurs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Couleur Primaire</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary_color"
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        placeholder="#4F46E5"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Couleur Secondaire</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_color"
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        placeholder="#059669"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent_color">Couleur d'Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent_color"
                        type="color"
                        value={formData.accent_color}
                        onChange={(e) => handleInputChange('accent_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.accent_color}
                        onChange={(e) => handleInputChange('accent_color', e.target.value)}
                        placeholder="#DC2626"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background_color">Couleur de Fond</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background_color"
                        type="color"
                        value={formData.background_color}
                        onChange={(e) => handleInputChange('background_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.background_color}
                        onChange={(e) => handleInputChange('background_color', e.target.value)}
                        placeholder="#F8FAFC"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sidebar_color">Couleur Sidebar</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sidebar_color"
                        type="color"
                        value={formData.sidebar_color}
                        onChange={(e) => handleInputChange('sidebar_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.sidebar_color}
                        onChange={(e) => handleInputChange('sidebar_color', e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_color">Couleur du Texte</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text_color"
                        type="color"
                        value={formData.text_color}
                        onChange={(e) => handleInputChange('text_color', e.target.value)}
                        className="w-16 h-10 p-1 border-2"
                      />
                      <Input
                        value={formData.text_color}
                        onChange={(e) => handleInputChange('text_color', e.target.value)}
                        placeholder="#1E293B"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={applyBrandingToApp} 
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Prévisualiser les Couleurs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Typography */}
          <TabsContent value="typography" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Paramètres de Typographie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add typography settings here later */}
                <p className="text-gray-500">
                  Les paramètres de typographie seront ajoutés prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout */}
          <TabsContent value="layout" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Paramètres de Layout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add layout settings here later */}
                <p className="text-gray-500">
                  Les paramètres de mise en page seront ajoutés prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Paramètres Avancés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Mode Sombre</Label>
                    <p className="text-sm text-gray-500">Activer le thème sombre pour l'application</p>
                  </div>
                  <Switch
                    checked={formData.enable_dark_mode}
                    onCheckedChange={(checked) => handleInputChange('enable_dark_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>CSS Personnalisé</Label>
                    <p className="text-sm text-gray-500">Activer les styles CSS personnalisés</p>
                  </div>
                  <Switch
                    checked={formData.enable_custom_css}
                    onCheckedChange={(checked) => handleInputChange('enable_custom_css', checked)}
                  />
                </div>

                {formData.enable_custom_css && (
                  <div className="space-y-2">
                    <Label htmlFor="custom_css">CSS Personnalisé</Label>
                    <Textarea
                      id="custom_css"
                      value={formData.custom_css}
                      onChange={(e) => handleInputChange('custom_css', e.target.value)}
                      placeholder="/* Votre CSS personnalisé ici */"
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Utilisez des variables CSS comme --primary-color, --secondary-color, etc.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup */}
          <TabsContent value="backup" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Paramètres de Sauvegarde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add backup settings here later */}
                <p className="text-gray-500">
                  Les options de sauvegarde seront ajoutées prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nouvel onglet Supabase */}
          <TabsContent value="supabase" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Synchronisation avec Supabase</h3>
                <p className="text-gray-600">
                  Synchronisez vos données et paramètres avec Supabase pour la sauvegarde et la réplication.
                </p>
              </div>
              <SupabaseManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
