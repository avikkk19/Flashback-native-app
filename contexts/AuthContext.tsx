import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Types for authentication state
export interface User {
  phoneNumber: string;
  username: string;
  selfieUrl?: string;
  localSelfiePath?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  livenessCompleted: boolean;
  selfieUploaded: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  setSelfieUrl: (url: string) => Promise<void>;
  completeLiveness: () => Promise<void>;
  completeSelfieUpload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
    livenessCompleted: false,
    selfieUploaded: false,
  });

  // Load authentication state from storage on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  /**
   * Load authentication state from AsyncStorage
   */
  const loadAuthState = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        setState({
          isAuthenticated: true,
          user,
          token,
          isLoading: false,
          livenessCompleted: false, // Reset liveness on app start
          selfieUploaded: !!user.selfieUrl, // Set based on whether user has selfie URL
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  /**
   * Login user and save to storage
   */
  const login = async (user: User, token: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      ]);

      const newState = {
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
        livenessCompleted: false, // New login requires liveness check
        selfieUploaded: false, // New login requires selfie upload
      };
      console.log('[AUTH] Setting new state after login:', newState);
      setState(newState);
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  };

  /**
   * Logout user and clear storage
   */
  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      setState({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        livenessCompleted: false,
        selfieUploaded: false,
      });
    } catch (error) {
      console.error('Error clearing auth state:', error);
      throw error;
    }
  };

  /**
   * Update user information
   */
  const updateUser = async (userUpdate: Partial<User>) => {
    try {
      const updatedUser = state.user ? { ...state.user, ...userUpdate } : userUpdate as User;
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  /**
   * Set selfie URL for the user
   */
  const setSelfieUrl = async (url: string) => {
    await updateUser({ selfieUrl: url });
  };

  /**
   * Mark liveness check as completed
   */
  const completeLiveness = async () => {
    try {
      setState(prev => ({
        ...prev,
        livenessCompleted: true,
      }));
    } catch (error) {
      console.error('Error completing liveness:', error);
      throw error;
    }
  };

  /**
   * Mark selfie upload as completed
   */
  const completeSelfieUpload = async () => {
    try {
      setState(prev => ({
        ...prev,
        selfieUploaded: true,
      }));
    } catch (error) {
      console.error('Error completing selfie upload:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    setSelfieUrl,
    completeLiveness,
    completeSelfieUpload,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
