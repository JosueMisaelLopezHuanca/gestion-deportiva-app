// src/components/CanchaCard.tsx
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

const CanchaCard: React.FC<{ cancha: Cancha }> = ({ cancha }) => {
  const router = useRouter();

  // === Colores personalizados (según tu paleta)
  const COLORS = {
    pb6: '#FFFFFF',      // blanco
    pb5: '#41BFB2',      // teal principal
    pb3: '#F28627',      // naranja secundario
    pb1: '#D61727',      // rojo alerta
    pb4: '#F2EFEB',      // beige suave
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
    black: '#000000',
  };

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

      {/* Overlay sutil para mejorar legibilidad */}
      <View style={styles.overlay} />

      {/* Botón "Ver detalle" en esquina superior derecha */}
      <TouchableOpacity style={styles.detailButton}>
        <Ionicons name="eye" size={16} color={COLORS.white} />
      </TouchableOpacity>

      {/* Contenido */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: COLORS.white }]}>
          {cancha.nombre}
        </Text>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color={COLORS.white} />
            <Text style={[styles.infoText, { color: COLORS.white }]}>
              ₡{cancha.costoHora.toFixed(2)} /h
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={14} color={COLORS.white} />
            <Text style={[styles.infoText, { color: COLORS.white }]}>
              {cancha.capacidad} pers.
            </Text>
          </View>
        </View>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.grayLight} />
          <Text style={[styles.timeText, { color: COLORS.grayLight }]}>
            {cancha.horaInicio} - {cancha.horaFin}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 4, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  detailButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
});

export default CanchaCard;