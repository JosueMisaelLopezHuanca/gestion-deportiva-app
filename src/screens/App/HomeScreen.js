import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
// src/screens/App/HomeScreen.js

export default function HomeScreen() {
  const { logout, userData } = useAuth();

  // ▼▼▼ ¡AQUÍ ESTÁ LA CÁMARA DE DIAGNÓSTICO! ▼▼▼
  // Esto imprimirá en tu terminal de VS Code el objeto 'userData' completo.
  console.log("Datos del usuario en HomeScreen:", JSON.stringify(userData, null, 2));

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">¡Bienvenido!</Text>
      
      {/* Mostramos la información del usuario en pantalla */}
      {userData && <Text variant="bodyLarge">Usuario: {userData.username}</Text>}
      
      {/* Mostramos los roles exactos que tiene el usuario */}
      {userData && (
        <Text style={styles.roleText}>
          Tus roles son: {JSON.stringify(userData.roles)}
        </Text>
      )}
      
      <Button mode="contained" onPress={logout} style={{ marginTop: 20 }}>
        <Text style={{color: 'white'}}>Cerrar Sesión</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  roleText: {
    marginTop: 10,
    color: '#6c757d',
    fontFamily: 'monospace', // Para que se vea claro
  }
});