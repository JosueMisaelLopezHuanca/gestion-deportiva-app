import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Searchbar, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { areaDeportivaService } from '../../services/areaDeportivaService';
import { showErrorToast } from '../../utils/toast';

export default function ClientHomeScreen() {
  const { logout, userToken } = useAuth();
  const router = useRouter();

  const [todasLasAreas, setTodasLasAreas] = useState([]);
  const [areasFiltradas, setAreasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAreasDeportivas = useCallback(async () => {
    if (!userToken) {
      setLoading(false);
      setIsRefreshing(false);
      return; 
    }
    try {
      const data = await areaDeportivaService.getAllAreasDeportivas();
      const activas = data.filter(area => area.estado === true);
      setTodasLasAreas(activas);
      setAreasFiltradas(activas);
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        showErrorToast('No se pudieron cargar las áreas deportivas.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [userToken]);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchAreasDeportivas();
  }, [fetchAreasDeportivas]));

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAreasDeportivas();
  };

  React.useEffect(() => {
    const filtrados = todasLasAreas.filter(area =>
      area.nombreArea?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setAreasFiltradas(filtrados);
  }, [searchQuery, todasLasAreas]);

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Explorar Áreas Deportivas</Title>

      <Searchbar
        placeholder="Buscar área deportiva..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={areasFiltradas}
        keyExtractor={(item) => item.idAreadeportiva.toString()}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/client/area-detalle/${item.idAreadeportiva}`)}
          >
            <Card.Content>
              <Title>{item.nombreArea}</Title>
              <Text>{item.descripcionArea}</Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No se encontraron áreas deportivas.</Text>}
      />

      <Button 
        mode="outlined" 
        onPress={() => router.push('/client/mis-reservas')} 
        style={styles.logoutButton}
      >
        Ver Mis Reservas
      </Button>
      <Button mode="contained" onPress={logout} style={styles.logoutButton}>
        <Text style={{ color: 'white' }}>Cerrar Sesión</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { textAlign: 'center', marginBottom: 20 },
  searchbar: { marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15 },
  logoutButton: { marginTop: 10 },
});
