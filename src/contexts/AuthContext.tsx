// src/contexts/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { UserData } from '../types/auth.types';


// 2. Define la forma (interfaz) de tu contexto
interface AuthContextType {
  userToken: string | null;
  userData: UserData | null;
  isLoading: boolean;
  // ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 3. Crea el contexto con el tipo y un valor inicial
export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  userData: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

// 4. Define los 'props' para el AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string): Promise<void> => {
  const data = await authService.login(username, password);
  setUserToken(data.token);
  setUserData(data);
};


  const logout = async () => {
    await authService.logout();
    setUserToken(null);
    setUserData(null);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
          const sessionData = await authService.getSessionInfo();
          setUserData(sessionData);
        }
      } catch (e) {
        await authService.logout();
        setUserToken(null);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};