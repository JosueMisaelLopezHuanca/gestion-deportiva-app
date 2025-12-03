// src/screens/ControlUser/QRScannerScreen.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

export default function QRScannerScreen() {
  const { logout } = useAuth();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Escanear QR</Text>
      
      {/* Botón principal */}
      <Button 
        mode="contained" 
        onPress={() => alert('Abriendo cámara...')} 
        style={{ marginTop: 20 }}
      >
        <Text style={{color: 'white'}}>Escanear Código</Text>
      </Button>

      {/* Botón de Cerrar Sesión */}
      {/* ▼▼▼ ¡AQUÍ ESTABA EL ÚLTIMO ERROR! ▼▼▼ */}
      <Button onPress={logout} style={{ marginTop: 20 }}>
          <Text>Cerrar Sesión</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  } 
});