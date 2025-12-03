// src/services/reservaService.js
import axiosInstance from '../api/axiosConfig';

// --- FUNCIÓN NUEVA (NECESARIA) ---
/**
 * Obtiene los detalles de una reserva base por su ID.
 * Llama a: GET /api/reservas/{id}
 */
const getReservaById = async (id) => {
  try {
    const response = await axiosInstance.get(`/reservas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener la reserva ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// --- FUNCIÓN CORREGIDA ---
/**
 * Obtiene las reservas de una cancha (usando IncluyeController y enriqueciendo los datos)
 */
const getReservasByCancha = async (canchaId) => {
  try {
    // 1. Obtiene las asociaciones (que solo tienen IDs)
    const response = await axiosInstance.get(`/incluye/por-cancha/${canchaId}`);
    const incluyeLista = response.data; // Esto es List<IncluyeDTO>

    // 2. Extrae los IDs de reserva
    const reservaIds = incluyeLista.map(incluye => incluye.idReserva);

    // 3. Por cada ID, busca los detalles completos de la reserva
    const reservaDetallesPromises = reservaIds.map(id => getReservaById(id));
    
    // 4. Espera a que todas las llamadas terminen
    const reservasCompletas = await Promise.all(reservaDetallesPromises);
    
    return reservasCompletas; // Devuelve un array de [ReservaDTO, ReservaDTO, ...]
    
  } catch (error) {
    console.error(`Error al obtener reservas (incluye) para la cancha ${canchaId}:`, error.response?.data || error.message);
    throw error;
  }
};


// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
/**
 * Obtiene todas las reservas de un cliente específico.
 * Llama a: GET /api/reservas/cliente/{idCliente}
 */
const getReservasByCliente = async (clienteId) => {
  try {
    const response = await axiosInstance.get(`/reservas/cliente/${clienteId}`);
    return response.data; // Devuelve un array de ReservaDTO
  } catch (error) {
    console.error(`Error al obtener las reservas del cliente ${clienteId}:`, error.response?.data || error.message);
    throw error;
  }
};


// --- getHorariosDisponibles (sin cambios) ---
const getHorariosDisponibles = async (canchaId, fecha) => {
  try {
    const response = await axiosInstance.get('/reservas/horario-disponible', {
      params: { canchaId, fecha }
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener horarios para la cancha ${canchaId} en ${fecha}:`, error.response?.data || error.message);
    throw error;
  }
};

// --- crearReservaBase (sin cambios) ---
const crearReservaBase = async (reservaData) => {
  try {
    const response = await axiosInstance.post('/reservas', reservaData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la reserva base:", error.response?.data || error.message);
    throw error;
  }
};

// --- crearAsociacionIncluye (sin cambios) ---
const crearAsociacionIncluye = async (asociacionData) => {
  try {
    const response = await axiosInstance.post('/incluye', asociacionData);
    return response.data;
  } catch (error) {
    console.error("Error al crear la asociación 'incluye':", error.response?.data || error.message);
    throw error;
  }
};

// --- crearReservaCompleta (sin cambios) ---
const crearReservaCompleta = async (reservaData, canchaId, disciplinaId, clienteId, monto) => {
  
  const reservaBaseDTO = {
    // No enviamos fechaCreacion, el backend se encarga
    fechaReserva: reservaData.fecha,
    horaInicio: reservaData.horaInicio,
    horaFin: reservaData.horaFin,
    estadoReserva: "PENDIENTE",
    montoTotal: monto,
    observaciones: "Reserva desde app móvil",
    clienteId: clienteId,
  };

  const reservaCreada = await crearReservaBase(reservaBaseDTO);
  
  const asociacionDTO = {
    idReserva: reservaCreada.idReserva,
    idCancha: canchaId,
    idDisciplina: disciplinaId,
  };

  const asociacionCreada = await crearAsociacionIncluye(asociacionDTO);
  return { reservaCreada, asociacionCreada };
};


// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
/**
 * Cancela una reserva.
 * Llama a: POST /api/reservas/{id}/cancelar
 * Espera un body con un "motivo" 
 */
const cancelarReserva = async (idReserva, motivo) => {
  try {
    const response = await axiosInstance.post(`/reservas/${idReserva}/cancelar`, { motivo });
    return response.data; // Devuelve la ReservaDTO actualizada
  } catch (error) {
    console.error(`Error al cancelar la reserva ${idReserva}:`, error.response?.data || error.message);
    throw error;
  }
};

// ▼▼▼ CORRIGE ESTA FUNCIÓN ▼▼▼
/**
 * Notifica al backend que se ha realizado un pago,
 * para que actualice el estado de la reserva y genere el QR.
 * Llama a: PUT /api/reservas/{id}/actualizar-pago
 */
// ▼▼▼ ESTA FUNCIÓN YA NO ES NECESARIA LLAMARLA DESDE EL FRONTEND ▼▼▼
// El backend ya la ejecuta automáticamente al confirmar el pago
const actualizarEstadoPagoReserva = async (idReserva) => {
  try {
    console.log(' [reservaService] Actualizando estado de pago para reserva:', idReserva);
    const response = await axiosInstance.put(`/reservas/${idReserva}/actualizar-pago`);
    console.log(' [reservaService] Estado de pago actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error(' [reservaService] Error al actualizar estado de pago:');
    console.error(' Status:', error.response?.status);
    console.error(' Mensaje:', error.response?.data);
    throw error;
  }
};

/** KAREN
 * Obtiene todas las reservas de una cancha específica.
 * Llama a: GET /api/reservas/{idCancha}/reservas
 */
const getReservasByCanchaK = async (idCancha) => {
  try {
    const response = await axiosInstance.get(`/reservas/${idCancha}/reservas`);
    return response.data; // Devuelve un array de ReservaDTO
  } catch (error) {
    console.error(
      `Error al obtener reservas para la cancha ${idCancha}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const reservaService = {
  getReservasByCancha,
  getHorariosDisponibles,
  crearReservaCompleta,
  // getReservaById, // No es necesario exportarlo si solo se usa aquí dentro
  getReservasByCliente, //  Exporta la nueva función
  cancelarReserva, //  Exporta la nueva función
  actualizarEstadoPagoReserva,
  getReservasByCanchaK, // Exporta función solicitada
};
