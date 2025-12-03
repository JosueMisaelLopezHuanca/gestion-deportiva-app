// src/screens/ControlUser/CanchasAsignadas.js
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { canchaService } from '../../services/canchaService';
import { supervisaService } from '../../services/supervisaService';
import CardCancha from './CardCancha';

export default function CanchasAsignadas() {
  const { userData } = useAuth();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCanchasAsignadas();
  }, []);

  const cargarCanchasAsignadas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener el ID del usuario de control desde userData
      const idUsuarioControl = userData?.idPersona || 1; // Default a 1 para pruebas
      
      console.log('🔍 Cargando canchas para usuario:', idUsuarioControl);
      
      const data = await supervisaService.getCanchasSupervisadasPorUsuario(idUsuarioControl);
      console.log('✅ Canchas recibidas:', data);

      // Enriquecer cada cancha con sus imágenes (si el endpoint base no las trae)
      const enriched = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (c) => {
          try {
            const detalle = await canchaService.getCanchaById(c.idCancha);
            return {
              ...c,
              imagenes: detalle?.imagenes || [],
              imagen: detalle?.imagen || detalle?.urlImagen || null,
            };
          } catch (e) {
            // Si falla el detalle, devolver la cancha tal cual
            return c;
          }
        })
      );

      setCanchas(enriched);
    } catch (err) {
      console.error('❌ Error al cargar canchas:', err);
      setError('No se pudieron cargar las canchas asignadas');
    } finally {
      setLoading(false);
    }
  };

  const handleEscanearQR = (cancha) => {
    alert(`Escaneando QR para cancha ${cancha.idCancha}`);
    // Aquí irá la lógica del escaneo QR
  };

  const renderCancha = ({ item }) => (
    <CardCancha cancha={item} onEscanearQR={handleEscanearQR} />
  );

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={cargarCanchasAsignadas} mode="contained">
            Reintentar
          </Button>
        </View>
      )}

      {!error && canchas.length === 0 && !loading && (
        <View style={styles.centerContainer}>
          <Text variant="titleMedium">No tienes canchas asignadas</Text>
        </View>
      )}

      {!error && canchas.length > 0 && (
        <FlatList
          data={canchas}
          renderItem={renderCancha}
          keyExtractor={(item) => item.idCancha.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={cargarCanchasAsignadas}
        />
      )}

      {loading && canchas.length === 0 && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10 }}>Cargando canchas asignadas...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});