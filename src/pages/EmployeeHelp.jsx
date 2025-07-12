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
  Clock,
  Calendar,
  TrendingUp,
  Megaphone,
  Users,
  ChevronRight,
  CheckCircle,
  Star,
  Lightbulb,
  Target,
  Zap,
  ArrowRight,
  Eye,
  LayoutDashboard,
  UserCheck,
  Bell,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeeHelp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedTutorial, setExpandedTutorial] = useState(null);

  const helpCategories = [
    { id: "dashboard", name: "Mon Dashboard", icon: LayoutDashboard, color: "blue" },
    { id: "timetracking", name: "Pointage", icon: Clock, color: "green" },
    { id: "leave", name: "Mes Congés", icon: Calendar, color: "purple" },
    { id: "team", name: "Mon Équipe", icon: Users, color: "orange" },
    { id: "performance", name: "Mes Évaluations", icon: TrendingUp, color: "pink" },
    { id: "communication", name: "Annonces", icon: Megaphone, color: "red" },
    { id: "profile", name: "Mon Profil", icon: Settings, color: "gray" }
  ];

  const tutorials = [
    {
      id: 1,
      title: "Découvrir Mon Dashboard",
      category: "dashboard",
      difficulty: "Débutant",
      duration: "3 min",
      type: "tutorial",
      description: "Familiarisez-vous avec votre espace personnel et les informations importantes.",
      steps: [
        {
          title: "🏠 Bienvenue sur votre Dashboard",
          content: "📊 Votre dashboard personnel affiche vos informations essentielles : pointages récents, congés à venir, annonces importantes et statistiques personnelles.\n\n🔍 **Navigation :** Utilisez le menu latéral gauche pour accéder aux différentes sections.\n\n💡 **Astuce :** Le dashboard se met à jour automatiquement toutes les 5 minutes pour vous montrer les dernières informations."
        },
        {
          title: "📋 Cartes d'Information Principales",
          content: "🎯 **4 cartes principales** vous donnent un aperçu rapide :\n\n⏰ **Heures ce mois** : Votre temps de travail cumulé\n🏖️ **Congés restants** : Solde de vos jours de congés\n⭐ **Évaluations récentes** : Vos dernières notes de performance\n📨 **Messages non lus** : Nouvelles notifications importantes\n\n📈 Chaque carte affiche une tendance (↗️ amélioration, ↘️ diminution) par rapport au mois précédent."
        },
        {
          title: "📈 Timeline d'Activité Récente",
          content: "🕒 **La section centrale** montre vos dernières activités chronologiques :\n\n✅ **Pointages** : Vos entrées/sorties avec statut (complet ✅ ou incomplet ⚠️)\n📝 **Demandes de congés** : État en attente 🟡, approuvé ✅, ou refusé ❌\n📢 **Notifications d'équipe** : Messages de votre manager ou RH\n⏰ **Rappels importants** : Évaluations à venir, documents à lire\n\n🔄 **Actualisation** : La timeline se rafraîchit automatiquement, vous pouvez aussi cliquer sur 🔄 pour actualiser."
        },
        {
          title: "🧭 Navigation et Accès Rapide",
          content: "📱 **Menu latéral** pour naviguer facilement :\n\n🏠 **Mon Tableau de Bord** → Vue d'ensemble\n⏰ **Pointage** → Enregistrer vos heures\n🏖️ **Mes Congés** → Gérer vos absences\n👥 **Mon Équipe** → Voir vos collègues\n⭐ **Mes Évaluations** → Consulter vos performances\n📄 **Documents** → Accéder aux fichiers partagés\n📢 **Annonces** → Lire les communications importantes\n\n💡 **Badge avec compteur** : Un numéro rouge 🔴 indique des actions en attente (ex: congés à approuver, documents non lus)."
        }
      ]
    },
    {
      id: 2,
      title: "Maîtriser le Système de Pointage",
      category: "timetracking",
      difficulty: "Débutant",
      duration: "5 min",
      type: "tutorial",
      description: "Apprenez à pointer correctement et suivre vos heures de travail efficacement.",
      steps: [
        {
          title: "⏰ Pointer Arrivée et Départ",
          content: "🎯 **Deux gros boutons** pour gérer vos pointages :\n\n🟢 **'Pointer Arrivée'** (matin) :\n• Cliquez dès votre arrivée au bureau\n• 📍 Le système enregistre automatiquement votre localisation GPS\n• ⏰ L'heure exacte est sauvegardée\n• 💻 Votre adresse IP et appareil sont notés pour sécurité\n\n🔴 **'Pointer Départ'** (soir) :\n• Cliquez avant de quitter le bureau\n• 📊 Le système calcule automatiquement vos heures travaillées\n• ✅ Votre journée passe au statut 'complet'\n\n⚠️ **Important** : N'oubliez jamais de pointer le départ, sinon votre journée reste 'incomplète'."
        },
        {
          title: "📚 Consulter l'Historique des Pointages",
          content: "📋 **Tableau complet** de tous vos pointages :\n\n📅 **Colonnes affichées** :\n• Date du pointage\n• ⏰ Heure d'arrivée\n• ⏰ Heure de départ\n• ⏱️ Durée totale travaillée\n• ✅❌ Statut (complet/incomplet)\n\n🎨 **Codes couleurs** :\n• ✅ **Vert** : Journée complète et normale\n• ⚠️ **Orange** : Pointage incomplet (oubli de départ)\n• 🔴 **Rouge** : Problème ou anomalie détectée\n• 🔵 **Bleu** : Jour férié ou congé approuvé\n\n📊 **Statistiques** en bas : Total heures du mois, moyenne quotidienne, jours travaillés."
        },
        {
          title: "📍 Comprendre la Localisation et Sécurité",
          content: "🛡️ **Système de sécurité** pour vérifier l'authenticité :\n\n📱 **Géolocalisation GPS** :\n• 🌍 Le navigateur demande l'autorisation de localisation\n• ✅ Cliquez 'Autoriser' pour activer le pointage\n• 📍 Votre position exacte est enregistrée\n• 🏢 Le système vérifie que vous êtes au bureau (zone autorisée)\n\n🔒 **Données de sécurité enregistrées** :\n• 🌐 Adresse IP de connexion\n• 💻 Type d'appareil (smartphone, ordinateur)\n• 🌍 Navigateur utilisé\n• 📍 Coordonnées GPS précises\n• 🏠 Adresse formatée lisible\n\n⚠️ **Anomalies détectées** : Si vous pointez depuis un lieu inhabituel, le système alerte automatiquement les RH."
        },
        {
          title: "🔧 Corriger les Erreurs de Pointage",
          content: "😅 **Oublié de pointer ?** Pas de panique !\n\n❌ **Problèmes courants** :\n• 🏃‍♂️ Oubli de pointer l'arrivée → Journée marquée 'incomplète'\n• 🚗 Oubli de pointer le départ → Calcul d'heures impossible\n• 📱 Problème GPS → Localisation incorrecte\n• 🌐 Connexion internet coupée → Pointage non enregistré\n\n✅ **Solutions disponibles** :\n• 📧 **Contactez votre manager** : Il peut corriger manuellement\n• 📞 **Appelez les RH** : Ils ont accès aux outils de correction\n• 📝 **Email avec justification** : Expliquez la raison (urgence, panne, etc.)\n• ⏰ **Correction rétroactive** : Possible jusqu'à 48h après\n\n📋 **Informations à fournir** : Date, heure approximative, raison de l'oubli, lieu de travail."
        }
      ]
    },
    {
      id: 3,
      title: "Gestion Complète de Mes Congés",
      category: "leave",
      difficulty: "Intermédiaire",
      duration: "7 min",
      type: "tutorial",
      description: "Maîtrisez la demande, le suivi et la planification de vos congés avec notre système intuitif.",
      steps: [
        {
          title: "📝 Créer une Nouvelle Demande de Congé",
          content: "🎯 **Processus étape par étape** :\n\n1️⃣ **Cliquer sur 'Nouvelle Demande'** 🆕\n\n2️⃣ **Choisir le type de congé** 📋 :\n• 🏖️ **Vacances** : Congés payés planifiés\n• 🤒 **Congé Maladie** : Arrêt maladie (justificatif requis)\n• 👨‍👩‍👧‍👦 **Congé Personnel** : Affaires personnelles\n• 👶 **Maternité/Paternité** : Congés parentaux\n• ⚱️ **Deuil** : Congés exceptionnels famille\n• ❓ **Autre** : Spécifiez dans la description\n\n3️⃣ **Sélectionner les dates** 📅 :\n• 📅 Date de début (premier jour d'absence)\n• 📅 Date de fin (dernier jour d'absence)\n• 🔢 Le système calcule automatiquement le nombre de jours\n\n4️⃣ **Ajouter une raison** ✍️ :\n• 📝 Description détaillée (optionnelle mais recommandée)\n• 🎯 Contexte pour faciliter l'approbation"
        },
        {
          title: "📚 Types de Congés et Spécificités",
          content: "🎭 **Chaque type a ses propres règles** :\n\n🏖️ **Vacances** :\n• ⏰ Préavis recommandé : 2 semaines minimum\n• 📊 Décompté de votre solde de congés payés\n• ✅ Nécessite approbation du manager\n• 📅 Évitez les périodes de forte activité\n\n🤒 **Congé Maladie** :\n• 🩺 Justificatif médical obligatoire sous 48h\n• ⚡ Peut être pris en urgence\n• 📞 Prévenez immédiatement par téléphone\n• 💊 Non décompté des congés payés\n\n👨‍👩‍👧‍👦 **Congé Personnel** :\n• 🎯 Raison personnelle importante\n• ⏰ Préavis de quelques jours souhaitable\n• 📝 Justification appréciée\n• ⚖️ Utilisation avec modération\n\n👶 **Maternité/Paternité** :\n• 📋 Congés légaux selon réglementation\n• 📄 Documents officiels requis\n• ⏰ Planification plusieurs mois à l'avance\n• 🤝 Coordination avec RH obligatoire"
        },
        {
          title: "📊 Suivre l'État de vos Demandes",
          content: "🎯 **3 statuts principaux** avec codes couleurs :\n\n🟡 **En Attente (Pending)** :\n• ⏳ Demande soumise, en cours d'examen\n• 👀 Votre manager examine la demande\n• 📧 Vous recevrez une notification de décision\n• ⏰ Délai habituel : 24-48h pour congés standards\n\n✅ **Approuvé (Approved)** :\n• 🎉 Félicitations ! Congé accordé\n• 📅 Dates confirmées dans votre planning\n• 📧 Email de confirmation automatique envoyé\n• 📋 Visible dans le calendrier équipe\n• 💼 Préparez la transmission de vos dossiers\n\n❌ **Refusé (Denied)** :\n• 😔 Demande non accordée\n• 📝 Raison du refus expliquée par le manager\n• 🔄 Possibilité de re-demander avec ajustements\n• 💬 Discutez avec votre manager pour alternative\n\n📬 **Notifications automatiques** : Email + notification dans l'app à chaque changement de statut."
        },
        {
          title: "💰 Comprendre votre Solde de Congés",
          content: "📊 **Tableau de bord détaillé** de vos droits :\n\n🏦 **Solde Actuel** :\n• 💎 **Congés disponibles** : Jours que vous pouvez prendre maintenant\n• 📈 **Congés acquis** : Total des droits accumulés depuis début d'année\n• 📉 **Congés pris** : Jours déjà utilisés cette année\n• 📅 **Congés planifiés** : Demandes approuvées à venir\n\n🔢 **Calcul automatique** :\n• 📆 **Acquisition mensuelle** : 2.5 jours par mois travaillé (standard)\n• 📊 **Proratisation** : Ajusté selon votre date d'embauche\n• 🔄 **Mise à jour** : Recalculé automatiquement chaque début de mois\n• ⚖️ **Report** : Maximum 5 jours reportables sur année suivante\n\n📈 **Historique complet** :\n• 📋 Liste tous vos congés pris avec dates\n• 🎯 Répartition par type (vacances, maladie, etc.)\n• 📊 Graphique d'évolution sur 12 mois\n• 🔮 Projection des droits futurs jusqu'à fin d'année"
        }
      ]
    },
    {
      id: 4,
      title: "Collaboration et Travail d'Équipe",
      category: "team",
      difficulty: "Intermédiaire",
      duration: "6 min",
      type: "tutorial",
      description: "Optimisez votre collaboration avec vos collègues et votre manager grâce aux outils dédiés.",
      steps: [
        {
          title: "👥 Vue d'Ensemble de l'Équipe",
          content: "🎯 **Dashboard équipe en temps réel** :\n\n🟢 **Présences du jour** :\n• ✅ **Présents** : Collègues actuellement au bureau (pointage fait)\n• 🏖️ **En congé** : Absents avec congés approuvés\n• 🏠 **Télétravail** : Travaillent à distance (si autorisé)\n• ❓ **Non pointés** : Pas encore arrivés ou oubli de pointage\n\n📊 **Carte thermique** :\n• 📈 **Tendances de présence** sur les 3 derniers mois\n• 🎨 **Couleurs** : Vert (présence élevée) → Rouge (absences fréquentes)\n• 📅 **Patterns** : Identification des jours préférés de congés\n• 🔍 **Vue détaillée** : Cliquez sur un jour pour voir qui était présent\n\n👤 **Profils rapides** :\n• 📸 Photo et nom de chaque collègue\n• 🏢 Département et poste\n• 📊 Statut actuel (présent/absent/congé)\n• 📞 Contact rapide (email, téléphone)"
        },
        {
          title: "📅 Demandes de Réunion Intelligentes",
          content: "🎯 **Système de planification automatisé** :\n\n📝 **Créer une demande** :\n• 🎭 **Titre** : Objet de la réunion (ex: \"Point projet X\")\n• 👥 **Participants** : Sélectionnez dans la liste des collègues\n• ⏰ **Créneaux proposés** : Plusieurs options de date/heure\n• 📝 **Description** : Agenda, objectifs, documents à préparer\n\n🤖 **Intelligence automatique** :\n• ✅ **Disponibilité** : Le système vérifie les congés de chacun\n• ⚠️ **Conflits** : Alerte si quelqu'un est en congé aux dates proposées\n• 🕐 **Suggestions** : Propose automatiquement les meilleurs créneaux\n• 🌍 **Fuseaux horaires** : Gestion automatique si équipe internationale\n\n📧 **Notifications automatiques** :\n• 📨 Email d'invitation envoyé à tous les participants\n• 🔗 **Lien visio** généré automatiquement (Zoom, Teams, etc.)\n• 📅 Ajout automatique aux calendriers\n• ⏰ Rappels 24h et 1h avant la réunion"
        },
        {
          title: "👤 Explorer les Profils Détaillés",
          content: "🔍 **Informations complètes** sur vos collègues :\n\n📋 **Informations professionnelles** :\n• 🏢 **Poste et département** : Rôle officiel dans l'entreprise\n• 📅 **Ancienneté** : Date d'arrivée, nombre d'années\n• 👑 **Manager** : Hiérarchie et équipe\n• 🎯 **Projets actuels** : Missions en cours visibles par l'équipe\n\n🛠️ **Compétences et expertise** :\n• 💪 **Skills techniques** : Langages, logiciels, certifications\n• 🎨 **Domaines d'expertise** : Spécialisations métier\n• 🏆 **Réalisations** : Projets marquants, succès récents\n• 📚 **Formations** : Cursus, formations continues\n\n📞 **Contact et disponibilité** :\n• 📧 **Email professionnel** : Contact direct\n• 📱 **Téléphone** : Numéro interne/externe\n• 💬 **Chat interne** : Messagerie instantanée\n• 🕐 **Statut** : Disponible, occupé, en réunion, absent\n\n🤝 **Historique de collaboration** :\n• 📊 **Projets communs** : Historique des missions partagées\n• 📅 **Réunions passées** : Liste des rencontres précédentes"
        },
        {
          title: "🔔 Notifications et Vie d'Équipe",
          content: "🎉 **Restez connecté** avec votre équipe :\n\n🎂 **Événements sociaux** :\n• 🎈 **Anniversaires** : Notification la veille et le jour J\n• 🎊 **Arrivées** : Accueil des nouveaux collègues\n• 🏆 **Promotions** : Félicitations pour les évolutions\n• 🏅 **Succès d'équipe** : Célébration des réussites collectives\n\n📢 **Communications importantes** :\n• 🚨 **Urgences** : Messages prioritaires du management\n• 📋 **Changements** : Nouveaux process, réorganisations\n• 🎯 **Objectifs** : Mise à jour des KPIs d'équipe\n• 📊 **Résultats** : Partage des performances mensuelles\n\n👥 **Activité collaborative** :\n• 💬 **Discussions** : Threads de conversation par projet\n• 📤 **Partages** : Documents, liens, ressources utiles\n• 🤝 **Entraide** : Demandes d'aide, propositions de support\n• 🎓 **Apprentissage** : Sessions de formation, partage de connaissances\n\n⚙️ **Paramètres personnalisés** :\n• 📬 **Fréquence** : Immédiat, quotidien, hebdomadaire\n• 🎭 **Types** : Choisir quels événements vous intéressent\n• 📱 **Canaux** : Email, notification app, SMS"
        }
      ]
    },
    {
      id: 5,
      title: "Mes Évaluations de Performance",
      category: "performance",
      difficulty: "Avancé",
      duration: "10 min",
      type: "tutorial",
      description: "Suivez votre évolution professionnelle, préparez vos entretiens et développez vos compétences.",
      steps: [
        {
          title: "📊 Comprendre votre Dashboard Performance",
          content: "🎯 **Vue d'ensemble** de votre évolution professionnelle :\n\n📈 **Graphiques interactifs** :\n• 📊 **Notes moyennes** : Évolution sur les 12 derniers mois\n• 🎯 **Objectifs vs Réalisé** : Comparaison visuelle avec barres de progression\n• 🔍 **Zoom détaillé** : Cliquez sur un point pour voir les détails\n• 📅 **Timeline** : Chronologie de toutes vos évaluations\n\n🏆 **Métriques clés** :\n• ⭐ **Note globale actuelle** : Votre score sur 5\n• 📈 **Progression** : Évolution par rapport à la dernière évaluation\n• 🎯 **Objectifs atteints** : Pourcentage de réussite\n• 👥 **Comparaison équipe** : Votre position relative (anonymisée)\n\n🎨 **Points forts visuels** :\n• 💪 **Forces identifiées** : Vos domaines d'excellence\n• 🎯 **Axes d'amélioration** : Zones de développement\n• 📊 **Radar des compétences** : Vue multidimensionnelle\n• 🔮 **Potentiel d'évolution** : Projections basées sur vos progrès"
        },
        {
          title: "📚 Consulter l'Historique Complet",
          content: "🗂️ **Archive détaillée** de toutes vos évaluations :\n\n📋 **Liste chronologique** :\n• 📅 **Date d'évaluation** : Quand l'entretien a eu lieu\n• 👤 **Évaluateur** : Manager ou RH qui a conduit l'entretien\n• 📊 **Notes détaillées** : Scores par catégorie (5 domaines)\n• 📝 **Commentaires complets** : Retours détaillés du manager\n\n🎯 **5 domaines évalués** :\n• 🏆 **Performance globale** : Atteinte des objectifs généraux\n• 🎯 **Réalisation des objectifs** : KPIs spécifiques atteints\n• 💬 **Communication** : Clarté, écoute, présentation\n• 🤝 **Travail d'équipe** : Collaboration, support mutuel\n• 👑 **Leadership** : Initiative, influence positive, autonomie\n\n📖 **Détails enrichis** :\n• 💪 **Points forts** : Ce qui a été particulièrement apprécié\n• 🔧 **Améliorations** : Domaines identifiés pour progresser\n• 🎯 **Objectifs suivants** : Défis fixés pour la prochaine période\n• 📈 **Plan d'action** : Étapes concrètes de développement"
        },
        {
          title: "🤔 Préparer votre Auto-Évaluation",
          content: "📝 **Réflexion personnelle** avant l'entretien avec votre manager :\n\n🎯 **Questions de réflexion** :\n• 🏆 **Réussites** : Quels sont vos 3 plus grands succès cette période ?\n• 📊 **Objectifs** : Avez-vous atteint vos KPIs ? Lesquels ? Pourquoi ?\n• 🤝 **Collaboration** : Comment avez-vous contribué à l'équipe ?\n• 🔧 **Difficultés** : Quels obstacles avez-vous rencontrés ?\n• 📚 **Apprentissages** : Qu'avez-vous appris de nouveau ?\n\n✍️ **Section à remplir** :\n• 📈 **Auto-notation** : Évaluez-vous sur les 5 domaines (1-5)\n• 📝 **Justifications** : Expliquez vos notes avec des exemples concrets\n• 🎯 **Exemples précis** : Projets, situations, résultats chiffrés\n• 💭 **Ressentis** : Votre satisfaction, motivations, frustrations\n\n🚀 **Préparation stratégique** :\n• 📊 **Données factuelles** : Rassemblez vos métriques de performance\n• 🏆 **Portfolio** : Compilez vos meilleures réalisations\n• 🎯 **Objectifs futurs** : Réfléchissez à vos souhaits d'évolution\n• 💼 **Besoins** : Formation, outils, support nécessaires"
        },
        {
          title: "🚀 Développer votre Plan de Carrière",
          content: "🎯 **Collaboration active** avec votre manager pour votre évolution :\n\n🔮 **Vision à long terme** :\n• 🏔️ **Objectifs 1-3 ans** : Où voulez-vous être professionnellement ?\n• 🎭 **Rôles cibles** : Postes qui vous intéressent dans l'entreprise\n• 💼 **Compétences à acquérir** : Gap analysis entre maintenant et objectif\n• 🌍 **Mobilité** : Ouverture géographique ou départementale\n\n📚 **Plan de formation** :\n• 🎓 **Formations techniques** : Certifications, nouveaux outils\n• 🤝 **Soft skills** : Communication, leadership, gestion de projet\n• 📖 **Autoformation** : Livres, cours en ligne, conférences\n• 👥 **Mentorat** : Identification de mentors internes\n\n🎯 **Étapes concrètes** :\n• 📅 **Timeline** : Planning détaillé des étapes sur 6-18 mois\n• 🎯 **Micro-objectifs** : Petites victoires régulières\n• 📊 **Mesure du progrès** : KPIs de développement personnel\n• 🔄 **Points de révision** : Rendez-vous trimestriels avec manager\n\n🤝 **Support de l'entreprise** :\n• 💰 **Budget formation** : Allocation disponible pour votre développement\n• ⏰ **Temps dédié** : Heures allouées à l'apprentissage\n• 👥 **Réseau interne** : Connexions avec d'autres départements\n• 🚀 **Opportunités** : Projets transverses, missions spéciales"
        }
      ]
    }
  ];

  const quickGuides = [
    {
      title: "🚀 Premier Jour",
      description: "Tout ce qu'il faut savoir pour bien commencer",
      icon: Zap,
      color: "yellow",
      tasks: [
        "📝 Complétez votre profil personnel avec photo",
        "⏰ Faites votre premier pointage d'arrivée",
        "👥 Découvrez votre équipe et vos collègues",
        "📢 Lisez les annonces importantes du jour"
      ]
    },
    {
      title: "⭐ Utilisation Quotidienne",
      description: "Les bonnes pratiques au jour le jour",
      icon: Star,
      color: "blue",
      tasks: [
        "✅ Pointez en arrivant et en partant (automatisme)",
        "🔔 Consultez vos notifications matin et soir",
        "📅 Planifiez vos congés au moins 2 semaines à l'avance",
        "🔄 Maintenez votre profil à jour (compétences, contact)"
      ]
    },
    {
      title: "🆘 Problèmes Courants",
      description: "Solutions aux situations fréquentes",
      icon: Target,
      color: "red",
      tasks: [
        "😅 Pointage oublié → Contactez votre manager dans les 24h",
        "🚨 Demande de congé urgente → Appelez avant d'envoyer la demande",
        "📍 Problème de géolocalisation → Vérifiez les paramètres navigateur",
        "📧 Notification non reçue → Vérifiez vos spams et paramètres email"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
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
                🎓 Centre d'Aide Employé
              </h1>
              <p className="text-xl text-emerald-100 font-medium mb-4">
                📚 Découvrez comment utiliser efficacement votre espace personnel
              </p>
              <div className="flex items-center gap-6 text-sm text-emerald-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{tutorials.length} tutoriels interactifs disponibles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span>📖 Guides textuels détaillés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>💡 Conseils d'experts</span>
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
                🎯 Guide Complet
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
                <h3 className="font-semibold text-slate-900">🔍 Recherche et Navigation</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="🔍 Rechercher dans l'aide..."
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
                    🔄 Tout voir
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
                📚 Tutoriels
              </TabsTrigger>
              <TabsTrigger 
                value="guides"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                💡 Guides Rapides
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className="rounded-xl font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                ❓ FAQ
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
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                              <CardTitle className="text-xl font-bold text-slate-900">
                                {tutorial.title}
                              </CardTitle>
                              <p className="text-slate-600">{tutorial.description}</p>
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <Badge variant="outline" className="text-xs">
                                  🎯 {tutorial.difficulty}
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  ⏱️ {tutorial.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  📖 {tutorial.steps.length} étapes
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => setExpandedTutorial(
                              expandedTutorial === tutorial.id ? null : tutorial.id
                            )}
                            className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                          >
                            {expandedTutorial === tutorial.id ? "🔼 Fermer" : "🚀 Commencer"}
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
                                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <h4 className="font-semibold text-slate-900">
                                        {step.title}
                                      </h4>
                                      <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                                        {step.content}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex justify-end pt-4 border-t">
                                  <Button className="bg-gradient-to-r from-emerald-600 to-blue-600">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    ✅ Tutoriel Terminé
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
                            <div key={taskIndex} className="flex items-start gap-3 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{task}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          📖 Voir le Guide
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
                  <div className="text-6xl mb-4">❓</div>
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">
                    📚 Section FAQ en cours de développement
                  </h3>
                  <p className="text-slate-500">
                    🔄 Cette section contiendra bientôt les questions fréquemment posées et leurs réponses détaillées avec illustrations.
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