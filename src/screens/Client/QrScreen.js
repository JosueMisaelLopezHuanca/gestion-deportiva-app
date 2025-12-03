// src/screens/Client/QrScreen.js - VERSIÓN CORREGIDA
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Paragraph, Text, Title } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../hooks/useAuth';
import { qrService } from '../../services/qrService';

export default function QrScreen() {
  const router = useRouter();
  const { userData } = useAuth();
  const { idReserva, nombreCancha } = useLocalSearchParams();

  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarQR = async () => {
      if (!idReserva) {
        setError('No se especificó la reserva');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(' Cargando QRs para reserva:', idReserva);
        const qrs = await qrService.getQrsByReserva(idReserva);
        
        if (qrs && qrs.length > 0) {
          // Buscar QR del usuario actual primero
          const miQR = qrs.find(qr => qr.idPersona === userData?.idPersona) || qrs[0];
          setQrData(miQR);
          console.log(' QR encontrado:', miQR);
        } else {
          setError('No se encontraron códigos QR para esta reserva.');
        }
      } catch (error) {
        console.error(' Error cargando QR:', error);
        //  NO intentes generar QR automáticamente - eso debe hacerse al confirmar pago
        setError('No se pudo cargar el código QR. La reserva puede no estar completamente pagada.');
      } finally {
        setLoading(false);
      }
    };

    cargarQR();
  }, [idReserva, userData]);

  //  CORREGIDO: Sin usar router.pathname
  const handleReintentar = () => {
    setLoading(true);
    setError(null);
    // Simplemente recarga los datos
    setTimeout(() => {
      cargarQR();
    }, 1000);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Cargando código QR...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <Button mode="contained" onPress={handleReintentar} style={styles.button}>
          Reintentar
        </Button>
        <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
          Volver a Mis Reservas
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Tu Código QR</Title>
      <Paragraph style={styles.subtitle}>
        {nombreCancha || 'Reserva'} - {qrData?.esCliente ? 'Titular' : 'Invitado'}
      </Paragraph>

      <View style={styles.qrContainer}>
        {qrData?.codigoQr ? (
          <>
            <QRCode
              value={qrData.codigoQr}
              size={250}
              backgroundColor="white"
              color="black"
            />
            <Text style={styles.qrInfo}>
              Presenta este código en la entrada
            </Text>
            <Text style={styles.qrExpiry}>
              Válido hasta: {new Date(qrData.fechaExpiracion).toLocaleDateString()}
            </Text>
          </>
        ) : (
          <Text>No se pudo generar el código QR</Text>
        )}
      </View>

      <Button 
        mode="outlined" 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        Volver a Mis Reservas
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qrInfo: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
  },
  qrExpiry: {
    marginTop: 5,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    width: 200,
  },
  backButton: {
    marginTop: 30,
    width: 200,
  },
});