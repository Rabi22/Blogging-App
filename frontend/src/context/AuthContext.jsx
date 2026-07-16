import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('blog_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate stored data has required fields
        if (parsed && parsed.id && parsed.username) {
          setUser(parsed);
        } else {
          localStorage.removeItem('blog_user');
        }
      }
    } catch {
      localStorage.removeItem('blog_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (u) => {
    if (u) {
      // Ensure role is stored
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
