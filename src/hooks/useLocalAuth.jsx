import { useState, useEffect, createContext, useContext } from 'react';
import { localAuth, localAuthService } from '@/api/localAuth';

// Create authentication context
const LocalAuthContext = createContext();

// Custom hook to use local authentication
export const useLocalAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
};

// Authentication provider component
export const LocalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const currentUser = localAuth.getCurrentUser();
        const currentSession = localAuth.getCurrentSession();

        if (currentUser && currentSession && localAuth.isSessionValid(currentSession)) {
          setUser(currentUser);
          setSession(currentSession);
        } else {
          // Clear invalid session
          localAuth.clearSession();
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localAuth.clearSession();
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Wait for localAuth to be initialized
    if (localAuth.isInitialized) {
      initializeAuth();
    } else {
      // Poll until initialized
      const interval = setInterval(() => {
        if (localAuth.isInitialized) {
          clearInterval(interval);
          initializeAuth();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const { user: authUser, session: authSession, error } = await localAuthService.signIn(email, password);
      
      if (error) {
        return { error };
      }

      setUser(authUser);
      setSession(authSession);

      return { user: authUser, session: authSession };
    } catch (error) {
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (userData) => {
    setIsLoading(true);
    try {
      const { user: authUser, session: authSession, error } = await localAuthService.signUp(userData);
      
      if (error) {
        return { error };
      }

      setUser(authUser);
      setSession(authSession);

      return { user: authUser, session: authSession };
    } catch (error) {
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await localAuthService.signOut();
      
      if (error) {
        return { error };
      }

      setUser(null);
      setSession(null);

      return { success: true };
    } catch (error) {
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    if (!user) {
      return { error: 'Aucun utilisateur connecté' };
    }

    try {
      const { user: updatedUser, error } = await localAuthService.updateProfile(user.id, updates);
      
      if (error) {
        return { error };
      }

      setUser(updatedUser);
      return { user: updatedUser };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) {
      return { error: 'Aucun utilisateur connecté' };
    }

    try {
      const { error } = await localAuthService.changePassword(user.id, currentPassword, newPassword);
      return { error };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!session && localAuth.isSessionValid(session);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('admin');
  };

  // Check if user is manager
  const isManager = () => {
    return hasRole('manager') || hasRole('admin');
  };

  // Get user permissions
  const getUserPermissions = () => {
    if (!user) return [];

    const permissions = {
      admin: [
        'manage_users',
        'manage_system',
        'view_all_data',
        'manage_employees',
        'manage_finance',
        'manage_announcements',
        'manage_surveys',
        'manage_projects',
        'view_analytics',
        'manage_settings'
      ],
      manager: [
        'manage_team',
        'view_team_data',
        'manage_team_projects',
        'view_team_analytics',
        'approve_requests'
      ],
      employee: [
        'view_own_data',
        'submit_requests',
        'view_announcements',
        'participate_surveys'
      ]
    };

    return permissions[user.role] || [];
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return;

    try {
      const { user: refreshedUser, error } = await localAuthService.getCurrentUser();
      
      if (!error && refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Context value
  const value = {
    // State
    user,
    session,
    isLoading,
    isInitialized,
    
    // Authentication functions
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    
    // Utility functions
    isAuthenticated,
    hasRole,
    isAdmin,
    isManager,
    hasPermission,
    getUserPermissions,
    getUserDisplayName,
    getUserInitials,
    refreshUser,
    
    // Direct access to auth manager (for advanced use cases)
    authManager: localAuth,
    authService: localAuthService
  };

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
};

// Higher-order component for protecting routes
export const withLocalAuth = (Component, requiredRole = null, requiredPermission = null) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasRole, hasPermission, isLoading } = useLocalAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!isAuthenticated()) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous devez avoir le rôle "{requiredRole}" pour accéder à cette page.
            </p>
          </div>
        </div>
      );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas la permission "{requiredPermission}" pour accéder à cette page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Hook for route protection
export const useRequireAuth = (requiredRole = null, requiredPermission = null) => {
  const { isAuthenticated, hasRole, hasPermission, isLoading } = useLocalAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
      }

      if (requiredRole && !hasRole(requiredRole)) {
        window.location.href = '/unauthorized';
        return;
      }

      if (requiredPermission && !hasPermission(requiredPermission)) {
        window.location.href = '/unauthorized';
        return;
      }
    }
  }, [isLoading, isAuthenticated, hasRole, hasPermission, requiredRole, requiredPermission]);

  return { isLoading };
};

export default useLocalAuth; 