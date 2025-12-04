// app/(client)/reservas/[id]/detalle.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReservaPorId } from '../../../services/ReservaApi';

export default function DetalleReserva() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const reservaId = typeof id === 'string' ? parseInt(id, 10) : null;

  const [reserva, setReserva] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // === Formatear hora
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  };

  // === Cargar reserva
  useEffect(() => {
    if (!reservaId || isNaN(reservaId)) {
      Alert.alert('Error', 'ID de reserva inválido');
      router.replace('/client/reservas');
      return;
    }

    const fetchReserva = async () => {
      try {
        const data = await getReservaPorId(reservaId);
        setReserva(data);
      } catch (error) {
        console.error('Error al cargar reserva:', error);
        Alert.alert('Error', 'No se pudo cargar la reserva');
        router.replace('/client/reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchReserva();
  }, [reservaId, router]);

  const handleVolver = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando detalles de la reserva...
        </Text>
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: COLORS.pb1 }]}>
          No se encontró la reserva.
        </Text>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: COLORS.pb5 }]}>Volver al historial</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.pb5} />
          <Text style={[styles.backButtonText, { color: COLORS.pb5 }]}>Volver</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Detalles de la Reserva</Text>
      </View>

      {/* Información principal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Reserva</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.pb5} />
          <Text style={[styles.infoText, { color: COLORS.grayDark }]}>
            <Text style={styles.infoLabel}>Fecha:</Text> {reserva.fechaReserva || '—'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.pb5} />
          <Text style={[styles.infoText, { color: COLORS.grayDark }]}>
            <Text style={styles.infoLabel}>Horario:</Text> {formatTime(reserva.horaInicio)} – {formatTime(reserva.horaFin)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.pb5} />
          <Text style={[styles.infoText, { color: COLORS.grayDark }]}>
            <Text style={styles.infoLabel}>Estado:</Text> {reserva.estadoReserva || '—'}
          </Text>
        </View>
        {reserva.observaciones ? (
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: COLORS.grayMedium, marginLeft: 24 }]}>
              <Text style={styles.infoLabel}>Notas:</Text> {reserva.observaciones}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Cancha */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Cancha</Text>
        <View style={[styles.detailCard, { backgroundColor: COLORS.pb4 }]}>
          <Text style={[styles.detailText, { color: COLORS.grayDark }]}>
            <Text style={styles.detailLabel}>Nombre:</Text> {reserva.cancha?.nombre || '—'}
          </Text>
          <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
            <Text style={styles.detailLabel}>Superficie:</Text> {reserva.cancha?.tipoSuperficie || '—'}
          </Text>
          <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
            <Text style={styles.detailLabel}>Tamaño:</Text> {reserva.cancha?.tamano || '—'}
          </Text>
          <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
            <Text style={styles.detailLabel}>Iluminación:</Text> {reserva.cancha?.iluminacion || '—'}
          </Text>
          <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
            <Text style={styles.detailLabel}>Cubierta:</Text> {reserva.cancha?.cubierta || '—'}
          </Text>
        </View>
      </View>

      {/* Disciplina */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Disciplina</Text>
        <View style={[styles.detailCard, { backgroundColor: COLORS.pb4 }]}>
          <Text style={[styles.detailText, { color: COLORS.grayDark }]}>
            <Text style={styles.detailLabel}>Nombre:</Text> {reserva.disciplina?.nombre || 'Sin disciplina'}
          </Text>
          {reserva.disciplina?.descripcion ? (
            <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
              <Text style={styles.detailLabel}>Descripción:</Text>{' '}
              {reserva.disciplina.descripcion.length > 100
                ? `${reserva.disciplina.descripcion.substring(0, 100)}...`
                : reserva.disciplina.descripcion}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Botón de cerrar (opcional) */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleVolver} style={[styles.button, { backgroundColor: COLORS.pb5 }]}>
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Volver al historial</Text>
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter',
    flex: 1,
  },
  infoLabel: {
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  detailCard: {
    borderRadius: 8,
    padding: 16,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  loadingText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  errorText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});