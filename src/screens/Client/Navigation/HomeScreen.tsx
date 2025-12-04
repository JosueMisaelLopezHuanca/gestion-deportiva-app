// src/screens/Client/Navigation/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AreaCard from "../Components/AreaCard";
import { getAreadeportivaActivos } from '../../../services/AreadeportivaApi';
import { useRouter } from "expo-router";
import GridCanchas from "../Components/GridCanchas";
import { getCanchasActivas } from '../../../services/CanchaApi';

interface Area {
  idAreadeportiva: number;
  nombreArea: string;
  telefonoArea?: string;
  emailArea?: string;
  horaInicioArea?: string;
  horaFinArea?: string;
  urlImagen?: string;
  imagenes?: { urlAcceso: string }[];
}

interface Cancha {
  idCancha: number;
  nombre: string;
  idAreadeportiva: number;
  costoHora: number;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  imagenes?: { urlAcceso: string }[];
}

export default function HomeScreen() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCanchas, setLoadingCanchas] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const data = await getAreadeportivaActivos();
        setAreas(data);
      } catch (error) {
        console.error('Error al cargar áreas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    const loadCanchas = async () => {
      try {
        const data = await getCanchasActivas();
        setCanchas(data);
      } catch (error) {
        console.error('Error al cargar canchas:', error);
      } finally {
        setLoadingCanchas(false);
      }
    };
    loadCanchas();
  }, []);

  const handleAreaPress = (areaId: number) => {
    router.push(`/client/detalle-area/${areaId}`);
  };

  if (loading || loadingCanchas) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41BFB2" />
        <Text style={styles.loadingText}>Cargando contenido...</Text>
      </View>
    );
  }

  return (
    // ✅ Envuelve TODO en un ScrollView
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido. Elige tus áreas favoritas</Text>
      </View>

      {/* Carrusel de áreas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Áreas destacadas</Text>
        {/* ✅ FlatList horizontal con scrollEnabled={true} (solo horizontal) */}
        <FlatList
          data={areas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.idAreadeportiva.toString()}
          renderItem={({ item }) => (
            <AreaCard area={item} onPress={() => handleAreaPress(item.idAreadeportiva)} />
          )}
          contentContainerStyle={styles.areasList}
          // 👇 Permite scroll horizontal dentro del ScrollView vertical
          nestedScrollEnabled={true}
        />
      </View>

      {/* Grid de canchas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Canchas disponibles</Text>
        {/* ✅ FlatList vertical con scrollEnabled={false} */}
        <FlatList
          data={canchas}
          renderItem={({ item }) => <GridCanchas cancha={item} />}
          keyExtractor={(item) => item.idCancha.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // 👈 ¡IMPORTANTE!
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Inter',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Inter',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  areasList: {
    paddingHorizontal: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    color: '#666',
    fontFamily: 'Inter',
  },
});