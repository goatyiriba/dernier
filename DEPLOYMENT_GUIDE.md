# 🚀 Guide de Déploiement - HR Management System

Ce guide vous accompagne pour déployer votre application HR Management System sur Vercel ou Netlify.

## 📋 **Prérequis**

- ✅ Compte GitHub/GitLab/Bitbucket
- ✅ Compte Vercel ou Netlify
- ✅ Node.js 18+ installé localement
- ✅ Git configuré

## 🔧 **Préparation Locale**

### **1. Test de Build Local**

```bash
# Installer les dépendances
npm install

# Tester le build
npm run build

# Prévisualiser le build
npm run preview
```

### **2. Vérification des Fichiers**

Assurez-vous que ces fichiers sont présents :
- ✅ `vercel.json` (pour Vercel)
- ✅ `netlify.toml` (pour Netlify)
- ✅ `public/_redirects` (pour Netlify)
- ✅ `public/_headers` (pour Netlify)
- ✅ `public/robots.txt`
- ✅ `public/sitemap.xml`
- ✅ `public/manifest.json`
- ✅ `public/sw.js`

## 🚀 **Déploiement sur Vercel**

### **Option 1 : Déploiement via CLI**

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### **Option 2 : Déploiement via Dashboard**

1. **Connectez-vous à [vercel.com](https://vercel.com)**
2. **Cliquez sur "New Project"**
3. **Importez votre repository**
4. **Configurez le projet :**
   - **Framework Preset :** Vite
   - **Build Command :** `npm run build`
   - **Output Directory :** `dist`
   - **Install Command :** `npm install`

### **Configuration Vercel**

Le fichier `vercel.json` est déjà configuré avec :
- ✅ Redirection SPA
- ✅ Headers de sécurité
- ✅ Cache optimisé
- ✅ Variables d'environnement

### **Variables d'Environnement (Optionnel)**

Si vous utilisez Supabase, ajoutez dans les paramètres Vercel :
```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
VITE_SUPABASE_SERVICE_ROLE_KEY=votre_cle_service
```

## 🌐 **Déploiement sur Netlify**

### **Option 1 : Déploiement via CLI**

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Déployer
netlify deploy --prod --dir=dist
```

### **Option 2 : Déploiement via Dashboard**

1. **Connectez-vous à [netlify.com](https://netlify.com)**
2. **Cliquez sur "New site from Git"**
3. **Sélectionnez votre repository**
4. **Configurez le build :**
   - **Build command :** `npm run build`
   - **Publish directory :** `dist`
   - **Base directory :** (laisser vide)

### **Configuration Netlify**

Le fichier `netlify.toml` est déjà configuré avec :
- ✅ Redirection SPA
- ✅ Headers de sécurité
- ✅ Cache optimisé
- ✅ Variables d'environnement par contexte

## 🔒 **Sécurité et Performance**

### **Headers de Sécurité Configurés**

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

### **Cache Optimisé**

- **Assets statiques :** Cache de 1 an
- **Pages :** Pas de cache (SPA)
- **API :** Cache configurable

### **Compression**

- **Gzip** activé automatiquement
- **Brotli** supporté par Vercel

## 📱 **PWA (Progressive Web App)**

### **Fonctionnalités PWA**

- ✅ **Manifest.json** configuré
- ✅ **Service Worker** pour le cache
- ✅ **Icons** (à ajouter)
- ✅ **Meta tags** pour iOS/Android

### **Ajout des Icons**

Créez et ajoutez ces fichiers dans `public/` :
```
public/
├── icon-192x192.png
├── icon-512x512.png
├── apple-touch-icon.png
└── favicon.ico
```

## 🔍 **SEO Optimisé**

### **Fichiers SEO**

- ✅ **robots.txt** configuré
- ✅ **sitemap.xml** généré
- ✅ **Meta tags** complets
- ✅ **Open Graph** configuré
- ✅ **Twitter Cards** configuré

### **Mise à Jour des URLs**

Modifiez ces fichiers avec votre domaine :
- `public/robots.txt`
- `public/sitemap.xml`
- `index.html` (meta tags)

## 📊 **Monitoring et Analytics**

### **Vercel Analytics**

```bash
# Installer Vercel Analytics
npm install @vercel/analytics

# Ajouter dans main.jsx
import { Analytics } from '@vercel/analytics/react';

// Dans votre App
<Analytics />
```

### **Netlify Analytics**

Activable dans le dashboard Netlify.

## 🚨 **Dépannage**

### **Erreurs Courantes**

#### **Build Failed**
```bash
# Vérifier les dépendances
npm install

# Nettoyer le cache
npm run clean

# Rebuild
npm run build
```

#### **404 sur les Routes**
- Vérifiez que les redirections sont configurées
- Testez avec `npm run preview`

#### **Variables d'Environnement**
- Vérifiez que les variables sont définies
- Redéployez après modification

### **Logs de Déploiement**

#### **Vercel**
```bash
vercel logs
```

#### **Netlify**
```bash
netlify logs
```

## 🔄 **Déploiement Continu**

### **GitHub Actions (Optionnel)**

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📈 **Optimisations Post-Déploiement**

### **1. Performance**

- ✅ **Code splitting** configuré
- ✅ **Lazy loading** des composants
- ✅ **Cache** optimisé
- ✅ **Compression** activée

### **2. Sécurité**

- ✅ **Headers** de sécurité
- ✅ **HTTPS** forcé
- ✅ **CSP** configurable
- ✅ **HSTS** activé

### **3. Monitoring**

- ✅ **Error tracking** (Sentry)
- ✅ **Performance monitoring**
- ✅ **Uptime monitoring**

## 🎯 **Checklist de Déploiement**

### **Avant le Déploiement**
- [ ] Tests locaux passent
- [ ] Build local réussi
- [ ] Variables d'environnement configurées
- [ ] URLs mises à jour
- [ ] Icons PWA ajoutées

### **Après le Déploiement**
- [ ] Site accessible
- [ ] Routes fonctionnent
- [ ] Authentification opérationnelle
- [ ] Performance vérifiée
- [ ] SEO testé
- [ ] PWA installable

## 📞 **Support**

### **Vercel**
- [Documentation](https://vercel.com/docs)
- [Support](https://vercel.com/support)

### **Netlify**
- [Documentation](https://docs.netlify.com)
- [Support](https://www.netlify.com/support)

### **Projet**
- Consultez les logs de déploiement
- Vérifiez la configuration
- Testez en local d'abord

---

## 🎉 **Félicitations !**

Votre application HR Management System est maintenant déployée et prête à être utilisée !

**URLs importantes :**
- **Site principal :** `https://votre-domaine.com`
- **Page d'accueil :** `https://votre-domaine.com/home`
- **Connexion :** `https://votre-domaine.com/login`
- **Gestion utilisateurs :** `https://votre-domaine.com/local-user-management`

**Compte de démonstration :**
- **Email :** `admin@hr-app.local`
- **Mot de passe :** `admin123` 