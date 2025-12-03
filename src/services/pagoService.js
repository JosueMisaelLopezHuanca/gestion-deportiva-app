import axiosInstance from '../api/axiosConfig';

const crearPago = async (pagoData) => {
  try {
    const response = await axiosInstance.post('/pagos', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error crearPago:', error);
    throw error;
  }
};

const confirmarPago = async (idPago, codigoTransaccion) => {
  try {
    const response = await axiosInstance.post(`/pagos/${idPago}/confirmar`, {
      codigoTransaccion
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ▼▼▼ NUEVA FUNCIÓN CRÍTICA ▼▼▼
const obtenerSaldoPendiente = async (idReserva) => {
  try {
    // Llama a tu endpoint: @GetMapping("/reserva/{idReserva}/saldo-pendiente")
    const response = await axiosInstance.get(`/pagos/reserva/${idReserva}/saldo-pendiente`);
    // Tu backend devuelve { "saldoPendiente": 50.0, ... }
    return response.data.saldoPendiente;
  } catch (error) {
    console.error("Error obteniendo saldo:", error);
    throw error;
  }
};

export const pagoService = {
  crearPago,
  confirmarPago,
  obtenerSaldoPendiente, 
};