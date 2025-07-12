# Guide de Migration : Base44 vers Supabase

Ce guide vous accompagne dans la migration complète de votre application Flow HR de Base44 vers Supabase.

## 🎯 Objectif

Remplacer complètement l'infrastructure Base44 par Supabase tout en conservant toutes les fonctionnalités existantes.

## 📋 Étapes de Migration

### 1. Préparation

#### 1.1 Sauvegarde des données existantes
```bash
# Exporter les données Base44 (si disponibles)
# Sauvegarder la configuration actuelle
cp .env .env.backup
```

#### 1.2 Création du projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anon

### 2. Configuration de la Base de Données

#### 2.1 Exécution du script SQL
1. Aller dans l'éditeur SQL de Supabase
2. Copier et exécuter le contenu de `supabase_schema.sql`
3. Vérifier que toutes les tables sont créées

#### 2.2 Configuration de l'authentification
1. Aller dans Authentication > Settings
2. Configurer les providers (Email, Google, GitHub)
3. Définir les URLs de redirection :
   - `http://localhost:3003/auth/callback`
   - `https://votre-domaine.com/auth/callback`

#### 2.3 Configuration du Storage
1. Aller dans Storage
2. Créer les buckets suivants :
   - `documents` (pour les fichiers)
   - `avatars` (pour les photos de profil)
   - `backups` (pour les sauvegardes)

### 3. Migration des Données

#### 3.1 Export des données Base44
Si vous avez des données existantes dans Base44, exportez-les au format JSON.

#### 3.2 Import dans Supabase
```sql
-- Exemple d'import pour les employés
INSERT INTO employees (first_name, last_name, email, department, position, hire_date)
SELECT 
  first_name,
  last_name,
  email,
  department,
  position,
  hire_date
FROM json_populate_recordset(null::employees, '[VOS_DONNÉES_JSON]');
```

#### 3.3 Vérification des données
```sql
-- Vérifier le nombre d'enregistrements
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM leave_requests;
SELECT COUNT(*) FROM time_entries;
```

### 4. Configuration de l'Application

#### 4.1 Variables d'environnement
Mettre à jour `.env.local` :
```env
# Supprimer les variables Base44
# VITE_BASE44_APP_ID=xxx

# Ajouter les variables Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon
```

#### 4.2 Mise à jour des imports
Tous les imports ont été mis à jour automatiquement :
- `@/api/entities` → `@/api/supabaseEntities`
- `@/api/functions` → `@/api/supabaseFunctions`

#### 4.3 Test de connexion
1. Lancer l'application : `npm run dev`
2. Tester la connexion Supabase
3. Vérifier l'authentification

### 5. Migration des Fonctionnalités

#### 5.1 Authentification
- ✅ Remplacé par Supabase Auth
- ✅ Gestion des sessions
- ✅ Récupération de mot de passe

#### 5.2 Base de données
- ✅ Toutes les tables créées
- ✅ Relations et contraintes
- ✅ Index pour les performances

#### 5.3 Storage
- ✅ Buckets configurés
- ✅ Politiques de sécurité
- ✅ Upload de fichiers

#### 5.4 Fonctions
- ✅ Notifications
- ✅ Gamification
- ✅ Analytics
- ✅ Logs système

### 6. Tests et Validation

#### 6.1 Tests fonctionnels
- [ ] Connexion utilisateur
- [ ] Gestion des employés
- [ ] Demandes de congés
- [ ] Pointage
- [ ] Annonces
- [ ] Messages
- [ ] Documents
- [ ] Gamification

#### 6.2 Tests de performance
- [ ] Temps de réponse des requêtes
- [ ] Upload de fichiers
- [ ] Concurrence utilisateurs

#### 6.3 Tests de sécurité
- [ ] Authentification
- [ ] Autorisations (RLS)
- [ ] Validation des données

### 7. Déploiement

#### 7.1 Configuration de production
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-production
VITE_APP_ENVIRONMENT=production
```

#### 7.2 Déploiement Vercel
```bash
npm run build
vercel --prod
```

#### 7.3 Déploiement Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### 8. Post-Migration

#### 8.1 Surveillance
- Surveiller les logs Supabase
- Vérifier les performances
- Contrôler l'utilisation des ressources

#### 8.2 Optimisations
- Ajuster les politiques RLS
- Optimiser les requêtes
- Configurer les sauvegardes

#### 8.3 Documentation
- Mettre à jour la documentation
- Former les utilisateurs
- Créer des guides d'utilisation

## 🔧 Résolution des Problèmes

### Problèmes courants

#### Erreur de connexion Supabase
```javascript
// Vérifier les variables d'environnement
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

#### Erreur RLS (Row Level Security)
```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'employees';

-- Désactiver temporairement RLS pour debug
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
```

#### Erreur d'authentification
```javascript
// Vérifier la configuration auth
const { data, error } = await supabase.auth.getUser();
console.log('User:', data.user);
console.log('Error:', error);
```

### Logs utiles

#### Logs Supabase
- Aller dans Dashboard > Logs
- Filtrer par type d'erreur
- Vérifier les requêtes lentes

#### Logs application
```javascript
// Activer les logs détaillés
console.log('Supabase client:', supabase);
console.log('Auth state:', await supabase.auth.getSession());
```

## 📊 Comparaison Base44 vs Supabase

| Fonctionnalité | Base44 | Supabase |
|----------------|--------|----------|
| Base de données | ✅ | ✅ PostgreSQL |
| Authentification | ✅ | ✅ Auth |
| Storage | ✅ | ✅ Storage |
| Functions | ✅ | ✅ Edge Functions |
| Real-time | ✅ | ✅ Realtime |
| API | ✅ | ✅ REST/GraphQL |
| Dashboard | ✅ | ✅ Dashboard |
| Pricing | Pay-per-use | Gratuit + Pay-per-use |

## 🎉 Avantages de la Migration

### Performance
- Base de données PostgreSQL optimisée
- Index automatiques
- Requêtes plus rapides

### Sécurité
- Row Level Security (RLS)
- Authentification robuste
- Chiffrement des données

### Scalabilité
- Infrastructure cloud native
- Auto-scaling
- Haute disponibilité

### Coût
- Plan gratuit généreux
- Pricing transparent
- Pas de coûts cachés

## 📞 Support

En cas de problème lors de la migration :

1. **Documentation Supabase** : [docs.supabase.com](https://docs.supabase.com)
2. **Communauté Discord** : [discord.supabase.com](https://discord.supabase.com)
3. **GitHub Issues** : Ouvrir une issue sur le repository
4. **Support technique** : Contacter l'équipe de développement

## ✅ Checklist de Migration

- [ ] Projet Supabase créé
- [ ] Script SQL exécuté
- [ ] Authentification configurée
- [ ] Storage configuré
- [ ] Variables d'environnement mises à jour
- [ ] Imports mis à jour
- [ ] Données migrées
- [ ] Tests fonctionnels passés
- [ ] Tests de performance validés
- [ ] Tests de sécurité validés
- [ ] Application déployée
- [ ] Documentation mise à jour
- [ ] Utilisateurs formés

---

**Migration réussie !** 🎉

Votre application Flow HR est maintenant entièrement basée sur Supabase avec une infrastructure moderne, sécurisée et scalable. 