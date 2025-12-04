import api from '../api/axiosConfig';

const API_URL = "/disciplina"; // coincide con @RequestMapping("/api/disciplina")

// ===============================
// CRUD BÁSICO
// ===============================

// Crear disciplina (JSON)
export async function crearDisciplina(payload) {
  const res = await api.post(API_URL, payload);
  return res.data;
}

// Crear disciplina (form-data, con imagen)
export async function crearDisciplinaFormData(formData) {
  const res = await api.post(API_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Obtener todas las disciplinas
export async function getDisciplinas() {
  const res = await api.get(API_URL);
  return res.data;
}

// Obtener una disciplina por ID
export async function getDisciplinaById(id) {
  const res = await api.get(`${API_URL}/porid/${id}`);
  return res.data;
}

// Actualizar disciplina (JSON)
export async function updateDisciplina(id, payload) {
  const res = await api.put(`${API_URL}/${id}`, payload);
  return res.data;
}

// Actualizar disciplina (form-data)
export async function updateDisciplinaFormData(id, formData) {
  const res = await api.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Eliminación lógica
export async function eliminarDisciplinaLogica(id) {
  const res = await api.put(`${API_URL}/${id}/eliminar-logico`);
  return res.data;
}

// Eliminación física
export async function eliminarDisciplinaFisica(id) {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
}

// Cambiar estado (PATCH)
export async function cambiarEstadoDisciplina(id, nuevoEstado) {
  const res = await api.patch(`${API_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`);
  return res.data;
}

// ===============================
// FILTROS Y BÚSQUEDAS
// ===============================

// Buscar por nombre
export async function buscarPorNombre(nombre) {
  const res = await api.get(`${API_URL}/buscar/nombre?nombre=${nombre}`);
  return res.data;
}

// Buscar por descripción
export async function buscarPorDescripcion(descripcion) {
  const res = await api.get(`${API_URL}/buscar/descripcion?descripcion=${descripcion}`);
  return res.data;
}

// Obtener activas e inactivas
export async function getDisciplinasActivas() {
  const res = await api.get(`${API_URL}/activos`);
  return res.data;
}

export async function getDisciplinasInactivas() {
  const res = await api.get(`${API_URL}/inactivas`);
  return res.data;
}

// ===============================
// GESTIÓN DE ESTADO
// ===============================

// Activar una disciplina
export async function activarDisciplina(id) {
  const res = await api.put(`${API_URL}/${id}/activar`);
  return res.data;
}

// Desactivar varias a la vez
export async function desactivarMasivo(ids) {
  const res = await api.put(`${API_URL}/desactivar-masivo`, ids);
  return res.data;
}

// ===============================
// GESTIÓN DE IMÁGENES
// ===============================

// Agregar imágenes a una disciplina
export async function agregarImagenes(idDisciplina, archivos) {
  const formData = new FormData();
  archivos.forEach((archivo) => formData.append("archivosImagenes", archivo));
  const res = await api.post(`${API_URL}/${idDisciplina}/imagenes`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Eliminar una imagen
export async function eliminarImagen(idDisciplina, idImagenRelacion) {
  const res = await api.delete(`${API_URL}/${idDisciplina}/imagenes/${idImagenRelacion}`);
  return res.data;
}

// Reordenar imágenes
export async function reordenarImagenes(idDisciplina, idsOrden) {
  const res = await api.put(`${API_URL}/${idDisciplina}/imagenes/reordenar`, idsOrden);
  return res.data;
}

// ===============================
// VALIDACIONES
// ===============================

// Verificar si un nombre está disponible
export async function verificarNombreDisponible(nombre) {
  const res = await api.get(`${API_URL}/verificar-nombre/${nombre}`);
  return res.data;
}

// ===============================
// ESTADÍSTICAS Y LISTADOS
// ===============================

// Contar cuántas disciplinas activas hay
export async function contarActivas() {
  const res = await api.get(`${API_URL}/estadisticas/total-activas`);
  return res.data;
}

// Obtener las más recientes (por límite)
export async function getDisciplinasRecientes(limite = 5) {
  const res = await api.get(`${API_URL}/recientes?limite=${limite}`);
  return res.data;
}
