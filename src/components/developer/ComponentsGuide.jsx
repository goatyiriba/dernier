import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code2, Folder, Layers, Copy, Check, Smartphone } from "lucide-react";

export default function ComponentsGuide({ copyToClipboard, copiedCode }) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Code2 className="w-6 h-6 text-blue-600" />
            Guide Frontend & Composants
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Structure des dossiers */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Folder className="w-5 h-5" />
                Structure des Dossiers
              </h4>
              <div className="bg-gray-50 p-4 rounded-xl">
                <pre className="text-sm text-gray-700">
{`src/
├── pages/                    # Pages principales
│   ├── AdminDashboard.js
│   ├── Employees.js
│   ├── TimeTracking.js
│   └── ...
├── components/               # Composants réutilisables
│   ├── ui/                  # Composants UI de base
│   ├── admin/               # Composants admin
│   ├── employees/           # Composants employés
│   ├── performance/         # Composants évaluations
│   └── ...
├── entities/                # Entités Base44
├── utils/                   # Utilitaires
└── Layout.js               # Layout principal`}
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Architecture des Composants</h4>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="font-medium text-blue-800">Pages</div>
                  <div className="text-sm text-blue-600">
                    Composants de haut niveau, gèrent l'état et les données
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="font-medium text-green-800">Composants Métier</div>
                  <div className="text-sm text-green-600">
                    Logique spécifique (EmployeeCard, ReviewCard, etc.)
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="font-medium text-purple-800">Composants UI</div>
                  <div className="text-sm text-purple-600">
                    Éléments réutilisables (Button, Card, Modal, etc.)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Patterns de composants */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Patterns de Composants Utilisés</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/70 p-4 rounded-lg">
                <h5 className="font-semibold text-indigo-800 mb-2">Container/Presentational</h5>
                <p className="text-sm text-indigo-600">
                  Séparation entre logique (Container) et affichage (Presentational)
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg">
                <h5 className="font-semibold text-indigo-800 mb-2">Compound Components</h5>
                <p className="text-sm text-indigo-600">
                  Composants qui travaillent ensemble (Tabs, Modal, etc.)
                </p>
              </div>
              <div className="bg-white/70 p-4 rounded-lg">
                <h5 className="font-semibold text-indigo-800 mb-2">Render Props</h5>
                <p className="text-sm text-indigo-600">
                  Partage de logique via des fonctions de rendu
                </p>
              </div>
            </div>
          </div>

          {/* Exemple de composant */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Exemple - Composant Employee Card</h4>
            <div className="relative">
              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`// components/employees/EmployeeCard.jsx
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function EmployeeCard({ 
  employee, 
  onEdit, 
  onView, 
  isAdmin = false 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Photo de profil */}
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            {employee.profile_picture ? (
              <img 
                src={employee.profile_picture} 
                alt={employee.first_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          
          {/* Informations */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h3>
              <Badge className={getStatusColor(employee.status)}>
                {employee.status}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {employee.position} • {employee.department}
            </p>
            
            <div className="space-y-1 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {employee.email}
              </div>
              {employee.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {employee.phone}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={() => onView(employee)}>
            Voir
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => onEdit(employee)}>
              Modifier
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}`}
              </pre>
              <Button
                onClick={() => copyToClipboard(`// components/employees/EmployeeCard.jsx...`, "Employee Card")}
                className="absolute top-2 right-2 p-2"
                variant="ghost"
                size="sm"
              >
                {copiedCode === "Employee Card" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Design System */}
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
            <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Design System & Composants UI
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-purple-800 mb-3">Shadcn/ui Components</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Button</span>
                    <Badge variant="outline" className="text-xs">@/components/ui/button</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Card</span>
                    <Badge variant="outline" className="text-xs">@/components/ui/card</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Input</span>
                    <Badge variant="outline" className="text-xs">@/components/ui/input</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Dialog</span>
                    <Badge variant="outline" className="text-xs">@/components/ui/dialog</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Select</span>
                    <Badge variant="outline" className="text-xs">@/components/ui/select</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-purple-800 mb-3">Couleurs & Thème</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-sm">Primary (Bleu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="text-sm">Success (Vert)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-sm">Error (Rouge)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span className="text-sm">Warning (Jaune)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Design */}
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Design Responsive
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white/70 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Mobile First</div>
                <div className="text-sm text-green-700">
                  Design pensé d'abord pour mobile
                </div>
              </div>
              <div className="bg-white/70 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Breakpoints</div>
                <div className="text-sm text-green-700">
                  sm: 640px, md: 768px, lg: 1024px
                </div>
              </div>
              <div className="bg-white/70 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">Flexbox/Grid</div>
                <div className="text-sm text-green-700">
                  Layouts flexibles et adaptatifs
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white/50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Classes Tailwind Responsive</h5>
              <div className="relative">
                <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// Exemples de classes responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="flex flex-col md:flex-row items-center gap-4">
<div className="text-sm md:text-base lg:text-lg">
<div className="p-2 md:p-4 lg:p-6">`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}