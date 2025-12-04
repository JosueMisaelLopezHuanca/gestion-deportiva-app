// components/QRCode.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QRCodeProps {
  value: string;
  size?: number;
  isDarkMode?: boolean;
}

export default function QRCode({ value, size = 150, isDarkMode = false }: QRCodeProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: isDarkMode ? '#111' : '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 12,
          padding: 12,
        },
      ]}
    >
      <Ionicons
        name="qr-code"
        size={size * 0.6}
        color={isDarkMode ? '#fff' : '#000'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
});