import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Book, Search, Code, Database, Shield, Cloud, Zap } from "lucide-react";

export default function TechnicalGlossary() {
  const [searchTerm, setSearchTerm] = useState("");

  const glossaryTerms = [
    {
      term: "Base44",
      category: "Platform",
      definition: "Backend-as-a-Service (BaaS) qui fournit l'API, la base de données, l'authentification et les intégrations pour Flow HR.",
      icon: Cloud,
      color: "blue"
    },
    {
      term: "JWT (JSON Web Token)",
      category: "Security",
      definition: "Standard de sécurité pour transmettre des informations de manière sécurisée entre parties. Utilisé pour l'authentification des utilisateurs.",
      icon: Shield,
      color: "green"
    },
    {
      term: "CRUD",
      category: "API",
      definition: "Create, Read, Update, Delete - Les quatre opérations de base sur les données. Chaque entité a des endpoints CRUD automatiques.",
      icon: Database,
      color: "purple"
    },
    {
      term: "Entity",
      category: "Database",
      definition: "Structure de données définie par un schéma JSON qui représente un objet métier (Employee, TimeEntry, etc.).",
      icon: Database,
      color: "orange"
    },
    {
      term: "React Hook",
      category: "Frontend",
      definition: "Fonctions qui permettent d'utiliser l'état et d'autres fonctionnalités React dans les composants fonctionnels (useState, useEffect, etc.).",
      icon: Code,
      color: "blue"
    },
    {
      term: "Tailwind CSS",
      category: "Frontend",
      definition: "Framework CSS utilitaire qui permet de styler rapidement avec des classes prédéfinies (bg-blue-500, p-4, etc.).",
      icon: Code,
      color: "cyan"
    },
    {
      term: "Shadcn/ui",
      category: "Frontend",
      definition: "Collection de composants UI réutilisables construits avec Radix UI et stylés avec Tailwind CSS.",
      icon: Code,
      color: "indigo"
    },
    {
      term: "Rate Limiting",
      category: "Security",
      definition: "Mécanisme qui limite le nombre de requêtes API qu'un utilisateur peut faire dans un certain laps de temps.",
      icon: Shield,
      color: "red"
    },
    {
      term: "OAuth",
      category: "Security",
      definition: "Protocole d'autorisation qui permet aux utilisateurs de se connecter via des services tiers (Google) sans partager leur mot de passe.",
      icon: Shield,
      color: "green"
    },
    {
      term: "SPA (Single Page Application)",
      category: "Frontend",
      definition: "Application web qui charge une seule page HTML et met à jour dynamiquement le contenu sans rechargement de page.",
      icon: Code,
      color: "blue"
    },
    {
      term: "API Endpoint",
      category: "API",
      definition: "Point d'accès spécifique d'une API (ex: GET /api/employees) qui permet d'effectuer une opération sur des données.",
      icon: Zap,
      color: "yellow"
    },
    {
      term: "Responsive Design",
      category: "Frontend",
      definition: "Approche de conception qui permet à l'interface de s'adapter automatiquement à différentes tailles d'écran (mobile, tablette, desktop).",
      icon: Code,
      color: "pink"
    },
    {
      term: "Component",
      category: "Frontend",
      definition: "Bloc de code React réutilisable qui encapsule la logique et l'interface utilisateur d'une partie de l'application.",
      icon: Code,
      color: "green"
    },
    {
      term: "Props",
      category: "Frontend",
      definition: "Propriétés passées d'un composant parent à un composant enfant pour transmettre des données et fonctions.",
      icon: Code,
      color: "blue"
    },
    {
      term: "State",
      category: "Frontend",
      definition: "Données locales d'un composant qui peuvent changer au fil du temps et déclenchent un re-rendu quand elles sont modifiées.",
      icon: Code,
      color: "purple"
    },
    {
      term: "RBAC (Role-Based Access Control)",
      category: "Security",
      definition: "Système de contrôle d'accès basé sur les rôles utilisateurs (admin, employee) qui détermine les permissions.",
      icon: Shield,
      color: "red"
    },
    {
      term: "Cache",
      category: "Performance",
      definition: "Mécanisme de stockage temporaire qui améliore les performances en évitant les appels API répétés.",
      icon: Zap,
      color: "orange"
    }
  ];

  const categories = ["All", "Frontend", "Database", "API", "Security", "Platform", "Performance"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      Frontend: "bg-blue-100 text-blue-800",
      Database: "bg-orange-100 text-orange-800",
      API: "bg-purple-100 text-purple-800",
      Security: "bg-red-100 text-red-800",
      Platform: "bg-green-100 text-green-800",
      Performance: "bg-yellow-100 text-yellow-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getIconColor = (color) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600",
      red: "text-red-600",
      yellow: "text-yellow-600",
      cyan: "text-cyan-600",
      indigo: "text-indigo-600",
      pink: "text-pink-600"
    };
    return colors[color] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Book className="w-6 h-6 text-indigo-600" />
            Glossaire Technique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un terme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-blue-600">{glossaryTerms.length}</div>
              <div className="text-sm text-blue-700">Termes Total</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
              <div className="text-sm text-green-700">Catégories</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredTerms.length}</div>
              <div className="text-sm text-purple-700">Résultats</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-orange-600">100%</div>
              <div className="text-sm text-orange-700">Coverage</div>
            </div>
          </div>

          {/* Liste des termes */}
          <div className="grid gap-4">
            {filteredTerms.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${getIconColor(item.color)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.term}</h3>
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{item.definition}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun terme trouvé</h3>
              <p className="text-gray-500">Essayez de modifier votre recherche ou sélectionner une autre catégorie.</p>
            </div>
          )}

          {/* FAQ Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-800">Questions Fréquentes (FAQ)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Comment ajouter une nouvelle entité ?</h4>
                <p className="text-sm text-indigo-700">
                  Créez un fichier JSON dans le dossier <code>/entities/</code> avec le schéma approprié. 
                  L'entité sera automatiquement disponible via le SDK.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Que faire en cas d'erreur Rate Limit ?</h4>
                <p className="text-sm text-indigo-700">
                  Implémentez le système de cache API (voir <code>components/utils/apiCache.js</code>) 
                  et réduisez la fréquence des appels.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Comment débugger un problème d'authentification ?</h4>
                <p className="text-sm text-indigo-700">
                  Vérifiez les tokens JWT dans le localStorage, les permissions utilisateur, 
                  et la configuration Google OAuth dans Base44.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-800 mb-2">Comment ajouter une nouvelle page ?</h4>
                <p className="text-sm text-indigo-700">
                  Créez le fichier dans <code>/pages/</code>, ajoutez la route dans le Layout.js, 
                  et implémentez les vérifications de permissions appropriées.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}