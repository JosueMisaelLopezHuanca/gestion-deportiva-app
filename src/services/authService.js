// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosConfig';

const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { username, password });
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('userToken', response.data.token);
      // Guardamos data del usuario si existe
      if (response.data.username) {
         await AsyncStorage.setItem('userData', JSON.stringify(response.data));
      }
      return response.data;
    }
    throw new Error('Respuesta inválida del servidor');
  } catch (error) {
    console.log("Error login raw:", error.response?.data); // Para depurar en consola

    // ▼▼▼ AQUÍ ESTÁ LA MAGIA PARA LEER EL MENSAJE DE SPRING BOOT ▼▼▼
    let errorMessage = "Error al iniciar sesión";

    if (error.response) {
        // 1. Intentamos leer el campo 'message' que envía tu MessageResponse de Java
        if (error.response.data?.message) {
            errorMessage = error.response.data.message;
        } 
        // 2. Si no es un objeto JSON, leemos el texto tal cual
        else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
        }
        // 3. Fallback con el código de estado
        else {
            errorMessage = `Error del servidor (${error.response.status})`;
        }
    } else if (error.request) {
        errorMessage = "Sin conexión al servidor";
    }

    // Lanzamos el mensaje limpio para que el Toast lo muestre
    throw new Error(errorMessage);
  }
};
// 2. OBTENER INFORMACIÓN DE SESIÓN
const getSessionInfo = async () => {
  try {
    const response = await axiosInstance.get('/auth/session-info');
    return response.data;
  } catch (error) {
    console.warn("No se pudo obtener info de sesión", error);
    return null;
  }
};

// 3. LOGOUT
const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};

// 4. REGISTRO DE CLIENTE (CORREGIDO)
const registerCliente = async (clienteData) => {
  try {
    console.log("Enviando a backend:", clienteData);

    // CORRECCIÓN: Quitamos ${AUTH_URL} y usamos la ruta relativa directa
    // Como tu axiosInstance ya apunta a la API, y el controller está en /api/auth
    // La ruta correcta es /auth/registro/cliente
    const response = await axiosInstance.post('/auth/registro/cliente', clienteData);
    
    console.log("Respuesta registro:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error detallado en registro:", error);
    
    // Manejo robusto de errores para que no salga "undefined"
    let errorMessage = "Error desconocido al registrar";

    if (error.response) {
        // El servidor respondió con un error (400, 500, etc)
        errorMessage = error.response.data?.message || JSON.stringify(error.response.data);
    } else if (error.request) {
        // No hubo respuesta del servidor
        errorMessage = "No se pudo conectar con el servidor. Revisa tu internet.";
    } else {
        // Error de configuración (como el que tenías de la variable undefined)
        errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

export const authService = {
  login,
  logout,
  getSessionInfo,
  registerCliente,
};