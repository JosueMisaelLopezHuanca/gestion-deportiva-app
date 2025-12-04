// app/(client)/reservas/components/HorariosDisponibles.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { getHorasDisponibles } from '../../../services/ReservaApi';
import { Ionicons } from '@expo/vector-icons';

interface HorariosDisponiblesProps {
  canchaId: string;
  fecha: string; // YYYY-MM-DD
  onSelectRango: (horarios: string[]) => void;
}

export default function HorariosDisponibles({ canchaId, fecha, onSelectRango }: HorariosDisponiblesProps) {
  const [horas, setHoras] = useState<string[]>([]);
  const [seleccion, setSeleccion] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // === Colores personalizados
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

  useEffect(() => {
    if (!canchaId || !fecha) return;
    setLoading(true);
    getHorasDisponibles(canchaId, fecha)
      .then((data) => {
        let horasFormateadas: string[] = [];
        if (Array.isArray(data)) {
          if (typeof data[0] === 'object') {
            horasFormateadas = data.map((h: any) =>
              h.hora || h.horario || h.horaInicio || ''
            ).filter(Boolean);
          } else {
            horasFormateadas = data as string[];
          }
        }
        setHoras(horasFormateadas.sort());
      })
      .catch((err) => console.error('❌ Error al cargar horas:', err))
      .finally(() => setLoading(false));
  }, [canchaId, fecha]);

  const toggleHora = (hora: string) => {
    let nuevaSeleccion = [...seleccion];

    if (seleccion.includes(hora)) {
      nuevaSeleccion = [];
    } else if (seleccion.length === 0) {
      nuevaSeleccion = [hora];
    } else {
      const todosIndices = horas.map((h, i) => ({ h, i }));
      const indicesSeleccion = seleccion.map(h => horas.indexOf(h)).sort((a, b) => a - b);
      const indiceActual = horas.indexOf(hora);
      const minIndex = Math.min(...indicesSeleccion, indiceActual);
      const maxIndex = Math.max(...indicesSeleccion, indiceActual);
      nuevaSeleccion = horas.slice(minIndex, maxIndex + 1);
    }

    setSeleccion(nuevaSeleccion);
    onSelectRango(nuevaSeleccion);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color={COLORS.pb5} />
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Horarios disponibles</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.pb3} />
          <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>Buscando horarios...</Text>
        </View>
      ) : horas.length === 0 ? (
        <Text style={[styles.noHorarios, { color: COLORS.pb1 }]}>
          No hay horarios para esta fecha
        </Text>
      ) : (
        <View style={styles.grid}>
          {horas.map((hora) => {
            const isSelected = seleccion.includes(hora);
            return (
              <TouchableOpacity
                key={hora}
                onPress={() => toggleHora(hora)}
                style={[
                  styles.horaButton,
                  isSelected
                    ? { backgroundColor: COLORS.pb5, borderColor: COLORS.pb5 }
                    : { backgroundColor: COLORS.pb6, borderColor: COLORS.grayLight },
                ]}
              >
                <Text
                  style={[
                    styles.horaText,
                    { color: isSelected ? COLORS.white : COLORS.grayDark },
                  ]}
                >
                  {hora}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {seleccion.length > 0 && (
        <View style={[styles.selectedRango, { backgroundColor: COLORS.pb5 }]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
          <Text style={[styles.rangoText, { color: COLORS.white }]}>
            {seleccion.length === 1
              ? `Bloque: ${seleccion[0]}`
              : `Rango: ${seleccion[0]} – ${seleccion[seleccion.length - 1]}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter',
  },
  noHorarios: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  horaButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  horaText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  selectedRango: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  rangoText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});