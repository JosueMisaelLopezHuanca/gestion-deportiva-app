// app/(client)/cancha/Components/ComentariosCancha.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComentariosCanchaProps {
  canchaId: number;
}

export default function ComentariosCancha({ canchaId }: ComentariosCanchaProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💬 Opiniones de usuarios</Text>
      <Text style={styles.subtext}>Aún no hay comentarios para esta cancha.</Text>
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