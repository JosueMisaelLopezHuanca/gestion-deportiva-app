// src/api/QrApi.js
import api from '../api/axiosConfig';
const URL_BASE = "/qr";

/* -----------------------------------------------------------
   CRUD PRINCIPAL
----------------------------------------------------------- */
export const getAllQrs = async () => {
  const response = await api.get(`${URL_BASE}`);
  return response.data;
};

export const getQrById = async (id) => {
  const response = await api.get(`${URL_BASE}/${id}`);
  return response.data;
};

export const createQr = async (qrData) => {
  const response = await api.post(`${URL_BASE}`, qrData);
  return response.data;
};

export const updateQr = async (id, qrData) => {
  const response = await api.put(`${URL_BASE}/${id}`, qrData);
  return response.data;
};

export const deleteQr = async (id) => {
  const response = await api.delete(`${URL_BASE}/${id}`);
  return response.data;
};

/* -----------------------------------------------------------
   OPERACIONES ESPECÍFICAS
----------------------------------------------------------- */

// 🟡 Eliminación lógica
export const eliminarLogicoQr = async (id) => {
  const response = await api.put(`${URL_BASE}/${id}/eliminar`);
  return response.data;
};

// 🔒 Obtener QR con bloqueo
export const getQrConBloqueo = async (id) => {
  const response = await api.get(`${URL_BASE}/${id}/lock`);
  return response.data;
};

/* -----------------------------------------------------------
   RELACIONES Y BÚSQUEDAS
----------------------------------------------------------- */

// 🔍 Buscar por código
export const getQrByCodigo = async (codigoQr) => {
  const response = await api.get(`${URL_BASE}/codigo/${codigoQr}`);
  return response.data;
};

// 🔍 Buscar por reserva
export const getQrsByReserva = async (idReserva) => {
  const response = await api.get(`${URL_BASE}/reserva/${idReserva}`);
  return response.data;
};

// 🔍 Buscar por persona
export const getQrsByPersona = async (idPersona) => {
  const response = await api.get(`${URL_BASE}/persona/${idPersona}`);
  return response.data;
};

/* -----------------------------------------------------------
   FUNCIONALIDADES ESPECIALES
----------------------------------------------------------- */

// 🧾 Generar QR para reserva
export const generarQrParaReserva = async (idReserva, idPersona) => {
  const response = await api.post(`${URL_BASE}/reserva/${idReserva}/generar`, null, {
    params: { idPersona },
  });
  return response.data;
};

// ✅ Validar QR
export const validarQr = async (codigo) => {
  const response = await api.post(`${URL_BASE}/validar`, null, {
    params: { codigo },
  });
  return response.data;
};

// 📜 Ver contenido QR
export const verContenidoQr = async (codigo) => {
  const response = await api.get(`${URL_BASE}/contenido/${codigo}`);
  return response.data;
};

// 🖼️ Obtener imagen QR (imagen PNG)
export const getQrImage = async (filename) => {
  const response = await api.get(`${URL_BASE}/qrs/${filename}`, {
    responseType: "blob",
  });
  return response.data;
};
