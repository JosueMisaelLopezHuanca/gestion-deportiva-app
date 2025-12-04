// src/api/PagoApi.js
import api from '../api/axiosConfig';// instancia base de Axios (con baseURL y headers configurados)

const URL_BASE = "/pagos";

export async function getPagos() {
  const res = await api.get(URL_BASE);
  return res.data;
}



/* -----------------------------------------------------------
   CRUD PRINCIPAL
----------------------------------------------------------- */
export const getAllPagos = async () => {
  const response = await api.get(`${URL_BASE}`);
  return response.data;
};

export const getPagoById = async (id) => {
  const response = await api.get(`${URL_BASE}/${id}`);
  return response.data;
};

export const createPago = async (pagoData) => {
  const response = await api.post(`${URL_BASE}`, pagoData);
  return response.data;
};

export const updatePago = async (id, pagoData) => {
  const response = await api.put(`${URL_BASE}/${id}`, pagoData);
  return response.data;
};

export const deletePago = async (id) => {
  const response = await api.delete(`${URL_BASE}/${id}`);
  return response.data;
};

/* -----------------------------------------------------------
   BÚSQUEDAS
----------------------------------------------------------- */
export const getPagosByEstado = async (estado) => {
  const response = await api.get(`${URL_BASE}/estado/${estado}`);
  return response.data;
};

export const getPagosByMetodo = async (metodoPago) => {
  const response = await api.get(`${URL_BASE}/metodo/${metodoPago}`);
  return response.data;
};

export const getPagosByTipo = async (tipoPago) => {
  const response = await api.get(`${URL_BASE}/tipo/${tipoPago}`);
  return response.data;
};

export const getPagosByFecha = async (fecha) => {
  const response = await api.get(`${URL_BASE}/fecha/${fecha}`);
  return response.data;
};

export const getPagosByRangoFechas = async (inicio, fin) => {
  const response = await api.get(`${URL_BASE}/rango-fechas`, {
    params: { inicio, fin },
  });
  return response.data;
};

export const getPagoByCodigoTransaccion = async (codigo) => {
  const response = await api.get(`${URL_BASE}/transaccion/${codigo}`);
  return response.data;
};

export const getPagosByReserva = async (idReserva) => {
  const response = await api.get(`${URL_BASE}/reserva/${idReserva}`);
  return response.data;
};

export const getPagosByReservaYEstado = async (idReserva, estado) => {
  const response = await api.get(`${URL_BASE}/reserva/${idReserva}/estado/${estado}`);
  return response.data;
};

export const getPagosByCliente = async (idCliente) => {
  const response = await api.get(`${URL_BASE}/cliente/${idCliente}`);
  return response.data;
};

export const getPagosByClienteYEstado = async (idCliente, estado) => {
  const response = await api.get(`${URL_BASE}/cliente/${idCliente}/estado/${estado}`);
  return response.data;
};

/* -----------------------------------------------------------
   OPERACIONES DE NEGOCIO
----------------------------------------------------------- */
export const confirmarPago = async (id, codigoTransaccion) => {
  const response = await api.post(`${URL_BASE}/${id}/confirmar`, {
    codigoTransaccion,
  });
  return response.data;
};

export const anularPago = async (id, razon) => {
  const response = await api.post(`${URL_BASE}/${id}/anular`, { razon });
  return response.data;
};

export const rechazarPago = async (id, razon) => {
  const response = await api.post(`${URL_BASE}/${id}/rechazar`, { razon });
  return response.data;
};

/* -----------------------------------------------------------
   REPORTES
----------------------------------------------------------- */
export const getTotalPorFecha = async (fecha) => {
  const response = await api.get(`${URL_BASE}/reporte/total-por-fecha`, {
    params: { fecha },
  });
  return response.data;
};

export const getTotalPorRango = async (inicio, fin) => {
  const response = await api.get(`${URL_BASE}/reporte/total-por-rango`, {
    params: { inicio, fin },
  });
  return response.data;
};

export const getPagosConfirmadosEnRango = async (inicio, fin) => {
  const response = await api.get(`${URL_BASE}/reporte/pagos-confirmados`, {
    params: { inicio, fin },
  });
  return response.data;
};

export const getSaldoPendienteReserva = async (idReserva) => {
  const response = await api.get(`${URL_BASE}/reserva/${idReserva}/saldo-pendiente`);
  return response.data;
};

/* -----------------------------------------------------------
   VALIDACIONES
----------------------------------------------------------- */
export const validarCodigoTransaccion = async (codigo) => {
  const response = await api.get(`${URL_BASE}/validar-transaccion/${codigo}`);
  return response.data;
};

export const validarMontoYReserva = async (monto, idReserva) => {
  const response = await api.get(`${URL_BASE}/validar-monto-reserva`, {
    params: { monto, idReserva },
  });
  return response.data;
};

/* -----------------------------------------------------------
   HEALTH CHECK
----------------------------------------------------------- */
export const healthCheckPago = async () => {
  const response = await api.get(`${URL_BASE}/health`);
  return response.data;
};
