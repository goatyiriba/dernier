
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HelpCircle,
  Search,
  Play,
  BookOpen,
  Video,
  FileText,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  DollarSign,
  Megaphone,
  Settings,
  Database,
  Shield,
  ChevronRight,
  CheckCircle,
  Star,
  Lightbulb,
  Target,
  Zap,
  ArrowRight,
  Eye,
  Download,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHelp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTutorial, setExpandedTutorial] = useState(null);

  const helpCategories = [
    { id: "dashboard", name: "Tableau de Bord", icon: LayoutDashboard, color: "blue" },
    { id: "employees", name: "Gestion Employés", icon: Users, color: "green" },
    { id: "leave", name: "Gestion Congés", icon: Calendar, color: "purple" },
    { id: "time", name: "Pointage", icon: Clock, color: "orange" },
    { id: "performance", name: "Performance", icon: TrendingUp, color: "pink" },
    { id: "finance", name: "Finance", icon: DollarSign, color: "emerald" },
    { id: "communication", name: "Communication", icon: Megaphone, color: "red" },
    { id: "settings", name: "Paramètres", icon: Settings, color: "gray" }
  ];

  const tutorials = [
    {
      id: 1,
      title: "Comprendre votre Dashboard Admin",
      category: "dashboard",
      difficulty: "Débutant",
      duration: "5 min",
      type: "tutorial",
      description: "Découvrez les principales métriques et fonctionnalités de votre tableau de bord administrateur.",
      steps: [
        {
          title: "🏠 Vue d'ensemble du Dashboard",
          content: "📊 **Le dashboard admin** vous donne une vue complète de votre organisation avec **4 cartes principales** :\n\n👥 **Total Employés** : Nombre total d'employés actifs dans votre système\n⏳ **Congés en Attente** : Demandes nécessitant votre approbation\n⏰ **Pointages du Jour** : Employés qui ont pointé aujourd'hui\n📢 **Annonces Actives** : Communications importantes en cours\n\n💡 **Navigation** : Cliquez sur chaque carte pour accéder aux détails complets.\n\n🔄 **Actualisation automatique** : Les données se mettent à jour toutes les 5 minutes."
        },
        {
          title: "📈 Métriques Clés de Performance",
          content: "🎯 **Les 3 cartes du bas** affichent des indicateurs cruciaux :\n\n📊 **Taux d'Activité** :\n• 💚 Vert (>90%) : Équipe très active\n• 🟡 Orange (70-90%) : Activité normale\n• 🔴 Rouge (<70%) : Attention requise\n\n👥 **Taux de Présence** :\n• ✅ Calculé sur les 30 derniers jours\n• 📅 Exclut les congés approuvés\n• ⚠️ Alerte si <85%\n\n⚖️ **Statut Approbations** :\n• 🟢 **À jour** : Aucune demande en attente\n• 🟡 **Modéré** : Quelques demandes à traiter\n• 🔴 **Urgent** : Beaucoup de demandes en retard\n\n📈 Ces métriques vous aident à surveiller la **santé organisationnelle** en temps réel."
        },
        {
          title: "⚡ Activité Récente Centralisée",
          content: "🎯 **La section centrale** montre les événements importants :\n\n📝 **Nouvelles demandes de congés** :\n• 👤 Nom de l'employé demandeur\n• 📅 Dates et durée demandées\n• 🎭 Type de congé (vacances, maladie, etc.)\n• ⏱️ Temps écoulé depuis la demande\n• 🚀 **Action** : Cliquez pour approuver/refuser directement\n\n⏰ **Pointages incomplets** :\n• ⚠️ Employés qui ont oublié de pointer la sortie\n• 📍 Localisation du dernier pointage\n• 🕐 Heure d'entrée sans sortie correspondante\n• 🔧 **Action** : Corriger manuellement si nécessaire\n\n📢 **Annonces urgentes** :\n• 🚨 Messages prioritaires à diffuser\n• 👥 Audience cible (tous/département/rôle)\n• 📊 Taux de lecture actuel\n• ✏️ **Action** : Modifier ou republier\n\n💡 **Cliquez sur chaque élément** pour accéder aux détails et actions spécifiques."
        },
        {
          title: "🚀 Panneau d'Actions Rapides",
          content: "⚡ **Le panneau de droite** propose des raccourcis vers les tâches courantes :\n\n👥 **Gérer les Employés** :\n• ➕ Ajouter un nouvel employé rapidement\n• 👀 Vue d'overview de l'équipe\n• 🔍 Recherche et filtres avancés\n• 📊 Statistiques par département\n\n📢 **Créer des Annonces** :\n• ✍️ Rédaction rapide d'annonce\n• 🎯 Ciblage par audience\n• 📅 Programmation de diffusion\n• 📈 Suivi des lectures\n\n📝 **Revoir les Congés** :\n• 📋 Liste complète des demandes en attente\n• ⚡ Approbation/refus en lot\n• 📊 Analyse des tendances de congés\n• 📅 Vue calendrier équipe\n\n⚙️ **Accéder aux Paramètres** :\n• 🎨 Personnalisation de l'interface\n• 👤 Gestion des comptes utilisateurs\n• 🔐 Paramètres de sécurité\n• 📊 Configuration des rapports\n\n🎯 **Objectif** : Vous permettre d'effectuer 80% de vos tâches quotidiennes en 2 clics maximum !"
        }
      ]
    },
    {
      id: 2,
      title: "Gestion Complète des Employés",
      category: "employees",
      difficulty: "Intermédiaire",
      duration: "8 min",
      type: "tutorial",
      description: "Maîtrisez l'ajout, la modification et la gestion efficace de votre équipe.",
      steps: [
        {
          title: "➕ Ajouter un Nouvel Employé",
          content: "🎯 **Processus étape par étape** :\n\n1️⃣ **Cliquer sur 'Ajouter Employé'** 🆕\n• 📍 Bouton visible en haut à droite\n• 🎨 Icône '+' clairement identifiable\n\n2️⃣ **Informations Personnelles** 👤 :\n• 📝 **Prénom & Nom** (obligatoires*)\n• 📧 **Email professionnel** (obligatoire*)\n• 📱 **Téléphone** (recommandé)\n• 🏠 **Adresse complète** (optionnelle)\n• 🆘 **Contact d'urgence** (important)\n\n3️⃣ **Informations Professionnelles** 💼 :\n• 🏢 **Département** : Choisir dans la liste déroulante\n• 🎭 **Poste/Fonction** (obligatoire*)\n• 📅 **Date de début** (obligatoire*)\n• 💰 **Salaire** (optionnel, confidentiel)\n• 👑 **Manager** : Sélectionner dans la liste des employés\n\n4️⃣ **Détails Contractuels** 📋 :\n• ⏰ **Type d'emploi** : Temps plein/partiel/contrat/stage\n• 📊 **Statut initial** : Actif par défaut\n• 🛠️ **Compétences** : Liste des skills techniques\n• 📸 **Photo de profil** : Upload optionnel\n\n✅ **Validation** : Tous les champs marqués * sont obligatoires pour sauvegarder."
        },
        {
          title: "👀 Visualisation et Actions sur les Fiches",
          content: "🎯 **3 actions principales** disponibles sur chaque fiche employé :\n\n👁️ **Icône Œil (Voir)** :\n• 📋 **Vue complète** : Toutes les informations personnelles et professionnelles\n• 📊 **Statistiques** : Pointages, congés, évaluations\n• 📈 **Historique** : Chronologie des événements\n• 🏆 **Badges** : Récompenses et reconnaissances\n• 📞 **Contact rapide** : Email et téléphone cliquables\n• 📅 **Planning** : Congés à venir et absences\n\n✏️ **Icône Crayon (Modifier)** :\n• 🔄 **Mise à jour** des informations personnelles\n• 💼 **Changement** de poste ou département\n• 💰 **Ajustement** de salaire (si autorisé)\n• 👑 **Réassignation** de manager\n• 📸 **Changement** de photo de profil\n• ⚙️ **Modification** des compétences\n\n🗑️ **Menu Actions (···)** :\n• ⚡ **Désactiver/Activer** le compte\n• 🗑️ **Supprimer** définitivement (avec confirmation)\n• 📊 **Générer rapport** individuel\n• 👥 **Promouvoir** en administrateur\n• 🔄 **Réinitialiser** mot de passe\n\n⚠️ **Attention** : La suppression est irréversible ! Préférez la désactivation."
        },
        {
          title: "🔍 Filtres et Recherche Avancée",
          content: "🎯 **Système de recherche multicritères** :\n\n🔍 **Barre de recherche globale** :\n• 👤 **Par nom** : Prénom ou nom de famille\n• 📧 **Par email** : Adresse complète ou partielle\n• 🎭 **Par poste** : Fonction ou titre\n• 🏢 **Par département** : Nom du département\n• 🔢 **Recherche intelligente** : Combine plusieurs critères\n\n🏢 **Filtre par Département** :\n• 💻 **Engineering** : Développeurs, DevOps, Architectes\n• 📈 **Marketing** : Communication, Digital, Events\n• 💰 **Sales** : Commercial, Business Development\n• 👥 **HR** : Ressources Humaines, Recrutement\n• 💼 **Finance** : Comptabilité, Contrôle de gestion\n• 🔧 **Operations** : Logistique, Support, IT\n• 🎨 **Design** : UX/UI, Graphisme, Creative\n• ⚖️ **Legal** : Juridique, Compliance\n\n📊 **Filtre par Statut** :\n• ✅ **Actif** : Employés en poste actuellement\n• ⏸️ **Inactif** : Comptes désactivés temporairement\n• 🏖️ **En Congé** : Absents avec congés approuvés\n• ❌ **Terminé** : Employés ayant quitté l'entreprise\n\n🔄 **Combinaison de filtres** : Les filtres se cumulent pour affiner précisément les résultats.\n\n💡 **Astuce** : Utilisez 'Réinitialiser filtres' pour revenir à la vue complète."
        },
        {
          title: "🏢 Organisation par Départements",
          content: "🎯 **Structure organisationnelle claire** :\n\n💻 **Engineering** (Technique) :\n• 👨‍💻 **Développeurs** : Frontend, Backend, Fullstack\n• 🔧 **DevOps** : Infrastructure, CI/CD, Cloud\n• 🏗️ **Architectes** : Solutions, Systèmes\n• 🔍 **QA** : Tests, Qualité\n• 📊 **Data** : Scientists, Analysts, Engineers\n\n📈 **Marketing** (Communication) :\n• 📱 **Digital** : SEO, SEM, Social Media\n• ✍️ **Content** : Rédaction, Storytelling\n• 🎨 **Creative** : Graphisme, Vidéo\n• 📊 **Analytics** : Performance, ROI\n• 🎪 **Events** : Salons, Webinaires\n\n💰 **Sales** (Commercial) :\n• 🎯 **Business Development** : Prospection\n• 🤝 **Account Management** : Suivi clients\n• 📞 **Inside Sales** : Vente interne\n• 🌍 **Field Sales** : Vente terrain\n• 💼 **Sales Operations** : Support vente\n\n👥 **HR** (Ressources Humaines) :\n• 🔍 **Recrutement** : Sourcing, Entretiens\n• 📚 **Formation** : Développement, Onboarding\n• 💰 **Compensation** : Paie, Avantages\n• 🤝 **Relations** : SIRH, Communication interne\n\n🎯 **Avantages de l'organisation** :\n• 📊 **Rapports par département** : Analyses ciblées\n• 👑 **Hiérarchie claire** : Managers identifiés\n• 🔄 **Mobilité interne** : Évolutions possibles\n• 📈 **KPIs spécifiques** : Métriques adaptées par métier"
        }
      ]
    },
    {
      id: 3,
      title: "Système de Gestion des Congés",
      category: "leave",
      difficulty: "Intermédiaire",
      duration: "10 min",
      type: "tutorial",
      description: "Maîtrisez le processus d'approbation et de gestion des demandes de congés de votre équipe.",
      steps: [
        {
          title: "📋 Comprendre les Demandes en Attente",
          content: "🎯 **Interface de gestion centralisée** :\n\n📊 **Informations affichées** pour chaque demande :\n• 👤 **Nom de l'employé** : Qui fait la demande\n• 🎭 **Type de congé** : Vacances, Maladie, Personnel, Maternité, etc.\n• 📅 **Dates demandées** : Début et fin avec calcul automatique\n• 🔢 **Durée** : Nombre de jours ouvrables\n• 📝 **Raison** : Justification fournie par l'employé\n• ⏰ **Date de demande** : Quand la demande a été soumise\n• ⚡ **Urgence** : Délai entre demande et début de congé\n\n🎨 **Codes visuels** :\n• 🟡 **Orange** : Statut 'En Attente' (Pending)\n• ⏰ **Horloge** : Demande récente (<24h)\n• ⚠️ **Triangle** : Congé qui commence bientôt\n• 📋 **Document** : Justificatif attaché\n\n🔄 **Tri et organisation** :\n• 📅 **Par date** : Plus récentes en premier\n• ⚡ **Par urgence** : Congés imminents prioritaires\n• 🏢 **Par département** : Filtrage par équipe\n• 👤 **Par employé** : Historique individuel"
        },
        {
          title: "⚖️ Processus d'Approbation Détaillé",
          content: "🎯 **Deux actions principales** par demande :\n\n✅ **Bouton 'Approuver'** :\n• 🎉 **Effet** : Le congé est officiellement accordé\n• 📧 **Notification** : Email automatique à l'employé\n• 📅 **Calendrier** : Ajout automatique aux plannings\n• 💰 **Décompte** : Soustraction du solde de congés\n• 📊 **Statistiques** : Mise à jour des métriques\n\n❌ **Bouton 'Refuser'** :\n• 📝 **Commentaire obligatoire** : Expliquer le refus\n• 📧 **Notification** : Email avec justification\n• 🔄 **Possibilité** : Employé peut re-demander\n• 📊 **Suivi** : Taux de refus dans les rapports\n\n💭 **Zone de commentaires** :\n• ✍️ **Ajout facultatif** : Précisions pour l'employé\n• 💡 **Suggestions** : Dates alternatives possibles\n• ⚠️ **Alertes** : Informations importantes à retenir\n• 🤝 **Coordination** : Mention d'autres congés simultanés\n\n🎯 **Conseils d'approbation** :\n• 📊 **Vérifiez** les effectifs restants sur la période\n• 📅 **Considérez** les congés déjà approuvés dans l'équipe\n• 💼 **Évaluez** l'impact sur les projets en cours\n• ⏰ **Respectez** les délais de réponse (48h max)"
        },
        {
          title: "📅 Calendrier Global des Congés",
          content: "🎯 **Vue d'ensemble visuelle** de tous les congés :\n\n📊 **Affichage calendrier** :\n• 📅 **Vue mensuelle** : Mois complet avec tous les congés\n• 📝 **Vue liste** : Chronologique avec détails\n• 👥 **Vue équipe** : Par département ou service\n• 🎨 **Codes couleurs** : Différents types de congés\n\n🌈 **Légende des couleurs** :\n• 🟦 **Bleu** : Congés vacances approuvés\n• 🟥 **Rouge** : Congés maladie\n• 🟪 **Violet** : Congés maternité/paternité\n• 🟨 **Jaune** : Congés personnels\n• 🟫 **Marron** : Congés deuil\n• ⬜ **Gris** : Jours fériés\n\n🔍 **Fonctionnalités avancées** :\n• 🎯 **Filtre par département** : Focus sur une équipe\n• 👤 **Filtre par employé** : Planning individuel\n• 📊 **Analyse de charge** : Pourcentage d'absents par jour\n• ⚠️ **Alertes conflits** : Trop d'absents simultanés\n• 📥 **Export** : PDF ou Excel pour impression\n\n💡 **Utilisation stratégique** :\n• 📈 **Planification** : Anticiper les périodes creuses\n• 🎯 **Optimisation** : Répartir les congés équitablement\n• 🚨 **Prévention** : Éviter les surcharges équipe\n• 📊 **Reporting** : Analyses pour la direction"
        },
        {
          title: "📊 Rapports et Analyses de Congés",
          content: "🎯 **Outils d'analyse avancés** pour optimiser la gestion :\n\n📈 **Rapports automatiques** :\n• 📊 **Tableau de bord** : Métriques clés en temps réel\n• 📅 **Rapport mensuel** : Synthèse des congés du mois\n• 👥 **Analyse par équipe** : Comparaison des départements\n• 👤 **Profil individuel** : Historique détaillé par employé\n• 🔮 **Prévisions** : Projections basées sur les tendances\n\n📊 **Métriques importantes** :\n• 📉 **Taux d'utilisation** : % de congés pris vs acquis\n• ⚡ **Délai moyen** : Temps entre demande et prise de congé\n• ✅ **Taux d'approbation** : % de demandes acceptées\n• 📅 **Répartition saisonnière** : Périodes favorites\n• 🏢 **Comparaison départements** : Équité entre équipes\n\n🎯 **Analyses prédictives** :\n• 🔮 **Pics de congés** : Périodes de forte demande\n• ⚠️ **Risques de surcharge** : Équipes en sous-effectif\n• 💡 **Recommandations** : Optimisation des plannings\n• 📈 **Tendances** : Évolution des habitudes de congés\n\n📄 **Exports disponibles** :\n• 📊 **Excel** : Données brutes pour analyses approfondies\n• 📄 **PDF** : Rapports formatés pour présentation\n• 📧 **Email automatique** : Envoi programmé aux managers\n• 🔗 **Partage** : Links sécurisés pour la direction\n\n💼 **Applications business** :\n• 💰 **Budget RH** : Prévoir les remplacements\n• 📈 **Productivité** : Impact des absences sur les résultats\n• 🎯 **Politique** : Ajuster les règles de congés\n• 🤝 **Négociation** : Arguments pour les accords collectifs"
        }
      ]
    },
    {
      id: 4,
      title: "Suivi du Temps de Travail",
      category: "time",
      difficulty: "Avancé",
      duration: "12 min",
      type: "tutorial",
      description: "Surveillez et gérez les pointages de vos employés efficacement.",
      steps: [
        {
          title: "⏱️ Vue d'Ensemble des Pointages",
          content: "🎯 **Le dashboard de pointage** vous offre une vue globale :\n\n📊 **Statistiques du jour** :\n• ✅ Nombre d'employés ayant pointé l'entrée\n• ❌ Nombre de pointages incomplets (sans sortie)\n• 📈 Taux de conformité des pointages\n\n⚠️ **Alertes anomalies** :\n• ⏰ Retards fréquents\n• 🕒 Pointages hors des heures de travail\n• 📍 Disparité géographique (si option activée)\n\n👤 **Statistiques par employé** :\n• 🟢 Présence actuelle\n• 🔴 Absence non justifiée\n• 📊 Heures travaillées cumulées\n\n💡 **Objectif** : Identifier rapidement les écarts et assurer la fiabilité des données de temps."
        },
        {
          title: "🔧 Gestion des Entrées Incomplètes",
          content: "🎯 **Corrigez les erreurs de pointage** :\n\n📝 **Pointages sans sortie** :\n• 🔴 Apparaissent en rouge sur la liste\n• 👤 Nom de l'employé concerné\n• 📅 Date et heure d'entrée\n• ❓ Cause possible : Oubli, problème technique\n\n✍️ **Actions de correction** :\n• ✏️ **Modifier manuellement** : Saisissez l'heure de sortie estimée après vérification.\n• 📞 **Contacter l'employé** : Demandez à l'employé de justifier et de compléter son pointage.\n• ✅ **Marquer comme résolu** : Une fois la correction effectuée.\n\n⚠️ **Impact** : Les pointages incomplets faussent les calculs d'heures travaillées et peuvent affecter la paie."
        },
        {
          title: "📍 Localisation et Sécurité",
          content: "🎯 **Sécurisez vos données de pointage** :\n\n🌍 **Localisation GPS** :\n• 📍 Capture de la position GPS à chaque pointage (si activé).\n• 🗺️ Visualisation sur une carte pour vérifier la conformité.\n• 🚫 Option de bloquer les pointages hors des zones autorisées.\n\n💻 **Adresse IP** :\n• 🌐 Enregistrement de l'adresse IP de l'appareil utilisé.\n• 🛡️ Aide à détecter les tentatives de fraude ou les pointages depuis des lieux non autorisés.\n\n🚨 **Alertes de sécurité** :\n• ⚠️ Notification en cas de pointage depuis une localisation suspecte ou inconnue.\n• 🔒 Rapports d'anomalies pour investigation.\n\n💡 **Confiance** : Assure l'authenticité et la fiabilité des données de présence pour tous les employés."
        },
        {
          title: "📊 Rapports de Présence Détaillés",
          content: "🎯 **Analysez les tendances de présence** :\n\n📈 **Types de rapports** :\n• 📊 **Heures travaillées** : Par jour, semaine, mois, employé ou équipe.\n• ⏰ **Retards et absences** : Fréquence, durée, causes.\n• 📉 **Taux de présence** : Global et par département.\n• 👤 **Historique individuel** : Dossier complet des pointages de chaque employé.\n\n📦 **Options d'export** :\n• 📄 **Excel/CSV** : Pour des analyses personnalisées ou l'intégration à d'autres systèmes (paie).\n• 📊 **PDF** : Pour des présentations ou des archives.\n\n💡 **Utilisation stratégique** :\n• 💰 **Paie** : Assurez une rémunération précise basée sur les heures réelles.\n• 📈 **Productivité** : Identifiez les goulots d'étranglement ou les problèmes de gestion du temps.\n• 🤝 **Conformité** : Respectez les réglementations en matière de temps de travail.\n• 🎯 **Prise de décision** : Basez vos stratégies RH sur des données fiables."
        }
      ]
    },
    {
      id: 5,
      title: "Module Finance Avancé",
      category: "finance",
      difficulty: "Avancé",
      duration: "15 min",
      type: "tutorial",
      description: "Gérez les finances de votre entreprise avec le système multi-devises.",
      steps: [
        {
          title: "💰 Dashboard Financier Interactif",
          content: "🎯 **Vue d'ensemble de vos finances** :\n\n📊 **4 métriques clés** :\n• 📈 **Trésorerie Nette** : Liquidités disponibles\n• 💸 **Revenus Totaux** : Chiffre d'affaires généré\n•  расходов **Dépenses Totales** : Coûts opérationnels\n• 🌍 **Multi-Devises** : Valeur consolidée en monnaie locale\n\n🔄 **Données en temps réel** :\n• Les chiffres s'actualisent instantanément à chaque transaction.\n• 📊 Graphiques interactifs pour visualiser les tendances.\n\n💡 **Objectif** : Obtenez une image claire et rapide de la santé financière de votre entreprise."
        },
        {
          title: "💳 Gestion des Transactions Multi-Devises",
          content: "🎯 **Enregistrez chaque flux financier** :\n\n➕ **Ajout de transactions** :\n• 📈 **Revenu** : Ventes, services, investissements.\n• 📉 **Dépense** : Salaires, loyers, fournitures, marketing.\n\n🌐 **Support Multi-Devises** :\n• Saisissez les montants dans la devise d'origine (USD, EUR, GBP, etc.).\n• Le système convertit automatiquement au taux de change du jour.\n• 💰 Historique des taux de change pour des rapports précis.\n\n🏷️ **Catégorisation et Pièces Jointes** :\n• 📁 **Catégorisez** : Salaires, Marketing, Équipement, Transport, etc.\n• 📎 **Attachez des reçus** : Photos ou scans de factures pour un suivi complet et la conformité fiscale.\n\n💡 **Traçabilité** : Chaque transaction est enregistrée avec sa date, son montant, sa devise, sa catégorie et les pièces justificatives."
        },
        {
          title: " budgeting Budgets et Planification Intelligente",
          content: "🎯 **Contrôlez vos dépenses et planifiez l'avenir** :\n\n📝 **Création de budgets** :\n• 📅 Par période : Mensuel, trimestriel, annuel.\n• 🏷️ Par catégorie : Marketing, RH, Opérations, R&D.\n• 📊 Définissez des objectifs de dépenses pour chaque domaine.\n\n📈 **Suivi en temps réel** :\n• 🟢 Barres de progression : Visualisez l'état d'avancement par rapport au budget.\n• ⚠️ Alertes de dépassement : Recevez des notifications lorsque vous approchez ou dépassez votre limite.\n\n🔮 **Projections automatiques** :\n• Basées sur vos dépenses passées et actuelles.\n• Aide à anticiper les besoins futurs et à ajuster vos stratégies.\n\n💡 **Maîtrise budgétaire** : Évitez les surprises et optimisez l'allocation de vos ressources financières."
        },
        {
          title: "📊 Rapports Financiers et Analytics Avancés",
          content: "🎯 **Obtenez une vision profonde de votre performance financière** :\n\n📈 **Rapports clés** :\n• 💵 **Flux de Trésorerie** : Mouvements d'argent entrant et sortant.\n• ⚖️ **Compte de Résultat (P&L)** : Revenus vs. dépenses pour une période donnée.\n• 📊 **Répartition par Catégorie** : Où va votre argent, et d'où vient-il ?\n• 🌐 **Analyses Multi-Devises** : Performance de chaque devise et leur impact consolidé.\n\n🔍 **Options d'analyse** :\n• 📅 Par période personnalisée : Jour, semaine, mois, année.\n• 📈 Comparaisons : Mesurez votre performance par rapport aux périodes précédentes ou aux budgets.\n\n📄 **Exports flexibles** :\n• 📊 **Excel/CSV** : Pour des analyses approfondies et l'intégration à d'autres outils.\n• 📈 **Graphiques PDF** : Rapports visuels prêts pour les présentations aux actionnaires ou à la direction.\n\n💡 **Décisions éclairées** : Utilisez ces données pour optimiser la rentabilité, identifier les économies potentielles et planifier la croissance future."
        }
      ]
    }
  ];

  const quickGuides = [
    {
      title: "🚀 Première Configuration",
      description: "Configurez votre système en 10 minutes",
      icon: Zap,
      color: "yellow",
      tasks: [
        "👥 Ajoutez vos premiers employés avec informations complètes",
        "🏢 Configurez les départements et hiérarchies",
        "📅 Définissez les types de congés et politiques",
        "🔔 Paramétrez les notifications automatiques"
      ]
    },
    {
      title: "⭐ Bonnes Pratiques",
      description: "Optimisez votre gestion RH quotidienne",
      icon: Star,
      color: "purple",
      tasks: [
        "📋 Révisez les demandes de congés quotidiennement",
        "⏰ Surveillez les pointages incomplets chaque matin",
        "📢 Communiquez régulièrement avec vos équipes",
        "📊 Analysez les tendances mensuelles de présence"
      ]
    },
    {
      title: "🆘 Résolution de Problèmes",
      description: "Solutions aux problèmes courants",
      icon: Target,
      color: "red",
      tasks: [
        "📍 Pointages GPS incorrects → Vérifiez la géolocalisation",
        "📧 Notifications non reçues → Contrôlez les paramètres email",
        "🔄 Erreurs de synchronisation → Rafraîchissez le cache",
        "🔐 Problèmes d'accès utilisateur → Vérifiez les permissions"
      ]
    }
  ];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = searchTerm === "" || 
      tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* En-tête Hero moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-3xl p-10 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Centre d'Aide Admin
              </h1>
              <p className="text-xl text-emerald-100 font-medium mb-4">
                Maîtrisez votre interface d'administration avec nos guides interactifs
              </p>
              <div className="flex items-center gap-6 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{tutorials.length} tutoriels disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>Guides interactifs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Conseils d'experts</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-right">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 justify-center">
                <Target className="w-4 h-4 mr-2" />
                Guide Complet
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Recherche et filtres modernisés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold text-slate-900">Recherche et Navigation</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Rechercher dans l'aide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-slate-50/80 border-0 focus:bg-white focus:ring-2 focus:ring-teal-500/20 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                    className="whitespace-nowrap rounded-xl"
                  >
                    Tout voir
                  </Button>
                  {helpCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                      className="whitespace-nowrap rounded-xl"
                    >
                      <category.icon className="w-4 h-4 mr-2" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Système d'onglets moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="tutorials" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-14 p-1 rounded-2xl">
              <TabsTrigger 
                value="tutorials" 
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Tutoriels
              </TabsTrigger>
              <TabsTrigger 
                value="guides"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Guides Rapides
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutorials" className="space-y-6">
              <div className="grid gap-6">
                {filteredTutorials.map((tutorial) => (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                              <CardTitle className="text-xl font-bold text-slate-900">
                                {tutorial.title}
                              </CardTitle>
                              <p className="text-slate-600">{tutorial.description}</p>
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Badge variant="outline" className="text-xs">
                                  {tutorial.difficulty}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {tutorial.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  {tutorial.steps.length} étapes
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setExpandedTutorial(
                              expandedTutorial === tutorial.id ? null : tutorial.id
                            )}
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                          >
                            {expandedTutorial === tutorial.id ? "Fermer" : "Commencer"}
                            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${
                              expandedTutorial === tutorial.id ? "rotate-90" : ""
                            }`} />
                          </Button>
                        </div>
                      </CardHeader>

                      <AnimatePresence>
                        {expandedTutorial === tutorial.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent className="border-t bg-slate-50/50">
                              <div className="space-y-6 pt-6">
                                {tutorial.steps.map((step, index) => (
                                  <div key={index} className="flex gap-4">
                                    <div className="flex-shrink-0">
                                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <h4 className="font-semibold text-slate-900">
                                        {step.title}
                                      </h4>
                                      {/* Render markdown-like content using dangerouslySetInnerHTML */}
                                      <p 
                                        className="text-slate-600 leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: step.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                      ></p>
                                      {step.image && (
                                        <div className="bg-slate-100 rounded-lg p-4 text-center text-slate-500">
                                          <Eye className="w-8 h-8 mx-auto mb-2" />
                                          <p className="text-sm">Capture d'écran : {step.title}</p>
                                          <p className="text-xs text-slate-400">{step.image}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-end pt-4 border-t">
                                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Tutoriel Terminé
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guides" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {quickGuides.map((guide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <CardContent className="p-6">
                        <div className={`w-12 h-12 bg-gradient-to-br from-${guide.color}-100 to-${guide.color}-200 rounded-2xl flex items-center justify-center mb-4`}>
                          <guide.icon className={`w-6 h-6 text-${guide.color}-600`} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">
                          {guide.title}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {guide.description}
                        </p>
                        <div className="space-y-2">
                          {guide.tasks.map((task, taskIndex) => (
                            <div key={taskIndex} className="flex items-center gap-3 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Voir le Guide
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    Section FAQ en cours de développement
                  </h3>
                  <p className="text-slate-500">
                    Cette section contiendra les questions fréquemment posées et leurs réponses détaillées.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
