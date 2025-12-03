// src/services/incluyeService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Rompe la asociación ternaria entre una reserva, cancha y disciplina.
 * Llama a: DELETE /api/incluye/{idReserva}/{idCancha}/{idDisciplina}
 */
const desasociarReserva = async (idReserva, idCancha, idDisciplina) => {
  try {
    const response = await axiosInstance.delete(`/incluye/${idReserva}/${idCancha}/${idDisciplina}`);
    return response.data;
  } catch (error) {
    console.error("Error al desasociar la reserva:", error.response?.data || error.message);
    throw error;
  }
};

export const incluyeService = {
  desasociarReserva,
};