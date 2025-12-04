// app/(client)/reserva-confirmacion/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { getDisciplinaById } from '../../services/DisciplinaApi';
import { getCancha } from '../../services/CanchaApi';
import { createReserva } from '../../services/ReservaApi';
import { crearAsociacion, calcularMonto } from '../../services/IncluyeApi';

export default function ReservaConfirmacion() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('TODOS LOS PARÁMETROS QUE LLEGAN:', params);

  // Extraer y parsear clienteData de forma estable (useMemo evita nueva referencia en cada render)
  const clienteData = useMemo(() => {
    try {
      return params.clienteData ? JSON.parse(params.clienteData as string) : null;
    } catch (e) {
      console.error('Error parseando clienteData:', e);
      return null;
    }
  }, [params.clienteData]);

  console.log('clienteData parseado:', clienteData);

  const {
    fecha,
    horaInicio,
    horaFin,
    canchaId,
    disciplinaId,
  } = params;

  const [cancha, setCancha] = useState<any>(null);
  const [disciplina, setDisciplina] = useState<any>(null);
  const [monto, setMonto] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  // Limpiar las horas: quedarnos solo con la primera parte (hora de inicio/fin real)
const cleanHoraInicio = (horaInicio as string).split(' - ')[0]; // "09:00"
const cleanHoraFin = (horaFin as string).split(' - ')[1] || (horaFin as string).split(' - ')[0];
  console.log('Horas originales:', { horaInicio, horaFin });
  console.log('Horas limpias para el backend:', { cleanHoraInicio, cleanHoraFin });
  
  const COLORS = {
    pb6: '#FFFFFF',
    pb5: '#41BFB2',
    pb3: '#F28627',
    pb1: '#D61727',
    pb4: '#F2EFEB',
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
  };

  useEffect(() => {
    if (!clienteData || !canchaId || !disciplinaId || !fecha || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Faltan datos para continuar', [
        { text: 'OK', onPress: () => router.replace('/client') },
      ]);
      return;
    }

    const loadData = async () => {
      try {
        const [canchaData, disciplinaData] = await Promise.all([
          getCancha(canchaId as string),
          getDisciplinaById(disciplinaId as string),
        ]);

        const montoCalculado = await calcularMonto(
          canchaId as string,
          disciplinaId as string,
          cleanHoraInicio,   // ← ahora sí es "09:00"
          cleanHoraFin       // ← ahora sí es "09:30"
        );

        setCancha(canchaData);
        setDisciplina(disciplinaData);
        setMonto(montoCalculado);
      } catch (err) {
        console.error('Error cargando datos:', err);
        Alert.alert('Error', 'No se pudieron cargar los detalles');
      }
    };

    loadData();
  // Observa sólo las dependencias escalares/strings para evitar re-ejecuciones por referencia de objetos
  }, [canchaId, disciplinaId, fecha, horaInicio, horaFin, params.clienteData, router]);

  const handleConfirmar = async () => {
    if (!clienteData || !cancha || !disciplina || monto === null) return;

    setLoading(true);

    try {
      const payloadReserva = {
        fechaReserva: fecha,
        horaInicio: cleanHoraInicio,
        horaFin: cleanHoraFin,
        estadoReserva: 'PENDIENTE',
        observaciones: observaciones.trim() || 'Reserva desde app',
        clienteId: clienteData.id,
      };

      const nuevaReserva = await createReserva(payloadReserva);

      await crearAsociacion({
        idCancha: Number(canchaId),
        idDisciplina: Number(disciplinaId),
        idReserva: nuevaReserva.idReserva,
      });

      Alert.alert('¡Reserva confirmada!', 'Tu cancha ha sido reservada', [
        { text: 'Ver mis reservas', onPress: () => router.replace('/client/mis-reservas') },
        { text: 'Inicio', onPress: () => router.replace('/client') },
      ]);
    } catch (err: any) {
      console.error('Error al crear reserva:', err);
      Alert.alert('Error', err.message || 'No se pudo completar la reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!clienteData || !cancha || !disciplina || monto === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando reserva...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Confirmar Reserva</Text>
        <Text style={[styles.subtitle, { color: COLORS.grayMedium }]}>
          Revisa y confirma tu reserva
        </Text>
      </View>

      {/* Cliente */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Cliente</Text>
        <Text style={[styles.detailText, { color: COLORS.grayDark }]}>
          {clienteData.nombre} {clienteData.apellidoPaterno} {clienteData.apellidoMaterno}
        </Text>
        <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>{clienteData.email}</Text>
        {clienteData.telefono && (
          <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>{clienteData.telefono}</Text>
        )}
      </View>

      {/* Cancha */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Cancha</Text>
        <Text style={[styles.detailText, { color: COLORS.grayDark }]}>{cancha.nombre}</Text>
        <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
          {cancha.areaDeportiva?.nombreArea || 'Área deportiva'}
        </Text>
        <Text style={[styles.detailText, { color: COLORS.grayMedium }]}>
          {fecha} • {horaInicio} - {horaFin}
        </Text>
      </View>

      {/* Disciplina */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Disciplina</Text>
        <Text style={[styles.detailText, { color: COLORS.grayDark }]}>{disciplina.nombre}</Text>
      </View>

      {/* Observaciones */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.pb5 }]}>Observaciones (opcional)</Text>
        <TextInput
          value={observaciones}
          onChangeText={setObservaciones}
          placeholder="Ej: Traer balones, usar zapatillas..."
          multiline
          style={styles.textInput}
          maxLength={500}
        />
        <Text style={[styles.charCount, { color: COLORS.grayMedium }]}>
          {observaciones.length}/500
        </Text>
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: COLORS.grayMedium }]}>Total a pagar</Text>
          <Text style={[styles.totalValue, { color: COLORS.pb5, fontSize: 20 }]}>
            {monto} Bs
          </Text>
        </View>
      </View>

      {/* Botones */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, { color: COLORS.pb5 }]}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleConfirmar} disabled={loading} style={[styles.button, styles.confirmButton, loading && { opacity: 0.7 }]}>
          <Text style={[styles.buttonText, { color: COLORS.white }]}>
            {loading ? 'Procesando...' : 'Confirmar Reserva'}
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  totalContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#41BFB2',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#D61727',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#41BFB2',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});