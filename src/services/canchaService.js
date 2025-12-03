// src/services/canchaService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Obtiene todas las canchas que pertenecen a un área deportiva específica.
 * @param {number} areaId - El ID del área deportiva.
 * @returns {Promise<Array>} - Una promesa que resuelve a un array de canchas.
 */
const getCanchasByArea = async (areaId) => {
  try {
    // Este es el endpoint de tu controller: @GetMapping("/area/{idArea}")
    const response = await axiosInstance.get(`/cancha/area/${areaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener canchas para el área ${areaId}:`, error.response?.data || error.message);
    throw error;
  }
};


// Más adelante añadiremos más funciones aquí (ej. para ver disponibilidad)

// ▼▼▼ ¡AÑADE ESTA FUNCIÓN! ▼▼▼
/**
 * Obtiene una cancha específica por su ID.
 * (Usamos GET /api/cancha/{id})
 */
// ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
const getCanchaById = async (id) => {
  try {
    // Cambiamos de /cancha/{id} a /cancha/porid/{id}
    const response = await axiosInstance.get(`/cancha/porid/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la cancha con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ▼▼▼ ¡AÑADE ESTA FUNCIÓN! ▼▼▼
/**
 * Obtiene todas las reservas de una cancha específica.
 * (Usamos GET /api/cancha/{id}/reservas)
 */
const getReservasByCancha = async (id) => {
  try {
    const response = await axiosInstance.get(`/cancha/${id}/reservas`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener las reservas de la cancha ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const canchaService = {
  getCanchasByArea,
  getCanchaById,       // 👈 Exporta la nueva función
  getReservasByCancha, // 👈 Exporta la nueva función
};