// app/(client)/pagos/[id]/realizar.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createPago } from '@/src/services/PagoApi';

export default function RealizarPago() {
  const router = useRouter();
  const { 
    reserva, 
    montoTotalIncluye, 
    primeraVez, 
    tipoPagoElegido 
  } = useLocalSearchParams();

  // Parsear parámetros
  const reservaObj = reserva ? JSON.parse(reserva as string) : null;
  const montoTotal = montoTotalIncluye ? parseFloat(montoTotalIncluye as string) : 0;
  const primeraVezBool = primeraVez === 'true';
  const tipoCongelado = tipoPagoElegido || null;

  // Estados
  const [reservaState, setReservaState] = useState(reservaObj);
  const [montoTotalIncluyeState, setMontoTotalIncluyeState] = useState(montoTotal);
  const [primeraVezState, setPrimeraVezState] = useState(primeraVezBool);
  const [tipoCongeladoState, setTipoCongeladoState] = useState(tipoCongelado);

  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<string | null>(null);
  const [monto, setMonto] = useState<string>('');
  const [cuotasElegidas, setCuotasElegidas] = useState<number | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [procesando, setProcesando] = useState(false);

  // Ref para primeraVez
  const primeraVezRef = useRef(primeraVezBool);

  // Colores
  const COLORS = {
    pb6: '#FFFFFF',
    pb5: '#41BFB2',
    pb3: '#F28627',
    pb1: '#D61727',
    pb4: '#F2EFEB',
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
  };

  // Limpiar estados del formulario
  const limpiarEstados = () => {
    setTipoSeleccionado(null);
    setMetodo(null);
    setMonto('');
    setCuotasElegidas(null);
    setAceptaTerminos(false);
    setProcesando(false);
  };

  // Validar reserva
  useEffect(() => {
    if (!reservaState) {
      Alert.alert('Error', 'No se encontró la reserva');
      router.replace('/client');
    }
  }, [reservaState, router]);

  // Reiniciar formulario cada vez que cambian los parámetros de reserva
  useEffect(() => {
    // Al cambiar los parámetros (vienen en los params) reiniciamos los campos
    limpiarEstados();
    // Restablecer estados derivados de los params
    setReservaState(reservaObj);
    setMontoTotalIncluyeState(montoTotal);
    setPrimeraVezState(primeraVezBool);
    primeraVezRef.current = primeraVezBool;
    setTipoCongeladoState(tipoCongelado);
  }, [reserva, montoTotalIncluye, primeraVez, tipoPagoElegido]);

  // Calcular datos
  const totalIncluye = montoTotalIncluyeState || reservaState?.total || 0;
  const totalPagado = reservaState?.totalPagado || 0;
  const saldoPendiente = Math.max(0, totalIncluye - totalPagado);
  
  // Calcular horas restantes
  const horasRestantes = () => {
    if (!reservaState?.fechaReserva || !reservaState.horaInicio) return 9999;
    try {
      const fecha = reservaState.fechaReserva;
      const hora = reservaState.horaInicio.slice(0, 5);
      const fechaHora = new Date(`${fecha}T${hora}:00`);
      const diffMs = fechaHora.getTime() - new Date().getTime();
      return diffMs / (1000 * 60 * 60);
    } catch (e) {
      return 9999;
    }
  };
  
  const puedeEfectivo = horasRestantes() <= 12;

  // Efecto para tipo congelado
  useEffect(() => {
    if (tipoCongeladoState) {
      setTipoSeleccionado(tipoCongeladoState);
      if (tipoCongeladoState === 'PARCIAL' && reservaState?.cuotas) {
        setCuotasElegidas(reservaState.cuotas);
      }
    }
  }, [tipoCongeladoState, reservaState]);

  // Funciones de selección
  const seleccionarTipo = (tipo: string) => {
    setTipoSeleccionado(tipo);
    setTipoCongeladoState(tipo);

    if (tipo === 'TOTAL') {
      setMonto(saldoPendiente.toFixed(2));
    } else if (tipo === 'ANTICIPO') {
      const mitad = saldoPendiente >= totalIncluye / 2 ? totalIncluye / 2 : saldoPendiente;
      setMonto(mitad.toFixed(2));
    } else {
      setMonto('');
    }
  };

  const seleccionarCuotas = (n: number) => {
    setCuotasElegidas(n);
    const cuotaMonto = Math.floor((totalIncluye / n) * 100) / 100;
    setMonto(cuotaMonto.toFixed(2));
  };

  // Validar monto
  const validarMonto = () => {
    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      return 'El monto debe ser mayor a 0';
    }
    if (numMonto > saldoPendiente) {
      return 'El monto no puede ser mayor al saldo pendiente';
    }
    if ((tipoSeleccionado === 'TOTAL' || tipoCongeladoState === 'TOTAL') && primeraVezRef.current) {
      if (Math.abs(numMonto - saldoPendiente) > 0.01) {
        return 'Para pago total, el monto debe ser igual al saldo pendiente';
      }
    }
    if ((tipoSeleccionado === 'ANTICIPO' || tipoCongeladoState === 'ANTICIPO') && primeraVezRef.current) {
      const mitad = totalIncluye / 2;
      if (Math.abs(numMonto - mitad) > 0.01) {
        return `El anticipo debe ser la mitad del total: ${mitad.toFixed(2)}`;
      }
    }
    return null;
  };

  // Generar código de transacción
  const generarCodigoTransaccion = (idReserva: number, clienteId: number) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${idReserva}-${clienteId}-${timestamp}${random}`;
  };

  // Crear pago
  const handleCrearPago = async () => {
    if (!tipoSeleccionado && !tipoCongeladoState) {
      Alert.alert('Advertencia', 'Debes seleccionar un tipo de pago');
      return;
    }
    
    const errorMonto = validarMonto();
    if (errorMonto) {
      Alert.alert('Error', errorMonto);
      return;
    }
    
    if (!metodo) {
      Alert.alert('Advertencia', 'Selecciona un método de pago');
      return;
    }
    
    if (!aceptaTerminos) {
      Alert.alert('Advertencia', 'Debes aceptar los términos y condiciones');
      return;
    }

    setProcesando(true);

    try {
      const codigo = generarCodigoTransaccion(reservaState.idReserva, reservaState.clienteId);
      const tipoAUsar = primeraVezRef.current 
        ? tipoSeleccionado || tipoCongeladoState 
        : tipoCongeladoState || tipoSeleccionado;

      const payload = {
        monto: parseFloat(monto),
        metodoPago: metodo === 'TARJETA' ? 'TARJETA_CREDITO' : metodo === 'QR' ? 'QR' : 'EFECTIVO',
        tipoPago: tipoAUsar,
        estado: 'PENDIENTE',
        fecha: new Date().toISOString().split('T')[0],
        descripcion: `Pago ${tipoAUsar} - Reserva #${reservaState.idReserva}`,
        codigoTransaccion: codigo,
        idReserva: reservaState.idReserva,
        clienteId: reservaState.clienteId,
        cuotas: cuotasElegidas || 1,
      };

      console.log('ENVIANDO AL BACKEND:', payload);

      // ✅ LLAMAR AL BACKEND PARA CREAR EL PAGO
      const pagoCreado = await createPago(payload);
      console.log('PAGO CREADO:', pagoCreado);

      // Usar el ID devuelto por el backend
      const pagoId = pagoCreado.idPago || pagoCreado.id;
      
      // Navegar según método
      if (metodo === 'QR') {
        router.replace({
          pathname: '/client/pagos/metodoqr',
          params: {
            pagoId: pagoId.toString(),
            codigoTransaccion: codigo,
            monto: monto,
            reservaId: reservaState.idReserva.toString(),
          },
        });
      } else if (metodo === 'TARJETA') {
        router.push({
          pathname: '/client/pagos/metodotarjeta',
          params: {
            pagoId: pagoId.toString(),
            codigoTransaccion: codigo,
            monto: monto,
            reservaId: reservaState.idReserva.toString(),
          },
        });
      } else {
        Alert.alert('Éxito', 'Pago en efectivo registrado');
        router.replace('/client/reservas');
      }

      // Actualizar primeraVez si es necesario
      if (primeraVezRef.current) {
        setTipoCongeladoState(tipoAUsar);
        primeraVezRef.current = false;
        setPrimeraVezState(false);
      }

    } catch (error) {
      console.error('Error al crear pago:', error);
      Alert.alert('Error', 'No se pudo procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  if (!reservaState) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>Realizar pago</Text>
        <Text style={[styles.subtitle, { color: COLORS.grayMedium }]}>
          Reserva #{reservaState.idReserva}
        </Text>
      </View>

      {/* Resumen de saldos */}
      <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
        <View style={styles.saldosRow}>
          <View style={styles.saldoItem}>
            <Text style={[styles.saldoLabel, { color: COLORS.grayMedium }]}>Total</Text>
            <Text style={[styles.saldoValue, { color: COLORS.pb5 }]}>
              {totalIncluye.toFixed(2)}
            </Text>
          </View>
          <View style={styles.saldoItem}>
            <Text style={[styles.saldoLabel, { color: COLORS.grayMedium }]}>Pagado</Text>
            <Text style={[styles.saldoValue, { color: COLORS.pb1 }]}>
              {totalPagado.toFixed(2)}
            </Text>
          </View>
          <View style={styles.saldoItem}>
            <Text style={[styles.saldoLabel, { color: COLORS.grayMedium }]}>Saldo</Text>
            <Text
              style={[
                styles.saldoValue,
                { color: saldoPendiente > 0 ? COLORS.pb3 : COLORS.pb5 },
              ]}
            >
              {saldoPendiente.toFixed(2)}
            </Text>
          </View>
        </View>
        <Text style={[styles.horasText, { color: COLORS.grayMedium }]}>
          Horas restantes: {horasRestantes().toFixed(1)}
        </Text>
      </View>

      {/* Tipo de pago fijado */}
      {!primeraVezState && tipoCongeladoState && (
        <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
          <Text style={[styles.sectionLabel, { color: COLORS.grayMedium }]}>
            Tipo de pago fijado
          </Text>
          <Text style={[styles.sectionValue, { color: COLORS.pb5 }]}>
            {tipoCongeladoState}
          </Text>
        </View>
      )}

      {/* Selección tipo (primera vez) */}
      {primeraVezState && !tipoCongeladoState && (
        <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
            Selecciona el tipo de pago (solo la primera vez)
          </Text>
          <View style={styles.tipoGrid}>
            {[
              { label: 'Total', value: 'TOTAL' },
              { label: 'Anticipo\n(Mitad)', value: 'ANTICIPO' },
              { label: 'Parcial', value: 'PARCIAL' },
            ].map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => seleccionarTipo(item.value)}
                style={[
                  styles.tipoButton,
                  tipoSeleccionado === item.value && { backgroundColor: COLORS.pb5 },
                ]}
              >
                <Text
                  style={[
                    styles.tipoText,
                    { color: tipoSeleccionado === item.value ? COLORS.white : COLORS.grayDark },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Monto a pagar */}
      {(tipoSeleccionado || tipoCongeladoState) && (
        <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
            Monto a pagar
          </Text>

          {((primeraVezState && tipoSeleccionado === 'PARCIAL') || 
            (!primeraVezState && tipoCongeladoState === 'PARCIAL')) && (
            <View style={styles.cuotasContainer}>
              <Text style={[styles.cuotasLabel, { color: COLORS.grayMedium }]}>
                Opcional: elige cuotas (3, 4 o 5)
              </Text>
              <View style={styles.cuotasRow}>
                {[3, 4, 5].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => seleccionarCuotas(c)}
                    style={[
                      styles.cuotaButton,
                      cuotasElegidas === c && { backgroundColor: COLORS.pb5 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cuotaText,
                        { color: cuotasElegidas === c ? COLORS.white : COLORS.grayDark },
                      ]}
                    >
                      {c} cuotas
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TextInput
            value={monto}
            onChangeText={(value) => {
              setMonto(value);
              if (tipoSeleccionado === 'PARCIAL') setCuotasElegidas(null);
            }}
            placeholder="Ingresa el monto"
            keyboardType="decimal-pad"
            style={[styles.input, { color: COLORS.grayDark }]}
          />
          <Text style={[styles.montoMax, { color: COLORS.grayMedium }]}>
            Máximo: {saldoPendiente.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Método de pago */}
      {(tipoSeleccionado || tipoCongeladoState) && (
        <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.grayDark }]}>
            Método de pago
          </Text>
          <View style={styles.metodoGrid}>
            {[
              { id: 'QR', icon: 'qr-code', label: 'QR' },
              { id: 'TARJETA', icon: 'card', label: 'Tarjeta' },
              { id: 'EFECTIVO', icon: 'cash', label: 'Efectivo', disabled: !puedeEfectivo },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => !item.disabled && setMetodo(item.id)}
                disabled={item.disabled}
                style={[
                  styles.metodoButton,
                  metodo === item.id && { backgroundColor: COLORS.pb5 },
                  item.disabled && { opacity: 0.5 },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={metodo === item.id ? COLORS.white : COLORS.grayDark}
                />
                <Text
                  style={[
                    styles.metodoText,
                    { color: metodo === item.id ? COLORS.white : COLORS.grayDark },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Términos y condiciones */}
      {metodo && (
        <View style={styles.terminosContainer}>
          <TouchableOpacity onPress={() => setAceptaTerminos(!aceptaTerminos)}>
            <View style={styles.checkbox}>
              {aceptaTerminos && <Ionicons name="checkmark" size={16} color={COLORS.pb5} />}
            </View>
          </TouchableOpacity>
          <Text style={[styles.terminosText, { color: COLORS.grayMedium }]}>
            <Text style={{ fontWeight: '600' }}>Términos y condiciones</Text>
            {'\n'}Acepto que este pago se procesa según la política de la reserva y es vinculante.
          </Text>
        </View>
      )}

      {/* Botones */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: COLORS.pb1 }]}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text style={[styles.buttonText, { color: COLORS.white }]}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCrearPago}
          disabled={procesando || !aceptaTerminos}
          style={[
            styles.button,
            {
              backgroundColor: procesando || !aceptaTerminos ? COLORS.grayLight : COLORS.pb5,
            },
          ]}
        >
          {procesando ? (
            <Text style={[styles.buttonText, { color: COLORS.grayDark }]}>Procesando...</Text>
          ) : (
            <Text style={[styles.buttonText, { color: COLORS.white }]}>Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
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
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saldosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  saldoItem: {
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  saldoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  horasText: {
    fontSize: 12,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  tipoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tipoButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  tipoText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  cuotasContainer: {
    marginBottom: 12,
  },
  cuotasLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  cuotasRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cuotaButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  cuotaText: {
    fontSize: 12,
    fontFamily: 'Inter',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  montoMax: {
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  metodoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metodoButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  metodoText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  terminosContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  terminosText: {
    fontSize: 14,
    fontFamily: 'Inter',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});