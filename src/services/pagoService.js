// src/services/pagoService.js
import axiosInstance from '../api/axiosConfig';
// ❌ QUITA ESTO: import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Crea un nuevo registro de pago para una reserva.
 * Llama a: POST /api/pagos
 */
const crearPago = async (pagoData) => {
  try {
    console.log('🔵 [pagoService] Iniciando creación de pago...');
    console.log('📦 Datos del pago:', JSON.stringify(pagoData, null, 2));
    
    // ✅ ELIMINA esta parte - el interceptor ya maneja el token
    // const token = await AsyncStorage.getItem('userToken');
    // console.log('🔑 Token disponible:', token ? 'SÍ' : 'NO');
    
    console.log('🌐 URL destino:', '/pagos');
    
    const response = await axiosInstance.post('/pagos', pagoData);
    
    console.log('✅ [pagoService] Pago creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [pagoService] Error al crear el pago:');
    console.error('📊 Status:', error.response?.status);
    console.error('📝 Mensaje:', error.response?.data);
    console.error('🔍 Detalles completos:', error);
    throw error;
  }
};

/**
 * Confirma un pago existente
 */
const confirmarPago = async (idPago, codigoTransaccion) => {
  try {
    console.log('🔵 [pagoService] Confirmando pago...');
    
    const response = await axiosInstance.post(`/pagos/${idPago}/confirmar`, {
      codigoTransaccion
    });
    
    console.log('✅ [pagoService] Pago confirmado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ [pagoService] Error al confirmar pago:');
    console.error('📊 Status:', error.response?.status);
    console.error('📝 Mensaje:', error.response?.data);
    throw error;
  }
};

export const pagoService = {
  crearPago,
  confirmarPago,
};