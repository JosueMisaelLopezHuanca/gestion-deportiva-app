// src/screens/Client/ListPagosPage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/hooks/useAuth';
import { getReservaPorId } from '@/src/services/ReservaApi';
import { getPagosByReserva } from '@/src/services/PagoApi';
import { calcularMonto } from '@/src/services/IncluyeApi';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ListPagosPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const reservaId = typeof id === 'string' ? parseInt(id, 10) : null;
   const { userData, isLoading: authLoading } = useAuth();

  const [reserva, setReserva] = useState<any>(null);
  const [pagos, setPagos] = useState<any[]>([]);
  const [montoTotalIncluye, setMontoTotalIncluye] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
  };

  // 2. REEMPLAZA TODO TU useEffect POR ESTO:
  useFocusEffect(
    useCallback(() => {
      // Esta función se ejecuta CADA VEZ que la pantalla gana foco
      // Es decir: cuando entras por primera vez, y cuando regresas de hacer un pago

      if (!userData || !reservaId) {
        Alert.alert('Error', 'Debes iniciar sesión');
        router.replace('/client');
        return;
      }

      const loadData = async () => {
        try {
          setLoading(true);

          const reservaData = await getReservaPorId(reservaId);

          if (reservaData.clienteId !== userData.id) {
            Alert.alert('Error', 'No tienes permiso');
            router.replace('/client');
            return;
          }

          setReserva(reservaData);

          const pagosData = await getPagosByReserva(reservaId);
          setPagos(pagosData || []);

          if (reservaData.cancha?.idCancha && reservaData.disciplina?.idDisciplina) {
            const monto = await calcularMonto(
              reservaData.cancha.idCancha,
              reservaData.disciplina.idDisciplina,
              reservaData.horaInicio,
              reservaData.horaFin
            );
            setMontoTotalIncluye(monto);
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'No se pudieron cargar los pagos');
        } finally {
          setLoading(false);
        }
      };

      loadData();

      // Opcional: cleanup (no necesario aquí, pero por buenas prácticas)
      return () => {};
    }, [reservaId, userData, router]) // ← dependencias correctas
  );

  // === Cálculos (solo si hay datos)
  const totalPagado = pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
  const totalIncluye = montoTotalIncluye || (reserva?.total || 0);
  const saldoPendiente = Math.max(0, totalIncluye - totalPagado);
  const pagadaCompleta = saldoPendiente <= 0;
  
  // ✅ Aquí validamos que user exista
  const puedeRealizarPago = !pagadaCompleta && reserva && userData;

  const handleRealizarPago = () => {
    if (!reserva || !userData) return;

    const tipoPagoCongelado = pagos.length > 0 ? pagos[0].tipoPago : null;
    const primeraVez = pagos.length === 0;

    router.replace({
      pathname: `/client/pagos/${reservaId}/realizar`,
      params: {
        reserva: JSON.stringify(reserva),
        montoTotalIncluye: totalIncluye.toString(),
        primeraVez: primeraVez.toString(),
        tipoPagoElegido: tipoPagoCongelado || '',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando pagos...
        </Text>
      </View>
    );
  }

  if (!reserva) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: COLORS.pb1 }]}>
          Reserva no encontrada o no autorizada.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Pagos Realizados</Text>
        <Text style={[styles.subtitle, { color: COLORS.grayMedium }]}>
          Reserva #{reserva.idReserva} • {reserva.cancha?.nombre} • {reserva.fechaReserva}
        </Text>
      </View>

      {/* Totales */}
      <View style={styles.totalesContainer}>
        {[
          { label: 'Total', value: totalIncluye.toFixed(2), color: COLORS.pb5 },
          { label: 'Pagado', value: totalPagado.toFixed(2), color: COLORS.pb1 },
          { 
            label: 'Saldo', 
            value: saldoPendiente.toFixed(2), 
            color: saldoPendiente > 0 ? COLORS.pb3 : COLORS.pb5 
          },
        ].map((item, index) => (
          <View key={index} style={[styles.totalCard, { backgroundColor: COLORS.pb6 }]}>
            <Text style={[styles.totalLabel, { color: COLORS.grayMedium }]}>{item.label}</Text>
            <Text style={[styles.totalValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* Lista de pagos */}
      <View style={styles.pagosContainer}>
        {pagos.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: COLORS.pb6 }]}>
            <Text style={[styles.emptyText, { color: COLORS.grayMedium }]}>
              No se registran pagos para esta reserva.
            </Text>
          </View>
        ) : (
          pagos.map((pago) => (
            <View key={pago.idPago} style={[styles.pagoCard, { backgroundColor: COLORS.pb6 }]}>
              <View style={styles.pagoHeader}>
                <View>
                  <Text style={[styles.pagoNombre, { color: COLORS.grayDark }]}>
                    {pago.cliente?.nombre} {pago.cliente?.apellidoPaterno}
                  </Text>
                  <Text style={[styles.pagoDetalle, { color: COLORS.grayMedium }]}>
                    {pago.tipoPago} • {pago.metodoPago} • {pago.fecha}
                  </Text>
                </View>
                <Text style={[styles.pagoMonto, { color: COLORS.pb3 }]}>
                  {pago.monto?.toFixed(2)}
                </Text>
              </View>
              {pago.descripcion && (
                <Text style={[styles.pagoDescripcion, { color: COLORS.grayMedium }]}>
                  {pago.descripcion}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: COLORS.pb1 }]}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Salir</Text>
        </TouchableOpacity>

        {puedeRealizarPago ? (
          <TouchableOpacity
            onPress={handleRealizarPago}
            style={[styles.button, { backgroundColor: COLORS.pb5 }]}
          >
            <Text style={[styles.buttonText, { color: COLORS.white }]}>Realizar pago</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.button, { backgroundColor: COLORS.grayLight }]}>
            <Text style={[styles.buttonText, { color: COLORS.grayMedium }]}>Realizar pago</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  header: {
    padding: 24,
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
    marginTop: 4,
  },
  totalesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  totalCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  pagosContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
  },
  pagoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pagoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pagoNombre: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  pagoDetalle: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  pagoMonto: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  pagoDescripcion: {
    fontSize: 14,
    fontFamily: 'Inter',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});