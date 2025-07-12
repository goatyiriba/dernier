import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  MessageSquare,
  Shield,
  Building,
  Award,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

export default function PublicHome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gestion des Employés",
      description: "Gérez facilement vos équipes, profils et informations personnelles"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Gestion des Congés",
      description: "Demandez et approuvez les congés en toute simplicité"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Suivi du Temps",
      description: "Enregistrez vos heures de travail et suivez votre productivité"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Évaluation des Performances",
      description: "Analysez et améliorez les performances de vos équipes"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Communication",
      description: "Annonces, messages et collaboration en temps réel"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Gestion Documentaire",
      description: "Stockez et organisez tous vos documents importants"
    }
  ];

  const benefits = [
    "Interface moderne et intuitive",
    "Sécurité des données garantie",
    "Accessible depuis n'importe où",
    "Support multilingue",
    "Intégration facile",
    "Rapports détaillés"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR Management System</h1>
                <p className="text-sm text-gray-600">Solution complète de gestion RH</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Commencer
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
              <Star className="w-4 h-4 mr-2" />
              Nouveau système d'authentification local
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Gérez vos ressources humaines avec
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                {" "}simplicité et efficacité
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Une plateforme complète pour la gestion des employés, des congés, 
              du suivi du temps et bien plus encore. Simple, sécurisé et performant.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Essayer maintenant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Connexion démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités qui font de notre plateforme 
              la solution idéale pour votre gestion RH.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pourquoi choisir notre plateforme ?
              </h2>
              <p className="text-lg text-gray-600">
                Une solution conçue pour répondre aux besoins modernes de gestion RH.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {benefits.slice(3).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Testez notre plateforme avec le compte de démonstration ou créez votre propre compte.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Compte de démonstration
              </h3>
              <p className="text-blue-700 mb-4">
                Connectez-vous avec les identifiants suivants pour tester toutes les fonctionnalités :
              </p>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-600 mb-1">Email : <code className="bg-gray-100 px-2 py-1 rounded">admin@hr-app.local</code></p>
                <p className="text-sm text-gray-600">Mot de passe : <code className="bg-gray-100 px-2 py-1 rounded">admin123</code></p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Commencer maintenant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HR System</span>
              </div>
              <p className="text-gray-400">
                Solution complète de gestion des ressources humaines pour les entreprises modernes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Gestion des employés</li>
                <li>Suivi du temps</li>
                <li>Gestion des congés</li>
                <li>Évaluations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Guide d'utilisation</li>
                <li>FAQ</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sécurité</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Authentification locale</li>
                <li>Chiffrement des données</li>
                <li>Contrôle d'accès</li>
                <li>Sauvegarde automatique</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HR Management System. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 