// src/screens/Client/DetalleAreadeportiva.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAreadeportivaById } from '../../services/AreadeportivaApi';
import { getCanchasActivasPorArea } from '../../services/CanchaApi';
import { API_URL } from '../../config';
import CanchaCard from './Components/CanchaCard';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Area {
  idAreadeportiva: number;
  nombreArea: string;
  telefonoArea?: string;
  emailArea?: string;
  horaInicioArea?: string;
  horaFinArea?: string;
  zona?: {
    nombre: string;
    macrodistrito?: { nombre: string };
  };
  urlImagen?: string;
  imagenes?: { urlAcceso: string }[];
}

interface Cancha {
  idCancha: number;
  nombre: string;
  costoHora: number;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  imagenes?: { urlAcceso: string }[];
}

export default function DetalleAreadeportiva() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const areaId = typeof id === 'string' ? parseInt(id, 10) : null;

  const [area, setArea] = useState<Area | null>(null);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Colores personalizados (según tu paleta)
  const COLORS = {
    pb6: '#FFFFFF',      // blanco
    pb5: '#41BFB2',      // teal principal
    pb3: '#F28627',      // naranja secundario
    pb1: '#D61727',      // rojo alerta
    pb4: '#F2EFEB',      // beige suave
    p8: '#8A2628',       // rojo oscuro
    p2: '#F35734',       // naranja intenso
    p11: '#2C7366',      // verde oscuro
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    black: '#000000',
    white: '#FFFFFF',
  };

  // === Construir URL completa de imagen
  const getFullImageUrl = (urlAcceso: string): string => {
    if (!urlAcceso) return ''; // No retornamos imagen por defecto
    if (urlAcceso.startsWith('http')) return urlAcceso;
    const BASE_HOST = (API_URL || '').replace(/\/api\/?$/, '');
    return `${BASE_HOST}${urlAcceso.startsWith('/') ? urlAcceso : `/${urlAcceso}`}`;
  };

  const getCurrentImageUrl = (): string | any => {
    if (area?.imagenes?.[currentImageIndex]?.urlAcceso) {
      return getFullImageUrl(area.imagenes[currentImageIndex].urlAcceso);
    }
    if (area?.urlImagen) {
      return getFullImageUrl(area.urlImagen);
    }
    return null; // No hay imagen
  };

  const hasMultipleImages = area?.imagenes && area.imagenes.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === area!.imagenes!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? area!.imagenes!.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // === Cargar datos
  useEffect(() => {
    if (!areaId || isNaN(areaId)) {
      setError('ID de área inválido');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [areaData, canchasData] = await Promise.all([
          getAreadeportivaById(areaId),
          getCanchasActivasPorArea(areaId),
        ]);
        setArea(areaData);
        setCanchas(Array.isArray(canchasData) ? canchasData : []);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [areaId]);

  const handleVolver = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.pb5} />
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando detalles del área...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={COLORS.pb1} />
        <Text style={[styles.errorTitle, { color: COLORS.pb1 }]}>
          ¡Oops!
        </Text>
        <Text style={[styles.errorText, { color: COLORS.grayDark }]}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={handleVolver}
          style={[styles.button, { backgroundColor: COLORS.pb1 }]}
        >
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            ← Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!area) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={COLORS.grayMedium} />
        <Text style={[styles.emptyTitle, { color: COLORS.grayDark }]}>
          Área no encontrada
        </Text>
        <Text style={[styles.emptyText, { color: COLORS.grayMedium }]}>
          No pudimos encontrar la información solicitada.
        </Text>
        <TouchableOpacity
          onPress={handleVolver}
          style={[styles.button, { backgroundColor: COLORS.pb5 }]}
        >
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            ← Volver a inicio
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* === HERO CON CARRUSEL === */}
      <View style={styles.heroContainer}>
        {getCurrentImageUrl() ? (
          <>
            <Image
              source={{ uri: getCurrentImageUrl() }}
              style={styles.heroImage}
              resizeMode="cover"
            />

            {/* Overlay oscuro */}
            <View style={styles.overlay} />

            {/* Flecha izquierda */}
            {hasMultipleImages && (
              <TouchableOpacity
                onPress={prevImage}
                style={[styles.carouselButton, styles.prevButton]}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {/* Flecha derecha */}
            {hasMultipleImages && (
              <TouchableOpacity
                onPress={nextImage}
                style={[styles.carouselButton, styles.nextButton]}
              >
                <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
              </TouchableOpacity>
            )}

            {/* Contador de imágenes */}
            {hasMultipleImages && (
              <View style={styles.imageCounter}>
                <Text style={[styles.imageCounterText, { color: COLORS.white }]}>
                  {currentImageIndex + 1} / {area.imagenes!.length}
                </Text>
              </View>
            )}

            {/* Indicadores de puntos */}
            {hasMultipleImages && (
              <View style={styles.paginationContainer}>
                {area.imagenes!.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.paginationDot,
                      idx === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          // Placeholder si no hay imágenes
          <View style={styles.placeholderContainer}>
            <Ionicons name="image-outline" size={64} color={COLORS.grayMedium} />
            <Text style={[styles.placeholderText, { color: COLORS.grayDark }]}>
              Sin imagen disponible
            </Text>
          </View>
        )}

        {/* Información del área */}
        <View style={styles.heroInfo}>
          <Text style={[styles.heroTitle, { color: COLORS.white }]}>
            {area.nombreArea}
          </Text>
          <Text style={[styles.heroSubtitle, { color: COLORS.white }]}>
            {area.zona?.macrodistrito?.nombre || 'Macrodistrito'} •{' '}
            {area.zona?.nombre || 'Zona'}
          </Text>

          {/* Info adicional */}
          <View style={styles.infoRow}>
            {area.telefonoArea && (
              <View style={styles.infoItem}>
                <Ionicons name="call" size={16} color={COLORS.white} />
                <Text style={[styles.infoText, { color: COLORS.white }]}>
                  {area.telefonoArea}
                </Text>
              </View>
            )}
            {area.emailArea && (
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={16} color={COLORS.white} />
                <Text style={[styles.infoText, { color: COLORS.white }]}>
                  {area.emailArea}
                </Text>
              </View>
            )}
            {area.horaInicioArea && area.horaFinArea && (
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={COLORS.white} />
                <Text style={[styles.infoText, { color: COLORS.white }]}>
                  {area.horaInicioArea} - {area.horaFinArea}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* === TÍTULO CANCHAS === */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
         Canchas Disponibles
        </Text>
      </View>

      {/* === LISTA DE CANCHAS === */}
      <View style={styles.canchasContainer}>
        {canchas.length === 0 ? (
          <View style={styles.emptyCanchas}>
            <Ionicons name="basketball" size={48} color={COLORS.grayMedium} />
            <Text style={[styles.emptyCanchasTitle, { color: COLORS.grayDark }]}>
              Sin canchas disponibles
            </Text>
            <Text style={[styles.emptyCanchasText, { color: COLORS.grayMedium }]}>
              Esta área no tiene canchas activas en este momento.
            </Text>
          </View>
        ) : (
          canchas.map((cancha) => (
            <CanchaCard key={cancha.idCancha} cancha={cancha} />
          ))
        )}
      </View>

      {/* === BOTÓN VOLVER === */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleVolver}
          style={[styles.button, { backgroundColor: COLORS.pb5 }]}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            Volver atrás
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    fontFamily: 'Inter',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    fontFamily: 'Inter',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  carouselButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -16 }],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 16,
  },
  nextButton: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Inter',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
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
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  canchasContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  emptyCanchas: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyCanchasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    fontFamily: 'Inter',
  },
  emptyCanchasText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Inter',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
    fontFamily: 'Inter',
  },
});