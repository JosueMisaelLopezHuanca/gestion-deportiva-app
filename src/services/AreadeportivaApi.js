// src/services/areaDeportivaService.js
import axiosInstance from '../api/axiosConfig';

const BASE_URL = '/areasdeportivas';

// =====================
// ÁREA DEPORTIVA
// =====================

export async function getAreadeportivaActivos() {
  const res = await axiosInstance.get(`${BASE_URL}/activos`);
  return res.data;
}

export async function getAreadeportiva() {
  const res = await axiosInstance.get(BASE_URL);
  return res.data;
}

export async function getAreadeportivaById(id) {
  const res = await axiosInstance.get(`${BASE_URL}/${id}`);
  return res.data;
}

export const createAreadeportiva = async (data) => {
  const response = await axiosInstance.post(BASE_URL, data);
  return response.data;
};

export async function updateAreadeportiva(id, payload) {
  const res = await axiosInstance.put(`${BASE_URL}/${id}`, payload);
  return res.data;
}

export async function deleteAreadeportivaFisica(id) {
  const res = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return res.data;
}

export async function patchEstadoAreadeportiva(id, nuevoEstado) {
  const res = await axiosInstance.patch(`${BASE_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`);
  return res.data;
}

export async function buscarAreadeportivaPorNombre(nombre) {
  const res = await axiosInstance.get(`${BASE_URL}/buscar/${nombre}`);
  return res.data;
}

export async function getAreadeportivaConBloqueo(id) {
  const res = await axiosInstance.get(`${BASE_URL}/${id}/lock`);
  return res.data;
}

export async function getAreadeportivaPorAdminId(adminId) {
  const res = await axiosInstance.get(`${BASE_URL}/admin/${adminId}`);
  return res.data;
}

export async function updateAreadeportivaPorAdminId(adminId, payload) {
  const res = await axiosInstance.put(`${BASE_URL}/admin/${adminId}`, payload);
  return res.data;
}

// =====================
// CANCHAS (asumo que existe este endpoint)
// =====================

// Si en tu web usabas getCanchasActivas, agrégalo aquí
export async function getCanchasActivas() {
  const res = await axiosInstance.get('/canchas/activas');
  return res.data;
}

// =====================
// DISCIPLINAS (por administrador)
// =====================

export async function createDisciplinaPorAdmin(adminId, disciplina, idsCanchas = []) {
  const res = await axiosInstance.post(`${BASE_URL}/admin/${adminId}/disciplinas`, disciplina, {
    params: { idsCanchas }
  });
  return res.data;
}

export async function getDisciplinasPorAdmin(adminId) {
  const res = await axiosInstance.get(`${BASE_URL}/admin/${adminId}/disciplinas`);
  return res.data;
}

export async function updateDisciplinaPorAdmin(adminId, idDisciplina, payload) {
  const res = await axiosInstance.put(`${BASE_URL}/admin/${adminId}/disciplinas/${idDisciplina}`, payload);
  return res.data;
}

export async function deleteDisciplinaPorAdmin(adminId, idDisciplina) {
  await axiosInstance.delete(`${BASE_URL}/admin/${adminId}/disciplinas/${idDisciplina}`);
}

// =====================
// IMÁGENES
// =====================

export async function agregarImagenesAreadeportiva(id, archivosImagenes) {
  const formData = new FormData();
  archivosImagenes.forEach((file) => formData.append('archivosImagenes', file));

  const res = await axiosInstance.post(`${BASE_URL}/${id}/imagenes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function eliminarImagenAreadeportiva(id, idImagenRelacion) {
  const res = await axiosInstance.delete(`${BASE_URL}/${id}/imagenes/${idImagenRelacion}`);
  return res.data;
}

export async function reordenarImagenesAreadeportiva(id, idsImagenesOrden) {
  const res = await axiosInstance.put(`${BASE_URL}/${id}/imagenes/reordenar`, idsImagenesOrden);
  return res.data;
}

// Variante consolidada (opcional)
export const agregarImagenesArea = async (id, archivos) => {
  const formData = new FormData();
  if (archivos && archivos.length > 0) {
    archivos.forEach((file) => formData.append('archivosImagenes', file));
  }
  const response = await axiosInstance.post(`${BASE_URL}/${id}/imagenes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const agregarImagenesAreaConProgreso = async (id, archivos, onUploadProgress) => {
  const formData = new FormData();
  if (archivos && archivos.length > 0) {
    archivos.forEach((file) => formData.append('archivosImagenes', file));
  }
  const response = await axiosInstance.post(`${BASE_URL}/${id}/imagenes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
  return response.data;
};
////aqui lo que se hizo