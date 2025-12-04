// app/(client)/qr/[id].tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/hooks/useAuth';
import { getQrsByPersona, getQrImage } from '@/src/services/QrApi';

export default function QrReservaPage() {
  const router = useRouter();
  
  const { id } = useLocalSearchParams();
  const reservaId = typeof id === 'string' ? parseInt(id, 10) : null;
    const { userData, isLoading: authLoading } = useAuth();

  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Cargar QR
  useEffect(() => {
    if (!reservaId || !userData?.id) {
      Alert.alert('Error', 'Faltan datos para cargar el QR');
      router.replace('/client/mis-reservas');
      return;
    }

    const fetchQr = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener QRs del usuario
        const qrs = await getQrsByPersona(userData.id);
        
        // Encontrar el QR de esta reserva
        const qrEncontrado = qrs.find(
          (qr) => qr.idReserva === reservaId && qr.idPersona === userData.id && qr.esCliente
        );

        if (!qrEncontrado) {
          setError('No tienes un QR para esta reserva');
          return;
        }

        // Obtener la imagen del QR
        const blob = await getQrImage(qrEncontrado.codigoQr);
        const url = URL.createObjectURL(blob);
        setQrImageUrl(url);
      } catch (error) {
        console.error('Error al cargar QR:', error);
        setError('No se pudo cargar el código QR');
      } finally {
        setLoading(false);
      }
    };

    fetchQr();
  }, [reservaId, userData?.id, router]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando código QR...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón volver */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Código QR</Text>
        <Text style={styles.subtitle}>Muestra este código en la entrada</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#D61727" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : qrImageUrl ? (
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <Image source={{ uri: qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
          </View>
          <Text style={styles.qrInstructions}>Presenta este QR en la recepción</Text>
        </View>
      ) : null}
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
    alignItems: 'center',
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
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#D61727',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  qrImage: {
    width: 240,
    height: 240,
  },
  qrInstructions: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#6B7280',
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#6B7280',
  },
});