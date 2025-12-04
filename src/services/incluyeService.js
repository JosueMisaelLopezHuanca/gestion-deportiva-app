import axiosInstance from '../api/axiosConfig';

/**
 * Rompe la asociación ternaria entre una reserva, cancha y disciplina.
 * Endpoint Backend: DELETE /api/incluye/{idReserva}/{idCancha}/{idDisciplina}
 */
const desasociarReserva = async (idReserva, idCancha, idDisciplina) => {
  try {
    console.log(`[incluyeService] Solicitando desasociación: R=${idReserva}, C=${idCancha}, D=${idDisciplina}`);
    
    // Llama al endpoint de eliminación
    const response = await axiosInstance.delete(`/incluye/${idReserva}/${idCancha}/${idDisciplina}`);
    
    console.log('[incluyeService] Desasociación exitosa');
    return response.data;
  } catch (error) {
    // Manejo de error específico pero no bloqueante
    console.error("Error al desasociar la reserva:", error.response?.data || error.message);
    // Retornamos null para que el flujo principal (ej. cancelar reserva) no se rompa
    return null; 
  }
};

/**
 * Calcula el monto a pagar basándose en la cancha y el rango de horario.
 * Endpoint Backend: GET /api/incluye/montos
 * Parámetros: idCancha, idDisciplina, horaInicio (HH:mm), horaFin (HH:mm)
 */
const calcularMonto = async (idCancha, idDisciplina, horaInicio, horaFin) => {
  try {
    // El backend espera parámetros en query string: ?idCancha=1&idDisciplina=2...
    const response = await axiosInstance.get('/incluye/montos', {
      params: { 
        idCancha, 
        idDisciplina, 
        horaInicio, 
        horaFin 
      }
    });
    return response.data; // Devuelve el Double (monto)
  } catch (error) {
    console.error('[incluyeService] Error calculando monto:', error);
    throw error;
  }
};

export const incluyeService = {
  desasociarReserva,
  calcularMonto,
};