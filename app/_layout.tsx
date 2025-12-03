// app/_layout.tsx - VERSIÓN CORREGIDA
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/contexts/AuthContext';
import { useAuth } from '../src/hooks/useAuth';

const InitialLayout = () => {
  const { userToken, userData, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAppGroup = segments[0] === '(app)';

    if (userToken && !inAppGroup) {
      // Redirigir al dashboard correcto basado en el rol
      if (userData?.roles?.includes('ROLE_SUPERUSUARIO')) {
        router.replace('/superadmin');
      } else if (userData?.roles?.includes('ROLE_ADMINISTRADOR')) {
        router.replace('/admin');
      } else if (userData?.roles?.includes('ROLE_USUARIO_CONTROL')) {
        router.replace('/controluser');
      } else if (userData?.roles?.includes('ROLE_CLIENTE')) {
        router.replace('/client');
      } else {
        router.replace('/home'); 
      }
    } else if (!userToken && inAppGroup) {
      router.replace('/login');
    }
  }, [userToken, userData, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack key={userToken ? 'app-stack' : 'auth-stack'} screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaperProvider>
          <InitialLayout />
          <Toast />
        </PaperProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}