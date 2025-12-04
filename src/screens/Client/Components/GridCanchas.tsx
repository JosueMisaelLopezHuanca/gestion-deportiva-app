// src/components/GridCanchas.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../../config';
import { Ionicons } from '@expo/vector-icons';

interface Cancha {
  idCancha: number;
  nombre: string;
  costoHora: number;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  imagenes?: { urlAcceso: string }[];
}

const GridCanchas: React.FC<{ cancha: Cancha }> = ({ cancha }) => {
  const router = useRouter();

  // === Construir URL completa de imagen
  const getFullImageUrl = (urlAcceso: string): string => {
    if (!urlAcceso) return 'https://placehold.co/400x240?text=Cancha+Default';
    if (urlAcceso.startsWith('http')) return urlAcceso;
    const BASE_HOST = (API_URL || '').replace(/\/api\/?$/, '');
    return `${BASE_HOST}${urlAcceso.startsWith('/') ? urlAcceso : `/${urlAcceso}`}`;
  };

  const imageUrl = cancha.imagenes?.[0]?.urlAcceso
    ? getFullImageUrl(cancha.imagenes[0].urlAcceso)
    : 'https://placehold.co/400x240?text=Cancha+Default';

  const handlePress = () => {
    router.push(`/client/detalle-cancha/${cancha.idCancha}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      {/* Imagen */}
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

      {/* Información */}
      <View style={styles.body}>
        <Text style={styles.title}>{cancha.nombre}</Text>

        <View style={styles.row}>
          <Ionicons name="cash-outline" size={14} color="#41BFB2" />
          <Text style={styles.price}>₡{cancha.costoHora.toFixed(2)}/h</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="people-outline" size={14} color="#6B7280" />
          <Text style={styles.text}>{cancha.capacidad} personas</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.text}>
            {cancha.horaInicio} - {cancha.horaFin}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',        // ⭐ Para 2 columnas
    borderRadius: 12,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 110,
    backgroundColor: '#ddd',
  },
  body: {
    padding: 10,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  price: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#41BFB2',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  text: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});

export default GridCanchas;
