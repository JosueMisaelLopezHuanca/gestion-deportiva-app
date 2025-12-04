// src/api/ReservaApi.js
import api from '../api/axiosConfig';

const URL_BASE = "/reservas";

/* -----------------------------------------------------------
   CRUD BÁSICO
----------------------------------------------------------- */
export const getReservas = async () => {
  const res = await api.get(`${URL_BASE}`);
  return res.data;
};

export const getReservaPorId = async (id) => {
  const res = await api.get(`${URL_BASE}/${id}`);
  return res.data;
};

export const getReservasByAdmin = async (id) => {
  // ANTES (Incorrecto): api.get(`${URL_BASE}/${id}`);
  // AHORA (Correcto): Agregamos "/admin/"
  const res = await api.get(`${URL_BASE}/admin/${id}`); 
  return res.data;
};

export const createReserva = async (payload) => {
  const res = await api.post(`${URL_BASE}`, payload);
  return res.data;
};

export const updateReserva = async (id, payload) => {
  const res = await api.put(`${URL_BASE}/${id}`, payload);
  return res.data;
};

export const deleteReserva = async (id) => {
  // Usar eliminación lógica consistente con otras APIs del proyecto (PUT /{id}/eliminar)
  const res = await api.put(`${URL_BASE}/${id}/eliminar`);
  return res.data;
};

/* -----------------------------------------------------------
   BÚSQUEDAS
----------------------------------------------------------- */
export const getReservasPorCliente = async (idCliente) => {
  const res = await api.get(`${URL_BASE}/cliente/${idCliente}`);
  return res.data;
};

export const getReservasPorEstado = async (estado) => {
  const res = await api.get(`${URL_BASE}/estado/${estado}`);
  return res.data;
};

export const getReservasPorRangoFechas = async (inicio, fin) => {
  const res = await api.get(`${URL_BASE}/rango-fechas`, { params: { inicio, fin } });
  return res.data;
};

export const getReservasActivasPorCliente = async (idCliente) => {
  const res = await api.get(`${URL_BASE}/cliente/${idCliente}/activas`);
  return res.data;
};

export const getReservasActivasDelCliente = async (idCliente) => {
  const res = await api.get(`${URL_BASE}/activas/cliente/${idCliente}`);
  return res.data;
};

export const getReservasPorDia = async (fecha) => {
  const res = await api.get(`${URL_BASE}/dia/${fecha}`);
  return res.data;
};

/* -----------------------------------------------------------
   DISPONIBILIDAD Y HORARIOS
----------------------------------------------------------- */
export const getHorasDisponibles = async (canchaId, fecha) => {
  const res = await api.get(`${URL_BASE}/horario-disponible`, {
    params: { canchaId, fecha },
  });
  return res.data;
};

export const validarDisponibilidad = async (fecha, horaInicio, horaFin) => {
  const res = await api.get(`${URL_BASE}/disponibilidad`, {
    params: { fecha, horaInicio, horaFin },
  });
  return res.data;
};

/* -----------------------------------------------------------
   OPERACIONES DE NEGOCIO
----------------------------------------------------------- */
export const marcarEnCurso = async (id) => {
  const res = await api.post(`${URL_BASE}/${id}/en-curso`);
  return res.data;
};

//  Obtener reservas del administrador en un rango de fechas
// Se usa en el dashboard y calendario para mostrar solo las reservas de sus canchas
export async function getReservasPorAdministradorEnRango(idAdministrador, inicio, fin) {
  const res = await api.get(`${URL_BASE}/administrador/${idAdministrador}/rango-fechas?inicio=${inicio}&fin=${fin}`);
  return res.data;
}

export const completarReserva = async (id) => {
  const res = await api.post(`${URL_BASE}/${id}/completar`);
  return res.data;
};

export const marcarNoShow = async (id) => {
  const res = await api.post(`${URL_BASE}/${id}/no-show`);
  return res.data;
};

export const cancelarReserva = async (id, motivo) => {
  const res = await api.post(`${URL_BASE}/${id}/cancelar`, { motivo });
  return res.data;
};

/**
 * 🔥 Este endpoint es el más importante, usado en la generación de QR y
 * actualización del estado de pago de la reserva.
 */
export const actualizarEstadoPago = async (id) => {
  const res = await api.put(`${URL_BASE}/${id}/actualizar-pago`);
  return res.data;
};

/* -----------------------------------------------------------
   HEALTH CHECK
----------------------------------------------------------- */
export const healthCheckReserva = async () => {
  const res = await api.get(`${URL_BASE}/health`);
  return res.data;
};

/**
obtener reservas por cancha
 */

export const getReservasPorCancha = async (idCancha) => {
  const res = await api.get(`${URL_BASE}/${idCancha}/reservas`);
  return res.data;
};

/**RESERVAS DE UN CLIENTE POR ESTADO */

export const getReservasPorClienteYEstado = async (idCliente, estado) => {
  const res = await api.get(`${URL_BASE}/cliente/${idCliente}/estado/${estado}`);
  return res.data;
};

export const getReservasClienteOrdenAsc = async (idCliente) => {
  const res = await api.get(`${URL_BASE}/cliente/${idCliente}/orden/asc`);
  return res.data;
};

export const getReservasClienteOrdenDesc = async (idCliente) => {
  const res = await api.get(`${URL_BASE}/cliente/${idCliente}/orden/desc`);
  return res.data;
};
//pasarle el id
// Buscar por cancha
// services/reservaService.js

// Por nombre de cancha (solo del cliente)
export const getReservasPorClienteYNombreCancha = async (idCliente, nombre) => {
  const res = await api.get(
    `${URL_BASE}/cliente/${idCliente}/cancha`,
    { params: { nombre } }
  );
  return res.data;
};


// Por rango de fechas (solo del cliente)
export const getReservasPorClienteEnRango = async (idCliente, inicio, fin) => {
  const res = await api.get(
    `${URL_BASE}/cliente/${idCliente}/rango-fechas`,
    { params: { inicio, fin } }
  );
  return res.data;
};


// Listar invitados por reserva
export const getInvitadosByReserva = async (idReserva) => {
  const res = await api.get(`${URL_BASE}/${idReserva}/invitados`);
  return res.data;
};