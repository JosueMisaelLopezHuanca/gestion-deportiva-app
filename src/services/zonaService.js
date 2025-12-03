// src/services/zonaService.js
import axiosInstance from '../api/axiosConfig';

// Obtiene TODAS las zonas del backend.
const getAllZonas = async () => {
  try {
    // Usamos el endpoint GET /api/zona que lista todo.
    const response = await axiosInstance.get('/zona');
    return response.data;
  } catch (error) {
    console.error(`Error al obtener todas las zonas:`, error.response?.data || error.message);
    throw error;
  }
};

// Crea una nueva zona.
const createZona = async (zonaData) => {
  try {
    const response = await axiosInstance.post('/zona', zonaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la zona:", error.response?.data || error.message);
    throw error;
  }
};

// Actualiza una zona existente.
const updateZona = async (id, zonaData) => {
  try {
    const response = await axiosInstance.put(`/zona/${id}`, zonaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar la zona con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// Elimina una zona físicamente.
const deleteZona = async (id) => {
  try {
    const response = await axiosInstance.delete(`/zona/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar la zona con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const zonaService = {
  getAllZonas,
  createZona,
  updateZona,
  deleteZona,
};