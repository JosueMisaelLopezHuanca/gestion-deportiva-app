import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { qrService } from '../../services/qrService';

const FRONT_URL = "http://192.168.1.10:3000"; 

export default function QrScreen() {
  const router = useRouter();
  const { userData } = useAuth();
  const { idReserva } = useLocalSearchParams();

  const [qrData, setQrData] = useState(null);
  const [qrImageBase64, setQrImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Cargando...");

  useEffect(() => {
    const cargarTodo = async () => {
      if (!idReserva) return;

      try {
        setLoading(true);
        setLoadingText("Buscando reserva...");

        const qrs = await qrService.getQrsByReserva(idReserva);
        let miQR = qrs?.find(qr => qr.idPersona === userData?.idPersona) || qrs?.[0];
        if (!miQR) {
          Alert.alert("Aviso","No se encontraron códigos QR.");
          setLoading(false);
          return;
        }
        setQrData(miQR);

        if (miQR.codigoQr) {
          setLoadingText("Descargando imagen...");
          const blob = await qrService.getQrImage(miQR.codigoQr);
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            setQrImageBase64(reader.result);
            setLoading(false);
          };
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error","No se pudo cargar el código QR.");
        setLoading(false);
      }
    };
    cargarTodo();
  }, [idReserva, userData]);

  const handleShareLink = async () => {
    if (!qrData?.codigoQr) return;
    const linkWeb = `${FRONT_URL}/qr-publico/${qrData.idReserva}/${qrData.codigoQr.replace('.png','')}`;
    try { await Share.share({ message:`Mi pase de acceso: ${linkWeb}`, url: linkWeb }); } 
    catch (err) { console.log(err); }
  };

  const formatearFecha = f => f ? new Date(f).toLocaleString() : '--';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#666" />
      </TouchableOpacity>

      <Text style={styles.mainTitle}>Tu Código QR</Text>

      <View style={styles.card}>
        <View style={styles.qrWrapper}>
          {loading ? (
            <View style={{alignItems:'center'}}>
              <ActivityIndicator size="large" color="#41bfb2"/>
              <Text style={{marginTop:10,color:'#888'}}>{loadingText}</Text>
            </View>
          ) : qrImageBase64 ? (
            <Image source={{uri:qrImageBase64}} style={{width:250,height:250}} resizeMode="contain"/>
          ) : (
            <View style={{alignItems:'center'}}>
              <Ionicons name="alert-circle-outline" size={40} color="red"/>
              <Text style={{color:'red'}}>Imagen no disponible</Text>
            </View>
          )}
        </View>

        <Text style={styles.reservaLabel}>Reserva #{idReserva}</Text>
        <Text style={styles.descripcionText}>{qrData?.descripcion}</Text>
        <Text style={styles.expiryText}>Vence: {formatearFecha(qrData?.fechaExpiracion)}</Text>

        <TouchableOpacity style={styles.actionButton} onPress={handleShareLink}>
          <Text style={styles.actionButtonText}>Compartir Enlace</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0f1213', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  closeButton: { position:'absolute', top:50, right:25, zIndex:10, backgroundColor:'rgba(255,255,255,0.1)', borderRadius:20, padding:5 },
  mainTitle: { color:'white', fontSize:28, fontWeight:'bold', marginBottom:30 },
  card: { backgroundColor:'#181c1d', borderRadius:24, width:'100%', maxWidth:360, padding:25, alignItems:'center', elevation:10 },
  qrWrapper: { backgroundColor:'white', padding:15, borderRadius:20, marginBottom:20, justifyContent:'center', alignItems:'center', minHeight:250, minWidth:250 },
  reservaLabel: { color:'#888', fontSize:14, marginBottom:5 },
  descripcionText: { color:'white', fontSize:16, fontWeight:'600', textAlign:'center', marginBottom:5, paddingHorizontal:10 },
  expiryText: { color:'#666', fontSize:12, marginBottom:25 },
  actionButton: { backgroundColor:'#2C7366', width:'100%', paddingVertical:14, borderRadius:16, alignItems:'center' },
  actionButtonText: { color:'white', fontSize:16, fontWeight:'bold' },
});
