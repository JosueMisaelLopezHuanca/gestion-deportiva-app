import React from 'react';
import { View, Text } from 'react-native';

export default function PerfilScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-800 mb-4">👤 PERFIL</Text>
      <Text className="text-lg text-gray-600 text-center px-4">
        Aquí va tu perfil, datos personales, configuración y más.
      </Text>
    </View>
  );
}