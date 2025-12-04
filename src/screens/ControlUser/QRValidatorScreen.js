// src/screens/ControlUser/QRValidatorScreen.js
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { qrService } from '../../services/qrService';
import { reservaService } from '../../services/reservaService';

export default function QRValidatorScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Estado persistente para capacidad, independiente del resultado actual
  const [capacityInfo, setCapacityInfo] = useState({ capacidadMaxima: null, vecesEscaneado: null });

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
      const qrData = JSON.parse(data);
      // Cargar detalle completo de la reserva para mostrar capacidad y datos enriquecidos
      if (qrData?.reservaId) {
        try {
          const reservaCompleta = await reservaService.getReservaById(qrData.reservaId);
          // Prefijar capacidad desde cancha o capacidadTotal
          const capacidadMaxima = reservaCompleta?.cancha?.capacidad ?? reservaCompleta?.capacidadTotal ?? null;
          setCapacityInfo((prev) => ({
            capacidadMaxima: typeof capacidadMaxima === 'number' ? capacidadMaxima : prev.capacidadMaxima,
            vecesEscaneado: prev.vecesEscaneado, // se actualizará tras validar
          }));
          // Mezclar datos de QR y reserva completa
          setResult({
            ...qrData,
            scannedData: data,
            needsValidation: true,
            reservaDetallada: reservaCompleta,
            nombreReservador:
              `${reservaCompleta?.cliente?.nombre || ''} ${reservaCompleta?.cliente?.apellidoPaterno || ''} ${reservaCompleta?.cliente?.apellidoMaterno || ''}`.trim() || qrData.nombreReservador,
            nombreCancha: reservaCompleta?.cancha?.nombre || qrData.nombreCancha,
            fechaReserva: reservaCompleta?.fechaReserva || qrData.fechaReserva,
            horaInicio: reservaCompleta?.horaInicio || qrData.horaInicio,
            horaFin: reservaCompleta?.horaFin || qrData.horaFin,
            montoTotal: reservaCompleta?.totalPagado ?? qrData.montoTotal,
          });
        } catch (err) {
          // Si falla la carga detallada, seguir con datos básicos del QR
          setResult({ ...qrData, scannedData: data, needsValidation: true });
        }
      } else {
        setResult({ ...qrData, scannedData: data, needsValidation: true });
      }
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
      const qrs = await qrService.getQrsPorReserva(result.reservaId);
      if (!qrs || qrs.length === 0) {
        setError('No se encontraron QRs para esta reserva');
        setLoading(false);
        return;
      }
      
      const codigo = qrs[0].codigoQr.replace('.png', '');
      const validationResult = await qrService.validarQR(codigo);
      
      setResult({ ...result, ...validationResult, validated: true, needsValidation: false });
      // Guardar capacidad para mostrar banner aun cuando volvamos a abrir la cámara
      setCapacityInfo({
        capacidadMaxima: validationResult.capacidadMaxima ?? validationResult.capacidad ?? null,
        vecesEscaneado: typeof validationResult.vecesEscaneado === 'number' ? validationResult.vecesEscaneado : null,
      });
    } catch (e) {
      setError('Error al validar QR: ' + (e.response?.data?.mensaje || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#41BFB3" />
        <Text style={styles.permissionText}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#94A3B8" />
        <Text style={styles.permissionTitle}>Acceso a la Cámara</Text>
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara para escanear códigos QR
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {!scanned && (
        <>
          {/* Banner superior con capacidad restante, si se conoce */}
          {capacityInfo.capacidadMaxima && typeof capacityInfo.vecesEscaneado === 'number' && (
            <View style={styles.topCapacityBanner}>
              {capacityInfo.vecesEscaneado >= capacityInfo.capacidadMaxima ? (
                <Text style={styles.topCapacityText}>ya se escaneo toda la capacidad de las canchas</Text>
              ) : (
                <Text style={styles.topCapacityText}>
                  Quedan <Text style={styles.topCapacityNumber}>{capacityInfo.capacidadMaxima - capacityInfo.vecesEscaneado}</Text> escaneos disponibles
                </Text>
              )}
            </View>
          )}
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Apunta al código QR de la reserva</Text>
          </View>
        </>
      )}
      
      {scanned && (
        <ScrollView 
          style={styles.resultsContainer}
          contentContainerStyle={styles.resultsContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#41BFB3" />
              <Text style={styles.loadingText}>Validando...</Text>
            </View>
          )}
          
          {error && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle" size={48} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          {result && !loading && (
            <>
              {/* Estado de validación */}
              {result.validated && (
                <View style={[
                  styles.statusCard,
                  result.valido ? styles.statusSuccess : styles.statusError
                ]}>
                  {/* Mensaje principal más notorio: escaneos restantes */}
                  {(() => {
                    const isSameDay = (dateStr) => {
                      if (!dateStr) return false;
                      try {
                        const d = new Date(dateStr);
                        const now = new Date();
                        return d.getFullYear() === now.getFullYear() &&
                               d.getMonth() === now.getMonth() &&
                               d.getDate() === now.getDate();
                      } catch (_) { return false; }
                    };

                    const capMax = capacityInfo.capacidadMaxima ?? result.capacidadMaxima ?? result.capacidad;
                    const escaneos = typeof result.vecesEscaneado === 'number' ? result.vecesEscaneado : capacityInfo.vecesEscaneado;

                    // Mostrar mensaje del backend si está disponible
                    if (result.mensaje) {
                      return (
                        <Text style={styles.statusRemainingEmphasis}>
                          {result.mensaje}
                        </Text>
                      );
                    }

                    if (!result.valido) {
                      // Mensaje claro si la reserva no es para hoy
                      if (!isSameDay(result.fechaReserva)) {
                        return (
                          <Text style={styles.statusMessage}>
                            hoy no es el día de tu reserva, no se pueden validar QRs
                          </Text>
                        );
                      }
                      return (
                        <Text style={styles.statusMessage}>
                          todos los qrs ya fueron usados para la capacidad de la cancha
                        </Text>
                      );
                    }

                    if (typeof capMax === 'number' && typeof escaneos === 'number') {
                      const restantes = Math.max(capMax - escaneos, 0);
                      return (
                        <Text style={styles.statusRemainingEmphasis}>
                          {restantes > 0 
                            ? `Quedan ${restantes} escaneos disponibles`
                            : 'ya se escaneo toda la capacidad de las canchas'}
                        </Text>
                      );
                    }

                    return (
                      <Text style={styles.statusMessage}>
                        {result.valido ? 'Acceso permitido' : 'Acceso denegado'}
                      </Text>
                    );
                  })()}
                </View>
              )}

              {/* Información de capacidad de la cancha */}
              {result.validated && result.capacidadMaxima && (
                <View style={styles.capacityInfoCard}>
                  <View style={styles.capacityInfoHeader}>
                    <Ionicons name="information-circle" size={28} color="#41BFB3" />
                    <Text style={styles.capacityInfoTitle}>Capacidad de la Cancha</Text>
                  </View>
                  <Text style={styles.capacityInfoText}>
                    Esta cancha cuenta con una capacidad máxima de{' '}
                    <Text style={styles.capacityInfoNumber}>{result.capacidadMaxima}</Text> personas
                  </Text>
                </View>
              )}

              {/* Contador de capacidad */}
              {result.validated && result.capacidadMaxima && result.vecesEscaneado !== undefined && (
                <View style={styles.capacityCard}>
                  <View style={styles.capacityHeader}>
                    <Ionicons name="people" size={24} color="#41BFB3" />
                    <Text style={styles.capacityTitle}>Ocupación Actual</Text>
                  </View>
                  
                  <View style={styles.capacityStats}>
                    <Text style={styles.capacityNumber}>{result.vecesEscaneado}</Text>
                    <Text style={styles.capacitySeparator}>/</Text>
                    <Text style={styles.capacityTotal}>{result.capacidadMaxima}</Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { 
                          width: `${Math.min((result.vecesEscaneado / result.capacidadMaxima) * 100, 100)}%`,
                          backgroundColor: result.vecesEscaneado >= result.capacidadMaxima ? '#EF4444' : '#41BFB3'
                        }
                      ]} 
                    />
                  </View>
                  
                  {result.capacidadMaxima - result.vecesEscaneado > 0 ? (
                    <Text style={styles.capacityLabel}>
                      Quedan <Text style={styles.capacityRemainingNumber}>
                        {result.capacidadMaxima - result.vecesEscaneado}
                      </Text> escaneos disponibles
                    </Text>
                  ) : (
                    <Text style={styles.capacityLabel}>
                      ⚠️ ya se escaneo toda la capacidad de las canchas
                    </Text>
                  )}
                </View>
              )}

              {/* Información de la reserva */}
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Información de la Reserva</Text>
                
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Reservador</Text>
                    <Text style={styles.infoValue}>
                      {result.nombreReservador || result.nombrePersona || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                {/* COMENTADO TEMPORALMENTE - Campo de Participante
                <View style={styles.infoRow}>
                  <Ionicons name="people" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Participante</Text>
                    <Text style={styles.infoValue}>
                      {result.nombreParticipante || 'Invitado'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />
                */}

                <View style={styles.infoRow}>
                  <Ionicons name="basketball" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Cancha</Text>
                    <Text style={styles.infoValue}>
                      {result.nombreCancha || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Fecha</Text>
                    <Text style={styles.infoValue}>
                      {result.fechaReserva || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Horario</Text>
                    <Text style={styles.infoValue}>
                      {result.horaInicio} - {result.horaFin}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Monto</Text>
                    <Text style={styles.infoValue}>
                      {result.montoTotal} Bs
                    </Text>
                  </View>
                </View>

                <View style={styles.infoDivider} />

                {/*
                <View style={styles.infoRow}>
                  <Ionicons name="receipt" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>N° Reserva</Text>
                    <Text style={styles.infoValue}>
                      #{result.reservaId || result.idReserva}
                    </Text>
                  </View>
                </View>
                */}

                {/* Disciplina */}
                {result.reservaDetallada?.disciplina && (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <Ionicons name="fitness" size={20} color="#64748B" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Disciplina</Text>
                        <Text style={styles.infoValue}>
                          {result.reservaDetallada.disciplina.nombre}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* Pagos */}
                {Array.isArray(result.reservaDetallada?.pagos) && result.reservaDetallada.pagos.length > 0 && (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <Ionicons name="card" size={20} color="#64748B" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Pagos</Text>
                        {result.reservaDetallada.pagos.map((pago, idx) => (
                          <View key={`${pago.idPago}-${idx}`} style={{ marginBottom: 8 }}>
                            <Text style={styles.infoValue}>
                              {`${pago.tipoPago} - ${pago.estado} (${pago.monto} Bs)`}
                            </Text>
                            {pago.metodoPago && (
                              <Text style={styles.infoValue}>
                                {`Método: ${pago.metodoPago}`}
                              </Text>
                            )}
                            {pago.codigoTransaccion && (
                              <Text style={styles.infoValue}>
                                {`Transacción: ${pago.codigoTransaccion}`}
                              </Text>
                            )}
                            {pago.fecha && (
                              <Text style={styles.infoValue}>
                                {`Fecha: ${pago.fecha}`}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Botones de acción */}
              <View style={styles.actionsContainer}>
                {result.needsValidation && !loading && (
                  <TouchableOpacity 
                    style={styles.validateButton} 
                    onPress={handleValidate}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                    <Text style={styles.validateButtonText}>Validar Acceso</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.scanButton} 
                  onPress={() => { 
                    setScanned(false); 
                    setResult(null); // Preservamos capacityInfo para el banner superior
                    setError(null); 
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={24} color="#41BFB3" />
                  <Text style={styles.scanButtonText}>Escanear Otro QR</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topCapacityBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(65,191,179,0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCapacityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  topCapacityNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#41BFB3',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F8FAFC',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#41BFB3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#41BFB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 16,
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '600',
    lineHeight: 24,
  },
  statusCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statusSuccess: {
    backgroundColor: '#10B981',
  },
  statusError: {
    backgroundColor: '#EF4444',
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.95,
  },
  capacityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#E0F2F1',
  },
  capacityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center',
  },
  capacityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  capacityStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  capacityNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#41BFB3',
  },
  capacitySeparator: {
    fontSize: 40,
    fontWeight: '700',
    color: '#CBD5E1',
    marginHorizontal: 8,
  },
  capacityTotal: {
    fontSize: 40,
    fontWeight: '700',
    color: '#94A3B8',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  capacityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  capacityRemainingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#41BFB3',
  },
  capacityInfoCard: {
    backgroundColor: '#E0F7F4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#41BFB3',
  },
  capacityInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  capacityInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 8,
  },
  capacityInfoText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  capacityInfoNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#41BFB3',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  validateButton: {
    backgroundColor: '#41BFB3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#41BFB3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#41BFB3',
  },
  scanButtonText: {
    color: '#41BFB3',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
});
