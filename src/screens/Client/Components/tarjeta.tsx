// app/(client)/reservas/pagos/tarjeta.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { confirmarPago } from '@/src/services/PagoApi';

export default function Tarjeta() {
  const router = useRouter();
  const { pagoId } = useLocalSearchParams();
  const pagoIdNum = pagoId ? parseInt(pagoId as string, 10) : null;

  const [numero, setNumero] = useState('');
  const [cvv, setCvv] = useState('');
  const [nombre, setNombre] = useState('');
  const [procesando, setProcesando] = useState(false);

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
  };

  // === Validar pagoId
  if (!pagoIdNum) {
    Alert.alert('Error', 'No se encontró el pago');
    router.replace('/client/reservas');
    return null;
  }

  // === Procesar pago
  const handlePagar = async () => {
    if (!numero.trim() || !cvv.trim() || !nombre.trim()) {
      Alert.alert('Advertencia', 'Completa todos los campos');
      return;
    }

    setProcesando(true);

    try {
      // Aquí normalmente enviarías los datos de la tarjeta a tu backend
      // Pero como solo necesitas confirmar el pago, llamamos directamente a confirmarPago
      await confirmarPago(pagoIdNum, `PAY-${pagoIdNum}`);

      Alert.alert('Éxito', 'Pago con tarjeta confirmado', [
        { text: 'Aceptar', onPress: () => router.replace('/client/reservas') },
      ]);
    } catch (error) {
      console.error('Error al procesar tarjeta:', error);
      Alert.alert('Error', 'No se pudo procesar la tarjeta');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Botón volver */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color={COLORS.white} />
        <Text style={[styles.backButtonText, { color: COLORS.white }]}>Volver</Text>
      </TouchableOpacity>

      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Datos de tarjeta</Text>
        <Text style={[styles.subtitle, { color: COLORS.grayMedium }]}>
          Monto: <Text style={{ fontWeight: '600' }}>S/ {0.00}</Text> {/* Puedes pasar el monto por parámetro */}
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: COLORS.grayMedium }]}>Número de tarjeta</Text>
          <TextInput
            placeholder="•••• •••• •••• ••••"
            value={numero}
            onChangeText={(value) => setNumero(value.replace(/\D/g, '').slice(0, 16))}
            keyboardType="numeric"
            style={[styles.input, { color: COLORS.grayDark }]}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainerHalf}>
            <Text style={[styles.label, { color: COLORS.grayMedium }]}>CVV</Text>
            <TextInput
              placeholder="•••"
              value={cvv}
              onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 3))}
              keyboardType="numeric"
              secureTextEntry
              style={[styles.input, { color: COLORS.grayDark }]}
            />
          </View>

          <View style={styles.inputContainerHalf}>
            <Text style={[styles.label, { color: COLORS.grayMedium }]}>Nombre</Text>
            <TextInput
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              style={[styles.input, { color: COLORS.grayDark }]}
            />
          </View>
        </View>
      </View>

      {/* Botón confirmar */}
      <TouchableOpacity
        onPress={handlePagar}
        disabled={procesando}
        style={[
          styles.button,
          { backgroundColor: procesando ? COLORS.grayLight : COLORS.pb5 },
        ]}
      >
        {procesando ? (
          <Text style={[styles.buttonText, { color: COLORS.grayDark }]}>Procesando...</Text>
        ) : (
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Confirmar pago</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D61727',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 24,
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
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputContainerHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
});