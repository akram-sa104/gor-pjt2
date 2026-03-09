import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User } from '@/lib/api';
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(!!token);
  useEffect(() => {
    if (token) {
      api.getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [token]);
  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };
  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    await api.register(data);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};