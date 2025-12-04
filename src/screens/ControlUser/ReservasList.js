// src/screens/ControlUser/ReservasList.js
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { qrService } from '../../services/qrService';
import { reservaService } from '../../services/reservaService';
import { supervisaService } from '../../services/supervisaService';
import ReservasCards from './ReservasCards';

export default function ReservasList() {
  const { userData } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [filteredReservas, setFilteredReservas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarTodasLasReservas();
  }, []);

  const cargarTodasLasReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const idUsuarioControl = userData?.idPersona || 1;
      console.log('🔍 Cargando todas las reservas para usuario:', idUsuarioControl);

      // 1. Obtener canchas asignadas al usuario
      const canchas = await supervisaService.getCanchasSupervisadasPorUsuario(idUsuarioControl);
      console.log(' Canchas obtenidas:', canchas?.length || 0);

      if (!Array.isArray(canchas) || canchas.length === 0) {
        setReservas([]);
        setLoading(false);
        return;
      }

      // 2. Para cada cancha, obtener sus reservas
      const todasLasReservas = [];
      for (const cancha of canchas) {
        try {
          const reservasDeCancha = await reservaService.getReservasByCanchaK(cancha.idCancha);
          if (Array.isArray(reservasDeCancha)) {
            todasLasReservas.push(...reservasDeCancha);
          }
        } catch (err) {
          console.warn(`⚠️ Error al cargar reservas de cancha ${cancha.idCancha}:`, err.message);
          // Continuar con otras canchas
        }
      }

      console.log('📊 Total de reservas cargadas:', todasLasReservas.length);

      // 3. Enriquecer cada reserva con vecesEscaneado desde QRs
      const reservasEnriquecidas = await Promise.all(
        todasLasReservas.map(async (reserva) => {
          try {
            const qrs = await qrService.getQrsPorReserva(reserva.idReserva);
            const vecesEscaneado = qrs ? qrs.length : 0;
            return { ...reserva, vecesEscaneado };
          } catch (e) {
            console.warn(`⚠️ Error al obtener QRs de reserva ${reserva.idReserva}:`, e.message);
            return { ...reserva, vecesEscaneado: 0 };
          }
        })
      );

      setReservas(reservasEnriquecidas);
      setFilteredReservas(reservasEnriquecidas);
    } catch (err) {
      console.error('❌ Error al cargar todas las reservas:', err);
      setError('No se pudieron cargar las reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredReservas(reservas);
      return;
    }
    const q = query.toLowerCase();
    const filtered = reservas.filter((r) => {
      const nombre = `${r.cliente?.nombre || ''} ${r.cliente?.apellidoPaterno || ''} ${r.cliente?.apellidoMaterno || ''}`.toLowerCase();
      const fecha = (r.fechaReserva || '').toLowerCase();
      const horario = `${r.horaInicio || ''} ${r.horaFin || ''}`.toLowerCase();
      return nombre.includes(q) || fecha.includes(q) || horario.includes(q);
    });
    setFilteredReservas(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarTodasLasReservas();
  };

  const handleScanReserva = (reserva) => {
    // Navegar al validador QR
    router.push('/controluser/qr-validator');
  };

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={cargarTodasLasReservas} mode="contained">
            Reintentar
          </Button>
        </View>
      )}

      {!error && reservas.length === 0 && !loading && (
        <View style={styles.centerContainer}>
          <Text variant="titleMedium" style={styles.emptyText}>
            No hay reservas para tus canchas asignadas
          </Text>
        </View>
      )}

      {!error && reservas.length > 0 && (
        <>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por cliente, fecha o horario..."
              placeholderTextColor="#FFFFFF"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>
          <ReservasCards
            reservas={filteredReservas}
            onScanReserva={handleScanReserva}
            onRefresh={handleRefresh}
          />
        </>
      )}

      {loading && reservas.length === 0 && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#41BFB3" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#41BFB3',
  },
  searchInput: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#41BFB3',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
