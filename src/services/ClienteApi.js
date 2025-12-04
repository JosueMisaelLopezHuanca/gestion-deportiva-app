import api from '../api/axiosConfig';

const API_URL = '/clientes'; 

export async function getClientes(activos = false) {
  const url = activos ? `${API_URL}/activos` : API_URL;
  const res = await api.get(url);
  return res.data;
}

export async function getClienteById(id) {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
}

export async function searchClientes(nombre) {
  const res = await api.get(`${API_URL}/buscar/${encodeURIComponent(nombre)}`);
  return res.data;
}

export async function createCliente(payload) {
  const res = await api.post(API_URL, payload);
  return res.data;
}

export async function updateCliente(id, payload) {
  const res = await api.put(`${API_URL}/${id}`, payload);
  return res.data;
}

export async function deleteCliente(id) {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
}

export async function cambiarEstado(id, estado) {
  if (typeof estado !== "boolean") {
    throw new Error("El valor de 'estado' debe ser booleano.");
  }

  const url = `${API_URL}/${id}/estado?estado=${encodeURIComponent(estado)}`;
  const res = await api.patch(url);
  return res.data;
}

export const getClienteByEmail = async (email) => {
  const res = await api.get(`${API_URL}/buscar/email/${email}`);
  return res.data;
};
