import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, careerPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('devtracker_token');
    const storedUser = localStorage.getItem('devtracker_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid by fetching current user
        api.get('/api/auth/me')
          .then(({ data }) => {
            setUser(data);
            localStorage.setItem('devtracker_user', JSON.stringify(data));
          })
          .catch(() => {
            localStorage.removeItem('devtracker_token');
            localStorage.removeItem('devtracker_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('devtracker_token', data.token);
    localStorage.setItem('devtracker_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, fullName: string, careerPath?: string) => {
    const { data } = await api.post('/api/auth/register', {
      email,
      password,
      fullName,
      careerPath,
    });
    localStorage.setItem('devtracker_token', data.token);
    localStorage.setItem('devtracker_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const signOut = async () => {
    localStorage.removeItem('devtracker_token');
    localStorage.removeItem('devtracker_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
