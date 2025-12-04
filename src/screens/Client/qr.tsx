// app/(client)/pagos/qr.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from './Components/QrCode';
import { confirmarPago } from '@/src/services/PagoApi'; // Ajusta la ruta

export default function ConfirmarPagoQRPage() {
  const router = useRouter();
  const { pagoId, codigoTransaccion, monto, reservaId } = useLocalSearchParams();
  const [procesando, setProcesando] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validar parámetros en useEffect para evitar setState durante render
  useEffect(() => {
    if (!pagoId || !codigoTransaccion) {
      setValidationError('Datos de pago incompletos');
    }
  }, [pagoId, codigoTransaccion]);

  // Mostrar Alert en otro useEffect cuando hay error
  useEffect(() => {
    if (validationError) {
      Alert.alert('Error', validationError, [
        { text: 'Aceptar', onPress: () => router.replace('/client/mis-reservas') },
      ]);
    }
  }, [validationError, router]);

  // Parsear parámetros de forma segura
  const pagoIdNum = pagoId ? parseInt(pagoId as string, 10) : null;
  const montoNum = monto ? parseFloat(monto as string) : 0;
  const codigo = codigoTransaccion as string || '';

  // Early return si hay error de validación
  if (validationError) {
    return null;
  }

  // ✅ FUNCIÓN DE CONFIRMACIÓN (LO MÁS IMPORTANTE)
  const handleConfirmarPago = async () => {
    setProcesando(true);
    
    try {
      // 🎯 ¡ESTA ES LA LLAMADA QUE FALTABA!
      await confirmarPago(pagoIdNum, codigo);
      
      Alert.alert('Éxito', 'Pago confirmado vía QR', [
        { text: 'Aceptar', onPress: () => router.replace('/client/mis-reservas') },
      ]);
    } catch (error) {
      console.error('Error al confirmar pago QR:', error);
      Alert.alert('Error', 'No se pudo confirmar el pago. Inténtalo de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón volver */}
        <TouchableOpacity onPress={() => router.replace('/client/reservas')} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Confirmar pago</Text>
        <Text style={styles.subtitle}>Escanea el código QR para completar</Text>
      </View>

      {/* Panel con QR y monto */}
      <View style={[styles.card, { backgroundColor: '#FFFFFF' }]}>
        {/* Monto */}
        <View style={styles.montoContainer}>
          <Text style={styles.montoLabel}>Monto</Text>
          <Text style={styles.montoValue}>{montoNum.toFixed(2)} Bs</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrWrapper}>
          <QRCode value={codigo} size={180} />
        </View>

        <Text style={styles.qrInstructions}>Escanea con tu app de pagos</Text>
      </View>

      {/* ✅ BOTÓN CONFIRMAR PAGO (LO MÁS IMPORTANTE) */}
      <TouchableOpacity
        onPress={handleConfirmarPago} // ← ¡Esta es la función que llama a tu API!
        disabled={procesando}
        style={[styles.confirmButton, { opacity: procesando ? 0.7 : 1 }]}
      >
        {procesando ? (
          <Text style={styles.confirmButtonText}>Procesando...</Text>
        ) : (
          <Text style={styles.confirmButtonText}>Confirmar pago</Text>
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
  content: {
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
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#6B7280',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  montoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  montoLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#6B7280',
    marginBottom: 4,
  },
  montoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: '#F28627',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  qrInstructions: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#41BFB2',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});