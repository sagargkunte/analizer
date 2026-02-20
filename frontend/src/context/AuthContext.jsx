import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { setToken, removeToken, getToken } from '../utils/token';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        setToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};