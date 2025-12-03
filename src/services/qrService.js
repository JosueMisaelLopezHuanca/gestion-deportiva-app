// src/services/qrService.js - COMPLETAR
import axiosInstance from '../api/axiosConfig';

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

// AGREGAR FUNCIÓN PARA GENERAR QR
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

export const qrService = {
  getQrsByReserva,
  generarQR, //  AGREGAR ESTA EXPORTACIÓN
};