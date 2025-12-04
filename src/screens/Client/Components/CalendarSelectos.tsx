// app/(client)/reservas/components/CalendarSelector.tsx
import React from 'react';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper'; // o define tus colores

interface CalendarSelectorProps {
  fecha: Date | null;
  onChange: (date: Date) => void;
}

export default function CalendarSelector({ fecha, onChange }: CalendarSelectorProps) {
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

  const markedDates: any = {};
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  markedDates[todayKey] = {
    selectedColor: COLORS.pb3, // color "hoy"
    selectedTextColor: COLORS.white,
  };

  if (fecha) {
    const fechaKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    markedDates[fechaKey] = {
      selected: true,
      selectedColor: COLORS.pb5, // color "seleccionado"
      selectedTextColor: COLORS.white,
    };
  }

  const onDayPress = (day: any) => {
    const selectedDate = new Date(day.year, day.month - 1, day.day);
    onChange(selectedDate);
  };

  return (
    <View style={styles.container}>
      <RNCalendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        minDate={new Date()}
        theme={{
          calendarBackground: COLORS.pb6,
          textSectionTitleColor: COLORS.grayMedium,
          selectedDayBackgroundColor: COLORS.pb5,
          selectedDayTextColor: COLORS.white,
          todayTextColor: COLORS.pb3,
          dayTextColor: COLORS.grayDark,
          textDisabledColor: COLORS.grayLight,
          dotColor: COLORS.pb5,
          selectedDotColor: COLORS.white,
          arrowColor: COLORS.pb5,
          monthTextColor: COLORS.grayDark,
          textMonthFontWeight: 'bold',
        }}
        style={styles.calendar}
      />

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.pb3 }]} />
          <Text style={[styles.legendText, { color: COLORS.grayMedium }]}>Hoy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORS.pb5 }]} />
          <Text style={[styles.legendText, { color: COLORS.grayMedium }]}>Seleccionada</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendar: {
    borderRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
});