import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Code, Key, Send, Copy, Check, Database, Zap } from "lucide-react";
import { Employee, AuthService, TimeEntry } from "@/api/supabaseEntities";

export default function APIDocumentation({ copyToClipboard, copiedCode }) {
  const [selectedCategory, setSelectedCategory] = useState("crud");

  const apiCategories = {
    crud: {
      title: "CRUD Operations",
      description: "Opérations de base sur les entités",
      endpoints: [
        {
          method: "GET",
          path: "/api/apps/{app_id}/entities/{Entity}",
          description: "Lister les entités",
          example: "Employee.list('-created_date', 20)",
          response: `[
  {
    "id": "emp_123",
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@company.com",
    "department": "Engineering",
    "status": "Active",
    "created_date": "2024-01-15T10:30:00Z"
  }
]`
        },
        {
          method: "POST",
          path: "/api/apps/{app_id}/entities/{Entity}",
          description: "Créer une nouvelle entité",
          example: "Employee.create({first_name: 'Jean', last_name: 'Dupont', email: 'jean@company.com'})",
          response: `{
  "id": "emp_124",
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@company.com",
  "created_date": "2024-01-16T14:20:00Z"
}`
        },
        {
          method: "PUT",
          path: "/api/apps/{app_id}/entities/{Entity}/{id}",
          description: "Mettre à jour une entité",
          example: "Employee.update('emp_123', {department: 'Marketing'})",
          response: `{
  "id": "emp_123",
  "department": "Marketing",
  "updated_date": "2024-01-16T15:45:00Z"
}`
        },
        {
          method: "DELETE",
          path: "/api/apps/{app_id}/entities/{Entity}/{id}",
          description: "Supprimer une entité",
          example: "Employee.delete('emp_123')",
          response: `{
  "success": true,
  "message": "Entity deleted successfully"
}`
        }
      ]
    },
    filter: {
      title: "Filtrage & Recherche",
      description: "Opérations de filtrage avancées",
      endpoints: [
        {
          method: "POST",
          path: "/api/apps/{app_id}/entities/{Entity}/filter",
          description: "Filtrer les entités",
          example: "Employee.filter({department: 'Engineering', status: 'Active'}, '-created_date', 10)",
          response: `[
  {
    "id": "emp_125",
    "first_name": "Alice",
    "department": "Engineering",
    "status": "Active"
  }
]`
        },
        {
          method: "POST",
          path: "/api/apps/{app_id}/entities/{Entity}/search",
          description: "Recherche textuelle",
          example: "Employee.search('Jean Dupont')",
          response: `[
  {
    "id": "emp_123",
    "first_name": "Jean",
    "last_name": "Dupont",
    "relevance": 0.95
  }
]`
        }
      ]
    },
    integrations: {
      title: "Intégrations",
      description: "Services externes et intégrations",
      endpoints: [
        {
          method: "POST",
          path: "/api/integrations/Core/InvokeLLM",
          description: "Appeler un modèle de langage",
          example: `InvokeLLM({
  prompt: "Analyser cette donnée RH",
  add_context_from_internet: false,
  response_json_schema: {
    type: "object",
    properties: {
      analysis: {type: "string"},
      recommendations: {type: "array", items: {type: "string"}}
    }
  }
})`,
          response: `{
  "analysis": "Les données montrent...",
  "recommendations": ["Améliorer...", "Optimiser..."]
}`
        },
        {
          method: "POST",
          path: "/api/integrations/Core/UploadFile",
          description: "Upload de fichier",
          example: `UploadFile({file: fileObject})`,
          response: `{
  "file_url": "https://storage.base44.app/files/doc_123.pdf"
}`
        },
        {
          method: "POST",
          path: "/api/integrations/Core/SendEmail",
          description: "Envoi d'email",
          example: `SendEmail({
  to: "employee@company.com",
  subject: "Notification RH",
  body: "Votre demande a été approuvée"
})`,
          response: `{
  "success": true,
  "message_id": "msg_456"
}`
        }
      ]
    },
    auth: {
      title: "Authentification",
      description: "Gestion de l'authentification et des utilisateurs",
      endpoints: [
        {
          method: "GET",
          path: "/api/auth/me",
          description: "Récupérer l'utilisateur actuel",
          example: "User.me()",
          response: `{
  "id": "user_789",
  "email": "admin@company.com",
  "full_name": "Admin User",
  "role": "admin",
  "is_active": true,
  "employee_id": "emp_123"
}`
        },
        {
          method: "POST",
          path: "/api/auth/login",
          description: "Connexion utilisateur",
          example: "User.login()",
          response: "Redirection vers Google OAuth"
        },
        {
          method: "POST",
          path: "/api/auth/logout",
          description: "Déconnexion utilisateur",
          example: "User.logout()",
          response: `{
  "success": true,
  "message": "Logged out successfully"
}`
        }
      ]
    }
  };

  const getMethodBadge = (method) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800"
    };
    return <Badge className={`${colors[method]} font-mono text-xs`}>{method}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Globe className="w-6 h-6 text-green-600" />
            Documentation API
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Vue d'ensemble */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-700">REST API</div>
                  <div className="text-sm text-green-600">Architecture standard</div>
                </div>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Endpoints CRUD automatiques</li>
                <li>• Authentification JWT</li>
                <li>• Validation automatique</li>
                <li>• Rate limiting intégré</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-700">SDK Intégré</div>
                  <div className="text-sm text-blue-600">Pas de fetch manuel</div>
                </div>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Import direct des entités</li>
                <li>• Méthodes typées</li>
                <li>• Gestion d'erreurs automatique</li>
                <li>• Cache et optimisations</li>
              </ul>
            </div>
          </div>

          {/* Configuration API */}
          <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Configuration API
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Base URL</div>
                <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                  https://base44.app/api/apps/{"{app_id}"}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Headers Requis</div>
                <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
                  Authorization: Bearer {"{jwt_token}"}
                  <br />
                  Content-Type: application/json
                </div>
              </div>
            </div>
          </div>

          {/* Navigation par catégories */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
              {Object.entries(apiCategories).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(apiCategories).map(([categoryKey, category]) => (
              <TabsContent key={categoryKey} value={categoryKey} className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                <div className="space-y-6">
                  {category.endpoints.map((endpoint, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getMethodBadge(endpoint.method)}
                            <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {endpoint.path}
                            </code>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(endpoint.example, `${endpoint.method} Example`)}
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === `${endpoint.method} Example` ? 
                              <Check className="w-4 h-4 text-green-500" /> : 
                              <Copy className="w-4 h-4" />
                            }
                          </Button>
                        </div>
                        <p className="text-gray-600">{endpoint.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Exemple d'utilisation */}
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Code className="w-4 h-4" />
                              Exemple SDK
                            </div>
                            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                              {endpoint.example}
                            </pre>
                          </div>

                          {/* Réponse */}
                          <div>
                            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Send className="w-4 h-4" />
                              Réponse
                            </div>
                            <pre className="bg-gray-800 text-blue-400 p-4 rounded-lg text-sm overflow-x-auto">
                              {endpoint.response}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* SDK Usage Examples */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Code className="w-5 h-5 text-purple-600" />
                Exemples d'Utilisation SDK
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Import et Utilisation de Base</h4>
                  <div className="relative">
                    <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Import des entités
import { Employee, AuthService, TimeEntry } from "@/api/supabaseEntities";

// Utilisation basique
const employees = await Employee.list();
const activeEmployees = await Employee.filter({
  status: "Active"
});

// Création
const newEmployee = await Employee.create({
  first_name: "Marie",
  last_name: "Martin",
  email: "marie@company.com",
  department: "Marketing"
});`}
                    </pre>
                    <Button
                      onClick={() => copyToClipboard(`// Import des entités...`, "SDK Basic")}
                      className="absolute top-2 right-2 p-2"
                      variant="ghost"
                      size="sm"
                    >
                      {copiedCode === "SDK Basic" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Gestion d'Erreurs</h4>
                  <div className="relative">
                    <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Gestion des erreurs
try {
  const employee = await Employee.create({
    first_name: "Test",
    email: "invalid-email" // Erreur de validation
  });
} catch (error) {
  if (error.message.includes('400')) {
    // Erreur de validation
    console.log("Données invalides");
  } else if (error.message.includes('429')) {
    // Rate limit
    console.log("Trop de requêtes");
  }
}`}
                    </pre>
                    <Button
                      onClick={() => copyToClipboard(`// Gestion des erreurs...`, "Error Handling")}
                      className="absolute top-2 right-2 p-2"
                      variant="ghost"
                      size="sm"
                    >
                      {copiedCode === "Error Handling" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <h5 className="font-semibold text-amber-800 mb-2">⚠️ Bonnes Pratiques</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Toujours gérer les erreurs avec try/catch</li>
                  <li>• Utiliser le cache API pour éviter les appels répétés</li>
                  <li>• Respecter les limites de taux (rate limiting)</li>
                  <li>• Valider les données côté client avant envoi</li>
                  <li>• Utiliser les filtres plutôt que charger toutes les données</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}