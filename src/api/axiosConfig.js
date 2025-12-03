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

export default axiosInstance;