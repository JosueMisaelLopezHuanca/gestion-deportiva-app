// src/screens/ControlUser/CardCancha.js
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { API_URL } from '../../config';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

export default function CardCancha({ cancha, onEscanearQR }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { userToken } = useAuth();
  const router = useRouter();
  
  const imagenes = cancha.imagenes || [];
  const totalImages = imagenes.length;
  const hasMultipleImages = totalImages > 1;

  // Función para obtener URL completa de la imagen - ADAPTADA DE LA WEB
  const getUrlImagenCompleta = (urlAcceso) => {
    if (!urlAcceso) return null;
    if (urlAcceso.startsWith('http')) return urlAcceso;
    
    // Base host derivado de API_URL (ej. http://192.168.0.7:8032)
    const BASE_HOST = (API_URL || '').replace(/\/(api)\/?$/, '');
    return `${BASE_HOST}${urlAcceso.startsWith('/') ? urlAcceso : `/${urlAcceso}`}`;
  };

  // Obtener la imagen actual según índice
  const getImagenCancha = (index = currentImageIndex) => {
    if (imagenes && imagenes.length > 0 && index < imagenes.length) {
      const imagenActual = imagenes[index];
      // Buscar la URL en diferentes propiedades posibles
      const urlAcceso = imagenActual?.urlAcceso || imagenActual?.url || imagenActual?.imagen;
      return getUrlImagenCompleta(urlAcceso);
    }
    // Fallback a imagen simple si existe en la cancha directamente
    if (cancha.imagen) {
      return getUrlImagenCompleta(cancha.imagen);
    }
    return null;
  };

  // Obtener URL de la imagen actual
  const getCurrentImageUrl = () => {
    const imageUrl = getImagenCancha(currentImageIndex);
    return imageUrl || 'https://via.placeholder.com/400x240?text=Cancha';
  };

  useEffect(() => {
    setImageError(false);
  }, [currentImageIndex]);

  const nextImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (totalImages > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={
            imageError
              ? { uri: 'https://via.placeholder.com/400x240?text=Cancha' }
              : {
                  uri: getCurrentImageUrl(),
                  headers: userToken ? { Authorization: `Bearer ${userToken}` } : undefined,
                }
          }
          style={styles.image}
          contentFit="cover"
          onError={() => {
            console.log('Error cargando imagen:', getCurrentImageUrl());
            setImageError(true);
          }}
          onLoad={() => setImageError(false)}
        />
        <View style={styles.imageOverlay} />

        {hasMultipleImages && (
          <>
            <TouchableOpacity style={[styles.carouselButton, styles.prevButton]} onPress={prevImage}>
              <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.carouselButton, styles.nextButton]} onPress={nextImage}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.paginationContainer}>
              {imagenes.map((_, idx) => (
                <View key={idx} style={[styles.paginationDot, idx === currentImageIndex && styles.paginationDotActive]} />
              ))}
            </View>

            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>{currentImageIndex + 1}/{totalImages}</Text>
            </View>
          </>
        )}
      </View>

      <Card.Content style={styles.content}>
        <Text variant="titleLarge" style={styles.title}>
          {cancha.nombre || `Cancha ${cancha.idCancha}`}
        </Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="cash-outline" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.infoText}>{cancha.costoHora?.toFixed(2) || '0.00'} Bs/h</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={18} color="#41BFB3" />
            <Text style={styles.infoText}>{cancha.capacidad || 0} pers.</Text>
          </View>
        </View>

        <View style={styles.horarioContainer}>
          <View style={styles.horarioItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.horarioText}>{cancha.horaInicio || '00:00'} - {cancha.horaFin || '00:00'}</Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={() => router.push(`/controluser/reservas/${cancha.idCancha}`)}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Ver reservas
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden', elevation: 4, backgroundColor: '#FFFFFF' },
  imageContainer: { width: '100%', height: 180, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.15)' },
  carouselButton: { position: 'absolute', top: '50%', transform: [{ translateY: -14 }], width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  prevButton: { left: 8 },
  nextButton: { right: 8 },
  paginationContainer: { position: 'absolute', bottom: 8, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  paginationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.5)' },
  paginationDotActive: { backgroundColor: '#FFFFFF', width: 8, height: 8, borderRadius: 4 },
  imageCounter: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0, 0, 0, 0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  imageCounterText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  infoContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  iconCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#41BFB3', justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 14, color: '#666666', fontWeight: '500' },
  horarioContainer: { marginBottom: 16 },
  horarioItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  horarioText: { fontSize: 13, color: '#666666' },
  button: { backgroundColor: '#41BFB3', borderRadius: 8, elevation: 2 },
  buttonLabel: { fontSize: 15, fontWeight: '600', paddingVertical: 4 },
});