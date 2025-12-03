// src/utils/toast.js
import Toast from 'react-native-toast-message';

/**
 * Muestra una notificación toast de éxito.
 * @param {string} message - El mensaje a mostrar.
 */
export const showSuccessToast = (message) => {
  Toast.show({
    type: 'success',
    text1: 'Éxito',
    text2: message,
  });
};

/**
 * Muestra una notificación toast de error.
 * @param {string} message - El mensaje a mostrar.
 */
export const showErrorToast = (message) => {
  Toast.show({
    type: 'error',
    text1: 'Error',
    text2: message,
  });
};