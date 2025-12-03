// src/screens/SuperAdmin/ZonaListScreen.js
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
// ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
import { Button, Card, FAB, Searchbar, Text, Title } from 'react-native-paper';
import { zonaService } from '../../services/zonaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function ZonaListScreen() {
  const router = useRouter();
  const { macrodistritoId, nombreMacrodistrito } = useLocalSearchParams();

  // Estados para el filtro
  const [todasLasZonas, setTodasLasZonas] = useState([]);
  const [zonasFiltradas, setZonasFiltradas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);

  // Función para obtener y filtrar las zonas
  const fetchAndFilterZonas = useCallback(async () => {
    try {
      const todasLasZonasData = await zonaService.getAllZonas();
      const filtradasPorMacro = todasLasZonasData.filter(zona => zona.idMacrodistrito == macrodistritoId);
      
      setTodasLasZonas(filtradasPorMacro);
      setZonasFiltradas(filtradasPorMacro);
    } catch (error) {
      showErrorToast("Error al cargar las zonas.");
    } finally {
      setLoading(false);
    }
  }, [macrodistritoId]);

  // Obtiene los datos cuando la pantalla se enfoca
  useFocusEffect(useCallback(() => { setLoading(true); fetchAndFilterZonas(); }, [fetchAndFilterZonas]));

  // Lógica para filtrar la lista cuando se escribe en el buscador
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setZonasFiltradas(todasLasZonas);
    } else {
      const filtradas = todasLasZonas.filter(zona =>
        zona.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setZonasFiltradas(filtradas);
    }
  }, [searchQuery, todasLasZonas]);

  // Lógica para eliminar
  const handleDelete = (item) => {
    Alert.alert("Confirmar Eliminación", `¿Seguro que quieres eliminar la zona "${item.nombre}"?`,
      [ { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: async () => {
          try {
            await zonaService.deleteZona(item.idZona);
            setZonasFiltradas(current => current.filter(z => z.idZona !== item.idZona));
            showSuccessToast("Zona eliminada con éxito.");
          } catch (error) {
            showErrorToast("No se pudo eliminar la zona.");
          }
        }},
      ]
    );
  };

  if (loading) { return <ActivityIndicator size="large" style={styles.loader} />; }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Zonas de {nombreMacrodistrito}</Title>

      <Searchbar
        placeholder="Buscar zona..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={zonasFiltradas} // Usa la lista filtrada
        keyExtractor={(item) => item.idZona.toString()}
        renderItem={({ item }) => (
          <Card 
            style={[styles.card, !item.estado && styles.desactivadoCard]}
            onPress={() => router.push({
              pathname: '/superadmin/areas-deportivas', //  Nueva ruta
              params: { zonaId: item.idZona, nombreZona: item.nombre } //  Enviamos el ID de la zona
            })}
          >
            <Card.Title
              title={item.nombre}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button icon="pencil" onPress={() => router.push({ pathname: '/superadmin/editar-zona', params: { zona: JSON.stringify(item), macrodistritoId } })}>
                    <Text>Editar</Text>
                  </Button>
                  <Button icon="delete" onPress={() => handleDelete(item)}>
                    <Text>Eliminar</Text>
                  </Button>
                </View>
              )}
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay zonas para este macrodistrito.</Text>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push({ pathname: '/superadmin/crear-zona', params: { macrodistritoId } })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { textAlign: 'center', marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  searchbar: { marginBottom: 10 },
});