import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cloud, Server, Settings, Terminal, GitBranch, Copy, Check, AlertCircle } from "lucide-react";

export default function DeploymentGuide({ copyToClipboard, copiedCode }) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Cloud className="w-6 h-6 text-blue-600" />
            Guide de Déploiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Architecture de déploiement */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Environnements</h4>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">Production</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Live</Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Environment principal accessible aux utilisateurs finaux
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Staging</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Test</Badge>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Environment de test avant mise en production
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800">Développement</span>
                    <Badge className="bg-gray-100 text-gray-800 text-xs">Local</Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    Environment local pour le développement
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Stack de Déploiement</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-800">Base44 Platform</div>
                    <div className="text-sm text-green-600">Backend-as-a-Service</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Hébergé</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-800">React SPA</div>
                    <div className="text-sm text-blue-600">Application frontend</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">CDN</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-purple-800">Cloud Storage</div>
                    <div className="text-sm text-purple-600">Fichiers et assets</div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">AWS S3</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Setup local */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              Setup Local (Développement)
            </h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">1. Cloner le projet</h5>
                <div className="relative">
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`git clone https://github.com/votre-org/flow-hr.git
cd flow-hr
npm install`}
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`git clone https://github.com/votre-org/flow-hr.git...`, "Clone Setup")}
                    className="absolute top-2 right-2 p-1"
                    variant="ghost"
                    size="sm"
                  >
                    {copiedCode === "Clone Setup" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">2. Configuration Base44</h5>
                <div className="relative">
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`# Créer un fichier .env.local
REACT_APP_BASE44_APP_ID=votre_app_id
REACT_APP_BASE44_API_URL=https://base44.app/api
REACT_APP_ENVIRONMENT=development`}
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`# Créer un fichier .env.local...`, "Env Config")}
                    className="absolute top-2 right-2 p-1"
                    variant="ghost"
                    size="sm"
                  >
                    {copiedCode === "Env Config" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">3. Lancer l'application</h5>
                <div className="relative">
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`npm start
# L'app sera disponible sur http://localhost:3000`}
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(`npm start`, "Start Command")}
                    className="absolute top-2 right-2 p-1"
                    variant="ghost"
                    size="sm"
                  >
                    {copiedCode === "Start Command" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Variables d'environnement */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">Variables d'Environnement Requises</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left p-2 font-medium text-blue-800">Variable</th>
                    <th className="text-left p-2 font-medium text-blue-800">Description</th>
                    <th className="text-left p-2 font-medium text-blue-800">Exemple</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-200">
                  <tr>
                    <td className="p-2 font-mono text-blue-700">REACT_APP_BASE44_APP_ID</td>
                    <td className="p-2 text-blue-600">ID de l'application Base44</td>
                    <td className="p-2 text-blue-500">abc123def456</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-blue-700">REACT_APP_BASE44_API_URL</td>
                    <td className="p-2 text-blue-600">URL de l'API Base44</td>
                    <td className="p-2 text-blue-500">https://base44.app/api</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-blue-700">REACT_APP_ENVIRONMENT</td>
                    <td className="p-2 text-blue-600">Environment actuel</td>
                    <td className="p-2 text-blue-500">development/staging/production</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Déploiement production */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-green-800 mb-4">Déploiement en Production</h4>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-green-800 mb-2">1. Build de production</h5>
                  <div className="relative">
                    <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm">
{`npm run build
# Génère le dossier /build`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-green-800 mb-2">2. Déploiement Base44</h5>
                  <p className="text-sm text-green-600">
                    Le déploiement se fait automatiquement via la plateforme Base44 
                    lors du push sur la branche principale.
                  </p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Checklist Pré-Déploiement</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✅ Tests unitaires passent</li>
                  <li>✅ Build de production réussit</li>
                  <li>✅ Variables d'environnement configurées</li>
                  <li>✅ Migrations de base de données appliquées</li>
                  <li>✅ Tests d'intégration validés</li>
                  <li>✅ Sauvegarde de sécurité effectuée</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-red-50 p-6 rounded-xl border border-red-200">
            <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Troubleshooting Commun
            </h4>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-red-800">Problème : Rate limit exceeded</h5>
                <p className="text-sm text-red-600 mb-2">
                  <strong>Cause :</strong> Trop d'appels API en peu de temps
                </p>
                <p className="text-sm text-red-600">
                  <strong>Solution :</strong> Implémenter le cache API et réduire la fréquence des appels
                </p>
              </div>

              <div>
                <h5 className="font-medium text-red-800">Problème : Build fails</h5>
                <p className="text-sm text-red-600 mb-2">
                  <strong>Cause :</strong> Imports manquants ou erreurs TypeScript
                </p>
                <p className="text-sm text-red-600">
                  <strong>Solution :</strong> Vérifier les imports et corriger les erreurs dans la console
                </p>
              </div>

              <div>
                <h5 className="font-medium text-red-800">Problème : Authentication errors</h5>
                <p className="text-sm text-red-600 mb-2">
                  <strong>Cause :</strong> JWT expiré ou configuration OAuth incorrecte
                </p>
                <p className="text-sm text-red-600">
                  <strong>Solution :</strong> Vérifier la configuration Base44 et les permissions Google
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}