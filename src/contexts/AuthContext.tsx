import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'shopkeeper' | 'customer';
  shopId?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<any>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const { token: newToken, user: newUser } = response;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);

      // Role-based navigation
      if (newUser.role === 'admin') {
        window.location.href = '/admin';
      } else if (newUser.role === 'shopkeeper') {
        window.location.href = '/shop';
      } else {
        window.location.href = '/menu';
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await authService.register({ 
        name, 
        email, 
        password, 
        role: role as 'admin' | 'shopkeeper' | 'customer' 
      });
      const { token: newToken, user: newUser } = response;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setToken(newToken);
      setUser(newUser);

      // Role-based navigation
      if (newUser.role === 'admin') {
        window.location.href = '/admin';
      } else if (newUser.role === 'shopkeeper') {
        window.location.href = '/shop';
      } else {
        window.location.href = '/menu';
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name: string, email: string, currentPassword?: string, newPassword?: string) => {
    try {
      const response = await authService.updateProfile({
        name,
        email,
        currentPassword,
        newPassword
      });
      
      const { user: updatedUser } = response;
      
      // Update localStorage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
