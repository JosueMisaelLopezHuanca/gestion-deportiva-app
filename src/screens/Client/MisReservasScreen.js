import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { incluyeService } from '../../services/incluyeService';
import { reservaService } from '../../services/reservaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function MisReservasScreen() {
  const { userData } = useAuth();
  const router = useRouter();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  const fetchReservas = useCallback(async () => {
    if (!userData) return;
    try {
      if (!refreshing) setLoading(true);
      const data = await reservaService.getReservasByCliente(userData.idPersona);
      const ordenadas = data.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
      setReservas(ordenadas);
    } catch (error) {
      console.log("Error listando:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData, refreshing]);

  useFocusEffect(useCallback(() => { fetchReservas(); }, [fetchReservas]));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReservas();
  }, [fetchReservas]);

  const handleCancel = (reserva) => {
    Alert.alert(
      "Cancelar Reserva",
      "¿Deseas cancelar esta reserva? Se liberará el horario.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            setCancelingId(reserva.idReserva);
            try {
              await reservaService.cancelarReserva(reserva.idReserva, "App Movil");
              if (reserva.cancha && reserva.disciplina) {
                try {
                  await incluyeService.desasociarReserva(reserva.idReserva, reserva.cancha.idCancha, reserva.disciplina.idDisciplina);
                } catch {}
              }
              showSuccessToast("Reserva cancelada.");
              setTimeout(() => onRefresh(), 500);
            } catch {
              showErrorToast("Error al cancelar.");
            } finally {
              setCancelingId(null);
            }
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'CONFIRMADA': return '#4caf50';
      case 'PENDIENTE': return '#ff9800';
      case 'CANCELADA': return '#f44336';
      default: return '#757575';
    }
  };

  const renderItem = ({ item }) => {
    const isCanceling = cancelingId === item.idReserva;
    const colorEstado = getEstadoColor(item.estadoReserva);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {item.cancha?.nombre || 'Reserva'}
            </Text>
            <View style={[styles.estadoBadge, { backgroundColor: colorEstado }]}>
              <Text style={styles.estadoText}>{item.estadoReserva}</Text>
            </View>
          </View>
          <Divider style={{ marginVertical: 8 }} />
          <Paragraph>Fecha: {item.fechaReserva}</Paragraph>
          <Paragraph>Horario: {item.horaInicio?.substring(0, 5)} - {item.horaFin?.substring(0, 5)}</Paragraph>
        </Card.Content>

        <Card.Actions style={{ justifyContent: 'flex-end' }}>
          {item.estadoReserva === 'PENDIENTE' && (
            <>
              <Button
                mode="outlined"
                textColor="#d32f2f"
                style={{ borderColor: '#d32f2f', marginRight: 5 }}
                onPress={() => handleCancel(item)}
                loading={isCanceling}
                disabled={isCanceling}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                buttonColor="#6200ee"
                onPress={() =>
                  router.push({
                    pathname: '/client/pago',
                    params: { reserva: JSON.stringify(item) }
                  })
                }
              >
                Pagar
              </Button>
            </>
          )}
          {item.estadoReserva === 'CONFIRMADA' && (
            <Button
              mode="contained"
              icon="qrcode"
              buttonColor="#2e7d32"
              style={{ width: '100%' }}
              onPress={() =>
                router.push({
                  pathname: '/client/qr',
                  params: { idReserva: item.idReserva, nombreCancha: item.cancha?.nombre }
                })
              }
            >
              Ver QR
            </Button>
          )}
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Title style={styles.screenTitle}>Mis Reservas</Title>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#6200ee" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reservas}
          keyExtractor={(item) => item.idReserva.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>No tienes reservas.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, paddingTop: 50 },
  screenTitle: { textAlign: 'center', marginBottom: 15, fontWeight: 'bold', color: '#333' },
  card: { marginBottom: 15, backgroundColor: 'white', borderRadius: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estadoBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center', justifyContent: 'center' },
  estadoText: { color: 'white', fontSize: 10, fontWeight: 'bold' }
});
