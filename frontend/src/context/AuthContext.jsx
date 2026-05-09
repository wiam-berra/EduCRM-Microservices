import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const userData = response.data;
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const userData = response.data;
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role) => user?.role === role;
  const isAdmin = () => hasRole('ADMIN');
  const isProf = () => hasRole('PROF');
  const isStudent = () => hasRole('STUDENT');

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      hasRole, isAdmin, isProf, isStudent,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
