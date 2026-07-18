import { createContext, useContext, useState, useEffect } from 'react';
import { userAuthAPI, authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async (parsed) => {
      try {
        // Verify the session is still valid on the server
        const check = parsed.role === 'admin'
          ? await authAPI.getDashboard()
          : await userAuthAPI.getMe();
        if (check.ok) {
          setUser(parsed);
        } else {
          // Server session expired — stale local state
          localStorage.removeItem('blog_user');
        }
      } catch {
        localStorage.removeItem('blog_user');
      } finally {
        setLoading(false);
      }
    };

    try {
      const stored = localStorage.getItem('blog_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.username) {
          verifySession(parsed);
          return; 
        } else {
          localStorage.removeItem('blog_user');
        }
      }
    } catch {
      localStorage.removeItem('blog_user');
    }
    setLoading(false);
  }, []);

  const login = (u) => {
    if (u) {
      const userData = {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role || 'user',
      };
      setUser(userData);
      localStorage.setItem('blog_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blog_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
