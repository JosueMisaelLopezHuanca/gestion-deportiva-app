import api from '../api/axiosConfig';


const API_URL = '/cancha'; 

//  Obtener todas las canchas
export async function getCanchas() {
  const res = await api.get(API_URL);
  return res.data;
}


// Obtener canchas activas por área
export async function getCanchasActivasPorArea(idArea) {
  const res = await api.get(`${API_URL}/area/${idArea}/activas`);
  return res.data;
}

//  Obtener una cancha por ID
export async function getCancha(id) {
  const res = await api.get(`${API_URL}/porid/${id}`);
  return res.data;
}

// Crear una cancha (Solo datos JSON)
export const createCancha = async (canchaData) => {
    const response = await api.post(API_URL, canchaData);
    return response.data;
};

// Actualizar una cancha
export const updateCancha = async (id, canchaData) => {
    const response = await api.put(`${API_URL}/${id}`, canchaData);
    return response.data;
};

// Desactivar (eliminar lógica) una cancha
export async function deleteCancha(id) {
  // En lugar de eliminar, cambiamos el estado a false (desactivar) K
  const res = await api.patch(`${API_URL}/${id}/estado?nuevoEstado=false`);
  return res.data;
}

// Obtener canchas por área deportiva
export async function getCanchasPorArea(idArea) {
  const res = await api.get(`${API_URL}/area/${idArea}`);
  return res.data;
}

// ============================
// ⚙️ ESTADO Y FILTROS
// ============================
export async function cambiarEstadoCancha(id, nuevoEstado) {
  const res = await api.patch(`${API_URL}/${id}/estado?nuevoEstado=${nuevoEstado}`);
  return res.data;
}

export async function buscarCanchasPorNombre(nombre) {
  const res = await api.get(`${API_URL}/buscar/${nombre}`);
  return res.data;
}


export async function buscarCanchasPorFiltros(params) {
  // params: { horaInicio, horaFin, costo, capacidad, tamano, iluminacion, cubierta }
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${API_URL}/buscar?${query}`);
  return res.data;
}

// ============================
// 🧱 RELACIONES
// ============================
export async function getCanchasActivas() {
  const res = await api.get(`${API_URL}/activos`);
  return res.data;
}


export async function getEquipamientosPorCancha(id) {
  const res = await api.get(`${API_URL}/${id}/equipamientos`);
  return res.data;
}

export async function getDisciplinasPorCancha(id) {
  const res = await api.get(`${API_URL}/${id}/disciplinas`);
  return res.data;
}

// --- LA FUNCIÓN NUEVA PARA IMÁGENES ---
export const agregarImagenesCancha = async (idCancha, archivos) => {
    const formData = new FormData();
    
    // "archivosImagenes" es el nombre exacto que espera tu @RequestParam en Java
    if (archivos && archivos.length > 0) {
        archivos.forEach((file) => {
            formData.append('archivosImagenes', file);
        });
    }

    // POST /api/cancha/{id}/imagenes
    const response = await api.post(`${API_URL}/${idCancha}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export async function eliminarImagenCancha(id, idImagenRelacion) {
  const res = await api.delete(`${API_URL}/${id}/imagenes/${idImagenRelacion}`);
  return res.data;
}

export async function reordenarImagenesCancha(id, idsImagenesOrden) {
  const res = await api.put(`${API_URL}/${id}/imagenes/reordenar`, idsImagenesOrden);
  return res.data;
}

// ============================
// 🔒 BLOQUEO / CONTROL CONCURRENCIA
// ============================
export async function obtenerCanchaConBloqueo(id) {
  const res = await api.get(`${API_URL}/${id}/lock`);
  return res.data;
}





//-------------------NUEVOS SERVICIOS
// Obtener todas las canchas
export const getAllCanchas = async () => {
    const response = await api.get(API_URL);
    return response.data;
};

//Obtener canchas mejor calificadas
export async function getCanchasMejorCalificadas() {
  const res = await api.get(`${API_URL}/mejor-calificadas`);
  return res.data;
}

// Obtener canchas más reservadas
export async function getCanchasMasReservadas() {
  const res = await api.get(`${API_URL}/mas-reservadas`);
  return res.data;
}

// Por disciplina (por ID)
export async function getCanchasPorDisciplina(idDisciplina) {
  const res = await api.get(`${API_URL}/por-disciplina/${idDisciplina}`);
  return res.data;
}

// Por zona (por ID)
export async function getCanchasPorZona(idZona) {
  const res = await api.get(`${API_URL}/por-zona/${idZona}`);
  return res.data;
}

// Abiertas ahora
export async function getCanchasAbiertasAhora() {
  const res = await api.get(`${API_URL}/abiertas-ahora`);
  return res.data;
}

// Disponibles en una fecha y rango horario
export async function getCanchasDisponibles(fecha, horaInicio, horaFin) {
  const res = await api.get(`${API_URL}/disponibles`, {
    params: { fecha, horaInicio, horaFin }
  });
  return res.data;
}

// Reservadas por cliente (por ID de cliente)
export async function getCanchasReservadasPorCliente(idCliente) {
  const res = await api.get(`${API_URL}/reservadas-cliente/${idCliente}`);
  return res.data;
}

// Buscar por nombre de disciplina (texto)
export async function buscarCanchasPorNombreDisciplina(nombreDisciplina) {
  const res = await api.get(`${API_URL}/buscar-por-disciplina`, {
    params: { nombreDisciplina }
  });
  return res.data;
}

// Por capacidad
export async function getCanchasPorCapacidad(capacidad) {
  const res = await api.get(`${API_URL}/por-capacidad/${capacidad}`);
  return res.data;
}

// Por tipo de superficie
export async function getCanchasPorTipoSuperficie(tipoSuperficie) {
  const res = await api.get(`${API_URL}/por-superficie`, {
    params: { tipoSuperficie }
  });
  return res.data;
}

// Por iluminación ("si" o "no", por ejemplo)
export async function getCanchasPorIluminacion(iluminacion) {
  const res = await api.get(`${API_URL}/por-iluminacion`, {
    params: { iluminacion }
  });
  return res.data;
}

// Por cubierta ("si" o "no")
export async function getCanchasPorCubierta(cubierta) {
  const res = await api.get(`${API_URL}/por-cubierta`, {
    params: { cubierta }
  });
  return res.data;
}