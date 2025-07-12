import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Table, Key, Link, Copy, Check } from "lucide-react";

export default function DatabaseSchema({ copyToClipboard, copiedCode }) {
  const [selectedEntity, setSelectedEntity] = useState("Employee");

  const entities = {
    Employee: {
      description: "Données principales des employés",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique auto-généré" },
        { name: "employee_id", type: "string", key: "", description: "ID employé personnalisé" },
        { name: "first_name", type: "string", key: "REQ", description: "Prénom" },
        { name: "last_name", type: "string", key: "REQ", description: "Nom de famille" },
        { name: "email", type: "email", key: "REQ", description: "Email unique" },
        { name: "phone", type: "string", key: "", description: "Numéro de téléphone" },
        { name: "department", type: "enum", key: "", description: "Engineering|Marketing|Sales|HR|Finance|Operations|Design|Legal" },
        { name: "position", type: "string", key: "", description: "Poste occupé" },
        { name: "start_date", type: "date", key: "REQ", description: "Date d'embauche" },
        { name: "salary", type: "number", key: "", description: "Salaire annuel" },
        { name: "status", type: "enum", key: "", description: "Active|Inactive|On Leave|Terminated" },
        { name: "created_date", type: "datetime", key: "AUTO", description: "Date de création" },
        { name: "updated_date", type: "datetime", key: "AUTO", description: "Dernière modification" }
      ],
      relations: [
        { target: "User", type: "1:1", description: "Un employé peut avoir un compte utilisateur" },
        { target: "TimeEntry", type: "1:N", description: "Un employé a plusieurs entrées de temps" },
        { target: "LeaveRequest", type: "1:N", description: "Un employé peut faire plusieurs demandes de congé" }
      ]
    },
    User: {
      description: "Comptes utilisateur et authentification",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique" },
        { name: "full_name", type: "string", key: "AUTO", description: "Nom complet (Google)" },
        { name: "email", type: "email", key: "AUTO", description: "Email (Google OAuth)" },
        { name: "employee_id", type: "string", key: "FK", description: "Référence vers Employee" },
        { name: "role", type: "enum", key: "", description: "admin|user" },
        { name: "is_active", type: "boolean", key: "", description: "Compte activé par admin" },
        { name: "last_login", type: "datetime", key: "", description: "Dernière connexion" },
        { name: "created_date", type: "datetime", key: "AUTO", description: "Date de création" }
      ],
      relations: [
        { target: "Employee", type: "1:1", description: "Référence optionnelle vers un employé" },
        { target: "Notification", type: "1:N", description: "Un utilisateur reçoit plusieurs notifications" }
      ]
    },
    TimeEntry: {
      description: "Système de pointage avec géolocalisation",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique" },
        { name: "employee_id", type: "string", key: "FK", description: "Référence vers Employee" },
        { name: "date", type: "date", key: "REQ", description: "Date du pointage" },
        { name: "check_in_time", type: "time", key: "REQ", description: "Heure d'arrivée" },
        { name: "check_out_time", type: "time", key: "", description: "Heure de départ (optionnel)" },
        { name: "hours_worked", type: "number", key: "", description: "Heures calculées" },
        { name: "status", type: "enum", key: "", description: "checked_in|checked_out|incomplete" },
        { name: "latitude", type: "number", key: "", description: "Coordonnée GPS" },
        { name: "longitude", type: "number", key: "", description: "Coordonnée GPS" },
        { name: "address", type: "string", key: "", description: "Adresse formatée" },
        { name: "ip_address", type: "string", key: "", description: "IP du device" },
        { name: "device_info", type: "string", key: "", description: "Info navigateur/OS" }
      ],
      relations: [
        { target: "Employee", type: "N:1", description: "Plusieurs pointages par employé" }
      ]
    },
    LeaveRequest: {
      description: "Demandes de congés et approbations",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique" },
        { name: "employee_id", type: "string", key: "FK", description: "Référence vers Employee" },
        { name: "leave_type", type: "enum", key: "REQ", description: "Vacation|Sick|Personal|Maternity|Paternity|Bereavement|Other" },
        { name: "start_date", type: "date", key: "REQ", description: "Date de début" },
        { name: "end_date", type: "date", key: "REQ", description: "Date de fin" },
        { name: "days_requested", type: "number", key: "REQ", description: "Nombre de jours" },
        { name: "reason", type: "string", key: "", description: "Motif détaillé" },
        { name: "status", type: "enum", key: "", description: "Pending|Approved|Denied|Cancelled" },
        { name: "approved_by", type: "string", key: "", description: "ID de l'approbateur" },
        { name: "approval_date", type: "date", key: "", description: "Date d'approbation" }
      ],
      relations: [
        { target: "Employee", type: "N:1", description: "Plusieurs demandes par employé" }
      ]
    },
    PerformanceReview: {
      description: "Évaluations de performance (anonymisées pour employés)",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique" },
        { name: "employee_id", type: "string", key: "FK", description: "Employé évalué" },
        { name: "reviewer_id", type: "string", key: "FK", description: "Évaluateur" },
        { name: "review_period", type: "string", key: "REQ", description: "Période (Q1 2024, etc.)" },
        { name: "overall_rating", type: "number", key: "REQ", description: "Note globale (1-5)" },
        { name: "goals_achievement", type: "number", key: "", description: "Atteinte objectifs (1-5)" },
        { name: "communication", type: "number", key: "", description: "Communication (1-5)" },
        { name: "teamwork", type: "number", key: "", description: "Travail équipe (1-5)" },
        { name: "leadership", type: "number", key: "", description: "Leadership (1-5)" },
        { name: "strengths", type: "text", key: "", description: "Points forts" },
        { name: "areas_for_improvement", type: "text", key: "", description: "Axes d'amélioration" },
        { name: "status", type: "enum", key: "", description: "Draft|Completed|Acknowledged" }
      ],
      relations: [
        { target: "Employee", type: "N:1", description: "Employé évalué" },
        { target: "Employee", type: "N:1", description: "Évaluateur (anonymisé côté employé)" }
      ]
    },
    FinanceTransaction: {
      description: "Transactions financières multi-devises",
      fields: [
        { name: "id", type: "string", key: "PK", description: "Identifiant unique" },
        { name: "title", type: "string", key: "REQ", description: "Titre de la transaction" },
        { name: "amount", type: "number", key: "REQ", description: "Montant original" },
        { name: "currency", type: "enum", key: "REQ", description: "XOF|EUR|USD|GBP|CAD|JPY|CNY|CHF|AUD|MAD|TND|DZD" },
        { name: "amount_xof", type: "number", key: "", description: "Montant converti en XOF" },
        { name: "category_id", type: "string", key: "FK", description: "Référence vers FinanceCategory" },
        { name: "type", type: "enum", key: "REQ", description: "income|expense" },
        { name: "payment_method", type: "enum", key: "", description: "cash|bank_transfer|credit_card|mobile_money|other" },
        { name: "reference", type: "string", key: "", description: "Référence auto-générée" },
        { name: "status", type: "enum", key: "", description: "pending|completed|cancelled|refunded" }
      ],
      relations: [
        { target: "FinanceCategory", type: "N:1", description: "Catégorie de la transaction" },
        { target: "Employee", type: "N:1", description: "Employé concerné (optionnel)" }
      ]
    }
  };

  const getKeyBadge = (key) => {
    switch (key) {
      case "PK": return <Badge className="bg-red-100 text-red-800 text-xs">PK</Badge>;
      case "FK": return <Badge className="bg-blue-100 text-blue-800 text-xs">FK</Badge>;
      case "REQ": return <Badge className="bg-green-100 text-green-800 text-xs">REQ</Badge>;
      case "AUTO": return <Badge className="bg-gray-100 text-gray-800 text-xs">AUTO</Badge>;
      default: return null;
    }
  };

  const generateEntitySchema = (entityName) => {
    const entity = entities[entityName];
    return `{
  "name": "${entityName}",
  "type": "object",
  "properties": {
${entity.fields.filter(f => !['id', 'created_date', 'updated_date'].includes(f.name)).map(field => 
    `    "${field.name}": {
      "type": "${field.type}",
      ${field.key === 'REQ' ? '"required": true,' : ''}
      "description": "${field.description}"
    }`
  ).join(',\n')}
  },
  "required": [${entity.fields.filter(f => f.key === 'REQ').map(f => `"${f.name}"`).join(', ')}]
}`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Database className="w-6 h-6 text-purple-600" />
            Schéma de Base de Données
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-blue-800 font-medium">Entités</div>
              <div className="text-sm text-blue-600 mt-1">Tables principales</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-green-800 font-medium">Champs</div>
              <div className="text-sm text-green-600 mt-1">Propriétés totales</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">25+</div>
              <div className="text-purple-800 font-medium">Relations</div>
              <div className="text-sm text-purple-600 mt-1">Liens entre entités</div>
            </div>
          </div>

          <Tabs value={selectedEntity} onValueChange={setSelectedEntity}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
              {Object.keys(entities).map(entityName => (
                <TabsTrigger key={entityName} value={entityName} className="text-xs">
                  {entityName}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(entities).map(([entityName, entity]) => (
              <TabsContent key={entityName} value={entityName} className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Table className="w-5 h-5 text-indigo-600" />
                        {entityName}
                      </h3>
                      <p className="text-gray-600 mt-1">{entity.description}</p>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(generateEntitySchema(entityName), `${entityName} Schema`)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {copiedCode === `${entityName} Schema` ? 
                        <Check className="w-4 h-4 text-green-500" /> : 
                        <Copy className="w-4 h-4" />
                      }
                      Copier JSON
                    </Button>
                  </div>

                  {/* Champs */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Champs</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white/50">
                          <tr>
                            <th className="text-left p-2 font-medium">Nom</th>
                            <th className="text-left p-2 font-medium">Type</th>
                            <th className="text-left p-2 font-medium">Clé</th>
                            <th className="text-left p-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {entity.fields.map((field, index) => (
                            <tr key={index} className="hover:bg-white/30">
                              <td className="p-2 font-mono text-indigo-700">{field.name}</td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-xs">
                                  {field.type}
                                </Badge>
                              </td>
                              <td className="p-2">
                                {getKeyBadge(field.key)}
                              </td>
                              <td className="p-2 text-gray-600">{field.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Relations */}
                  {entity.relations && entity.relations.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Link className="w-4 h-4" />
                        Relations
                      </h4>
                      <div className="space-y-2">
                        {entity.relations.map((relation, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white/40 rounded-lg">
                            <Badge className="bg-blue-100 text-blue-800">
                              {relation.type}
                            </Badge>
                            <div className="flex-1">
                              <span className="font-medium">{entityName}</span>
                              <span className="mx-2">→</span>
                              <span className="font-medium text-blue-600">{relation.target}</span>
                            </div>
                            <div className="text-sm text-gray-600">{relation.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Schéma JSON */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Schéma JSON</h4>
                    <Button
                      onClick={() => copyToClipboard(generateEntitySchema(entityName), `${entityName} JSON`)}
                      variant="ghost"
                      size="sm"
                    >
                      {copiedCode === `${entityName} JSON` ? 
                        <Check className="w-4 h-4 text-green-500" /> : 
                        <Copy className="w-4 h-4" />
                      }
                    </Button>
                  </div>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    {generateEntitySchema(entityName)}
                  </pre>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Vue d'ensemble des relations */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Link className="w-5 h-5 text-green-600" />
            Diagramme des Relations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
            <div className="text-center space-y-6">
              <div className="text-lg font-semibold text-gray-700 mb-8">Relations Principales</div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Relations core */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Relations Core</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-blue-600">User</div>
                      <div className="text-gray-400">1:1</div>
                      <div className="font-medium text-green-600">Employee</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-green-600">Employee</div>
                      <div className="text-gray-400">1:N</div>
                      <div className="font-medium text-purple-600">TimeEntry</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-green-600">Employee</div>
                      <div className="text-gray-400">1:N</div>
                      <div className="font-medium text-orange-600">LeaveRequest</div>
                    </div>
                  </div>
                </div>

                {/* Relations avancées */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Relations Avancées</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-green-600">Employee</div>
                      <div className="text-gray-400">N:N</div>
                      <div className="font-medium text-pink-600">PerformanceReview</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-indigo-600">FinanceCategory</div>
                      <div className="text-gray-400">1:N</div>
                      <div className="font-medium text-yellow-600">FinanceTransaction</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      <div className="font-medium text-blue-600">User</div>
                      <div className="text-gray-400">1:N</div>
                      <div className="font-medium text-red-600">Notification</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}