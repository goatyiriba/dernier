# 🔐 Guide du Système d'Authentification Local

## 📋 **Vue d'ensemble**

Ce système d'authentification local offre une solution complète pour gérer les utilisateurs sans dépendre de services externes comme Base44 ou Supabase. Il est parfait pour le développement, les démonstrations et les environnements isolés.

## 🚀 **Fonctionnalités**

### ✅ **Authentification**
- Connexion/Inscription avec email et mot de passe
- Sessions persistantes avec localStorage
- Gestion des rôles (admin, manager, employee)
- Système de permissions granulaire
- Déconnexion sécurisée

### ✅ **Gestion des Utilisateurs**
- Création de nouveaux utilisateurs
- Modification des profils
- Activation/désactivation de comptes
- Réinitialisation de mots de passe
- Suppression d'utilisateurs

### ✅ **Sécurité**
- Validation des sessions
- Protection des routes
- Gestion des permissions
- Tokens d'accès et de rafraîchissement

## 🛠️ **Installation et Configuration**

### **1. Structure des Fichiers**

```
src/
├── api/
│   └── localAuth.js          # Service d'authentification local
├── components/
│   ├── auth/
│   │   └── LocalLogin.jsx    # Composant de connexion
│   └── admin/
│       └── LocalUserManagement.jsx  # Gestion des utilisateurs
├── hooks/
│   └── useLocalAuth.jsx      # Hook d'authentification
└── pages/
    ├── LocalLogin.jsx        # Page de connexion
    └── LocalUserManagement.jsx  # Page de gestion
```

### **2. Configuration de l'Application**

Ajoutez le provider d'authentification dans votre `App.jsx` :

```jsx
import { LocalAuthProvider } from '@/hooks/useLocalAuth';

function App() {
  return (
    <LocalAuthProvider>
      {/* Votre application */}
    </LocalAuthProvider>
  );
}
```

### **3. Protection des Routes**

```jsx
import { withLocalAuth } from '@/hooks/useLocalAuth';

// Protection basique
const ProtectedComponent = withLocalAuth(MyComponent);

// Protection avec rôle requis
const AdminComponent = withLocalAuth(AdminPanel, 'admin');

// Protection avec permission requise
const FinanceComponent = withLocalAuth(FinancePanel, null, 'manage_finance');
```

## 👤 **Utilisation**

### **1. Connexion**

```jsx
import { useLocalAuth } from '@/hooks/useLocalAuth';

function LoginComponent() {
  const { signIn, isLoading } = useLocalAuth();

  const handleLogin = async () => {
    const { user, error } = await signIn(email, password);
    if (error) {
      console.error('Erreur de connexion:', error);
    } else {
      console.log('Connecté:', user);
    }
  };
}
```

### **2. Vérification d'Authentification**

```jsx
import { useLocalAuth } from '@/hooks/useLocalAuth';

function MyComponent() {
  const { isAuthenticated, user, isAdmin, hasPermission } = useLocalAuth();

  if (!isAuthenticated()) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <h1>Bienvenue, {user.first_name} !</h1>
      {isAdmin() && <AdminPanel />}
      {hasPermission('manage_users') && <UserManagement />}
    </div>
  );
}
```

### **3. Déconnexion**

```jsx
import { useLocalAuth } from '@/hooks/useLocalAuth';

function LogoutButton() {
  const { signOut } = useLocalAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      // Redirection vers la page de connexion
      window.location.href = '/login';
    }
  };

  return <button onClick={handleLogout}>Se déconnecter</button>;
}
```

## 🔧 **Configuration Avancée**

### **1. Compte Administrateur par Défaut**

Le système inclut un compte administrateur par défaut :

```javascript
// Dans src/api/localAuth.js
const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@hr-app.local',
  password: 'admin123',
  role: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  department: 'IT',
  position: 'System Administrator',
  is_active: true
};
```

**⚠️ Important :** Changez ces identifiants en production !

### **2. Personnalisation des Permissions**

Modifiez les permissions dans `useLocalAuth.jsx` :

```javascript
const permissions = {
  admin: [
    'manage_users',
    'manage_system',
    'view_all_data',
    // Ajoutez vos permissions
  ],
  manager: [
    'manage_team',
    'view_team_data',
    // Ajoutez vos permissions
  ],
  employee: [
    'view_own_data',
    'submit_requests',
    // Ajoutez vos permissions
  ]
};
```

### **3. Durée des Sessions**

Modifiez la durée des sessions dans `localAuth.js` :

```javascript
// Session de 24 heures (par défaut)
expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

// Session de 7 jours
expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
```

## 📊 **Gestion des Utilisateurs**

### **1. Interface d'Administration**

Accédez à la gestion des utilisateurs via `/local-user-management` (admin uniquement).

### **2. API de Gestion**

```javascript
import { localAuthService } from '@/api/localAuth';

// Créer un utilisateur
const { user, error } = await localAuthService.createUser({
  email: 'user@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe',
  role: 'employee'
});

// Mettre à jour un utilisateur
const { user, error } = await localAuthService.updateUser(userId, {
  first_name: 'Jane',
  department: 'Marketing'
});

// Supprimer un utilisateur
const { error } = await localAuthService.deleteUser(userId);

// Activer/Désactiver un utilisateur
const { error } = await localAuthService.toggleUserStatus(userId);
```

