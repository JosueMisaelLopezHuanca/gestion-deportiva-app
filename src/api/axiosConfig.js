// src/api/axiosConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Este interceptor se ejecuta ANTES de cada petición.
axiosInstance.interceptors.request.use(
  async (config) => {
    // ▼▼▼ ¡AQUÍ ESTÁ NUESTRA CÁMARA! ▼▼▼
    console.log("--- Interceptor de Axios Activado ---");
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        console.log("Token encontrado. Adjuntando al encabezado...");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("No se encontró ningún token en AsyncStorage.");
      }
    } catch (e) {
      console.error("Error al leer el token desde AsyncStorage:", e);
    }
    console.log("-------------------------------------");
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para reintentar automáticamente si recibe 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    
    // Si es 401 y no hemos reintentado ya
    if (error.response?.status === 401 && !config.__retried) {
      config.__retried = true;
      
      console.log("⚠️ Recibido 401. Esperando y reintentando...");
      // Esperar 500ms para que el token esté listo en AsyncStorage
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Reintentar la solicitud
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("🔄 Reintentando con token actualizado...");
          return axiosInstance.request(config);
        }
      } catch (e) {
        console.error("Error al reintentar:", e);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;