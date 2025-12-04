// app/(client)/reservas/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import {
  getReservasPorClienteYEstado,
  getReservasClienteOrdenDesc,
  getReservasClienteOrdenAsc,
  getReservasPorClienteYNombreCancha,
  getReservasPorClienteEnRango,
  getReservasPorCliente,
  cancelarReserva,
} from '../../../services/ReservaApi';
import DateTimePicker from '@react-native-community/datetimepicker';



export default function ReservasScreen() {
  const router = useRouter();
  const { userData, isLoading: authLoading } = useAuth();
  const idCliente = userData?.id;

  const [reservas, setReservas] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [ordenFecha, setOrdenFecha] = useState<'desc' | 'asc'>('desc');
  const [searchCancha, setSearchCancha] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Date picker visibility
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);

  // Modales
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState<string>('');
  const [reservaACancelar, setReservaACancelar] = useState<number | null>(null);

  // === Colores
  const COLORS = {
    pb6: '#FFFFFF',
    pb5: '#41BFB2',
    pb3: '#F28627',
    pb1: '#D61727',
    pb4: '#F2EFEB',
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
    black: '#000000',
  };

  // === Estados
  const ESTADO_TEXTO: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    CANCELADA: 'Cancelada',
  };

  const ESTADO_COLORES: Record<string, string> = {
    PENDIENTE: COLORS.pb3,
    CONFIRMADA: COLORS.pb5,
    CANCELADA: COLORS.pb1,
  };

  // === Cargar reservas
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const cargarReservas = async () => {
    if (!idCliente) return;

    try {
      setLoading(true);

      let data: any[] = [];
      const nombreCancha = searchCancha.trim();
      const tieneEstado = filtroEstado !== 'TODOS';
      const tieneFecha = fechaInicio || fechaFin;

      if (nombreCancha) {
        data = await getReservasPorClienteYNombreCancha(idCliente, nombreCancha);
        if (tieneEstado) {
          data = data.filter((r) => r.estadoReserva === filtroEstado);
        }
        if (tieneFecha) {
          const inicio = fechaInicio ? new Date(fechaInicio) : null;
          const fin = fechaFin ? new Date(fechaFin) : null;
          data = data.filter((r) => {
            const fr = new Date(r.fechaCreacion);
            if (inicio && fr < inicio) return false;
            if (fin && fr > fin) return false;
            return true;
          });
        }
      } else if (tieneFecha) {
        data = await getReservasPorClienteEnRango(idCliente, fechaInicio, fechaFin);
        if (tieneEstado) {
          data = data.filter((r) => r.estadoReserva === filtroEstado);
        }
      } else if (tieneEstado) {
        data = await getReservasPorClienteYEstado(idCliente, filtroEstado);
      } else {
        data = ordenFecha === 'desc'
          ? await getReservasClienteOrdenDesc(idCliente)
          : await getReservasClienteOrdenAsc(idCliente);
      }

      setReservas(data);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar tus reservas');
      setReservas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // === Efecto de carga
  useEffect(() => {
    if (idCliente) {
      cargarReservas();
    }
  }, [idCliente, filtroEstado, fechaInicio, fechaFin, ordenFecha, searchCancha]);

  // === Refrescar
  const onRefresh = () => {
    setRefreshing(true);
    cargarReservas();
  };

  // === Cancelar reserva
  const abrirCancelacion = (idReserva: number) => {
    setReservaACancelar(idReserva);
    setOpenCancelModal(true);
  };

  const confirmarCancelacion = async () => {
    if (!motivoCancelacion.trim()) {
      Alert.alert('Advertencia', 'Debes ingresar un motivo para cancelar.');
      return;
    }

    if (!reservaACancelar) return;

    try {
      await cancelarReserva(reservaACancelar, motivoCancelacion);
      setOpenCancelModal(false);
      setMotivoCancelacion('');
      setReservaACancelar(null);
      cargarReservas(); // Recargar
    } catch (error) {
      console.error('Error al cancelar:', error);
      Alert.alert('Error', 'No se pudo cancelar la reserva.');
    }
  };

  // === Acciones por estado
  const getAccionesPorEstado = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return ['Ver Pagos', 'Detalle', 'Cancelar'];
      case 'CONFIRMADA':
        return ['QR', , 'Detalle', 'Ver Pagos'];
      case 'CANCELADA':
        return ['Detalle'];
      default:
        return ['Detalle'];
    }
  };

  // === Navegar a acción
  const handleAccion = (accion: string, reserva: any) => {
    switch (accion) {
      case 'Ver Pagos':
        router.push(`/client/reservas/${reserva.idReserva}/pagos`);
        break;
      case 'QR':
        router.push(`/client/reservas/${reserva.idReserva}/qr`);
        break;
      case 'Invitados':
        router.push(`/client/reservas/${reserva.idReserva}/invitados`);
        break;
      case 'Detalle':
        router.push(`/client/reservas/${reserva.idReserva}/detalle`);
        break;
      case 'Cancelar':
        abrirCancelacion(reserva.idReserva);
        break;
    }
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Debes iniciar sesión para ver tus reservas.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>MIS RESERVAS</Text>
        <Text style={[styles.subtitle, { color: COLORS.grayMedium }]}>Tus reservas pasadas, actuales y futuras</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        {/* Buscar por cancha */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: COLORS.pb5 }]}>Buscar cancha</Text>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Nombre de la cancha"
              value={searchCancha}
              onChangeText={setSearchCancha}
              style={styles.searchInput}
            />
            <TouchableOpacity onPress={cargarReservas} style={styles.searchButton}>
              <Ionicons name="search" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtro estado */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: COLORS.pb5 }]}>Estado</Text>
          <View style={styles.pickerContainer}>
            <View style={styles.picker}>
              {(['TODOS', 'PENDIENTE', 'CONFIRMADA', 'CANCELADA'] as const).map((estado) => (
                <TouchableOpacity
                  key={estado}
                  onPress={() => setFiltroEstado(estado)}
                  style={[
                    styles.pickerOption,
                    filtroEstado === estado && { backgroundColor: COLORS.pb5 },
                  ]}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      { color: filtroEstado === estado ? COLORS.white : COLORS.grayMedium },
                    ]}
                  >
                    {ESTADO_TEXTO[estado] || estado}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fechas */}
        <View style={styles.dateRow}>
          <View style={styles.dateInputContainer}>
            <Text style={[styles.filterLabel, { color: COLORS.pb5 }]}>Desde</Text>
            <TouchableOpacity
              onPress={() => setShowStartPicker(true)}
              style={[styles.dateInput, { justifyContent: 'center' }]}
            >
              <Text style={{ color: fechaInicio ? COLORS.grayDark : COLORS.grayMedium }}>
                {fechaInicio || 'AAAA-MM-DD'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={[styles.filterLabel, { color: COLORS.pb5 }]}>Hasta</Text>
            <TouchableOpacity
              onPress={() => setShowEndPicker(true)}
              style={[styles.dateInput, { justifyContent: 'center' }]}
            >
              <Text style={{ color: fechaFin ? COLORS.grayDark : COLORS.grayMedium }}>
                {fechaFin || 'AAAA-MM-DD'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orden */}
        <TouchableOpacity onPress={() => setOrdenFecha(ordenFecha === 'desc' ? 'asc' : 'desc')}>
          <Text style={[styles.orderText, { color: COLORS.pb5 }]}>
            {ordenFecha === 'desc' ? '↓ Más recientes' : '↑ Más antiguas'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading dentro del header para que se muestre mientras lista carga */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>Cargando reservas...</Text>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={48} color={COLORS.grayMedium} />
      <Text style={[styles.emptyText, { color: COLORS.grayMedium }]}>No tienes reservas {filtroEstado !== 'TODOS' ? 'con este estado' : ''}</Text>
    </View>
  );

 return (
  <View style={styles.container}>
    <FlatList
      data={reservas}
      keyExtractor={(item) => item.idReserva.toString()}
      renderItem={({ item }) => (
        <View
          style={[
            styles.reservaCard,
            { borderLeftColor: ESTADO_COLORES[item.estadoReserva] || COLORS.grayMedium },
          ]}
        >
          <View style={styles.reservaHeader}>
            <Text style={[styles.reservaTitle, { color: COLORS.grayDark }]}>
              {item.cancha?.nombre || 'Cancha'}
            </Text>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: ESTADO_COLORES[item.estadoReserva] },
              ]}
            >
              <Text style={styles.estadoText}>
                {ESTADO_TEXTO[item.estadoReserva]}
              </Text>
            </View>
          </View>

          <View style={styles.reservaInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.pb5} />
              <Text style={[styles.infoText, { color: COLORS.grayMedium }]}>
                {item.cancha?.areaDeportiva?.nombreArea || 'Área deportiva'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.pb5} />
              <Text style={[styles.infoText, { color: COLORS.grayMedium }]}>
                {item.fechaReserva}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={COLORS.pb5} />
              <Text style={[styles.infoText, { color: COLORS.grayMedium }]}>
                {item.horaInicio} - {item.horaFin}
              </Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            {getAccionesPorEstado(item.estadoReserva).map((accion) => (
              <TouchableOpacity
                key={accion}
                onPress={() => handleAccion(accion, item)}
                style={[
                  styles.actionButton,
                  accion === 'Cancelar' && { backgroundColor: COLORS.pb1 },
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: accion === 'Cancelar' ? COLORS.white : COLORS.grayDark },
                  ]}
                >
                  {accion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={!loading ? renderEmpty : null}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />

    {showStartPicker && (
      <DateTimePicker
        value={fechaInicio ? new Date(fechaInicio) : new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event: any, selectedDate?: Date) => {
          setShowStartPicker(Platform.OS === 'ios');
          if (selectedDate) setFechaInicio(formatDate(selectedDate));
        }}
      />
    )}

    {showEndPicker && (
      <DateTimePicker
        value={fechaFin ? new Date(fechaFin) : new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event: any, selectedDate?: Date) => {
          setShowEndPicker(Platform.OS === 'ios');
          if (selectedDate) setFechaFin(formatDate(selectedDate));
        }}
      />
    )}

    <Modal visible={openCancelModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: COLORS.pb6 }]}>
          <Text style={[styles.modalTitle, { color: COLORS.grayDark }]}>
            Cancelar Reserva
          </Text>

          <TextInput
            placeholder="Motivo de cancelación"
            value={motivoCancelacion}
            onChangeText={setMotivoCancelacion}
            multiline
            numberOfLines={4}
            style={styles.textarea}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setOpenCancelModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmarCancelacion}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 4,
  },
  filters: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  searchButton: {
    width: 44,
    backgroundColor: '#41BFB2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    margin: 4,
    backgroundColor: '#F3F4F6',
  },
  pickerText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  orderText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'right',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  reservaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reservaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reservaTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  reservaInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 16,
    textAlign: 'center',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter',
    textAlignVertical: 'top',
    height: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#D61727',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
});