## 🔒 **Sécurité**

### **1. Bonnes Pratiques**

- **Changez le mot de passe admin par défaut**
- **Utilisez des mots de passe forts**
- **Limitez l'accès aux fonctions d'administration**
- **Surveillez les tentatives de connexion**
- **Sauvegardez régulièrement les données utilisateurs**

### **2. Améliorations Recommandées**

```javascript
// Hachage des mots de passe (production)
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);

// Validation des mots de passe
const isValidPassword = (password) => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
};

// Rate limiting pour les tentatives de connexion
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
```

### **3. Persistance des Données**

En production, remplacez le stockage en mémoire par une base de données :

```javascript
// Exemple avec localStorage (développement)
let localUsers = [DEFAULT_ADMIN];

// Exemple avec base de données (production)
const saveUsers = async (users) => {
  await db.users.bulkWrite(users.map(user => ({
    replaceOne: { filter: { id: user.id }, replacement: user, upsert: true }
  })));
};
```

## 🧪 **Tests**

### **1. Test de Connexion**

```javascript
// Test avec le compte admin par défaut
const testLogin = async () => {
  const { user, error } = await localAuthService.signIn(
    'admin@hr-app.local',
    'admin123'
  );
  
  if (error) {
    console.error('Test de connexion échoué:', error);
  } else {
    console.log('Test de connexion réussi:', user);
  }
};
```

### **2. Test des Permissions**

```javascript
const testPermissions = () => {
  const { hasPermission, isAdmin } = useLocalAuth();
  
  console.log('Est admin:', isAdmin());
  console.log('Peut gérer les utilisateurs:', hasPermission('manage_users'));
  console.log('Peut voir les analytics:', hasPermission('view_analytics'));
};
```

## 🚨 **Dépannage**

### **1. Problèmes Courants**

**Session expirée :**
```javascript
// Vérifiez la validité de la session
const { isAuthenticated } = useLocalAuth();
if (!isAuthenticated()) {
  // Redirigez vers la connexion
  window.location.href = '/login';
}
```

**Permissions insuffisantes :**
```javascript
// Vérifiez les permissions avant d'accéder aux fonctionnalités
const { hasPermission } = useLocalAuth();
if (!hasPermission('manage_users')) {
  return <div>Accès refusé</div>;
}
```

**Erreur de connexion :**
```javascript
// Vérifiez les identifiants
const { signIn } = useLocalAuth();
const { error } = await signIn(email, password);
if (error) {
  console.error('Erreur:', error);
  // Affichez le message d'erreur à l'utilisateur
}
```

### **2. Logs de Débogage**

Activez les logs de débogage :

```javascript
// Dans localAuth.js
const DEBUG = true;

if (DEBUG) {
  console.log('Auth operation:', operation, data);
}
```

## 📈 **Migration vers Production**

### **1. Étapes de Migration**

1. **Sauvegardez les données utilisateurs**
2. **Implémentez le hachage des mots de passe**
3. **Configurez une base de données**
4. **Ajoutez la validation des données**
5. **Implémentez le rate limiting**
6. **Configurez les logs de sécurité**
7. **Testez toutes les fonctionnalités**

### **2. Variables d'Environnement**

```bash
# .env.production
NODE_ENV=production
AUTH_SESSION_DURATION=86400000  # 24 heures
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=900000    # 15 minutes
AUTH_PASSWORD_MIN_LENGTH=8
```

## 🎯 **Exemples d'Utilisation**

### **1. Page Protégée**

```jsx
import { withLocalAuth } from '@/hooks/useLocalAuth';

const Dashboard = () => {
  const { user, isAdmin } = useLocalAuth();
  
  return (
    <div>
      <h1>Tableau de bord</h1>
      <p>Bienvenue, {user.first_name} !</p>
      {isAdmin() && <AdminControls />}
    </div>
  );
};

export default withLocalAuth(Dashboard);
```

### **2. Composant avec Permissions**

```jsx
import { useLocalAuth } from '@/hooks/useLocalAuth';

const UserManagement = () => {
  const { hasPermission, user } = useLocalAuth();
  
  if (!hasPermission('manage_users')) {
    return <div>Accès refusé</div>;
  }
  
  return (
    <div>
      <h2>Gestion des Utilisateurs</h2>
      {/* Interface de gestion */}
    </div>
  );
};
```

### **3. Hook Personnalisé**

```jsx
import { useLocalAuth } from '@/hooks/useLocalAuth';

const useUserProfile = () => {
  const { user, updateProfile } = useLocalAuth();
  
  const updateUserProfile = async (updates) => {
    const { error } = await updateProfile(updates);
    if (error) {
      throw new Error(error);
    }
  };
  
  return { user, updateUserProfile };
};
```

---

## 📞 **Support**

Pour toute question ou problème :

1. **Vérifiez les logs de la console**
2. **Consultez la documentation**
3. **Testez avec le compte admin par défaut**
4. **Vérifiez les permissions utilisateur**

**Rappel :** Ce système est conçu pour le développement et les démonstrations. Pour la production, implémentez des mesures de sécurité supplémentaires. 