// src/services/supervisaService.js
import axiosInstance from '../api/axiosConfig';

/**
 * Asigna una cancha a un usuario de control.
 * @param {number} idUsuarioControl - ID del usuario de control.
 * @param {number} idCancha - ID de la cancha.
 * @returns {Promise<void>}
 */
const asignarCanchaASupervisor = async (idUsuarioControl, idCancha) => {
  try {
    await axiosInstance.post(`/supervisa`, null, {
      params: { idUsuarioControl, idCancha },
    });
  } catch (error) {
    console.error(
      `Error al asignar la cancha ${idCancha} al usuario ${idUsuarioControl}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Quita una cancha de un usuario de control.
 * @param {number} idUsuarioControl - ID del usuario de control.
 * @param {number} idCancha - ID de la cancha.
 * @returns {Promise<void>}
 */
const quitarCanchaDeSupervisor = async (idUsuarioControl, idCancha) => {
  try {
    await axiosInstance.delete(`/supervisa`, {
      params: { idUsuarioControl, idCancha },
    });
  } catch (error) {
    console.error(
      `Error al quitar la cancha ${idCancha} del usuario ${idUsuarioControl}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Obtiene todas las canchas que supervisa un usuario.
 * @param {number} idUsuarioControl - ID del usuario de control.
 * @returns {Promise<Array>} - Lista de canchas supervisadas.
 */
const getCanchasSupervisadasPorUsuario = async (idUsuarioControl) => {
  try {
    const response = await axiosInstance.get(
      `/supervisa/usuario/${idUsuarioControl}/canchas`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener canchas supervisadas por el usuario ${idUsuarioControl}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Obtiene todos los usuarios que supervisan una cancha.
 * @param {number} idCancha - ID de la cancha.
 * @returns {Promise<Array>} - Lista de usuarios supervisores.
 */
const getSupervisoresDeCancha = async (idCancha) => {
  try {
    const response = await axiosInstance.get(
      `/supervisa/cancha/${idCancha}/usuarios`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error al obtener supervisores de la cancha ${idCancha}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const supervisaService = {
  asignarCanchaASupervisor,
  quitarCanchaDeSupervisor,
  getCanchasSupervisadasPorUsuario,
  getSupervisoresDeCancha,
};
