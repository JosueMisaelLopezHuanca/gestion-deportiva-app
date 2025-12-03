// src/screens/SuperAdmin/SuperAdminDashboardScreen.js
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, FAB, Searchbar, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { macrodistritoService } from '../../services/macrodistritoService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function SuperAdminDashboardScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const [todosLosMacrodistritos, setTodosLosMacrodistritos] = useState([]);
  const [macrodistritosFiltrados, setMacrodistritosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMacrodistritos = useCallback(async () => {
    try {
      const data = await macrodistritoService.getAllMacrodistritos();
      setTodosLosMacrodistritos(data);
    } catch (error) {
      showErrorToast('No se pudieron cargar los macrodistritos.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { setLoading(true); fetchMacrodistritos(); }, [fetchMacrodistritos]));
  
  const onRefresh = () => { setIsRefreshing(true); fetchMacrodistritos(); };

  useEffect(() => {
    const filtrados = todosLosMacrodistritos.filter(macro =>
      macro.nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setMacrodistritosFiltrados(filtrados);
  }, [searchQuery, todosLosMacrodistritos]);

  const handleDelete = (item) => {
    
    // CASO 1: El macrodistrito está ACTIVO -> Ofrecemos DESACTIVAR (Baja Lógica)
    if (item.estado === true) {
      Alert.alert(
        'Confirmar Desactivación',
        `¿Estás seguro de que quieres desactivar "${item.nombre}"? Esto lo ocultará de la lista para los clientes.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Desactivar', style: 'destructive',
            onPress: async () => {
              try {
                await macrodistritoService.logicalDeleteMacrodistrito(item.idMacrodistrito);
                showSuccessToast('Macrodistrito desactivado.');
                fetchMacrodistritos(); // Recargamos la lista para ver el cambio de opacidad
              } catch (error) {
                showErrorToast('No se pudo desactivar el macrodistrito.');
              }
            },
          },
        ]
      );
    } 
    // CASO 2: El macrodistrito está INACTIVO -> Ofrecemos ELIMINAR FÍSICAMENTE
    else {
      Alert.alert(
        'Confirmar Eliminación Permanente',
        `"${item.nombre}" ya está desactivado. ¿Quieres eliminarlo físicamente? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar Físicamente', style: 'destructive',
            onPress: async () => {
              try {
                await macrodistritoService.deleteMacrodistrito(item.idMacrodistrito);
                // Si tiene éxito, lo quitamos de la lista al instante.
                setTodosLosMacrodistritos(current => current.filter(m => m.idMacrodistrito !== item.idMacrodistrito));
                showSuccessToast('Macrodistrito eliminado permanentemente.');
              } catch (error) {
                // ▼▼▼ ¡AQUÍ MANEJAMOS EL ERROR DE DEPENDENCIAS! ▼▼▼
                // Asumimos que el backend devuelve un error 409 (Conflict) si hay dependencias.
                if (error.response && error.response.status === 409) {
                  showErrorToast('Error: Primero debe eliminar todas las zonas de este macrodistrito.');
                } else {
                  showErrorToast('No se pudo eliminar el macrodistrito.');
                }
              }
            },
          },
        ]
      );
    }
  };

  if (loading) { return <ActivityIndicator size="large" style={styles.loader} />; }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Gestión de Macrodistritos</Title>
      <Searchbar placeholder="Buscar macrodistrito..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchbar}/>
      <FlatList
        data={macrodistritosFiltrados}
        keyExtractor={(item) => item.idMacrodistrito.toString()}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          // ▼▼▼ ¡AQUÍ APLICAMOS LA OPACIDAD Y LA NAVEGACIÓN! ▼▼▼
          <Card
            style={[styles.card, !item.estado && styles.desactivadoCard]}
            // ▼▼▼ ¡AQUÍ ESTÁ LA LÍNEA QUE FALTABA! ▼▼▼
            // Esta es la acción para navegar a la lista de zonas.
            onPress={() =>
              router.push({
                pathname: '/superadmin/zonas',
                params: { macrodistritoId: item.idMacrodistrito, nombreMacrodistrito: item.nombre },
              })
            }
          >
            <Card.Title
              title={item.nombre}
              titleStyle={!item.estado && { color: '#888' }} // Opcional: texto también gris
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Button
                    icon="pencil"
                    onPress={() =>
                      router.push({
                        pathname: '/superadmin/editar-macrodistrito',
                        params: { macrodistrito: JSON.stringify(item) },
                      })
                    }
                  >
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
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No hay macrodistritos para mostrar.</Text>}
      />
      <Button mode="contained" onPress={logout} style={styles.logoutButton}>
        <Text style={{color: 'white'}}>Cerrar Sesión</Text>
      </Button>
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/superadmin/crear-macrodistrito')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  logoutButton: { marginTop: 20 },
  title: { textAlign: 'center', marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  searchbar: { marginBottom: 10 },
  // ▼▼▼ ¡AQUÍ ESTÁ EL NUEVO ESTILO! ▼▼▼
  desactivadoCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5' // Un fondo ligeramente diferente
  }
});
