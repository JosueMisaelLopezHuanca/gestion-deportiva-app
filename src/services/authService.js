// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosConfig';

const login = async (username, password) => {
  // ... (esta función se mantiene igual)
  const response = await axiosInstance.post('/auth/login', { username, password });
  if (response.data && response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    return response.data;
  }
  throw new Error('Respuesta inválida del servidor');
};

// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
// Esta función va al backend y pide los datos del usuario actual
// usando el token que ya está guardado.
const getSessionInfo = async () => {
  const response = await axiosInstance.get('/auth/session-info');
  return response.data;
};

const logout = async () => {
  await AsyncStorage.removeItem('userToken');
};



// ▼▼▼ ¡AÑADE ESTA NUEVA FUNCIÓN! ▼▼▼
/**
 * Envía la solicitud de registro al backend.
 * @param {object} signupData - El objeto SignupRequest
 */
const signup = async (signupData) => {
  try {
    const response = await axiosInstance.post('/auth/signup', signupData);
    return response.data; // Debería devolver un MessageResponse
  } catch (error) {
    console.error("Error en el servicio de registro:", error.response?.data || error.message);
    // Lanza el mensaje de error del backend si existe
    throw error.response?.data || new Error('Error de red o del servidor');
  }
};

// Exporta la nueva función también
export const authService = {
  login,
  logout,
  getSessionInfo, //  AÑADIDO
  signup,
};