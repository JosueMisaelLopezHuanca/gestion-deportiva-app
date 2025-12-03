// src/services/disciplinaService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Obtiene la lista de asociaciones 'se_practica' (disciplinas) para una cancha.
 * Llama a: GET /api/cancha-disciplina/{idCancha}/disciplinas
 */
const getDisciplinasByCancha = async (canchaId) => {
  try {
    const response = await axiosInstance.get(`/cancha-disciplina/${canchaId}/disciplinas`);
    return response.data; // Devuelve la lista de sepracticaDTO
  } catch (error) {
    console.error(`Error al obtener disciplinas para la cancha ${canchaId}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Obtiene los detalles de una disciplina específica.
 * Llama a: GET /api/disciplina/{id}
 */
// ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
const getDisciplinaById = async (id) => {
  try {
    // Cambiamos de /disciplina/{id} a /disciplina/porid/{id}
    const response = await axiosInstance.get(`/disciplina/porid/${id}`);
    return response.data;
  } catch (error) {
     console.error(`Error al obtener disciplina ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const disciplinaService = {
  getDisciplinasByCancha,
  getDisciplinaById,
};