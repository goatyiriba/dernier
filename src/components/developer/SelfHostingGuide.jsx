import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Server, 
  Database, 
  Cloud, 
  Code, 
  Settings,
  Terminal,
  Globe,
  Shield,
  Copy,
  Check,
  AlertTriangle,
  Container,
  Download,
  Upload,
  Cpu,
  HardDrive,
  Wifi,
  Lock,
  FileText,
  Zap
} from "lucide-react";

// Import de toutes les functions adaptées
const { sendEmailFunction } = require('../api/functions/notifications/sendEmail');
const { openaiFunction } = require('../api/functions/integrations/openai');
const { stripeFunction } = require('../api/functions/integrations/stripe');
const { exportTasksFunction } = require('../api/functions/employees/export');

export default function SelfHostingGuide({ copyToClipboard, copiedCode }) {
  const [activeHosting, setActiveHosting] = useState("overview");

  const hostingOptions = [
    {
      id: "vps",
      name: "VPS/Serveur Dédié",
      icon: Server,
      difficulty: "Intermédiaire",
      cost: "10-50€/mois",
      pros: ["Contrôle total", "Performance dédiée", "Sécurité maximale", "Isolation complète"],
      cons: ["Maintenance manuelle", "Expertise technique requise", "Responsabilité sécurité"],
      recommended: "OVH, Hetzner, DigitalOcean, Contabo, Vultr"
    },
    {
      id: "docker",
      name: "Docker + Orchestration",
      icon: Container,
      difficulty: "Avancé",
      cost: "15-100€/mois",
      pros: ["Scalabilité", "Isolation", "Déploiement facile", "Rollback simple"],
      cons: ["Complexité initiale", "Ressources additionnelles", "Courbe d'apprentissage"],
      recommended: "Docker Swarm, Kubernetes, Portainer"
    },
    {
      id: "paas",
      name: "Platform-as-a-Service",
      icon: Cloud,
      difficulty: "Facile",
      cost: "20-200€/mois",
      pros: ["Gestion automatisée", "Scaling automatique", "Maintenance incluse", "Backup automatique"],
      cons: ["Moins de contrôle", "Coût plus élevé", "Vendor lock-in"],
      recommended: "Heroku, Vercel, Railway, Render"
    },
    {
      id: "hybrid",
      name: "Architecture Hybride",
      icon: Globe,
      difficulty: "Expert",
      cost: "50-500€/mois",
      pros: ["Meilleure résilience", "Performance optimale", "Flexibilité maximale"],
      cons: ["Très complexe", "Coût élevé", "Expertise multiples requises"],
      recommended: "AWS/GCP + VPS, Multi-cloud setup"
    }
  ];

  const databaseOptions = [
    {
      name: "PostgreSQL",
      type: "Relationnel",
      complexity: "Moyen",
      performance: "Excellent",
      pros: ["ACID complet", "JSON natif", "Extensions riches", "Open source"],
      cons: ["Configuration complexe", "Consommation mémoire"],
      useCase: "Applications complexes, données relationnelles"
    },
    {
      name: "MySQL/MariaDB",
      type: "Relationnel", 
      complexity: "Facile",
      performance: "Très bon",
      pros: ["Simple à configurer", "Large adoption", "Performance read"],
      cons: ["Moins de fonctionnalités avancées", "Limites JSON"],
      useCase: "Applications web classiques, CMS"
    },
    {
      name: "MongoDB",
      type: "NoSQL",
      complexity: "Moyen",
      performance: "Excellent",
      pros: ["Schéma flexible", "Scaling horizontal", "JSON natif"],
      cons: ["Pas de transactions ACID complètes", "Consommation disque"],
      useCase: "APIs modernes, données non-structurées"
    },
    {
      name: "Redis + PostgreSQL",
      type: "Hybride",
      complexity: "Avancé",
      performance: "Exceptionnel",
      pros: ["Cache ultra-rapide", "Sessions", "Données relationnelles"],
      cons: ["Architecture complexe", "Coût infrastructure"],
      useCase: "Applications haute performance"
    }
  ];

  return (
    <div className="space-y-8">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Server className="w-6 h-6 text-blue-600" />
            Guide d'Hébergement Self-Hosted Complet
          </CardTitle>
          <p className="text-gray-600">
            Guide détaillé étape par étape pour héberger Flow HR avec votre propre infrastructure et base de données
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeHosting} onValueChange={setActiveHosting}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-8 mb-8">
              <TabsTrigger value="overview">Vue d'overview</TabsTrigger>
              <TabsTrigger value="requirements">Prérequis</TabsTrigger>
              <TabsTrigger value="database">Base de données</TabsTrigger>
              <TabsTrigger value="backend">Backend API</TabsTrigger>
              <TabsTrigger value="vps">Déploiement VPS</TabsTrigger>
              <TabsTrigger value="docker">Docker</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            {/* Vue d'overview */}
            <TabsContent value="overview">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Architecture Self-Hosted Complète</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">✅ Avantages du Self-Hosting</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Contrôle total :</strong> Maîtrise complète de vos données</li>
                        <li>• <strong>Conformité RGPD :</strong> Données stockées en Europe</li>
                        <li>• <strong>Personnalisation :</strong> Modifications illimitées du code</li>
                        <li>• <strong>Performance :</strong> Ressources dédiées optimisées</li>
                        <li>• <strong>Coût prévisible :</strong> Pas de limites d'utilisateurs</li>
                        <li>• <strong>Sécurité :</strong> Infrastructure sous votre contrôle</li>
                        <li>• <strong>Backup :</strong> Stratégies de sauvegarde personnalisées</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">⚠️ Responsabilités et Défis</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Expertise technique :</strong> Linux, Docker, réseaux</li>
                        <li>• <strong>Maintenance continue :</strong> Mises à jour de sécurité</li>
                        <li>• <strong>Monitoring 24/7 :</strong> Surveillance système</li>
                        <li>• <strong>Sauvegardes :</strong> Stratégie de backup robuste</li>
                        <li>• <strong>Sécurité :</strong> Hardening et protection</li>
                        <li>• <strong>Support :</strong> Résolution autonome des problèmes</li>
                        <li>• <strong>Scaling :</strong> Gestion de la montée en charge</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hostingOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Card key={option.id} className="border-2 hover:border-blue-300 transition-colors">
                        <CardHeader className="pb-4">
                          <div className="flex flex-col items-center text-center mb-2">
                            <IconComponent className="w-12 h-12 text-blue-600 mb-2" />
                            <h4 className="font-semibold">{option.name}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{option.difficulty}</Badge>
                              <Badge className="bg-green-100 text-green-800">{option.cost}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-xs font-medium text-green-800 mb-1">✅ Avantages</h5>
                              <ul className="text-xs text-green-700 space-y-1">
                                {option.pros.map((pro, index) => (
                                  <li key={index}>• {pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-xs font-medium text-red-800 mb-1">❌ Inconvénients</h5>
                              <ul className="text-xs text-red-700 space-y-1">
                                {option.cons.map((con, index) => (
                                  <li key={index}>• {con}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="text-xs text-gray-600">
                                <strong>Recommandé:</strong> {option.recommended}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">🎯 Étapes du Guide Complet</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ol className="space-y-2 text-sm text-green-700">
                        <li><strong>1. Prérequis :</strong> Serveur, domaine, certificats SSL</li>
                        <li><strong>2. Base de données :</strong> PostgreSQL/MySQL setup complet</li>
                        <li><strong>3. Backend API :</strong> Création d'un backend Node.js/Python</li>
                        <li><strong>4. Déploiement :</strong> VPS Ubuntu avec Nginx/Apache</li>
                      </ol>
                      <ol className="space-y-2 text-sm text-green-700" start={5}>
                        <li><strong>5. Containerisation :</strong> Docker setup avec docker-compose</li>
                        <li><strong>6. Sécurité :</strong> Firewall, SSL, monitoring</li>
                        <li><strong>7. Backup :</strong> Stratégies de sauvegarde automatisées</li>
                        <li><strong>8. Maintenance :</strong> Monitoring et mises à jour</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Prérequis */}
            <TabsContent value="requirements">
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Avertissement :</strong> Ce guide nécessite des compétences techniques avancées en administration système Linux, bases de données et sécurité réseau.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-2 border-orange-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-orange-500" />
                        Configuration Minimale
                      </CardTitle>
                      <Badge className="bg-orange-100 text-orange-800 w-fit">Développement/Test</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">CPU:</span>
                          <span>2 vCPUs (2.4GHz+)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">RAM:</span>
                          <span>4GB (DDR4)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Stockage:</span>
                          <span>25GB SSD NVMe</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Réseau:</span>
                          <span>100Mbps (1TB/mois)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">OS:</span>
                          <span>Ubuntu 22.04 LTS</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-orange-600">
                            <strong>Coût :</strong> 5-15€/mois
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="w-5 h-5 text-blue-500" />
                        Configuration Recommandée
                      </CardTitle>
                      <Badge className="bg-blue-100 text-blue-800 w-fit">PME (50-200 users)</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">CPU:</span>
                          <span>4 vCPUs (3.2GHz+)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">RAM:</span>
                          <span>8GB (DDR4)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Stockage:</span>
                          <span>100GB SSD NVMe</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Réseau:</span>
                          <span>1Gbps (5TB/mois)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">OS:</span>
                          <span>Ubuntu 22.04 LTS</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-blue-600">
                            <strong>Coût :</strong> 20-50€/mois
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Configuration Production
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800 w-fit">Entreprise (500+ users)</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">CPU:</span>
                          <span>8+ vCPUs (3.5GHz+)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">RAM:</span>
                          <span>16GB+ (DDR4/5)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Stockage:</span>
                          <span>500GB SSD + Backup</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Réseau:</span>
                          <span>1Gbps+ (Unlimited)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">OS:</span>
                          <span>Ubuntu 22.04 LTS</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm text-green-600">
                            <strong>Coût :</strong> 80-200€/mois
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-800">💰 Analyse Détaillée des Coûts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-3">Hébergeurs VPS Recommandés</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>🇫🇷 OVH VPS SSD 2:</span>
                            <span className="font-medium">7€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🇩🇪 Hetzner CX31:</span>
                            <span className="font-medium">8.90€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🇺🇸 DigitalOcean:</span>
                            <span className="font-medium">12$/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🇩🇪 Contabo VPS M:</span>
                            <span className="font-medium">8.99€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🇺🇸 Vultr Regular:</span>
                            <span className="font-medium">10$/mois</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-3">Services Additionnels</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>📌 Nom de domaine (.com):</span>
                            <span className="font-medium">12€/an</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🔒 Certificat SSL:</span>
                            <span className="font-medium text-green-600">Gratuit</span>
                          </div>
                          <div className="flex justify-between">
                            <span>💾 Backup automatique:</span>
                            <span className="font-medium">5-10€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📊 Monitoring (UptimeRobot):</span>
                            <span className="font-medium text-green-600">Gratuit</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📧 Service Email (Mailgun):</span>
                            <span className="font-medium">5€/mois</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-amber-800 mb-3">Coût Total Mensuel</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>🟡 Configuration Minimum:</span>
                            <span className="font-medium">15-25€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🔵 Configuration Recommandée:</span>
                            <span className="font-medium">30-60€/mois</span>
                          </div>
                          <div className="flex justify-between">
                            <span>🟢 Configuration Production:</span>
                            <span className="font-medium">100-250€/mois</span>
                          </div>
                          <div className="pt-2 border-t border-amber-300">
                            <div className="flex justify-between font-bold">
                              <span>💡 ROI vs Base44:</span>
                              <span className="text-green-600">60-80% économie</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Base de données */}
            <TabsContent value="database">
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-900">🗄️ Configuration Complète de Base de Données Self-Hosted</CardTitle>
                    <p className="text-purple-700">Guide détaillé pour configurer votre propre base de données pour Flow HR</p>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-6">
                      <Database className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important :</strong> Flow HR utilise actuellement Base44 comme backend. Ce guide vous montre comment créer votre propre API backend avec base de données pour remplacer Base44.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {databaseOptions.map((db, index) => (
                    <Card key={index} className="border-2 hover:border-purple-300 transition-colors">
                      <CardHeader className="pb-4">
                        <div className="flex flex-col items-center text-center">
                          <Database className="w-10 h-10 text-purple-600 mb-2" />
                          <h4 className="font-semibold">{db.name}</h4>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">{db.type}</Badge>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">{db.complexity}</Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">{db.performance}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-green-800 mb-1">✅ Avantages</h5>
                            <ul className="text-xs text-green-700 space-y-1">
                              {db.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-xs font-medium text-red-800 mb-1">❌ Inconvénients</h5>
                            <ul className="text-xs text-red-700 space-y-1">
                              {db.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-gray-600">
                              <strong>Idéal pour :</strong> {db.useCase}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">🚀 Installation PostgreSQL Complète (Recommandé)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">1. Installation PostgreSQL 15 sur Ubuntu 22.04</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de PostgreSQL 15
sudo apt install wget ca-certificates
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update
sudo apt install postgresql-15 postgresql-client-15 postgresql-contrib-15

# Démarrer et activer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier le statut
sudo systemctl status postgresql`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Installation PostgreSQL 15...`, "PostgreSQL Install")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Install" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">2. Configuration Sécurisée de PostgreSQL</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Se connecter en tant que postgres
sudo su - postgres

# Créer un superutilisateur pour l'application
createuser --interactive --pwprompt flowhr_admin
# Mot de passe fort recommandé : au moins 16 caractères avec majuscules, minuscules, chiffres, symboles

# Créer la base de données Flow HR
createdb -O flowhr_admin flowhr_production
createdb -O flowhr_admin flowhr_development
createdb -O flowhr_admin flowhr_test

# Se connecter à PostgreSQL pour configuration avancée
psql

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE flowhr_production TO flowhr_admin;
GRANT ALL PRIVILEGES ON DATABASE flowhr_development TO flowhr_admin;
GRANT ALL PRIVILEGES ON DATABASE flowhr_test TO flowhr_admin;

-- Créer un utilisateur en lecture seule pour les backups
CREATE USER flowhr_backup WITH PASSWORD 'backup_password_secure_123!';
GRANT CONNECT ON DATABASE flowhr_production TO flowhr_backup;
GRANT USAGE ON SCHEMA public TO flowhr_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO flowhr_backup;

-- Sortir de psql
\\q

# Sortir du user postgres
exit`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Configuration PostgreSQL...`, "PostgreSQL Config")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Config" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">3. Sécurisation et Optimisation PostgreSQL</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Éditer la configuration PostgreSQL
sudo nano /etc/postgresql/15/main/postgresql.conf

# Optimisations recommandées pour Flow HR (ajoutez ces lignes) :
# ================================================================

# Connexions et mémoire
max_connections = 100                    # Ajustez selon vos besoins
shared_buffers = 256MB                   # 25% de la RAM disponible
effective_cache_size = 1GB               # 75% de la RAM disponible
work_mem = 4MB                          # Pour les opérations de tri
maintenance_work_mem = 64MB              # Pour les opérations de maintenance

# Performance des requêtes
random_page_cost = 1.1                  # Pour SSD (4.0 pour HDD)
effective_io_concurrency = 200          # Pour SSD (2 pour HDD)

# WAL (Write-Ahead Logging) pour la durabilité
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 1GB
min_wal_size = 80MB

# Monitoring et logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'                   # Log toutes les modifications
log_duration = on
log_line_prefix = '%t [%p-%l] %q%u@%d '

# Sauvegarder et fermer le fichier (Ctrl+O, Enter, Ctrl+X)`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Optimisation PostgreSQL...`, "PostgreSQL Optimization")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Optimization" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">4. Configuration de Sécurité pg_hba.conf</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Éditer le fichier de contrôle d'accès
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Remplacer le contenu par une configuration sécurisée :
# ======================================================

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" pour les connexions Unix domain socket uniquement
local   all             postgres                                peer
local   all             flowhr_admin                           md5
local   all             flowhr_backup                          md5

# IPv4 local connections - TRÈS RESTRICTIF
host    flowhr_production   flowhr_admin    127.0.0.1/32          md5
host    flowhr_development  flowhr_admin    127.0.0.1/32          md5
host    flowhr_test         flowhr_admin    127.0.0.1/32          md5

# Backup connections (uniquement en lecture)
host    flowhr_production   flowhr_backup   127.0.0.1/32          md5

# Si vous avez besoin d'accès depuis une IP spécifique (remplacez XXX.XXX.XXX.XXX)
# host    flowhr_production   flowhr_admin    XXX.XXX.XXX.XXX/32    md5

# JAMAIS autoriser ceci en production :
# host    all             all             0.0.0.0/0               md5

# Sauvegarder et redémarrer PostgreSQL
sudo systemctl restart postgresql
sudo systemctl status postgresql`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Configuration pg_hba.conf...`, "PostgreSQL Security")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Security" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">5. Test de Connexion et Création du Schéma</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Tester la connexion à la base de données
psql -U flowhr_admin -d flowhr_production -h localhost

# Si la connexion fonctionne, créer le schéma Flow HR
-- ================================================

-- Table des utilisateurs (équivalent User entity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    employee_id UUID REFERENCES employees(id),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(100),
    employment_type VARCHAR(20) DEFAULT 'Full-time',
    start_date DATE NOT NULL,
    salary DECIMAL(10,2),
    manager_id UUID REFERENCES employees(id),
    status VARCHAR(20) DEFAULT 'Active',
    address TEXT,
    emergency_contact TEXT,
    skills TEXT[],
    profile_picture TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des pointages
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME,
    hours_worked DECIMAL(4,2),
    status VARCHAR(20) DEFAULT 'checked_in',
    break_start_time TIME,
    break_end_time TIME,
    total_break_duration INTEGER DEFAULT 0,
    break_sessions JSONB DEFAULT '[]',
    location TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ip_address INET,
    device_info TEXT,
    address TEXT,
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Table des demandes de congés
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    approved_by UUID REFERENCES employees(id),
    approval_date DATE,
    notes TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des évaluations de performance
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    reviewer_id UUID NOT NULL REFERENCES employees(id),
    review_period VARCHAR(50) NOT NULL,
    review_date DATE NOT NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    goals_achievement INTEGER CHECK (goals_achievement >= 1 AND goals_achievement <= 5),
    communication INTEGER CHECK (communication >= 1 AND communication <= 5),
    teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
    leadership INTEGER CHECK (leadership >= 1 AND leadership <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_next_period TEXT,
    status VARCHAR(20) DEFAULT 'Draft',
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_time_entries_employee_date ON time_entries(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id);

-- Trigger pour mettre à jour automatiquement updated_date
CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_date BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_employees_updated_date BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_time_entries_updated_date BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_leave_requests_updated_date BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_performance_reviews_updated_date BEFORE UPDATE ON performance_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

\\q`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Création schéma PostgreSQL...`, "PostgreSQL Schema")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Schema" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-800">💾 Stratégie de Sauvegarde PostgreSQL</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3">Script de Backup Automatisé</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`#!/bin/bash
# Script de backup PostgreSQL pour Flow HR
# Créer le fichier : /opt/flowhr/backup_postgres.sh

# Configuration
DB_NAME="flowhr_production"
DB_USER="flowhr_backup"
BACKUP_DIR="/var/backups/flowhr"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Créer le répertoire de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Export de la base de données complète
pg_dump -U $DB_USER -h localhost -d $DB_NAME -f $BACKUP_DIR/flowhr_full_$DATE.sql

# Compression du backup
gzip $BACKUP_DIR/flowhr_full_$DATE.sql

# Export des données uniquement (sans structure)
pg_dump -U $DB_USER -h localhost -d $DB_NAME --data-only -f $BACKUP_DIR/flowhr_data_$DATE.sql
gzip $BACKUP_DIR/flowhr_data_$DATE.sql

# Suppression des anciens backups (plus de 30 jours)
find $BACKUP_DIR -name "flowhr_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log du backup
echo "$(date): Backup PostgreSQL terminé avec succès" >> /var/log/flowhr_backup.log

# Rendre le script exécutable
chmod +x /opt/flowhr/backup_postgres.sh

# Ajouter au crontab pour backup quotidien à 2h du matin
echo "0 2 * * * /opt/flowhr/backup_postgres.sh" | sudo crontab -`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`#!/bin/bash...`, "PostgreSQL Backup")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "PostgreSQL Backup" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Backend API détaillé */}
            <TabsContent value="backend">
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <Code className="w-6 h-6" />
                    Backend Functions Self-Hosted (Alpha)
                  </h3>
                  <p className="text-purple-700 mb-4">
                    Flow HR utilise le système de Backend Functions pour la logique serveur. 
                    Voici comment les adapter pour un hébergement self-hosted.
                  </p>
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Statut Alpha :</strong> Les Backend Functions sont en développement actif. 
                      Certaines fonctionnalités peuvent nécessiter des adaptations.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Architecture Backend Functions */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      Architecture Backend Functions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">📁 Structure des Functions</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg text-sm">
                          <pre>{`functions/
├── auth/
│   ├── login.js
│   ├── logout.js
│   └── verify.js
├── employees/
│   ├── create.js
│   ├── update.js
│   └── export.js
├── notifications/
│   ├── send.js
│   ├── email.js
│   └── whatsapp.js
├── integrations/
│   ├── openai.js
│   ├── stripe.js
│   └── sendgrid.js
└── utils/
    ├── database.js
    ├── auth.js
    └── validation.js`}</pre>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">🔧 Fonctionnement</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">1</span>
                            </div>
                            <div>
                              <div className="font-medium text-blue-900">Runtime Deno</div>
                              <div className="text-sm text-blue-700">Chaque function s'exécute sur Deno Deploy</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">2</span>
                            </div>
                            <div>
                              <div className="font-medium text-green-900">HTTP Handlers</div>
                              <div className="text-sm text-green-700">Export d'une fonction Deno.serve</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">3</span>
                            </div>
                            <div>
                              <div className="font-medium text-purple-900">Authentification</div>
                              <div className="text-sm text-purple-700">JWT automatique via Base44 SDK</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Migration vers Node.js/Express */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-green-600" />
                      Migration vers Node.js/Express pour Self-Hosting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <h5 className="font-semibold text-amber-800 mb-2">🔄 Stratégie de Migration</h5>
                      <p className="text-sm text-amber-700">
                        Les Backend Functions Deno doivent être adaptées pour fonctionner avec votre serveur Node.js/Express.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">1. Structure Backend Express</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">{`# Créer la structure backend
mkdir -p backend/{src,functions,middleware,utils,config}
cd backend

# Initialiser le projet Node.js
npm init -y

# Installer les dépendances principales
npm install express cors helmet dotenv
npm install jsonwebtoken bcryptjs multer
npm install pg redis mongoose # Selon votre DB
npm install nodemailer openai stripe # Intégrations
npm install --save-dev nodemon concurrently

# Structure finale
backend/
├── src/
│   ├── app.js              # App Express principale
│   ├── server.js           # Point d'entrée
│   └── routes/
│       ├── auth.js
│       ├── employees.js
│       ├── functions.js    # Routes pour les functions
│       └── api.js
├── functions/
│   ├── auth/
│   ├── employees/
│   ├── notifications/
│   └── integrations/
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── utils/
│   ├── database.js
│   ├── jwt.js
│   └── logger.js
├── config/
│   └── database.js
├── package.json
└── Dockerfile`}</pre>
                          <Button
                            onClick={() => copyToClipboard(`# Structure backend Express...`, "Backend Structure")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Backend Structure" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">2. Adaptation des Backend Functions</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">❌ Format Deno Original</h5>
                            <div className="bg-gray-800 text-red-400 p-3 rounded-lg text-sm">
                              <pre>{`// functions/sendEmail.js (Deno)
import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
  appId: Deno.env.get('BASE44_APP_ID'), 
});

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader.split(' ')[1];
  base44.auth.setToken(token);
  
  const user = await base44.auth.me();
  
  // Logique de la function...
  
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" }
  });
});`}</pre>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-medium text-gray-800 mb-2">✅ Format Express Adapté</h5>
                            <div className="bg-gray-800 text-green-400 p-3 rounded-lg text-sm">
                              <pre>{`// functions/sendEmail.js (Express)
const jwt = require('jsonwebtoken');
const { User } = require('../utils/database');

const sendEmailFunction = async (req, res) => {
  try {
    // Vérification auth locale
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Logique de la function (identique)...
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendEmailFunction };`}</pre>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">3. App Express Principal</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">{`// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const functionsRoutes = require('./routes/functions');

// Import des middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes publiques
app.use('/auth', authRoutes);

// Routes protégées
app.use('/api', authMiddleware, apiRoutes);
app.use('/functions', authMiddleware, functionsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Gestion des erreurs
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;`}</pre>
                          <Button
                            onClick={() => copyToClipboard(`// src/app.js...`, "Express App")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Express App" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">4. Routes Functions</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">{`// src/routes/functions.js
const express = require('express');
const router = express.Router();

// Import de toutes les functions adaptées
const { sendEmailFunction } = require('../.@/api/functions/notifications/sendEmail');
const { openaiFunction } = require('../.@/api/functions/integrations/openai');
const { stripeFunction } = require('../.@/api/functions/integrations/stripe');
const { exportTasksFunction } = require('../.@/api/functions/employees/export');

// Routes dynamiques pour chaque function
router.post('/sendEmail', sendEmailFunction);
router.post('/openai', openaiFunction);
router.post('/stripe', stripeFunction);
router.post('/exportTasks', exportTasksFunction);

// Route générique pour découvrir les functions disponibles
router.get('/', (req, res) => {
  res.json({
    availableFunctions: [
      'sendEmail',
      'openai', 
      'stripe',
      'exportTasks'
    ]
  });
});

module.exports = router;`}</pre>
                          <Button
                            onClick={() => copyToClipboard(`// src/routes/functions.js...`, "Functions Routes")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Functions Routes" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">5. Middleware d'Authentification</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">
{`// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../utils/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Utilisateur non autorisé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware spécifique admin
const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin' && req.user.email !== 'syllacloud@gmail.com') {
    return res.status(403).json({ error: 'Accès admin requis' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };`}
                        </pre>
                          <Button
                            onClick={() => copyToClipboard(`// middleware/auth.js...`, "Auth Middleware")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Auth Middleware" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">6. Adaptation Frontend</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">{`// Avant (avec Base44 Functions)
import { someFunction } from "@/api/supabaseFunctions";
const response = await someFunction({param: "value"});

// Après (Self-hosted)
// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const callFunction = async (functionName, data) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(\`\${API_BASE_URL}/functions/\${functionName}\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${token}\`
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return response.json();
};

// Utilisation dans les composants
import { callFunction } from '../utils/api';

const handleExport = async () => {
  try {
    const result = await callFunction('exportTasks', {});
    // Traitement du résultat...
  } catch (error) {
    console.error('Erreur:', error);
  }
};`}</pre>
                          <Button
                            onClick={() => copyToClipboard(`// Adaptation Frontend...`, "Frontend Adaptation")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Frontend Adaptation" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">7. Exemples de Functions Adaptées</h4>
                        <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                          <pre className="text-sm overflow-x-auto">{`// functions/notifications/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmailFunction = async (req, res) => {
  try {
    const { to, subject, body, from_name } = req.body;
    
    // Configuration du transporteur email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // ou votre service SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Envoyer l'email
    const result = await transporter.sendMail({
      from: \`\${from_name || 'Flow HR'} <\${process.env.EMAIL_USER}>\`,
      to: to,
      subject: subject,
      html: body
    });

    res.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { sendEmailFunction };`}</pre>
                          <Button
                            onClick={() => copyToClipboard(`// functions/notifications/sendEmail.js...`, "Send Email Function")}
                            className="absolute top-2 right-2 p-2"
                            variant="ghost"
                            size="sm"
                          >
                            {copiedCode === "Send Email Function" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configuration et Déploiement */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Configuration et Déploiement Backend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Variables d'Environnement</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">{`# .env
NODE_ENV=production
PORT=3001

# Base de données
DATABASE_URL=postgresql://flowhr_admin:password@localhost:5432/flowhr_production
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=votre_jwt_secret_super_secure_au_moins_32_caracteres
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# Email (pour les notifications)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app

# Intégrations (si utilisées)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
SENDGRID_API_KEY=SG...

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://...`}</pre>
                        <Button
                          onClick={() => copyToClipboard(`# .env configuration...`, "Env Config")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Env Config" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Scripts de Déploiement</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">{`# package.json scripts
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "build": "echo 'No build needed for backend'",
    "test": "jest",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "pm2:start": "pm2 start ecosystem.config.js",
    "pm2:stop": "pm2 stop flowhr-backend",
    "pm2:restart": "pm2 restart flowhr-backend",
    "docker:build": "docker build -t flowhr-backend .",
    "docker:run": "docker run -p 3001:3001 --env-file .env flowhr-backend"
  }
}

# ecosystem.config.js (PM2)
module.exports = {
  apps: [{
    name: 'flowhr-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};`}</pre>
                        <Button
                          onClick={() => copyToClipboard(`# Scripts de déploiement...`, "Deploy Scripts")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Deploy Scripts" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bonnes Pratiques */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Bonnes Pratiques Backend Self-Hosting
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">🔒 Sécurité</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Utilisez HTTPS partout (Nginx + Let's Encrypt)</li>
                        <li>• Validez toutes les entrées utilisateur</li>
                        <li>• Implémentez le rate limiting</li>
                        <li>• Chiffrez les données sensibles</li>
                                                  <li>• Utilisez des secrets forts (&gt;32 caractères)</li>
                        <li>• Activez les logs de sécurité</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-800 mb-2">⚡ Performance</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Activez la compression gzip/brotli</li>
                        <li>• Utilisez Redis pour le cache</li>
                        <li>• Optimisez les requêtes DB</li>
                        <li>• Implémentez la pagination</li>
                        <li>• Ajoutez un CDN pour les assets</li>
                        <li>• Monitoring des métriques</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Déploiement VPS */}
            <TabsContent value="vps">
              <div className="space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">🌐 Déploiement Complet sur VPS Ubuntu 22.04</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">1. Préparation et Sécurisation du Serveur</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Mise à jour complète du système
sudo apt update && sudo apt upgrade -y

# Installation des paquets essentiels
sudo apt install -y curl wget git unzip software-properties-common
sudo apt install -y build-essential nginx certbot python3-certbot-nginx
sudo apt install -y fail2ban ufw htop tree

# Configuration du firewall UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Création d'un utilisateur dédié pour l'application
sudo adduser flowhr
sudo usermod -aG sudo flowhr
sudo mkdir -p /home/flowhr/.ssh
sudo cp ~/.ssh/authorized_keys /home/flowhr/.ssh/
sudo chown -R flowhr:flowhr /home/flowhr/.ssh
sudo chmod 700 /home/flowhr/.ssh
sudo chmod 600 /home/flowhr/.ssh/authorized_keys

# Configuration SSH sécurisée
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Configuration Fail2Ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Préparation serveur...`, "Server Prep")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Server Prep" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">2. Installation Node.js et PM2</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Passer à l'utilisateur flowhr
su - flowhr

# Installation de Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification de l'installation
node --version  # Doit afficher v18.x.x
npm --version   # Doit afficher 9.x.x

# Installation de PM2 globalement
sudo npm install -g pm2

# Configuration PM2 pour démarrer automatiquement
pm2 startup
# Suivre les instructions affichées pour exécuter la commande sudo

# Création du répertoire de l'application
sudo mkdir -p /var/www/flowhr
sudo chown -R flowhr:flowhr /var/www/flowhr
cd /var/www/flowhr`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Installation Node.js...`, "Node.js Install")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Node.js Install" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">3. Configuration Nginx en Reverse Proxy</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Créer la configuration Nginx pour Flow HR
sudo tee /etc/nginx/sites-available/flowhr << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (seront générés par Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Configuration SSL sécurisée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Configuration des uploads
    client_max_body_size 10M;

    # Frontend React (build statique)
    location / {
        root /var/www/flowhr/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout configurations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Upload d'images et fichiers
    location /uploads/ {
        alias /var/www/flowhr/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
        
        # Sécurité: empêcher l'exécution de scripts
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Logs d'accès et d'erreur
    access_log /var/log/nginx/flowhr.access.log;
    error_log /var/log/nginx/flowhr.error.log;
}
EOF

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/flowhr /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Configuration Nginx...`, "Nginx Config")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Nginx Config" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">4. Génération Certificat SSL avec Let's Encrypt</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# IMPORTANT: Remplacez 'votre-domaine.com' par votre vrai domaine
# Assurez-vous que votre domaine pointe vers l'IP de votre serveur

# Génération du certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Le script va vous demander :
# 1. Votre adresse email
# 2. Accepter les conditions d'utilisation
# 3. Choix de partager l'email (optionnel)

# Vérification du certificat
sudo certbot certificates

# Test du renouvellement automatique
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré via cron
sudo crontab -l | grep certbot
# Doit afficher : 0 12 * * * /usr/bin/certbot renew --quiet

# Si pas présent, ajouter la tâche cron
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Génération SSL...`, "SSL Setup")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "SSL Setup" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3">5. Déploiement et Configuration de l'Application</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Cloner les projets (backend et frontend adapté)
cd /var/www/flowhr

# Cloner votre backend personnalisé
git clone https://github.com/votre-compte/flowhr-backend.git backend
cd backend

# Installer les dépendances
npm install --production

# Créer le fichier de configuration production
cp .env.example .env
nano .env

# Configuration .env pour production :
DATABASE_URL="postgresql://flowhr_admin:mot_de_passe@localhost:5432/flowhr_production"
JWT_SECRET="jwt_secret_super_secure_genere_aleatoirement_32_caracteres_minimum"
JWT_EXPIRES_IN="24h"
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://votre-domaine.com"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/var/www/flowhr/backend/uploads"

# Créer les répertoires d'upload
mkdir -p uploads/{profiles,documents,temp}
chmod 755 uploads
chmod 755 uploads/*

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations de base de données
npx prisma migrate deploy

# (Optionnel) Seeder avec des données de test
npm run db:seed

# Configurer PM2 pour le backend
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'flowhr-backend',
    script: 'src/server.js',
    cwd: '/var/www/flowhr/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    instances: 2,  // Utilise 2 instances pour la haute disponibilité
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    error_file: '/var/log/pm2/flowhr-backend-error.log',
    out_file: '/var/log/pm2/flowhr-backend-out.log',
    log_file: '/var/log/pm2/flowhr-backend.log',
    time: true,
    restart_delay: 4000,
    max_restarts: 10
  }]
};
EOF

# Créer le répertoire des logs PM2
sudo mkdir -p /var/log/pm2
sudo chown flowhr:flowhr /var/log/pm2

# Démarrer l'application avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Maintenant le frontend adapté - cloner votre version modifiée de Flow HR
cd /var/www/flowhr
git clone https://github.com/votre-compte/flowhr-frontend.git frontend
cd frontend

# Installer les dépendances
npm install

# Créer le fichier de configuration frontend
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://votre-domaine.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=1.0.0
EOF

# Build de production
npm run build

# Vérifier que le build s'est bien passé
ls -la build/

# Régler les permissions
sudo chown -R flowhr:flowhr /var/www/flowhr
sudo chmod -R 755 /var/www/flowhr`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Déploiement application...`, "App Deploy")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "App Deploy" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Docker */}
            <TabsContent value="docker">
              <div className="space-y-6">
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-purple-900">🐳 Déploiement Docker Complet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">1. Installation Docker et Docker Compose</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérification
docker --version
docker-compose --version

# Activer Docker au démarrage
sudo systemctl enable docker`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Installation Docker...`, "Docker Install")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Docker Install" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">2. Docker Compose pour Flow HR</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Créer le fichier docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Base de données PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: flowhr_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: flowhr_production
      POSTGRES_USER: flowhr_admin
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - flowhr_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flowhr_admin -d flowhr_production"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Cache Redis pour les sessions
  redis:
    image: redis:7-alpine
    container_name: flowhr_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - flowhr_network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: flowhr_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://flowhr_admin:\${POSTGRES_PASSWORD}@postgres:5432/flowhr_production
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: \${JWT_SECRET}
      NODE_ENV: production
      PORT: 3001
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - flowhr_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend React (build)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: flowhr_frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - flowhr_network

  # Monitoring avec Prometheus (optionnel)
  prometheus:
    image: prom/prometheus:latest
    container_name: flowhr_prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - flowhr_network
    profiles:
      - monitoring

  # Grafana pour les métriques (optionnel)
  grafana:
    image: grafana/grafana:latest
    container_name: flowhr_grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: \${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - flowhr_network
    profiles:
      - monitoring

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  flowhr_network:
    driver: bridge
EOF

# Créer le fichier .env pour Docker Compose
cat > .env << 'EOF'
# Mots de passe sécurisés - CHANGEZ CES VALEURS !
POSTGRES_PASSWORD=votre_mot_de_passe_postgres_super_secure_123!
REDIS_PASSWORD=votre_mot_de_passe_redis_secure_456!
JWT_SECRET=votre_jwt_secret_super_secure_au_moins_32_caracteres_789!
GRAFANA_PASSWORD=votre_mot_de_passe_grafana_secure_012!

# Configuration générale
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.com
EOF

# Démarrer tous les services
docker-compose up -d

# Démarrer avec monitoring (optionnel)
docker-compose --profile monitoring up -d

# Vérifier le statut des conteneurs
docker-compose ps

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f postgres`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Docker Compose...`, "Docker Compose")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Docker Compose" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">3. Dockerfile pour le Backend</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Créer le Dockerfile pour le backend
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S flowhr -u 1001

# Changer le propriétaire des fichiers
RUN chown -R flowhr:nodejs /app
USER flowhr

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "src/server.js"]
EOF`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Créer le Dockerfile...`, "Backend Dockerfile")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Backend Dockerfile" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3">4. Dockerfile pour le Frontend</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Créer le Dockerfile pour le frontend
cat > frontend/Dockerfile << 'EOF'
# Stage 1: Build de l'application React
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serveur Nginx
FROM nginx:alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=builder /app/build /usr/share/nginx/html

# Exposer les ports
EXPOSE 80 443

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
EOF

# Créer la configuration Nginx pour le frontend
cat > frontend/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Configuration de logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    # Configuration générale
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 10M;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    server {
        listen 80;
        server_name localhost;
        
        # Servir les fichiers statiques React
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # Cache pour les assets statiques
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # Proxy vers le backend API
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Route de santé
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Créer le Dockerfile frontend...`, "Frontend Dockerfile")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Frontend Dockerfile" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sécurité */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card className="bg-red-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-red-900">🛡️ Sécurisation Complète de l'Infrastructure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-red-800 mb-3">1. Hardening du Serveur Ubuntu</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`# Configuration avancée du firewall UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser uniquement les ports nécessaires
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Rate limiting sur SSH pour éviter les attaques brute force
sudo ufw limit ssh

# Activer le firewall
sudo ufw enable

# Configuration avancée de Fail2Ban
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1h

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600

[postfix]
enabled = false
EOF

sudo systemctl restart fail2ban

# Désactiver les services non nécessaires
sudo systemctl disable snapd
sudo systemctl stop snapd
sudo systemctl mask snapd

# Configuration des limites système
sudo tee -a /etc/security/limits.conf << 'EOF'
# Limites pour l'utilisateur flowhr
flowhr soft nofile 65536
flowhr hard nofile 65536
flowhr soft nproc 32768
flowhr hard nproc 32768
EOF

# Configuration sysctl pour la sécurité
sudo tee /etc/sysctl.d/99-security.conf << 'EOF'
# Protection contre les attaques réseau
net.ipv4.conf.default.rp_filter=1
net.ipv4.conf.all.rp_filter=1
net.ipv4.tcp_syncookies=1
net.ipv4.conf.all.accept_redirects=0
net.ipv4.conf.default.accept_redirects=0
net.ipv4.conf.all.secure_redirects=0
net.ipv4.conf.default.secure_redirects=0
net.ipv6.conf.all.accept_redirects=0
net.ipv6.conf.default.accept_redirects=0
net.ipv4.conf.all.send_redirects=0
net.ipv4.conf.default.send_redirects=0

# Protection contre le IP spoofing
net.ipv4.conf.all.log_martians=1
net.ipv4.conf.default.log_martians=1

# Protection contre les SYN attacks
net.ipv4.tcp_max_syn_backlog=2048
net.ipv4.tcp_synack_retries=3

# Désactiver le source routing
net.ipv4.conf.all.accept_source_route=0
net.ipv6.conf.all.accept_source_route=0

# Optimisations pour PostgreSQL et Node.js
vm.swappiness=10
vm.dirty_ratio=15
vm.dirty_background_ratio=5
kernel.shmmax=268435456
EOF

sudo sysctl -p /etc/sysctl.d/99-security.conf`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`# Hardening serveur...`, "Server Hardening")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Server Hardening" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Maintenance */}
            <TabsContent value="maintenance">
              <div className="space-y-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-900">🔧 Maintenance et Monitoring</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3">Scripts de Maintenance Automatisés</h4>
                      <div className="bg-gray-800 text-green-400 p-4 rounded-lg relative">
                        <pre className="text-sm overflow-x-auto">
{`#!/bin/bash
# Script de maintenance quotidienne - /opt/flowhr/maintenance.sh

LOG_FILE="/var/log/flowhr_maintenance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Début de la maintenance quotidienne" >> $LOG_FILE

# 1. Backup de la base de données
/opt/flowhr/backup_postgres.sh >> $LOG_FILE 2>&1

# 2. Nettoyage des logs anciens (plus de 30 jours)
find /var/log -name "*.log" -mtime +30 -delete
find /var/log/nginx -name "*.log" -mtime +7 -delete

# 3. Nettoyage des fichiers temporaires
find /tmp -type f -mtime +3 -delete
find /var/www/flowhr/backend/uploads/temp -type f -mtime +1 -delete

# 4. Mise à jour des certificats SSL
certbot renew --quiet >> $LOG_FILE 2>&1

# 5. Redémarrage des services si nécessaire
if systemctl is-failed --quiet nginx; then
    systemctl restart nginx
    echo "[$DATE] Nginx redémarré" >> $LOG_FILE
fi

if systemctl is-failed --quiet postgresql; then
    systemctl restart postgresql
    echo "[$DATE] PostgreSQL redémarré" >> $LOG_FILE
fi

# 6. Vérification de l'espace disque
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "[$DATE] ALERTE: Espace disque > 85% ($DISK_USAGE%)" >> $LOG_FILE
    # Envoyer un email d'alerte (si configuré)
    # echo "Espace disque critique: $DISK_USAGE%" | mail -s "Alerte Flow HR" admin@votre-domaine.com
fi

# 7. Vérification de la mémoire
MEM_USAGE=$(free | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
echo "[$DATE] Utilisation mémoire: $MEM_USAGE" >> $LOG_FILE

# 8. Statut PM2
pm2 status >> $LOG_FILE 2>&1

echo "[$DATE] Fin de la maintenance quotidienne" >> $LOG_FILE

# Programmer dans crontab
# 0 3 * * * /opt/flowhr/maintenance.sh`}
                        </pre>
                        <Button
                          onClick={() => copyToClipboard(`#!/bin/bash...`, "Maintenance Script")}
                          className="absolute top-2 right-2 p-2"
                          variant="ghost"
                          size="sm"
                        >
                          {copiedCode === "Maintenance Script" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
