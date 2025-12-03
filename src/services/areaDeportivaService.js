// src/services/areaDeportivaService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Obtiene TODAS las áreas deportivas del backend.
 * (Usamos GET /api/areasdeportivas)
 */
const getAllAreasDeportivas = async () => {
  try {
    const response = await axiosInstance.get('/areasdeportivas');
    return response.data;
  } catch (error) {
    // ▼▼▼ DETAILED ERROR LOGGING ▼▼▼
    console.error("--- API CALL FAILED ---");
    if (error.response) {
      console.error("Status:", error.response.status);
      // This will show the actual message from the Spring error DTO
      console.error("Backend Message:", error.response.data.message || error.response.data); 
      console.error("Config URL:", error.config.url);
    } else {
      console.error("Network Error:", error.message);
    }
    console.error("-----------------------");
    throw error;
  }
};

/**
 * Crea una nueva área deportiva.
 * (Usamos POST /api/areasdeportivas)
 */
const createAreaDeportiva = async (areaData) => {
  try {
    const response = await axiosInstance.post('/areasdeportivas', areaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear el área:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Actualiza un área deportiva existente.
 * (Usamos PUT /api/areasdeportivas/{id})
 */
const updateAreaDeportiva = async (id, areaData) => {
  try {
    const response = await axiosInstance.put(`/areasdeportivas/${id}`, areaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el área con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Desactiva (baja lógica) un área deportiva.
 * (Usamos PATCH /api/areasdeportivas/{id}/estado)
 */
const logicalDeleteAreaDeportiva = async (id) => {
  try {
    const response = await axiosInstance.patch(`/areasdeportivas/${id}/estado?nuevoEstado=false`);
    return response.data;
  } catch (error) {
    console.error(`Error al desactivar el área ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Elimina físicamente un área deportiva.
 * (Usamos DELETE /api/areasdeportivas/{id})
 */
const physicalDeleteAreaDeportiva = async (id) => {
  try {
    const response = await axiosInstance.delete(`/areasdeportivas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el área ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
/**
 * Obtiene un área deportiva específica por su ID.
 * (Usamos GET /api/areasdeportivas/{id})
 */
const getAreaDeportivaById = async (id) => {
  try {
    const response = await axiosInstance.get(`/areasdeportivas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el área con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const areaDeportivaService = {
  getAllAreasDeportivas,
  createAreaDeportiva,
  updateAreaDeportiva,
  logicalDeleteAreaDeportiva,
  physicalDeleteAreaDeportiva,
  getAreaDeportivaById,
};