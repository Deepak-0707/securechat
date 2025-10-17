import React, { createContext, useState, useCallback } from 'react';
import { authService } from '../services/auth.js';
import { disconnectSocket } from '../services/socket.js';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getUser());
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      toast.success('Account created successfully');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      toast.success('Logged in successfully');
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Disconnect socket first to emit offline status
      disconnectSocket();
      
      // Call backend logout API to update database
      await authService.logout();
      
      // Clear local state and storage
      setUser(null);
      
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if API call fails, still logout locally
      console.error('Logout error:', error);
      disconnectSocket();
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}