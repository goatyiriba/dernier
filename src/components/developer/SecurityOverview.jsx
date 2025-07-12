import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Key, AlertTriangle, CheckCircle, Copy, Check } from "lucide-react";

export default function SecurityOverview({ copyToClipboard, copiedCode }) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Shield className="w-6 h-6 text-red-600" />
            Vue d'ensemble de la Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mesures de sécurité */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Authentification & Autorisation</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">JWT Tokens</div>
                    <div className="text-sm text-green-600">Authentification sécurisée via Base44</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">Google OAuth</div>
                    <div className="text-sm text-green-600">Connexion via compte Google sécurisé</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-800">RBAC (Role-Based Access)</div>
                    <div className="text-sm text-green-600">Contrôle d'accès basé sur les rôles</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Protection des Données</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">Chiffrement HTTPS</div>
                    <div className="text-sm text-blue-600">Communication sécurisée SSL/TLS</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">Anonymisation</div>
                    <div className="text-sm text-blue-600">Évaluations anonymes pour employés</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Key className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-800">Validation des Données</div>
                    <div className="text-sm text-blue-600">Validation côté client et serveur</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Rate Limiting & Protection
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">100</div>
                <div className="text-sm text-amber-700">Requêtes/minute</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">10MB</div>
                <div className="text-sm text-amber-700">Taille max fichier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">24h</div>
                <div className="text-sm text-amber-700">Durée session</div>
              </div>
            </div>
          </div>

          {/* Code de sécurité */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Exemple - Vérification de Sécurité</h4>
            <div className="relative">
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// Middleware de sécurité dans Layout.js
const checkSecurityAccess = async (pageType, userRole, userEmail) => {
  // Vérification admin principal
  const isMainAdmin = userEmail === 'syllacloud@gmail.com';
  
  // Pages sensibles réservées aux admins
  const adminOnlyPages = [
    'SystemMonitoring', 'AdminManagement', 
    'BrandingSettings', 'DeveloperDocs'
  ];
  
  // Vérification des permissions
  if (adminOnlyPages.includes(pageType)) {
    if (userRole !== 'admin' && !isMainAdmin) {
      throw new Error('Accès non autorisé');
    }
  }
  
  // Anonymisation des évaluations pour employés
  if (pageType === 'Performance' && userRole !== 'admin') {
    return { anonymizeReviews: true };
  }
  
  return { anonymizeReviews: false };
};

// Validation des données sensibles
const validateSensitiveData = (data, userRole) => {
  // Masquer les salaires pour non-admins
  if (userRole !== 'admin' && data.salary) {
    data.salary = '***';
  }
  
  // Masquer les infos personnelles dans les logs
  if (data.personalInfo && userRole !== 'admin') {
    data.personalInfo = '[MASQUÉ]';
  }
  
  return data;
};`}
              </pre>
              <Button
                onClick={() => copyToClipboard(`// Middleware de sécurité...`, "Security Code")}
                className="absolute top-2 right-2 p-2"
                variant="ghost"
                size="sm"
              >
                {copiedCode === "Security Code" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bonnes pratiques */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-green-800 mb-4">🛡️ Bonnes Pratiques de Sécurité</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-green-700">
                <li>• <strong>Principe du moindre privilège :</strong> Chaque utilisateur n'a accès qu'aux données nécessaires</li>
                <li>• <strong>Validation stricte :</strong> Toutes les entrées sont validées côté client ET serveur</li>
                <li>• <strong>Sessions sécurisées :</strong> Tokens JWT avec expiration automatique</li>
                <li>• <strong>Logs d'audit :</strong> Toutes les actions sensibles sont enregistrées</li>
              </ul>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• <strong>Anonymisation :</strong> Les évaluations restent anonymes pour les employés</li>
                <li>• <strong>Rate limiting :</strong> Protection contre les attaques par déni de service</li>
                <li>• <strong>HTTPS obligatoire :</strong> Toutes les communications sont chiffrées</li>
                <li>• <strong>Backup sécurisé :</strong> Données sauvegardées et chiffrées</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}