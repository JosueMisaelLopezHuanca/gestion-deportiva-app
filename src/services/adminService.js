// src/services/adminService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Obtiene todas las solicitudes pendientes de verificación.
 * GET /api/admin/solicitudes
 */
const getSolicitudesPendientes = async () => {
  try {
    const response = await axiosInstance.get('/admin/solicitudes');
    return response.data;
  } catch (error) {
    console.error(
      'Error al obtener solicitudes pendientes:',
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Aprueba una solicitud de usuario por ID.
 * POST /api/admin/solicitudes/{id}/aprobar
 * @param {number} id - ID del usuario a aprobar
 */
const aprobarSolicitud = async (id) => {
  try {
    const response = await axiosInstance.post(`/admin/solicitudes/${id}/aprobar`);
    return response.data;
  } catch (error) {
    console.error(
      `Error al aprobar solicitud con id ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Rechaza una solicitud de usuario por ID.
 * POST /api/admin/solicitudes/{id}/rechazar?motivo=...
 * @param {number} id - ID del usuario a rechazar
 * @param {string} motivo - Motivo opcional del rechazo
 */
const rechazarSolicitud = async (id, motivo) => {
  try {
    const response = await axiosInstance.post(`/admin/solicitudes/${id}/rechazar`, null, {
      params: { motivo },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error al rechazar solicitud con id ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const adminService = {
  getSolicitudesPendientes,
  aprobarSolicitud,
  rechazarSolicitud,
};
