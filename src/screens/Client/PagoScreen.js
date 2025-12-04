import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { pagoService } from '../../services/pagoService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function PagoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userData } = useAuth();

  const [loading, setLoading] = useState(false);
  const [calculando, setCalculando] = useState(true);
  const [montoReal, setMontoReal] = useState(0);

  let reserva = null;
  try {
    if (params.reserva) reserva = JSON.parse(params.reserva);
  } catch {}

  useEffect(() => {
    const consultarDeuda = async () => {
      if (!reserva?.idReserva) return;
      try {
        setCalculando(true);
        const saldo = await pagoService.obtenerSaldoPendiente(reserva.idReserva);
        setMontoReal(saldo);
      } catch {
        showErrorToast("No se pudo calcular el monto a pagar.");
        setMontoReal(reserva.montoTotal || 0);
      } finally {
        setCalculando(false);
      }
    };
    consultarDeuda();
  }, []);

  if (!reserva || !userData) return null;

  const handleConfirmarPago = async () => {
    if (montoReal <= 0) {
      showErrorToast("Esta reserva ya está pagada o el monto es 0.");
      return;
    }

    setLoading(true);
    try {
      const pagoData = {
        monto: montoReal,
        fecha: new Date().toISOString().split('T')[0],
        tipoPago: "TOTAL",
        metodoPago: "EFECTIVO",
        estado: "PENDIENTE",
        codigoTransaccion: `APP-${Date.now()}`,
        descripcion: "Pago App Móvil",
        idReserva: reserva.idReserva,
        clienteId: userData.idPersona,
      };

      const pagoCreado = await pagoService.crearPago(pagoData);
      await pagoService.confirmarPago(pagoCreado.idPago, pagoData.codigoTransaccion);
      showSuccessToast("¡Pago registrado correctamente!");

      setTimeout(() => router.back(), 1500);
    } catch (error) {
      const msg = error.response?.data?.message || "Error al procesar el pago.";
      showErrorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.header}>Confirmación de Pago</Title>

      <Card style={styles.card}>
        <Card.Title 
          title="Detalle Reserva" 
          left={(props) => <Avatar.Icon {...props} icon="calendar-check" style={{backgroundColor:'#6200ee'}} />} 
        />
        <Card.Content>
          <Paragraph>Cancha: <Text style={{fontWeight:'bold'}}>{reserva.cancha?.nombre}</Text></Paragraph>
          <Divider style={{marginVertical:5}}/>
          <Paragraph>Fecha: {reserva.fechaReserva}</Paragraph>
          <Paragraph>Horario: {reserva.horaInicio} - {reserva.horaFin}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.paymentCard]}>
        <Card.Content style={{alignItems:'center'}}>
          <Paragraph style={{color:'#666'}}>Total a Pagar</Paragraph>
          {calculando ? (
            <ActivityIndicator style={{margin:10}} color="#6200ee"/>
          ) : (
            <Text variant="displaySmall" style={{color:'#6200ee', fontWeight:'bold', marginVertical:5}}>
              Bs. {montoReal?.toFixed(2)}
            </Text>
          )}
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleConfirmarPago} loading={loading} disabled={loading || calculando || montoReal <= 0} style={styles.payButton}>
        CONFIRMAR PAGO
      </Button>

      <Button mode="text" onPress={() => router.back()} disabled={loading} style={{marginTop:10}}>
        Cancelar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor:'#f5f5f5' },
  header: { textAlign:'center', marginBottom:20, fontWeight:'bold', color:'#333' },
  card: { marginBottom:15, borderRadius:12, backgroundColor:'white', elevation:2 },
  paymentCard: { borderLeftWidth:5, borderLeftColor:'#6200ee' },
  payButton: { borderRadius:8, backgroundColor:'#6200ee', marginTop:10 }
});
