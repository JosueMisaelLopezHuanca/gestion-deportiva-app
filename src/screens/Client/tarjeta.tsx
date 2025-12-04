// app/(client)/pagos/tarjeta.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { confirmarPago } from '@/src/services/PagoApi'; // Ajusta la ruta

export default function TarjetaPage() {
  const router = useRouter();
  const { pagoId, codigoTransaccion, monto, reservaId } = useLocalSearchParams();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validar parámetros en useEffect
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
  
  const pagoIdNum = pagoId ? parseInt(pagoId as string, 10) : null;
  const codigo = codigoTransaccion as string || `PAY-${pagoIdNum}`;
  const montoNum = monto ? parseFloat(monto as string) : 0;

  const [numero, setNumero] = useState('');
  const [cvv, setCvv] = useState('');
  const [nombre, setNombre] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Early return si hay error de validación
  if (validationError) {
    return null;
  }

  const handlePagar = async () => {
    if (!numero.trim() || !cvv.trim() || !nombre.trim()) {
      Alert.alert('Advertencia', 'Completa todos los campos');
      return;
    }

    if (!pagoIdNum) {
      Alert.alert('Error', 'No se encontró el pago');
      return;
    }

    setProcesando(true);
    
    try {
      // En una implementación real, aquí enviarías los datos de la tarjeta a tu backend
      // Pero como solo necesitas confirmar el pago, llamamos directamente
      await confirmarPago(pagoIdNum, codigo);
      
      Alert.alert('Éxito', 'Pago con tarjeta confirmado', [
        { text: 'Aceptar', onPress: () => router.replace('/client/mis-reservas') },
      ]);
    } catch (error) {
      console.error('Error al procesar tarjeta:', error);
      Alert.alert('Error', 'No se pudo procesar la tarjeta');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón volver */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      {/* Título */}
      <View style={styles.header}>
        <Text style={styles.title}>Datos de tarjeta</Text>
        <Text style={styles.subtitle}>
          Monto: <Text style={{ fontWeight: '600' }}>S/ {montoNum.toFixed(2)}</Text>
        </Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Número de tarjeta</Text>
          <TextInput
            placeholder="•••• •••• •••• ••••"
            value={numero}
            onChangeText={(value) => setNumero(value.replace(/\D/g, '').slice(0, 16))}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainerHalf}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              placeholder="•••"
              value={cvv}
              onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 3))}
              keyboardType="numeric"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainerHalf}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
            />
          </View>
        </View>
      </View>

      {/* Botón confirmar */}
      <TouchableOpacity
        onPress={handlePagar}
        disabled={procesando}
        style={[styles.button, { opacity: procesando ? 0.7 : 1 }]}
      >
        {procesando ? (
          <Text style={styles.buttonText}>Procesando...</Text>
        ) : (
          <Text style={styles.buttonText}>Confirmar pago</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
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
    color: '#6B7280',
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
    backgroundColor: '#41BFB2',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
});