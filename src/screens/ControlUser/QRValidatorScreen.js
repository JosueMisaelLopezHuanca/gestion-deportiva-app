// src/screens/ControlUser/QRValidatorScreen.js
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { qrService } from '../../services/qrService';

export default function QRValidatorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setLoading(false);
    setError(null);
    setResult(null);
    
    try {
      // El QR del cliente contiene un JSON con la info de la reserva
      const qrData = JSON.parse(data);
      setResult({ ...qrData, scannedData: data, needsValidation: true });
    } catch (e) {
      setError('QR inválido: no contiene información de reserva');
    }
  };

  const handleValidate = async () => {
    if (!result || !result.reservaId) {
      setError('No hay información de reserva para validar');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Obtener los QRs de la reserva para extraer el código
      const qrs = await qrService.getQrsPorReserva(result.reservaId);
      if (!qrs || qrs.length === 0) {
        setError('No se encontraron QRs para esta reserva');
        setLoading(false);
        return;
      }
      
      // Usar el primer QR (código sin .png)
      const codigo = qrs[0].codigoQr.replace('.png', '');
      const validationResult = await qrService.validarQR(codigo);
      
      setResult({ ...result, ...validationResult, validated: true, needsValidation: false });
    } catch (e) {
      setError('Error al validar QR: ' + (e.response?.data?.mensaje || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.center}><Text>Solicitando permiso de cámara...</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 10 }}>Necesitamos acceso a la cámara para escanear QR</Text>
        <Button title="Solicitar permiso" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!scanned && (
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}
      {scanned && (
        <View style={styles.center}>
          {loading && <ActivityIndicator size="large" />}
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
          {result && (
            <View style={styles.resultBox}>
              {result.validated && (
                <Text style={styles.resultTitle}>{result.valido ? '✅ Acceso permitido' : '❌ Acceso denegado'}</Text>
              )}
              {result.validated && result.mensaje && (
                <Text style={styles.resultText}>{result.mensaje}</Text>
              )}
              <Text style={styles.resultText}>Reservador: {result.nombreReservador || result.nombrePersona || '—'}</Text>
              <Text style={styles.resultText}>Participante: {result.nombreParticipante || '—'}</Text>
              <Text style={styles.resultText}>Cancha: {result.nombreCancha || '—'}</Text>
              <Text style={styles.resultText}>Fecha: {result.fechaReserva || '—'}</Text>
              <Text style={styles.resultText}>Horario: {result.horaInicio} - {result.horaFin}</Text>
              <Text style={styles.resultText}>Monto: {result.montoTotal} Bs</Text>
              <Text style={styles.resultText}>Reserva: #{result.reservaId || result.idReserva}</Text>
              
              {result.needsValidation && !loading && (
                <Button title="Validar" onPress={handleValidate} color="#41BFB3" />
              )}
            </View>
          )}
          {!loading && (
            <Button title="Escanear otro QR" onPress={() => { setScanned(false); setResult(null); setError(null); }} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  resultBox: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  resultTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  resultText: { fontSize: 15, marginBottom: 4 },
});
