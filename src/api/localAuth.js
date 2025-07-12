import { supabase } from './supabaseClient';

// Local storage keys
const STORAGE_KEYS = {
  USER: 'hr_app_user',
  SESSION: 'hr_app_session',
  TOKENS: 'hr_app_tokens',
  SETTINGS: 'hr_app_settings'
};

// Default admin user
const DEFAULT_ADMIN = {
  id: 'admin-001',
  email: 'admin@hr-app.local',
  password: 'admin123', // Change this in production
  role: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  department: 'IT',
  position: 'System Administrator',
  is_active: true,
  created_at: new Date().toISOString(),
  last_login: null
};

// Local users storage (in production, this would be in a database)
let localUsers = [DEFAULT_ADMIN];

// Session management
class LocalAuthManager {
  constructor() {
    this.currentUser = null;
    this.session = null;
    this.isInitialized = false;
    this.init();
  }

  // Initialize the auth manager
  init() {
    try {
      // Load existing session from localStorage
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      if (savedSession && savedUser) {
        const session = JSON.parse(savedSession);
        const user = JSON.parse(savedUser);
        
        // Check if session is still valid
        if (this.isSessionValid(session)) {
          this.session = session;
          this.currentUser = user;
        } else {
          this.clearSession();
        }
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing local auth:', error);
      this.clearSession();
    }
  }

  // Check if session is valid
  isSessionValid(session) {
    if (!session || !session.expires_at) return false;
    return new Date(session.expires_at) > new Date();
  }

  // Create a new session
  createSession(user) {
    const session = {
      id: `session-${Date.now()}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      access_token: this.generateToken(),
      refresh_token: this.generateToken()
    };

    this.session = session;
    this.currentUser = user;

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return session;
  }

  // Generate a simple token (in production, use proper JWT)
  generateToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Clear session
  clearSession() {
    this.session = null;
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current session
  getCurrentSession() {
    return this.session;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser && !!this.session && this.isSessionValid(this.session);
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.role === role;
  }

  // Check if user has admin privileges
  isAdmin() {
    return this.hasRole('admin');
  }
}

// Create global auth manager instance
export const localAuth = new LocalAuthManager();

// Authentication functions
export const localAuthService = {
  // Sign in with email and password
  async signIn(email, password) {
    try {
      // Find user by email
      const user = localUsers.find(u => u.email === email && u.is_active);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé ou compte désactivé');
      }

      // Check password (in production, use proper hashing)
      if (user.password !== password) {
        throw new Error('Mot de passe incorrect');
      }

      // Update last login
      user.last_login = new Date().toISOString();

      // Create session
      const session = localAuth.createSession(user);

      return {
        user,
        session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error.message
      };
    }
  },

  // Sign up new user
  async signUp(userData) {
    try {
      // Check if email already exists
      const existingUser = localUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password, // In production, hash this
        role: userData.role || 'employee',
        first_name: userData.first_name,
        last_name: userData.last_name,
        department: userData.department,
        position: userData.position,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      };

      // Add to local users
      localUsers.push(newUser);

      // Create session
      const session = localAuth.createSession(newUser);

      return {
        user: newUser,
        session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error.message
      };
    }
  },

  // Sign out
  async signOut() {
    try {
      localAuth.clearSession();
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const user = localAuth.getCurrentUser();
      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const userIndex = localUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      // Update user data
      localUsers[userIndex] = {
        ...localUsers[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update current user if it's the same user
      if (localAuth.currentUser && localAuth.currentUser.id === userId) {
        localAuth.currentUser = localUsers[userIndex];
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUsers[userIndex]));
      }

      return {
        user: localUsers[userIndex],
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  },

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = localUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      if (user.password !== currentPassword) {
        throw new Error('Mot de passe actuel incorrect');
      }

      // Update password
      user.password = newPassword; // In production, hash this
      user.updated_at = new Date().toISOString();

      // Update current user if it's the same user
      if (localAuth.currentUser && localAuth.currentUser.id === userId) {
        localAuth.currentUser = user;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Reset password (admin function)
  async resetPassword(userId, newPassword) {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      const user = localUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Update password
      user.password = newPassword; // In production, hash this
      user.updated_at = new Date().toISOString();

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get all users (admin function)
  async getAllUsers() {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      // Return users without passwords
      return {
        users: localUsers.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }),
        error: null
      };
    } catch (error) {
      return {
        users: null,
        error: error.message
      };
    }
  },

  // Create user (admin function)
  async createUser(userData) {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      // Check if email already exists
      const existingUser = localUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        password: userData.password || 'changeme123', // In production, generate secure password
        role: userData.role || 'employee',
        first_name: userData.first_name,
        last_name: userData.last_name,
        department: userData.department,
        position: userData.position,
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: null
      };

      // Add to local users
      localUsers.push(newUser);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return {
        user: userWithoutPassword,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  },

  // Update user (admin function)
  async updateUser(userId, updates) {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      const userIndex = localUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      // Update user data
      localUsers[userIndex] = {
        ...localUsers[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update current user if it's the same user
      if (localAuth.currentUser && localAuth.currentUser.id === userId) {
        localAuth.currentUser = localUsers[userIndex];
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(localUsers[userIndex]));
      }

      // Return user without password
      const { password, ...userWithoutPassword } = localUsers[userIndex];
      return {
        user: userWithoutPassword,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        error: error.message
      };
    }
  },

  // Delete user (admin function)
  async deleteUser(userId) {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      const userIndex = localUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('Utilisateur non trouvé');
      }

      // Don't allow deleting the last admin
      const adminUsers = localUsers.filter(u => u.role === 'admin' && u.is_active);
      if (localUsers[userIndex].role === 'admin' && adminUsers.length <= 1) {
        throw new Error('Impossible de supprimer le dernier administrateur');
      }

      // Remove user
      localUsers.splice(userIndex, 1);

      // If deleted user is current user, sign out
      if (localAuth.currentUser && localAuth.currentUser.id === userId) {
        localAuth.clearSession();
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Toggle user active status (admin function)
  async toggleUserStatus(userId) {
    try {
      if (!localAuth.isAdmin()) {
        throw new Error('Accès refusé: privilèges administrateur requis');
      }

      const user = localUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Don't allow deactivating the last admin
      if (user.role === 'admin') {
        const adminUsers = localUsers.filter(u => u.role === 'admin' && u.is_active);
        if (adminUsers.length <= 1 && user.is_active) {
          throw new Error('Impossible de désactiver le dernier administrateur');
        }
      }

      // Toggle status
      user.is_active = !user.is_active;
      user.updated_at = new Date().toISOString();

      // If deactivated user is current user, sign out
      if (!user.is_active && localAuth.currentUser && localAuth.currentUser.id === userId) {
        localAuth.clearSession();
      }

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }
};

// Export the auth manager and service
export default localAuthService; 