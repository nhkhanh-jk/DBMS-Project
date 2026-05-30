import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('tnc_token');
    const stored = localStorage.getItem('tnc_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('tnc_user');
        localStorage.removeItem('tnc_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    localStorage.setItem('tnc_token', data.accessToken);
    localStorage.setItem('tnc_user', JSON.stringify(data.profile));
    setUser(data.profile);
    return data.profile;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('tnc_token');
    localStorage.removeItem('tnc_user');
    // Clear role-specific tokens
    localStorage.removeItem('tnc_superadmin');
    localStorage.removeItem('tnc_manager');
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getProfile();
      setUser(profile);
      localStorage.setItem('tnc_user', JSON.stringify(profile));
      return profile;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'NHANVIEN';
  const isCustomer = user?.role === 'KHACHHANG';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      refreshProfile,
      isAuthenticated,
      isAdmin,
      isStaff,
      isCustomer,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export default AuthContext;
