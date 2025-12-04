// src/api/IncluyeApi.js
import api from '../api/axiosConfig';

// Crear asociación ternaria (Reserva, Cancha, Disciplina)
export const crearAsociacion = async (dto) => {
  const res = await api.post('/incluye', dto);
  return res.data;
};

// Obtener una asociación específica
export const obtenerAsociacion = async (idReserva, idCancha, idDisciplina) => {
  const res = await api.get(`/incluye/${idReserva}/${idCancha}/${idDisciplina}`);
  return res.data;
};

// Eliminar una asociación
export const eliminarAsociacion = async (idReserva, idCancha, idDisciplina) => {
  const res = await api.delete(`/incluye/${idReserva}/${idCancha}/${idDisciplina}`);
  return res.data;
};

// Listar asociaciones por reserva
export const listarPorReserva = async (idReserva) => {
  const res = await api.get(`/incluye/por-reserva/${idReserva}`);
  return res.data;
};

// Listar asociaciones por cancha
export const listarPorCancha = async (idCancha) => {
  const res = await api.get(`/incluye/por-cancha/${idCancha}`);
  return res.data;
};

// Listar asociaciones por disciplina
export const listarPorDisciplina = async (idDisciplina) => {
  const res = await api.get(`/incluye/por-disciplina/${idDisciplina}`);
  return res.data;
};

// Obtener monto total de una asociación específica
export const obtenerMontoTotal = async (idReserva, idCancha, idDisciplina) => {
  // Usar query params para este endpoint (coincide con backend: /api/incluye/monto-total?idReserva=..&idCancha=..&idDisciplina=..)
  const res = await api.get(`/incluye/monto-total`, { params: { idReserva, idCancha, idDisciplina } });
  return res.data;
};

// Calcular monto por horarios
export const calcularMonto = async (idCancha, idDisciplina, horaInicio, horaFin) => {
  const res = await api.get(`/incluye/montos`, {
    params: { idCancha, idDisciplina, horaInicio, horaFin }
  });
  return res.data;
};
