import React from 'react';
import { View, Text } from 'react-native';

export default function AyudaScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-800 mb-4">❓ AYUDA</Text>
      <Text className="text-lg text-gray-600 text-center px-4">
        Centro de ayuda. Preguntas frecuentes, contacto, soporte técnico.
      </Text>
    </View>
  );
}