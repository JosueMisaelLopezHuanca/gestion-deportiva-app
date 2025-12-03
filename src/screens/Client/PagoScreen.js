// src/screens/Client/PagoScreen.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
// ❌ QUITA ESTO: import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../hooks/useAuth';
import { pagoService } from '../../services/pagoService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';
// src/screens/Client/PagoScreen.js

export default function PagoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useAuth();

  // ✅ AGREGAR VALIDACIÓN
  if (!params.reserva) {
    return (
      <View style={styles.container}>
        <Text>Error: No se encontraron datos de reserva</Text>
        <Button onPress={() => router.back()}>Volver</Button>
      </View>
    );
  }



  const reserva = JSON.parse(params.reserva);

  const [loading, setLoading] = useState(false);

  const handleConfirmarPago = async () => {
    setLoading(true);
    try {
      console.log('🟡 Iniciando proceso de pago completo...');

      // --- VALIDACIONES CRÍTICAS ---
      if (!reserva.idReserva) {
        throw new Error('No se encontró ID de reserva');
      }

      if (!userData?.idPersona) {
        throw new Error('No se pudo identificar al cliente');
      }

      const montoAPagar = reserva.montoTotal || reserva.saldoPendiente || 40;
      console.log('💰 Monto a pagar calculado:', montoAPagar);

      // --- PASO 1: Crear el pago como PENDIENTE ---
      const pagoData = {
        monto: montoAPagar,
        fecha: new Date().toISOString().split('T')[0],
        tipoPago: "TOTAL",
        metodoPago: "EFECTIVO",
        estado: "PENDIENTE", // 👈 CREAR COMO PENDIENTE
        codigoTransaccion: `SIM-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        descripcion: "Pago simulado desde app móvil",
        idReserva: reserva.idReserva,
        clienteId: userData.idPersona,
      };

      console.log('📤 Creando pago pendiente...');
      const pagoCreado = await pagoService.crearPago(pagoData);
      console.log('📥 Pago pendiente creado:', pagoCreado);

      // --- PASO 2: Confirmar el pago (ESTA LLAMADA AUTOMÁTICAMENTE ACTUALIZA LA RESERVA) ---
      console.log('🔄 Confirmando pago y actualizando reserva automáticamente...');
      const pagoConfirmado = await pagoService.confirmarPago(
        pagoCreado.idPago, 
        pagoData.codigoTransaccion
      );
      console.log('✅ Pago confirmado y reserva actualizada:', pagoConfirmado);

      // ❌❌❌ NO LLAMES ESTO - YA SE HIZO AUTOMÁTICAMENTE EN EL BACKEND ❌❌❌
      // await reservaService.actualizarEstadoPagoReserva(reserva.idReserva);

      showSuccessToast("¡Pago completado! Tu reserva está confirmada.");
      
      setTimeout(() => {
        router.replace('/client/mis-reservas');
      }, 1500);

    } catch (error) {
      console.error('❌ ERROR CRÍTICO EN PAGO:', error);
      
      let mensajeError = "No se pudo procesar el pago.";
      
      if (error.response) {
        console.log('📊 Respuesta de error:', error.response.data);
        console.log('🔢 Status code:', error.response.status);
        
        if (error.response.status === 401) {
          mensajeError = "Error de autenticación. Por favor, vuelve a iniciar sesión.";
        } else if (error.response.status === 400) {
          mensajeError = "Datos inválidos: " + (error.response.data?.message || 'Verifica la información');
        } else if (error.response.status === 500) {
          mensajeError = "Error del servidor. Intenta nuevamente.";
        }
      } else if (error.request) {
        console.log('🌐 Error de red - No hubo respuesta:', error.request);
        mensajeError = "Error de conexión. Verifica tu internet.";
      } else {
        console.log('⚡ Error inesperado:', error.message);
        mensajeError = error.message || "Error inesperado.";
      }
      
      showErrorToast(mensajeError);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Confirmar Pago</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Reserva en: {reserva.cancha?.nombre || 'Cancha'}</Title>
          <Paragraph>Fecha: {reserva.fechaReserva}</Paragraph>
          <Paragraph>Hora: {reserva.horaInicio} - {reserva.horaFin}</Paragraph>
          <Paragraph>Estado: {reserva.estadoReserva}</Paragraph>
          
          <Title style={styles.monto}>
            Monto a Pagar: Bs. {reserva.montoTotal || reserva.saldoPendiente || 40}
          </Title>

          <Paragraph style={styles.simulacionText}>
            (Simulación de pasarela de pago)
          </Paragraph>

          <Button 
            mode="contained" 
            icon="check-circle"
            onPress={handleConfirmarPago}
            loading={loading}
            disabled={loading}
            style={styles.pagoButton}
          >
            <Text style={styles.pagoButtonText}>
              {loading ? 'Procesando...' : 'Confirmar Pago (Simulado)'}
            </Text>
          </Button>
        </Card.Content>
      </Card>
      
      <Button 
        mode="outlined" 
        onPress={() => router.back()} 
        style={styles.cancelButton}
        disabled={loading}
      >
        Cancelar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60, 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    textAlign: 'center', 
    marginBottom: 20 
  },
  card: { 
    padding: 10,
    marginBottom: 20 
  },
  monto: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#6200ee',
  },
  simulacionText: {
    textAlign: 'center', 
    marginVertical: 10,
    fontStyle: 'italic',
    color: '#888'
  },
  pagoButton: {
    marginTop: 20,
  },
  pagoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cancelButton: { 
    marginTop: 10,
    marginBottom: 20 
  }
});