// app/(client)/cancha/Components/DisciplinaCli.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getDisciplinasPorCancha } from '../../../services/CanchaApi';
import { Ionicons } from '@expo/vector-icons';

interface Disciplina {
  idDisciplina: number;
  nombre: string;
  descripcion?: string;
}

interface DisciplinaCliProps {
  canchaId: number;
  onSelectDisciplina: (disciplina: Disciplina & { idCancha: number }) => void;
}

export default function DisciplinaCli({ canchaId, onSelectDisciplina }: DisciplinaCliProps) {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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

  // === Obtener ícono según nombre
  const getIconName = (nombre: string): string => {
    const n = nombre.toLowerCase();
    if (n.includes('fut')) return 'football';
    if (n.includes('vole')) return 'volleyball';
    if (n.includes('basq') || n.includes('basket')) return 'basketball';
    if (n.includes('tenis')) return 'tennisball';
    return 'trophy';
  };

  // === Cargar disciplinas
  useEffect(() => {
    const fetchDisciplinas = async () => {
      try {
        const data = await getDisciplinasPorCancha(canchaId);
        setDisciplinas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error cargando disciplinas:', err);
        setDisciplinas([]);
      } finally {
        setLoading(false);
      }
    };

    if (canchaId) {
      fetchDisciplinas();
    }
  }, [canchaId]);

  if (loading) {
    return (
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.card, styles.placeholderCard]} />
        ))}
      </View>
    );
  }

  if (disciplinas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: COLORS.pb3 }]}>
          Todavía no hay disciplinas disponibles
        </Text>
        <Text style={[styles.emptyText, { color: COLORS.grayMedium }]}>
          Esta cancha aún no tiene disciplinas registradas. Para poder realizar una reserva es necesario que exista al menos una disciplina asociada.
        </Text>
        <Text style={[styles.emptySubtext, { color: COLORS.grayMedium }]}>
          Si necesita más información, póngase en contacto con el administrador del área deportiva.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {disciplinas.map((disc) => {
        const isSelected = selected === disc.idDisciplina;
        const iconName = getIconName(disc.nombre);

        return (
          <TouchableOpacity
            key={disc.idDisciplina}
            onPress={() => {
              setSelected(disc.idDisciplina);
              onSelectDisciplina({
                idDisciplina: disc.idDisciplina,
                idCancha: canchaId,
                ...disc,
              });
            }}
            style={[
              styles.card,
              { backgroundColor: isSelected ? `${COLORS.pb5}20` : COLORS.pb6 },
              isSelected && { borderColor: COLORS.pb5, borderWidth: 2 },
            ]}
          >
            {/* Ícono */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isSelected ? `${COLORS.pb5}20` : `${COLORS.grayLight}` },
              ]}
            >
              <Ionicons
                name={iconName as any}
                size={28}
                color={isSelected ? COLORS.pb5 : COLORS.grayMedium}
              />
            </View>

            {/* Nombre */}
            <Text
              style={[
                styles.disciplinaNombre,
                { color: isSelected ? COLORS.pb5 : COLORS.grayDark },
              ]}
            >
              {disc.nombre}
            </Text>

            {/* Descripción */}
            {disc.descripcion ? (
              <Text
                numberOfLines={2}
                style={[styles.disciplinaDescripcion, { color: COLORS.grayMedium }]}
              >
                {disc.descripcion}
              </Text>
            ) : null}

            {/* Indicador de selección */}
            {isSelected && (
              <View
                style={[
                  styles.selectedIndicator,
                  { backgroundColor: COLORS.pb5 },
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  placeholderCard: {
    backgroundColor: '#F3F4F6',
    height: 120,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  disciplinaNombre: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  disciplinaDescripcion: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
    lineHeight: 16,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  emptySubtext: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter',
  },
});