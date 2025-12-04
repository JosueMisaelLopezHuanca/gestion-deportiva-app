import axiosInstance from '../api/axiosConfig';

// Función existente
const getQrsByReserva = async (idReserva) => {
  try {
    console.log(' [qrService] Obteniendo QRs para reserva:', idReserva);
    const response = await axiosInstance.get(`/qr/reserva/${idReserva}`);
    console.log(' [qrService] QRs obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error(' [qrService] Error al obtener QRs:');
    console.error(' Status:', error.response?.status);
    console.error(' Mensaje:', error.response?.data);
    throw error;
  }
};

// Función existente
const generarQR = async (idReserva, idPersona) => {
  try {
    console.log(' [qrService] Generando QR...');
    const response = await axiosInstance.post(`/qr/reserva/${idReserva}/generar?idPersona=${idPersona}`);
    console.log(' [qrService] QR generado:', response.data);
    return response.data;
  } catch (error) {
    console.error(' [qrService] Error al generar QR:');
    console.error(' Status:', error.response?.status);
    console.error(' Mensaje:', error.response?.data);
    throw error;
  }
};

// ---------------------------------------------------------
// BLOQUE DE LA RAMA LOGIN
// ---------------------------------------------------------
const getQrImage = async (codigoQr) => {
  try {
    console.log('[qrService] Descargando imagen:', codigoQr);
    // Pedimos 'blob' para recibir la imagen como archivo binario
    const response = await axiosInstance.get(`/qr/qrs/${codigoQr}`, {
      responseType: 'blob' 
    });  
    return response.data; // Retorna el Blob
  } catch (error) {
    console.error(' [qrService] Error descargando imagen:', error);
    throw error;
  }
};

// ---------------------------------------------------------
// BLOQUE DE LA RAMA MAIN (Karen)
// ---------------------------------------------------------

// NUEVA FUNCIÓN: Validar QR
const validarQR = async (codigo) => {
  try {
    console.log(' [qrService] Validando QR...');
    const response = await axiosInstance.post(`/qr/validar`, { codigo });
    console.log(' [qrService] Resultado validación:', response.data);
    return response.data; // {valido: true/false, mensaje: "...", ...}
  } catch (error) {
    console.error(' [qrService] Error al validar QR:');
    console.error(' Status:', error.response?.status);
    console.error(' Mensaje:', error.response?.data);
    throw error;
  }
};

/**
 * Obtiene todos los QRs asociados a una reserva específica.
 * Llama a: GET /api/qr/reserva/{id}
 */
const getQrsPorReserva = async (idReserva) => {
  try {
    console.log(' [qrService] Obteniendo QRs por reserva:', idReserva);
    const response = await axiosInstance.get(`/qr/reserva/${idReserva}`);
    console.log(' [qrService] QRs obtenidos:', response.data);
    return response.data; // Devuelve un array de QrDTO
  } catch (error) {
    console.error(' [qrService] Error al obtener QRs por reserva:');
    console.error(' Status:', error.response?.status);
    console.error(' Mensaje:', error.response?.data);
    throw error;
  }
};

// ---------------------------------------------------------
// EXPORTACIÓN UNIFICADA
// ---------------------------------------------------------
export const qrService = {
  getQrsByReserva,
  generarQR,
  getQrImage,       // Agregado de Login
  validarQR,        // Agregado de Main
  getQrsPorReserva  // Agregado de Main
};