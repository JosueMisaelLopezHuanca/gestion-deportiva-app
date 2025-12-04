import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions,
  ImageBackground,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import Logo from '../../components/common/Logo';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Animación de Opacidad (Fade In)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Animación de Desplazamiento (Slide Up)
  const slideAnim = useRef(new Animated.Value(50)).current;

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Iniciamos las animaciones al montar la pantalla
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // 1 segundo
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
        Toast.show({ type: 'error', text1: 'Datos incompletos', text2: 'Ingresa usuario y contraseña' });
        return;
    }

    setLoading(true);
    try {
        await login(username.trim(), password.trim());
    } catch (error) {
        Toast.show({ 
            type: 'error', 
            text1: 'Error de acceso',
            text2: error.message || 'Credenciales incorrectas'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Aquí implementaremos la lógica o navegación más adelante
    Toast.show({ type: 'info', text1: 'Próximamente', text2: 'Función de recuperación en construcción' });
  };

  return (
    <ImageBackground
      // Imagen de fondo (puedes cambiar esta URL por una local si prefieres)
      source={{ uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Capa oscura para mezclar imagen con fondo y dar legibilidad */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Contenido Animado */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
            
            {/* Logo */}
            <View style={styles.logoContainer}>
               <Logo size="large" />
            </View>

            {/* Tarjeta Glassmorphism (Efecto vidrio moderno) */}
            <View style={styles.glassCard}>
              <Text style={styles.welcomeTitle}>¡Hola de nuevo!</Text>
              <Text style={styles.welcomeSubtitle}>Tu pasión te espera</Text>

              {/* Input Usuario */}
              <View style={styles.inputWrapper}>
                <TextInput
                  mode="outlined"
                  label="Usuario"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  outlineColor="rgba(255,255,255,0.2)"
                  activeOutlineColor={COLORS.primary}
                  textColor="#FFF"
                  theme={{ colors: { background: 'rgba(31, 41, 55, 0.7)', onSurfaceVariant: '#9CA3AF' } }}
                  left={<TextInput.Icon icon="account" color={COLORS.primary} />}
                />
              </View>

              {/* Input Contraseña */}
              <View style={styles.inputWrapper}>
                <TextInput
                  mode="outlined"
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  style={styles.input}
                  outlineColor="rgba(255,255,255,0.2)"
                  activeOutlineColor={COLORS.primary}
                  textColor="#FFF"
                  theme={{ colors: { background: 'rgba(31, 41, 55, 0.7)', onSurfaceVariant: '#9CA3AF' } }}
                  right={
                    <TextInput.Icon 
                      icon={secureTextEntry ? "eye" : "eye-off"} 
                      onPress={() => setSecureTextEntry(!secureTextEntry)}
                      color={COLORS.textSecondary}
                    />
                  }
                  left={<TextInput.Icon icon="lock" color={COLORS.primary} />}
                />
              </View>

              {/* Olvidé mi contraseña */}
              <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
                <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Botón Login */}
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>INGRESAR</Text>
                )}
              </TouchableOpacity>

              {/* Separador */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>O</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Link Registro */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿Aún no tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/register')}>
                  <Text style={styles.linkText}>Regístrate gratis</Text>
                </TouchableOpacity>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)', // Oscurece la imagen un 85% para que se funda
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.6)', // Fondo semitransparente
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Borde sutil brillante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary || '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 15,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.textSecondary || '#9CA3AF',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: COLORS.primary || '#3AAFA9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 10,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  linkText: {
    color: COLORS.primary || '#3AAFA9',
    fontWeight: 'bold',
    fontSize: 14,
  },
});