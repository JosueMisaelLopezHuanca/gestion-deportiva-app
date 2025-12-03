// app/(client)/cancha/Components/CanchaMapa.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CanchaMapaProps {
  cancha: any;
}

export default function CanchaMapa({ cancha }: CanchaMapaProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mapa de la cancha</Text>
      <Text style={styles.subtext}>Ubicación: {cancha.areaDeportiva?.zona?.nombre || 'No disponible'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 12,
    color: '#6B7280',
  },
});