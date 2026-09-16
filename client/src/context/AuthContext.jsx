import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('college_av_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('college_av_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('college_av_token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const data = await api.register({ name, email, password, role });
      localStorage.setItem('college_av_token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('college_av_token');
    setUser(null);
  };

  const demoLogin = async (role = 'STUDENT') => {
    setError(null);
    try {
      const data = await api.demoLogin(role);
      localStorage.setItem('college_av_token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      console.warn('api.demoLogin endpoint failed, falling back to direct login:', err);
      const email = role === 'ADMIN' ? 'admin@college.edu' : 'aarav@college.edu';
      return login(email, 'password123');
    }
  };

  const switchRole = async (targetRole) => {
    setError(null);
    try {
      const data = await api.switchRole(targetRole);
      localStorage.setItem('college_av_token', data.token);
      setUser(data);
      return data;
    } catch (err) {
      console.warn('api.switchRole endpoint failed, falling back to demoLogin:', err);
      return demoLogin(targetRole);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, demoLogin, switchRole, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
