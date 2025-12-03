// src/screens/Client/Navigation/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AreaCard from "../Components/AreaCard";
import { getAreadeportivaActivos } from '../../../services/AreadeportivaApi';
import { useRouter } from "expo-router";

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

  
export default function HomeScreen({ navigation }: any) {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleAreaPress = (areaId: number) => {
    router.push(`/client/detalle-area/${areaId}`);
    // Esto SÍ funciona SIEMPRE y cuando:
    // - La carpeta se llame exactamente "detalle-area"
    // - El archivo sea [id].tsx
    // - No tengas ningún layout que esté bloqueando la navegación
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41bfb2" />
        <Text style={styles.loadingText}>Cargando áreas...</Text>
      </View>
    );
  }

  if (areas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay áreas deportivas disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido Elije Tus Areas Favoritas</Text>
      </View>

      {/* Carrusel de áreas */}
      <View style={styles.carouselContainer}>
        <FlatList
          data={areas}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.idAreadeportiva.toString()}
          renderItem={({ item }) => (
            <AreaCard area={item} onPress={() => handleAreaPress(item.idAreadeportiva)} />
          )}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </View>
  );
}

const COLORS = {
  pb6: "#FFFFFF",      // blanco
  pb5: "#41bfb2",      // teal
  pb3: "#f28627",      // naranja
  pb1: "#d61727",      // rojo
  pb4: "#f2efeb",      // beige
  darkBase: "#0f1213", // oscuro
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.pb6,
  },
  header: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  carouselContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pb6,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.pb6,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
});