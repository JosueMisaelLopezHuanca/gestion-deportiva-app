// app/(client)/reservas/[canchaId].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import useReservaFlow from './hooks/useReservaFlow';
import CalendarSelector from './Components/CalendarSelectos';
import HorariosDisponibles from './Components/HorariosDisponibles';
import { Ionicons } from '@expo/vector-icons';

export default function ReservaPage() {
  const router = useRouter();
  const { canchaId, disciplinaId } = useLocalSearchParams();

  const reserva = useReservaFlow();
  const [horarios, setHorarios] = useState<string[]>([]);

  // === Colores personalizados (según tu paleta)
  const COLORS = {
    pb6: '#FFFFFF',      // blanco
    pb5: '#41BFB2',      // teal principal
    pb3: '#F28627',      // naranja secundario
    pb1: '#D61727',      // rojo alerta
    pb4: '#F2EFEB',      // beige suave
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    black: '#000000',
    white: '#FFFFFF',
  };

  // Console logs al cargar
  useEffect(() => {
    console.log('ReservaPage - Parámetros recibidos:');
    console.log('  canchaId:', canchaId);
    console.log('  disciplinaId:', disciplinaId);
  }, [canchaId, disciplinaId]);

  const handleSiguiente = () => {
    if (!reserva.fecha || horarios.length === 0) {
      Alert.alert(
        '¡Atención!',
        'Selecciona una fecha y al menos un horario para continuar.'
      );
      return;
    }

    // Guardar en el flow
    reserva.setCancha({ idCancha: canchaId });
    reserva.setDisciplina({ idDisciplina: disciplinaId });
    reserva.setHorariosSeleccionados(horarios);

    console.log('ENVIANDO A CONFIRMACIÓN:');
    console.log('  Fecha:', reserva.fecha ? reserva.fecha.toISOString().split('T')[0] : null);
    console.log('  Cancha ID:', canchaId);
    console.log('  Disciplina ID:', disciplinaId);
    console.log('  Horarios seleccionados:', horarios);

    const fecha = reserva.fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaInicio = horarios[0];
    const horaFin = horarios[horarios.length - 1];

    // Navegar con state (Expo Router no soporta state directo, así que usamos query o contexto global)
    // Por ahora, pasamos por query (simple)
    router.push({
      pathname: '/client/reserva-cliente',
      params: {
        fecha,
        horaInicio,
        horaFin,
        canchaId,
        disciplinaId,
      },
    });
  };

  const handleVolver = () => {
    router.back();
  };

  const handleSalir = () => {
    router.push('/client');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>
          Selecciona tu fecha y horario para Reservar
        </Text>
      </View>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Selector de fecha */}
        <View style={styles.calendarContainer}>
          <CalendarSelector
            fecha={reserva.fecha}
            onChange={(d) => {
              console.log('Fecha cambiada desde ReservaPage:', d.toISOString().split('T')[0]);
              reserva.setFecha(d);
            }}
          />
        </View>

        {/* Mensaje si no hay fecha */}
        {!reserva.fecha && (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderText, { color: COLORS.grayMedium }]}>
              Selecciona una fecha para ver los horarios disponibles
            </Text>
          </View>
        )}

        {/* Horarios disponibles */}
        {reserva.fecha && canchaId && (
          <View style={styles.horariosContainer}>
            <HorariosDisponibles
              canchaId={canchaId as string}
              fecha={reserva.fecha.toISOString().split('T')[0]}
              onSelectRango={(seleccionados) => {
                setHorarios(seleccionados);
              }}
            />
          </View>
        )}
      </View>

      {/* Botones */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleVolver} style={styles.volverButton}>
          <Ionicons name="arrow-back" size={18} color={COLORS.pb5} />
          <Text style={[styles.volverText, { color: COLORS.pb5 }]}>Volver</Text>
        </TouchableOpacity>

        <View style={styles.buttonsRight}>
          <TouchableOpacity onPress={handleSalir} style={[styles.salirButton, { backgroundColor: COLORS.pb1 }]}>
            <Ionicons name="close" size={18} color={COLORS.white} />
            <Text style={[styles.salirText, { color: COLORS.white }]}>Salir</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSiguiente} style={[styles.siguienteButton, { backgroundColor: COLORS.pb5 }]}>
            <Text style={[styles.siguienteText, { color: COLORS.white }]}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EFEB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  placeholderContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  horariosContainer: {
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  volverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  volverText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  buttonsRight: {
    flexDirection: 'row',
    gap: 12,
  },
  salirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  salirText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  siguienteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  siguienteText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});