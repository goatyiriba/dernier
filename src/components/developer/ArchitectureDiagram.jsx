import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Database, Globe, Shield, Monitor, Cloud } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Layers className="w-6 h-6 text-indigo-600" />
          Architecture de l'Application
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Diagramme visuel */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
          <div className="flex flex-col items-center space-y-8">
            {/* Couche Présentation */}
            <div className="w-full">
              <h4 className="text-center text-sm font-semibold text-gray-600 mb-4">COUCHE PRÉSENTATION</h4>
              <div className="flex justify-center space-x-4">
                <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4 text-center min-w-[200px]">
                  <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-blue-800">React Frontend</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Tailwind CSS + Shadcn/ui
                  </div>
                </div>
              </div>
            </div>

            {/* Flèche vers le bas */}
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-400"></div>
              <div className="text-xs text-gray-500 mt-1">HTTPS/REST</div>
            </div>

            {/* Couche API */}
            <div className="w-full">
              <h4 className="text-center text-sm font-semibold text-gray-600 mb-4">COUCHE API</h4>
              <div className="flex justify-center space-x-4">
                <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4 text-center min-w-[200px]">
                  <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-green-800">Base44 API</div>
                  <div className="text-xs text-green-600 mt-1">
                    RESTful + JWT Auth
                  </div>
                </div>
                <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 text-center min-w-[200px]">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-purple-800">Authentification</div>
                  <div className="text-xs text-purple-600 mt-1">
                    Google OAuth
                  </div>
                </div>
              </div>
            </div>

            {/* Flèche vers le bas */}
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-400"></div>
              <div className="text-xs text-gray-500 mt-1">SQL/NoSQL</div>
            </div>

            {/* Couche Données */}
            <div className="w-full">
              <h4 className="text-center text-sm font-semibold text-gray-600 mb-4">COUCHE DONNÉES</h4>
              <div className="flex justify-center space-x-4">
                <div className="bg-orange-100 border-2 border-orange-300 rounded-xl p-4 text-center min-w-[200px]">
                  <Database className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold text-orange-800">Base de Données</div>
                  <div className="text-xs text-orange-600 mt-1">
                    Entités + Relations
                  </div>
                </div>
                <div className="bg-pink-100 border-2 border-pink-300 rounded-xl p-4 text-center min-w-[200px]">
                  <Cloud className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <div className="font-semibold text-pink-800">Stockage Fichiers</div>
                  <div className="text-xs text-pink-600 mt-1">
                    Cloud Storage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Détails des composants */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Frontend (React)</h4>
            <div className="space-y-2">
              {[
                { name: "Pages", description: "25+ pages organisées par rôle", badge: "React" },
                { name: "Composants", description: "50+ composants réutilisables", badge: "Modular" },
                { name: "Routing", description: "Navigation côté client", badge: "SPA" },
                { name: "État Global", description: "Context API + Local State", badge: "State" },
                { name: "Animations", description: "Framer Motion", badge: "UX" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">{item.name}</div>
                    <div className="text-sm text-blue-700">{item.description}</div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {item.badge}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">Backend (Base44)</h4>
            <div className="space-y-2">
              {[
                { name: "API REST", description: "Endpoints CRUD automatiques", badge: "REST" },
                { name: "Auth JWT", description: "Tokens sécurisés", badge: "Security" },
                { name: "Rôles", description: "Admin/User permissions", badge: "RBAC" },
                { name: "Intégrations", description: "Email, Storage, LLM", badge: "Services" },
                { name: "Monitoring", description: "Logs et métriques", badge: "Observability" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">{item.name}</div>
                    <div className="text-sm text-green-700">{item.description}</div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {item.badge}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Flux de données */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Flux de Données Typique</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <div className="font-medium">Interaction Utilisateur</div>
                <div className="text-sm text-gray-600">Clic, formulaire, navigation...</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <div className="font-medium">Appel API via SDK</div>
                <div className="text-sm text-gray-600">Employee.list(), User.create(), etc.</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <div className="font-medium">Traitement Base44</div>
                <div className="text-sm text-gray-600">Validation, auth, logique métier</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div className="flex-1">
                <div className="font-medium">Opération Base de Données</div>
                <div className="text-sm text-gray-600">CRUD sur les entités</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
              <div className="flex-1">
                <div className="font-medium">Retour et Affichage</div>
                <div className="text-sm text-gray-600">Mise à jour de l'interface React</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}