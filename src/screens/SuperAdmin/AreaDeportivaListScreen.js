// src/screens/SuperAdmin/AreaDeportivaListScreen.js
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Searchbar, Text, Title } from 'react-native-paper';
import { areaDeportivaService } from '../../services/areaDeportivaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function AreaDeportivaListScreen() {
  const router = useRouter();
  const { zonaId, nombreZona } = useLocalSearchParams();

  const [todasLasAreas, setTodasLasAreas] = useState([]);
  const [areasFiltradas, setAreasFiltradas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Función para obtener y filtrar las áreas
  const fetchAndFilterAreas = useCallback(async () => {
    try {
      const todasLasAreasData = await areaDeportivaService.getAllAreasDeportivas();
      // Filtramos en la app por la zonaId
      const filtradasPorZona = todasLasAreasData.filter(area => area.idZona == zonaId);
      
      setTodasLasAreas(filtradasPorZona);
      setAreasFiltradas(filtradasPorZona);
    } catch (error) {
      showErrorToast("Error al cargar las áreas deportivas.");
    } finally {
      setLoading(false);
    }
  }, [zonaId]);

  useFocusEffect(useCallback(() => { setLoading(true); fetchAndFilterAreas(); }, [fetchAndFilterAreas]));

  // Lógica de búsqueda
  useEffect(() => {
    const filtradas = todasLasAreas.filter(area =>
      area.nombreArea.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setAreasFiltradas(filtradas);
  }, [searchQuery, todasLasAreas]);

  // Lógica de eliminación (con baja lógica primero)
  const handleDelete = (item) => {
    const action = item.estado ? "Desactivar" : "Eliminar Físicamente";
    const message = item.estado 
      ? `¿Seguro que quieres desactivar "${item.nombreArea}"?`
      : `"${item.nombreArea}" ya está desactivado. ¿Quieres eliminarlo permanentemente?`;

    Alert.alert(`Confirmar ${action}`, message,
      [ { text: "Cancelar", style: "cancel" },
        { text: action, style: "destructive", onPress: async () => {
          try {
            if (item.estado) {
              await areaDeportivaService.logicalDeleteAreaDeportiva(item.idAreadeportiva);
              fetchAndFilterAreas(); // Recargamos para ver el cambio de opacidad
              showSuccessToast("Área desactivada.");
            } else {
              await areaDeportivaService.physicalDeleteAreaDeportiva(item.idAreadeportiva);
              setTodasLasAreas(current => current.filter(a => a.idAreadeportiva !== item.idAreadeportiva));
              showSuccessToast("Área eliminada permanentemente.");
            }
          } catch (error) {
            // Asumimos 409 (Conflict) si tiene canchas dependientes
            if (error.response && error.response.status === 409) {
              showErrorToast('Error: Primero debe eliminar todas las canchas de esta área.');
            } else {
              showErrorToast(`No se pudo ${action.toLowerCase()} el área.`);
            }
          }
        }},
      ]
    );
  };

  if (loading) { return <ActivityIndicator size="large" style={styles.loader} />; }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Áreas de {nombreZona}</Title>
      <Searchbar placeholder="Buscar área..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar}/>
      <FlatList
        data={areasFiltradas}
        keyExtractor={(item) => item.idAreadeportiva.toString()} // ❗ DTO usa 'idAreadeportiva'
        renderItem={({ item }) => (
          <Card style={[styles.card, !item.estado && styles.desactivadoCard]}>
            <Card.Title
              title={item.nombreArea} // ❗ DTO usa 'nombreArea'
              titleStyle={!item.estado && { color: '#888' }}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button icon="pencil" onPress={() => router.push({ pathname: '/superadmin/editar-area', params: { area: JSON.stringify(item), zonaId } })}>
                    <Text>Editar</Text>
                  </Button>
                  <Button icon="delete" onPress={() => handleDelete(item)}>
                    <Text>{item.estado ? 'Eliminar' : 'Borrar'}</Text>
                  </Button>
                </View>
              )}
            />
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay áreas deportivas para esta zona.</Text>}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push({ pathname: '/superadmin/crear-area', params: { zonaId } })}
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
  desactivadoCard: { opacity: 0.6, backgroundColor: '#f5f5f5' }
});