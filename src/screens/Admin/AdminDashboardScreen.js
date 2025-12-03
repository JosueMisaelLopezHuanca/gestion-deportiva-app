import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboardScreen() {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Dashboard del Administrador :P</Text>
      <Button mode="contained" onPress={logout} style={{ marginTop: 20 }} textColor="white">
        Cerrar Sesión
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
