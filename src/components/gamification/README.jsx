# Système de Gamification - Documentation Technique

## Vue d'ensemble

Le système de gamification de Flow HR est un moteur intelligent qui récompense automatiquement les employés pour leurs actions et comportements positifs sur la plateforme. Il utilise un système de badges multi-niveaux, de points et de classements pour encourager l'engagement.

## Architecture

### Entités Principales

1. **Badge** - Stocke les badges attribués aux employés
2. **EmployeePoints** - Gère les points, niveaux et statistiques
3. **ActionLog** - Enregistre toutes les actions des employés

### Composants

1. **GamificationEngine.jsx** - Moteur principal de calcul des récompenses
2. **GamificationDashboard.jsx** - Interface utilisateur pour afficher la progression
3. **README.md** - Cette documentation

## Types de Badges

### Catégories

- **attendance** - Assiduité et ponctualité
- **performance** - Efficacité et qualité du travail  
- **collaboration** - Travail d'équipe et communication
- **innovation** - Créativité et suggestions d'amélioration
- **leadership** - Mentorat et accompagnement
- **growth** - Apprentissage et développement
- **special** - Événements spéciaux et achievements uniques

### Niveaux (Tiers)

- **Bronze** - Niveau d'entrée
- **Argent** - Niveau intermédiaire  
- **Or** - Niveau avancé
- **Platine** - Niveau expert
- **Diamant** - Niveau légendaire

## Badges Disponibles

### EARLY_BIRD (Lève-tôt)
**Catégorie:** attendance
**Description:** Arrivée avant 7h30 pendant plusieurs jours consécutifs
**Critères:**
- Bronze: 5 jours consécutifs (15 points)
- Argent: 15 jours consécutifs (30 points)
- Or: 30 jours consécutifs (50 points)
- Platine: 60 jours consécutifs (75 points)
- Diamant: 100 jours consécutifs (100 points)

### PUNCTUALITY_MASTER (Maître de la Ponctualité)
**Catégorie:** attendance  
**Description:** Arrivée à l'heure (avant 8h00) de façon régulière
**Critères:**
- Bronze: 7 jours ponctuels (20 points)
- Argent: 21 jours ponctuels (40 points)
- Or: 60 jours ponctuels (60 points)
- Platine: 120 jours ponctuels (80 points)
- Diamant: 200 jours ponctuels (120 points)

### PERFECT_WEEK (Semaine Parfaite)
**Catégorie:** attendance
**Description:** Présence complète et ponctuelle toute la semaine
**Critères:**
- Bronze: 1 semaine parfaite (25 points)
- Argent: 4 semaines parfaites (50 points)
- Or: 12 semaines parfaites (100 points)
- Platine: 24 semaines parfaites (150 points)
- Diamant: 52 semaines parfaites (250 points)

### COMMUNICATOR (Communicateur)
**Catégorie:** collaboration
**Description:** Lecture régulière des annonces importantes
**Critères:**
- Bronze: 10 annonces lues (15 points)
- Argent: 25 annonces lues (25 points)
- Or: 50 annonces lues (40 points)
- Platine: 100 annonces lues (60 points)
- Diamant: 200 annonces lues (100 points)

### TEAM_PLAYER (Esprit d'Équipe)
**Catégorie:** collaboration
**Description:** Participation active aux événements et réunions
**Critères:** Basé sur les participations aux réunions, aide fournie, messages envoyés

### EFFICIENCY_EXPERT (Expert en Efficacité)
**Catégorie:** performance
**Description:** Completion rapide et précise des tâches
**Critères:** Basé sur les tâches complétées avec un score de qualité élevé

### CONTINUOUS_LEARNER (Apprentissage Continu)
**Catégorie:** growth
**Description:** Participation aux formations et développement
**Critères:** Basé sur les sondages complétés, documents consultés, formations suivies

### INNOVATOR (Innovateur)
**Catégorie:** innovation
**Description:** Propositions d'améliorations et idées créatives
**Critères:** Basé sur les suggestions d'innovation soumises

### MENTOR (Mentor)
**Catégorie:** leadership
**Description:** Aide et accompagnement des collègues
**Critères:** Basé sur l'aide fournie, feedback donné, sessions de mentorat

### STREAK_CHAMPION (Champion des Séries)
**Catégorie:** special
**Description:** Activité quotidienne sur la plateforme
**Critères:**
- Bronze: 7 jours consécutifs (25 points)
- Argent: 30 jours consécutifs (50 points)
- Or: 90 jours consécutifs (100 points)
- Platine: 180 jours consécutifs (150 points)
- Diamant: 365 jours consécutifs (300 points)

### FIRST_STEPS (Premiers Pas)
**Catégorie:** special
**Description:** Completion du profil et première connexion
**Critères:** Bronze: Profil complété + première connexion (10 points)

## Système de Points et Niveaux

### Points par Action

```javascript
const basePoints = {
  login: 2,
  check_in: 5,
  early_checkin: 10,
  check_out: 3,
  late_checkout: 8,
  announcement_read: 3,
  document_view: 2,
  document_upload: 8,
  task_completed: 15,
  meeting_attended: 12,
  leave_requested: 1,
  profile_updated: 5,
  message_sent: 1,
  survey_completed: 20,
  feedback_given: 10,
  help_provided: 15,
  innovation_suggested: 25
};
```

