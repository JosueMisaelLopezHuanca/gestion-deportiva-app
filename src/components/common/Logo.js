import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';

const Logo = ({ showText = true, size = 'large' }) => {
  // Ajustamos las dimensiones para que sea más grande y rectangular
  // (ya que tu logo tiene texto horizontal)
  const imageWidth = size === 'large' ? 280 : 150; 
  const imageHeight = size === 'large' ? 180 : 100; 
  
  const taglineSize = size === 'large' ? 16 : 12;

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={{ width: imageWidth, height: imageHeight }}
        resizeMode="contain" // Esto asegura que la imagen no se deforme
      />
      
      {showText && (
        <View style={styles.textContainer}>
          {/* ELIMINAMOS EL TEXTO "QJUEGO" PORQUE YA ESTÁ EN LA IMAGEN */}
          
          <Text style={[styles.tagline, { fontSize: taglineSize }]}>
            Escanea tu pasión
          </Text>
           <Text style={[styles.subTagline, { fontSize: taglineSize - 2 }]}>
            Juega sin límites
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20, // Reduje un poco el margen para que no ocupe tanto
    marginTop: 30,
  },
  textContainer: {
    marginTop: -10, // Un pequeño ajuste negativo para acercar el slogan a la imagen
    alignItems: 'center',
  },
  tagline: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 1,
  },
  subTagline: {
    color: COLORS.primary || '#3AAFA9', // El turquesa para resaltar el segundo texto
    marginTop: 4,
    fontWeight: 'bold',
  }
});

export default Logo;