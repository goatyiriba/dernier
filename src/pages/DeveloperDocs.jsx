import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code2, 
  Database, 
  Shield, 
  Cloud, 
  FileText, 
  Monitor, 
  Settings, 
  Book,
  Copy,
  Check,
  Terminal,
  Layers,
  Lock,
  Globe,
  HardDrive,
  Smartphone,
  Zap,
  GitBranch,
  Package,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

import ArchitectureDiagram from "../components/developer/ArchitectureDiagram";
import DatabaseSchema from "../components/developer/DatabaseSchema";
import APIDocumentation from "../components/developer/APIDocumentation";
import SecurityOverview from "../components/developer/SecurityOverview";
import DeploymentGuide from "../components/developer/DeploymentGuide";
import ComponentsGuide from "../components/developer/ComponentsGuide";
import TechnicalGlossary from "../components/developer/TechnicalGlossary";
import SelfHostingGuide from "../components/developer/SelfHostingGuide";
import DataManagementAnalysis from "../components/developer/DataManagementAnalysis";
import RunCodeEditor from "../components/developer/RunCodeEditor";

export default function DeveloperDocs() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedCode, setCopiedCode] = useState("");
  const { toast } = useToast();

  const copyToClipboard = async (text, label = "Code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(label);
      setTimeout(() => setCopiedCode(""), 2000);
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive"
      });
    }
  };

  const tabsData = [
    { id: "overview", label: "Vue d'ensemble", icon: Monitor },
    { id: "run", label: "Run - Éditeur", icon: Code2 },
    { id: "architecture", label: "Architecture", icon: Layers },
    { id: "database", label: "Base de données", icon: Database },
    { id: "api", label: "API & Endpoints", icon: Globe },
    { id: "auth", label: "Authentification", icon: Shield },
    { id: "frontend", label: "Frontend", icon: Code2 },
    { id: "storage", label: "Stockage", icon: HardDrive },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "deployment", label: "Déploiement", icon: Cloud },
    { id: "self-hosting", label: "Self-Hosting", icon: Terminal },
    { id: "data-management", label: "Data Management", icon: BarChart3 },
    { id: "glossary", label: "Glossaire", icon: Book }
  ];

  const stackTechnologies = [
    {
      category: "Frontend",
      technologies: [
        { name: "React 18", description: "Framework principal", version: "18.2.0" },
        { name: "Tailwind CSS", description: "Framework CSS utilitaire", version: "3.4.0" },
        { name: "Shadcn/ui", description: "Composants UI", version: "latest" },
        { name: "Lucide React", description: "Icônes", version: "0.263.1" },
        { name: "Framer Motion", description: "Animations", version: "10.16.4" },
        { name: "React Router", description: "Routage", version: "6.8.0" },
        { name: "Date-fns", description: "Manipulation de dates", version: "2.30.0" },
        { name: "Recharts", description: "Graphiques", version: "2.8.0" }
      ]
    },
    {
      category: "Backend & Infrastructure",
      technologies: [
        { name: "Base44 Platform", description: "Backend-as-a-Service", version: "latest" },
        { name: "RESTful API", description: "Architecture API", version: "stable" },
        { name: "JWT Authentication", description: "Authentification", version: "secure" },
        { name: "File Storage", description: "Stockage de fichiers", version: "cloud" }
      ]
    },
    {
      category: "Développement",
      technologies: [
        { name: "Vite", description: "Build tool", version: "4.4.0" },
        { name: "ESLint", description: "Linting", version: "8.45.0" },
        { name: "Prettier", description: "Formatage de code", version: "3.0.0" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Documentation Développeur
              </h1>
              <p className="text-xl text-purple-100 font-medium mb-4">
                Guide technique complet pour comprendre et maintenir Flow HR
              </p>
              <div className="flex items-center gap-6 text-sm text-purple-100">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  <span>React + Tailwind CSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Base44 Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>JWT Auth</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 justify-center">
                <GitBranch className="w-4 h-4 mr-2" />
                Version 1.0.0
              </Badge>
              <Badge className="bg-green-500/20 text-green-100 border-green-300/30 px-4 py-2 justify-center">
                <Zap className="w-4 h-4 mr-2" />
                Production Ready
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Navigation par onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-13 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-auto p-2 rounded-2xl overflow-x-auto">
              {tabsData.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="flex flex-col items-center gap-1 rounded-xl font-medium text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white p-3 min-w-0"
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate w-full text-center">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6 mt-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Monitor className="w-6 h-6 text-indigo-600" />
                    Vue d'ensemble de Flow HR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">À propos du projet</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Flow HR est une application complète de gestion des ressources humaines construite avec React et la plateforme Base44. 
                      Elle offre une interface moderne pour gérer les employés, les congés, les évaluations de performance, 
                      les finances et bien plus encore.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Fonctionnalités principales</h4>
                      <ul className="space-y-2">
                        {[
                          "Gestion des employés et profils",
                          "Système de pointage avec géolocalisation",
                          "Gestion des congés et approbations",
                          "Évaluations de performance anonymes",
                          "Module financier multi-devises",
                          "Système d'annonces et notifications",
                          "Gestion de documents",
                          "Monitoring système en temps réel"
                        ].map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Métriques du projet</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-blue-600">25+</div>
                          <div className="text-sm text-blue-800">Pages/Composants</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-green-600">15+</div>
                          <div className="text-sm text-green-800">Entités DB</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-purple-600">50+</div>
                          <div className="text-sm text-purple-800">Endpoints API</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-xl">
                          <div className="text-2xl font-bold text-amber-600">100%</div>
                          <div className="text-sm text-amber-800">TypeScript Ready</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stack technologique */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Package className="w-6 h-6 text-purple-600" />
                    Stack Technologique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {stackTechnologies.map((category, index) => (
                      <div key={index} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          {category.category}
                        </h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.technologies.map((tech, techIndex) => (
                            <div key={techIndex} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-gray-900">{tech.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {tech.version}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{tech.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Section Run - Éditeur de code */}
            <TabsContent value="run" className="space-y-6 mt-8">
              <RunCodeEditor copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Architecture */}
            <TabsContent value="architecture" className="space-y-6 mt-8">
              <ArchitectureDiagram />
            </TabsContent>

            {/* Base de données */}
            <TabsContent value="database" className="space-y-6 mt-8">
              <DatabaseSchema copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* API */}
            <TabsContent value="api" className="space-y-6 mt-8">
              <APIDocumentation copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Authentification */}
            <TabsContent value="auth" className="space-y-6 mt-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Shield className="w-6 h-6 text-green-600" />
                    Système d'Authentification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Documentation complète du système d'authentification JWT avec Google OAuth et gestion des rôles.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Frontend */}
            <TabsContent value="frontend" className="space-y-6 mt-8">
              <ComponentsGuide copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Stockage */}
            <TabsContent value="storage" className="space-y-6 mt-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <HardDrive className="w-6 h-6 text-blue-600" />
                    Gestion du Stockage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Documentation sur la gestion des fichiers, le stockage cloud et le cache local.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security" className="space-y-6 mt-8">
              <SecurityOverview copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Déploiement */}
            <TabsContent value="deployment" className="space-y-6 mt-8">
              <DeploymentGuide copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Self-Hosting */}
            <TabsContent value="self-hosting" className="space-y-6 mt-8">
              <SelfHostingGuide copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Data Management */}
            <TabsContent value="data-management" className="space-y-6 mt-8">
              <DataManagementAnalysis copyToClipboard={copyToClipboard} copiedCode={copiedCode} />
            </TabsContent>

            {/* Glossaire */}
            <TabsContent value="glossary" className="space-y-6 mt-8">
              <TechnicalGlossary />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}