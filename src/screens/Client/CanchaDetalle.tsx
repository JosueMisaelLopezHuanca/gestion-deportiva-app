// app/(client)/cancha/[id].tsx
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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getCancha } from '../../services/CanchaApi';
import { API_URL } from '../../config';
import { Ionicons } from '@expo/vector-icons';
import CanchaMapa from './Components/CanchaMapa'; // lo crearemos después
import DisciplinaCli from './Components/DisciplinaCli'; // lo crearemos después
import ComentariosCancha from './Components/ComentariosCancha'; // lo crearemos después

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Cancha {
  idCancha: number;
  nombre: string;
  costoHora: number;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  areaDeportiva?: {
    nombreArea: string;
    telefonoArea?: string;
    emailArea?: string;
    horaInicioArea?: string;
    horaFinArea?: string;
    zona?: {
      nombre: string;
      macrodistrito?: { nombre: string };
    };
  };
  imagenes?: { urlAcceso: string }[];
}

export default function CanchaDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const canchaId = typeof id === 'string' ? parseInt(id, 10) : null;

  const [cancha, setCancha] = useState<Cancha | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disciplina, setDisciplina] = useState<any>(null); // ajusta según tu interfaz
  const [activeTab, setActiveTab] = useState<'descripcion' | 'disciplina' | 'opiniones'>('descripcion');
  const [isEquipamientoOpen, setIsEquipamientoOpen] = useState(false);

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
    if (!urlAcceso) return '';
    if (urlAcceso.startsWith('http')) return urlAcceso;
    const BASE_HOST = (API_URL || '').replace(/\/api\/?$/, '');
    return `${BASE_HOST}${urlAcceso.startsWith('/') ? urlAcceso : `/${urlAcceso}`}`;
  };

  const getCurrentImageUrl = (): string | any => {
    if (cancha?.imagenes?.[currentImageIndex]?.urlAcceso) {
      return getFullImageUrl(cancha.imagenes[currentImageIndex].urlAcceso);
    }
    return '';
  };

  const hasMultipleImages = cancha?.imagenes && cancha.imagenes.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === cancha!.imagenes!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? cancha!.imagenes!.length - 1 : prev - 1
      );
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // === Cargar datos
  useEffect(() => {
    if (!canchaId || isNaN(canchaId)) {
      setError('ID de cancha inválido');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getCancha(canchaId);
        setCancha(data);
      } catch (err: any) {
        console.error('Error al cargar cancha:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canchaId]);

  const handleVolver = () => {
    router.back();
  };

  const handleReservar = () => {
    if (!disciplina) {
      Alert.alert('¡Atención!', 'Por favor, selecciona una disciplina antes de reservar.');
      return;
    }
    setError('');
    const url = `/client/reservas/${canchaId}?disciplinaId=${disciplina.idDisciplina}`;
    router.push(url);
  };

  // === Estado abierto/cerrado
  const estaAbierta = () => {
    if (!cancha?.areaDeportiva?.horaInicioArea || !cancha.areaDeportiva.horaFinArea) {
      return false;
    }
    const ahora = new Date();
    const minutosActual = ahora.getHours() * 60 + ahora.getMinutes();

    const [h1, m1] = cancha.areaDeportiva.horaInicioArea.split(':').map(Number);
    const [h2, m2] = cancha.areaDeportiva.horaFinArea.split(':').map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    return minutosActual >= inicio && minutosActual <= fin;
  };

  const scrollToSection = (sectionId: string) => {
    // En React Native no hay scrollIntoView, pero puedes usar un ref o simplemente navegar por tabs
    // Para simplificar, usamos tabs
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.pb5} />
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando detalles de la cancha...
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

  if (!cancha) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={COLORS.grayMedium} />
        <Text style={[styles.emptyTitle, { color: COLORS.grayDark }]}>
          Cancha no encontrada
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
      {/* === HEADER CON IMAGEN Y BOTÓN VOLVER === */}
      <View style={styles.headerContainer}>

        {/* Hero Image */}
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
                    {currentImageIndex + 1} / {cancha.imagenes!.length}
                  </Text>
                </View>
              )}

              {/* Indicadores de puntos */}
              {hasMultipleImages && (
                <View style={styles.paginationContainer}>
                  {cancha.imagenes!.map((_, idx) => (
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

              {/* Título */}
              <View style={styles.heroInfo}>
                <Text style={[styles.heroTitle, { color: COLORS.white }]}>
                  {cancha.nombre}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color={COLORS.grayMedium} />
              <Text style={[styles.placeholderText, { color: COLORS.grayDark }]}>
                Sin imagen disponible
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* === TABS === */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('descripcion')}
          style={[
            styles.tab,
            activeTab === 'descripcion' && styles.activeTab,
          ]}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'descripcion' && styles.activeTabText,
          ]}>
            Descripción
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('disciplina')}
          style={[
            styles.tab,
            activeTab === 'disciplina' && styles.activeTab,
          ]}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'disciplina' && styles.activeTabText,
          ]}>
            Disciplina
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('opiniones')}
          style={[
            styles.tab,
            activeTab === 'opiniones' && styles.activeTab,
          ]}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'opiniones' && styles.activeTabText,
          ]}>
            Opiniones
          </Text>
        </TouchableOpacity>
      </View>

      {/* === CONTENIDO SEGÚN TAB === */}
      {activeTab === 'descripcion' && (
        <View style={styles.section}>
          {/* Información básica */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={COLORS.grayMedium} />
              <Text style={[styles.infoText, { color: COLORS.grayMedium }]}>
                {cancha.horaInicio} - {cancha.horaFin}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.grayMedium} />
              <Text style={[styles.infoText, { color: COLORS.grayMedium }]}>
                {cancha.capacidad} pers.
              </Text>
            </View>
          </View>

          {/* Estado abierto/cerrado */}
          <View style={styles.estadoBadge}>
            <Text style={[
              styles.estadoText,
              { color: estaAbierta() ? COLORS.white : COLORS.white },
              { backgroundColor: estaAbierta() ? COLORS.pb5 : COLORS.pb1 },
            ]}>
              {estaAbierta() ? 'Abierto' : 'Cerrado'}
            </Text>
          </View>

          {/* Detalles del área */}
          {cancha.areaDeportiva && (
            <View style={styles.areaDetails}>
              <Text style={[styles.areaTitle, { color: COLORS.grayDark }]}>
                Área: {cancha.areaDeportiva.nombreArea}
              </Text>
              <Text style={[styles.areaSubtitle, { color: COLORS.grayMedium }]}>
                {cancha.areaDeportiva.zona?.macrodistrito?.nombre || 'Macrodistrito'} •{' '}
                {cancha.areaDeportiva.zona?.nombre || 'Zona'}
              </Text>
              {cancha.areaDeportiva.telefonoArea && (
                <Text style={[styles.areaContact, { color: COLORS.grayMedium }]}>
                  📞 {cancha.areaDeportiva.telefonoArea}
                </Text>
              )}
              {cancha.areaDeportiva.emailArea && (
                <Text style={[styles.areaContact, { color: COLORS.grayMedium }]}>
                  ✉️ {cancha.areaDeportiva.emailArea}
                </Text>
              )}
            </View>
          )}

          {/* Costo y capacidad */}
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: COLORS.pb4 }]}>
              <Text style={[styles.statLabel, { color: COLORS.grayDark }]}>
                Costo/Hora
              </Text>
              <Text style={[styles.statValue, { color: COLORS.pb3 }]}>
                ₡{cancha.costoHora.toFixed(2)} Bs
              </Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: COLORS.pb4 }]}>
              <Text style={[styles.statLabel, { color: COLORS.grayDark }]}>
                Capacidad
              </Text>
              <Text style={[styles.statValue, { color: COLORS.grayDark }]}>
                {cancha.capacidad} Pers.
              </Text>
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.mapSection}>
            <Text style={[styles.mapTitle, { color: COLORS.grayDark }]}>
              Ubicación
            </Text>
            <CanchaMapa cancha={cancha} />
          </View>
        </View>
      )}

      {activeTab === 'disciplina' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
            Selecciona la disciplina que deseas practicar
          </Text>
          <Text style={[styles.sectionSubtitle, { color: COLORS.grayMedium }]}>
            Para completar tu reserva debes elegir una disciplina disponible para esta cancha.
          </Text>

          <DisciplinaCli
            canchaId={cancha.idCancha}
            onSelectDisciplina={setDisciplina}
          />

          {disciplina && (
            <Text style={[styles.disciplinaSelected, { color: COLORS.pb5 }]}>
              ✓ Has seleccionado: {disciplina.nombre}
            </Text>
          )}

          {error && (
            <Text style={[styles.errorText, { color: COLORS.pb1 }]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleReservar}
            style={[styles.reservarButton, { backgroundColor: disciplina ? COLORS.pb1 : COLORS.pb3 }]}
          >
            <Text style={[styles.reservarButtonText, { color: COLORS.white }]}>
              Reservar ahora
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'opiniones' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
            Opiniones de usuarios
          </Text>
          <ComentariosCancha canchaId={cancha.idCancha} />
        </View>
      )}

      {/* === FOOTER === */}
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
  headerContainer: {
    position: 'relative',
    paddingTop: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 14,
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
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#41BFB2',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#6B7280',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#41BFB2',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  estadoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  areaDetails: {
    marginBottom: 24,
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  areaSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  areaContact: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  mapSection: {
    marginBottom: 24,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  disciplinaSelected: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  reservarButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});