### Multiplicateurs de Niveau

- Niveaux 1-10: Multiplicateur x1.0 (normal)
- Niveaux 11-20: Multiplicateur x1.1 (+10% de points)
- Niveaux 21-30: Multiplicateur x1.2 (+20% de points)
- Niveaux 31-40: Multiplicateur x1.3 (+30% de points)
- Niveaux 41-50: Multiplicateur x1.5 (+50% de points)

### Calcul des Niveaux

- Points nécessaires par niveau: 100
- Niveau maximum: 50
- Formule: `niveau = floor(points_totaux / 100) + 1`

## Système Anti-Fraude

### Limites de Sécurité

- **Actions par heure:** Maximum 50 actions
- **Points par jour:** Maximum 500 points
- **Cooldowns:** Délais entre actions identiques
  - Check-in: 8 heures
  - Lecture d'annonce: 10 secondes
  - Vue de document: 5 secondes

### Détection des Patterns Suspects

Le système surveille automatiquement:
- Fréquence anormale d'actions
- Patterns répétitifs suspects
- Tentatives de contournement des cooldowns

## API Principales

### Enregistrer une Action

```javascript
import { logAction } from './GamificationEngine';

// Enregistrer une action avec qualité
const result = await logAction(
  employeeId, 
  'check_in', 
  { isEarly: true, page: 'TimeClock' }, 
  85 // Score de qualité
);
```

### Traiter les Achievements

```javascript
import { processEmployeeAchievements } from './GamificationEngine';

// Recalculer tous les badges d'un employé
const result = await processEmployeeAchievements(employeeId);
```

### Obtenir la Progression

```javascript
import { getEmployeeProgress } from './GamificationEngine';

// Récupérer les statistiques détaillées
const progress = await getEmployeeProgress(employeeId);
```

### Obtenir le Classement

```javascript
import { getLeaderboard } from './GamificationEngine';

// Top 10 des employés
const leaderboard = await getLeaderboard(10);
```

## Intégration dans l'Application

### 1. Dashboard Employé

Ajouter le composant `GamificationDashboard` avec `isCompact={true}` pour un affichage résumé.

### 2. Après Actions Importantes

Appeler `logAction()` après:
- Connexion/déconnexion
- Pointage entrée/sortie
- Lecture d'annonces
- Completion de tâches
- Participation aux réunions

### 3. Traitement Automatique

Le système traite automatiquement les achievements après chaque action. Pour forcer un recalcul:

```javascript
// Dans un useEffect ou après une action majeure
useEffect(() => {
  if (employeeId) {
    processEmployeeAchievements(employeeId);
  }
}, [employeeId]);
```

## Maintenance et Monitoring

### Vérification Quotidienne

```javascript
import { checkDailyBadges } from './GamificationEngine';

// À exécuter quotidiennement (cron job)
const result = await checkDailyBadges();
```

### Nettoyage des Données

- Les logs d'actions peuvent être archivés après 6 mois
- Les badges inactifs peuvent être masqués mais conservés
- Les points historiques doivent être préservés

## Extensibilité

### Ajouter un Nouveau Badge

1. **Définir le badge** dans `BADGE_DEFINITIONS`:

```javascript
NEW_BADGE: {
  id: 'NEW_BADGE',
  name: 'Nom du Badge',
  description: 'Description du critère',
  icon: 'LucideIcon',
  category: 'performance',
  tiers: {
    bronze: { threshold: 5, points: 20, name: 'Badge Bronze' }
    // ... autres tiers
  }
}
```

2. **Ajouter la logique de vérification** dans `checkBadgeEligibility()`:

```javascript
case 'NEW_BADGE':
  criteria = await checkNewBadgeCriteria(employeeId);
  break;
```

3. **Implémenter la fonction de vérification**:

```javascript
const checkNewBadgeCriteria = async (employeeId) => {
  // Logique de vérification
  return { count: criteriaCount };
};
```

### Ajouter une Nouvelle Action

1. **Ajouter le type d'action** dans l'enum `ActionLog.action_type`
2. **Définir les points** dans `calculateActionPoints()`
3. **Appeler `logAction()`** après l'action dans l'interface

## Bonnes Pratiques

### Performance

- Utiliser les indices de base de données sur `employee_id` et `created_date`
- Limiter les requêtes avec des dates de début/fin
- Mettre en cache les calculs coûteux

### Sécurité

- Toujours valider les données d'entrée
- Vérifier les permissions avant d'attribuer des badges
- Logger les actions suspectes

### UX

- Afficher les notifications de nouveaux badges
- Montrer la progression vers les prochains objectifs
- Garder les récompenses équilibrées et motivantes

## Dépannage

### Badges Non Attribués

1. Vérifier les logs d'actions avec `ActionLog.filter()`
2. Contrôler les critères avec les fonctions `check*Criteria()`
3. Forcer le recalcul avec `processEmployeeAchievements()`

### Performance Lente

1. Vérifier les requêtes avec beaucoup de données
2. Ajouter des indices sur les champs filtrés
3. Optimiser les fonctions de vérification des critères

### Données Incohérentes

1. Exécuter `checkDailyBadges()` pour recalculer tout
2. Vérifier l'intégrité des données avec des requêtes SQL
3. Utiliser les migrations pour corriger les données historiques