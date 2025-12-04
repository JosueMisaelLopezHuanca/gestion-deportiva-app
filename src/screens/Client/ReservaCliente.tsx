// app/(client)/reserva-cliente/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { getClienteById } from '../../services/ClienteApi';

export default function ReservaCliente() {
  const router = useRouter();

  // === 1. Parámetros que llegan desde la pantalla anterior
  const params = useLocalSearchParams();
  console.log('Parámetros recibidos desde la pantalla anterior:', params);

  const { fecha, horaInicio, horaFin, canchaId, disciplinaId } = params;

  // === 2. Usuario autenticado
  const { userData, isLoading: authLoading } = useAuth();
  console.log('useAuth() → userData:', userData);
  console.log('useAuth() → authLoading:', authLoading);

  const [clienteCompleto, setClienteCompleto] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  };

  // === 3. CARGAR DATOS DEL CLIENTE
  useEffect(() => {
    console.log('useEffect disparado');
    console.log('userData?.id existe?', !!userData?.id);
    console.log('authLoading?', authLoading);

    if (!userData?.id) {
      if (!authLoading) {
        console.log('No hay usuario logueado → redirigiendo a /client');
        Alert.alert('Error', 'Debes iniciar sesión');
        router.replace('/client');
      }
      return;
    }

    const fetchCliente = async () => {
      try {
        console.log('Iniciando fetch del cliente con ID:', userData.id);
        setLoading(true);
        const data = await getClienteById(userData.id);
        console.log('Cliente recibido del backend:', data);
        setClienteCompleto(data);
      } catch (error: any) {
        console.error('ERROR al obtener cliente:', error);
        console.error('Error message:', error.message);
        Alert.alert('Error', 'No se pudieron cargar tus datos');
        router.replace('/client');
      } finally {
        console.log('Finalizando carga del cliente');
        setLoading(false);
      }
    };

    fetchCliente();
  }, [userData?.id, authLoading, router]);

  // === 4. BOTÓN SIGUIENTE
  const handleSiguiente = () => {
    console.log('Botón Siguiente presionado');

    if (!clienteCompleto) {
      Alert.alert('Advertencia', 'Espera a que se carguen tus datos');
      return;
    }

    console.log('Datos actuales antes de navegar:');
    console.log('fecha:', fecha);
    console.log('horaInicio:', horaInicio);
    console.log('horaFin:', horaFin);
    console.log('canchaId:', canchaId);
    console.log('disciplinaId:', disciplinaId);

    if (!canchaId || !disciplinaId || !fecha || !horaInicio || !horaFin) {
      Alert.alert('Error', 'Faltan datos de la reserva');
      return;
    }

    console.log('Todo OK → Navegando a confirmación');
    router.push({
      pathname: '/client/reserva-confirmacion',
      params: {
        fecha,
        horaInicio,
        horaFin,
        canchaId,
        disciplinaId,
        clienteData: JSON.stringify(clienteCompleto), // Recomendado
      },
    });
  };

  console.log('clienteCompleto:', clienteCompleto);

  if (authLoading || loading) {
    console.log('Mostrando pantalla de carga');
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando tus datos...
        </Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: COLORS.pb3 }]}>
          Debes iniciar sesión para continuar
        </Text>
      </View>
    );
  }

  if (!clienteCompleto) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: COLORS.pb3 }]}>
          No se pudo cargar tu perfil
        </Text>
      </View>
    );
  }

 

  // === Render final
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Verifica tus datos</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileContainer}>
          <Image
            source={{
              uri: clienteCompleto.urlImagen || 'https://placehold.co/400x400?text=Usuario',
            }}
            style={styles.profileImage}
          />
          <View style={[styles.profileBadge, { backgroundColor: COLORS.pb5 }]}>
            <Ionicons name="camera" size={16} color={COLORS.white} />
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: COLORS.grayDark }]}>Nombre:</Text>
            <Text style={[styles.infoValue, { color: COLORS.grayMedium }]}>
              {clienteCompleto.nombre} {clienteCompleto.apellidoPaterno} {clienteCompleto.apellidoMaterno}
            </Text>
          </View>
          {/* más campos... */}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.button, styles.secondaryButton]}>
          <Ionicons name="arrow-back" size={18} color={COLORS.pb5} />
          <Text style={[styles.buttonText, { color: COLORS.pb5 }]}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/client')} style={[styles.button, styles.cancelButton]}>
          <Ionicons name="close" size={18} color={COLORS.white} />
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Salir</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSiguiente} style={[styles.button, styles.primaryButton]}>
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos (sin cambios)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 16, textAlign: 'center' },
  header: { padding: 24, alignItems: 'center', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { margin: 24, padding: 24, borderRadius: 16, backgroundColor: '#fff', elevation: 3 },
  profileContainer: { alignItems: 'center', marginBottom: 24 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#41BFB2' },
  profileBadge: { position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { width: '100%' },
  infoRow: { flexDirection: 'row', marginBottom: 12 },
  infoLabel: { width: 140, fontWeight: '600' },
  infoValue: { flex: 1 },
  footer: { flexDirection: 'row', padding: 24, gap: 12, borderTopWidth: 1, borderColor: '#eee' },
  button: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, justifyContent: 'center' },
  secondaryButton: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#41BFB2' },
  cancelButton: { flex: 1, backgroundColor: '#D61727' },
  primaryButton: { flex: 2, backgroundColor: '#41BFB2' },
  buttonText: { color: '#fff', fontWeight: '600' },
});