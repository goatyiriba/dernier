# Flow HR - Système de Gestion des Ressources Humaines

Une application complète de gestion des ressources humaines construite avec React et Supabase.

## 🚀 Fonctionnalités

- **Gestion des employés** : Profils, contrats, départements
- **Gestion des congés** : Demandes, approbations, calendrier
- **Pointage et présence** : Suivi des heures, géolocalisation
- **Performance** : Évaluations, objectifs, feedback
- **Communication** : Annonces, messagerie, notifications
- **Gamification** : Badges, points, classements
- **Documents** : Stockage sécurisé, partage
- **Analytics** : Tableaux de bord, rapports
- **Surveys** : Enquêtes internes et publiques
- **Finance** : Gestion budgétaire, transactions

## 🛠️ Technologies

- **Frontend** : React 18, Vite, Tailwind CSS
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **UI Components** : Radix UI, Lucide React
- **State Management** : React Hooks
- **Routing** : React Router DOM
- **Charts** : Recharts
- **Animations** : Framer Motion

## 📦 Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd stable
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp env.example .env.local
   ```
   
   Remplir les variables dans `.env.local` :
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configurer Supabase**
   - Créer un projet Supabase
   - Exécuter le script SQL de création des tables
   - Configurer l'authentification
   - Activer les politiques RLS

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🗄️ Configuration Supabase

### Tables principales

- `employees` : Employés
- `leave_requests` : Demandes de congés
- `time_entries` : Pointages
- `performance_reviews` : Évaluations
- `announcements` : Annonces
- `documents` : Documents
- `projects` : Projets
- `tasks` : Tâches
- `events` : Événements
- `surveys` : Enquêtes
- `messages` : Messages
- `notifications` : Notifications

### Authentification

- Authentification par email/mot de passe
- Authentification sociale (Google, GitHub)
- Gestion des rôles (admin, manager, employee)
- Sessions sécurisées

## 🚀 Déploiement

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📚 Documentation

- [Guide de configuration Supabase](SUPABASE_SETUP.md)
- [Guide de déploiement](DEPLOYMENT_GUIDE.md)
- [Guide d'authentification locale](LOCAL_AUTH_GUIDE.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**Flow HR** - Simplifiez la gestion de vos ressources humaines avec une solution moderne et intuitive.