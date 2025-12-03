// src/services/macrodistritoService.js
import axiosInstance from '../api/axiosConfig';

// Pide al backend la lista completa de macrodistritos.
const getAllMacrodistritos = async () => {
  try {
    // ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
    // Cambiamos a la URL singular que usa tu backend.
    const response = await axiosInstance.get('/macrodistrito'); 
    return response.data;
  } catch (error) {
    console.error("Error al obtener macrodistritos:", error.response?.data || error.message);
    throw error;
  }
};

// Envía un nuevo objeto macrodistrito al backend.
const createMacrodistrito = async (macrodistritoData) => {
  try {
    // También corregimos aquí por si acaso.
    const response = await axiosInstance.post('/macrodistrito', macrodistritoData);
    return response.data;
  } catch (error) {
    console.error("Error al crear macrodistrito:", error.response?.data || error.message);
    throw error;
  }
};


// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
// Envía los datos actualizados de un macrodistrito al backend.
const updateMacrodistrito = async (id, macrodistritoData) => {
  try {
    // ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
    // Usamos `backticks` (`) para construir la URL dinámicamente,
    // incluyendo el ID al final, igual que en Postman.
    const response = await axiosInstance.put(`/macrodistrito/${id}`, macrodistritoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar macrodistrito con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
const deleteMacrodistrito = async (id) => {
  try {
    // Asume que tu endpoint es DELETE /api/macrodistrito/{id}
    const response = await axiosInstance.delete(`/macrodistrito/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar macrodistrito con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// ESTA FUNCIÓN ES NUEVA O MODIFICADA
const logicalDeleteMacrodistrito = async (id) => {
  try {
    // Asumimos que tu endpoint es como el de Zonas
    const response = await axiosInstance.patch(`/macrodistrito/${id}/estado?nuevoEstado=false`);
    return response.data;
  } catch (error) {
    console.error(`Error al dar de baja el macrodistrito con id ${id}:`, error.response?.data || error.message);
    throw error;
  }
};


// ▼▼ FUNCIÓN 2: BORRADO FÍSICO ▼▼
// Elimina permanentemente el registro de la base de datos
const physicalDeleteMacrodistrito = async (id) => {
  try {
    const response = await axiosInstance.delete(`/macrodistrito/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar físicamente macrodistrito ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const macrodistritoService = {
  getAllMacrodistritos,
  createMacrodistrito,
  updateMacrodistrito,
  logicalDeleteMacrodistrito, // Exportamos la baja lógica
  deleteMacrodistrito: physicalDeleteMacrodistrito, // Renombramos la física para claridad
};