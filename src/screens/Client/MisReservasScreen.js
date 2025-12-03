// src/screens/Client/MisReservasScreen.js
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { incluyeService } from '../../services/incluyeService';
import { reservaService } from '../../services/reservaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';




export default function MisReservasScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ▼▼▼ 1. DEFINE EL ESTADO PARA EL SPINNER DEL BOTÓN ▼▼▼
  const [cancelingId, setCancelingId] = useState(null);

  // Función para cargar las reservas
  const fetchReservas = useCallback(async () => {
    if (!userData) {
      setLoading(false);
      return;
    }
    setLoading(true); // Activa el spinner principal
    try {
      const data = await reservaService.getReservasByCliente(userData.idPersona);
      setReservas(data);
    } catch (error) {
      showErrorToast('No se pudieron cargar tus reservas.');
    } finally {
      setLoading(false); // Desactiva el spinner principal
    }
  }, [userData]);

  // Cargar reservas cuando la pantalla se enfoca
  useFocusEffect(
    useCallback(() => {
      fetchReservas();
    }, [fetchReservas])
  );

  // Lógica de cancelación
  const handleCancel = (reserva) => {
    if (!reserva.cancha || !reserva.disciplina) {
      showErrorToast("Error: Datos de reserva incompletos para cancelar.");
      return;
    }

    Alert.alert(
      "Cancelar Reserva",
      "¿Estás seguro de que quieres cancelar esta reserva?",
      [
        { text: "No, volver", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            // 2. Activa el spinner SOLO para esta tarjeta
            setCancelingId(reserva.idReserva); 
            
            try {
              // 3. Ejecuta la cancelación
              await reservaService.cancelarReserva(
                reserva.idReserva, 
                "Cancelación desde la app móvil"
              );

              // 4. Ejecuta la desasociación del horario
              await incluyeService.desasociarReserva(
                reserva.idReserva,
                reserva.cancha.idCancha,
                reserva.disciplina.idDisciplina
              );
              
              showSuccessToast("Reserva cancelada y horario liberado.");
              
              // 5. Actualiza la lista local (más rápido que recargar)
              setReservas(prevReservas => 
                prevReservas.map(r => 
                  r.idReserva === reserva.idReserva 
                    ? { ...r, estadoReserva: 'CANCELADA' } 
                    : r
                )
              );

            } catch (error) {
              showErrorToast("No se pudo cancelar la reserva.");
            } finally {
              // 6. Desactiva el spinner de esta tarjeta
              setCancelingId(null);
            }
          }
        }
      ]
    );
  };

  if (loading && !cancelingId) { // Solo muestra el spinner a pantalla completa si NO estamos cancelando
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Mis Reservas</Title>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.idReserva.toString()}
        renderItem={({ item }) => {
          // ▼▼▼ 7. DEFINE LA VARIABLE ANTES DE USARLA ▼▼▼
          const isCanceling = cancelingId === item.idReserva; 

          return (
            <Card style={styles.card}>
              <Card.Content>
                <Title>{item.cancha?.nombre || 'Reserva'}</Title>
                <Paragraph>Fecha: {item.fechaReserva}</Paragraph>
                <Paragraph>Hora: {item.horaInicio} - {item.horaFin}</Paragraph>
                <Paragraph style={{ fontWeight: 'bold' }}>Estado: {item.estadoReserva}</Paragraph>
              </Card.Content>
              
              <Card.Actions>
                {item.estadoReserva === 'PENDIENTE' && (
                  <>
                    <Button 
                      icon="credit-card" 
                      mode="contained"
                      disabled={isCanceling} // 8. Usa la variable
                      onPress={() => router.push({
                        pathname: '/client/pago',
                        params: { reserva: JSON.stringify(item) } 
                      })}
                    >
                      <Text style={{color: 'white'}}>Pagar</Text>
                    </Button>
                    <Button 
                      icon="cancel"
                      loading={isCanceling} // 8. Usa la variable
                      disabled={isCanceling} // 8. Usa la variable
                      onPress={() => handleCancel(item)} 
                    >
                      Cancelar
                    </Button>
                  </>
                )}
                {/* ▼▼▼ ¡AQUÍ ESTÁ EL CAMBIO! ▼▼▼ */}
                {/* Botón para CONFIRMADA */}
                {item.estadoReserva === 'CONFIRMADA' && (
                  <Button 
                    icon="qrcode" 
                    mode="contained"
                    onPress={() => router.push({
                      pathname: '/client/qr',
                      params: { 
                        idReserva: item.idReserva,
                        nombreCancha: item.cancha?.nombre || 'Reserva'
                      }
                    })}
                  >
                    <Text style={{color: 'white'}}>Ver QR</Text>
                  </Button>
                )}
              </Card.Actions>
            </Card>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No tienes ninguna reserva.</Text>}
      />
      <Button onPress={() => router.back()} style={{ marginTop: 20 }}>
        Volver
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { textAlign: 'center', marginBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { marginBottom: 15 },
});