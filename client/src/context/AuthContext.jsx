import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guest mode is ephemeral — NOT stored in localStorage intentionally.
  // Refreshing the page exits guest mode and returns to Login, which is correct.
  const [isGuest, setIsGuest] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Purge legacy persistent storage to prevent cross-session leakage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsGuest(false);
  }, []);

  const enterGuestMode = useCallback(() => {
    // Ensure no real user session bleeds into guest mode
    logout();
    setIsGuest(true);
  }, [logout]);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      // Purge any legacy persistent tokens from localStorage to prevent auto-login across browser sessions
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          sessionStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error('Session verification failed or token expired:', error.message);
          logout();
        }
      } else {
        // No session token — clean state so routes redirect to /login
        setUser(null);
      }
      setLoading(false);
    };

    verifyToken();
  }, [logout]);

  const login = async (email, password) => {
    // Ensure guest mode and any legacy storage is cleared
    setIsGuest(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const { data } = await api.post('/auth/login', { email, password });
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, username, email, password, securityQuestion, securityAnswer) => {
    // Ensure guest mode and any legacy storage is cleared
    setIsGuest(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const { data } = await api.post('/auth/register', {
      name,
      username,
      email,
      password,
      securityQuestion,
      securityAnswer,
    });
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      sessionStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    loading,
    isGuest,
    login,
    register,
    logout,
    updateUser,
    enterGuestMode,
    exitGuestMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
