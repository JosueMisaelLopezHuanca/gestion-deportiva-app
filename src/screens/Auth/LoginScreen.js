import { useRouter } from 'expo-router'; // ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(username.trim(), password.trim());
    } catch (error) {
      // ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN! ▼▼▼
      // 'error.message' ahora contendrá el mensaje específico del backend
      // (ej. "Error: Usuario no aprobado o inactivo.")
      Alert.alert(
        "Error de Login", 
        error.message || "Usuario o contraseña incorrectos."
      );
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Bienvenido</Text>
      <TextInput label="Usuario" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput label="Contraseña" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />
      <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading}>
        <Text style={{color: 'white'}}>Ingresar</Text>
      </Button>
    {/*  3. AÑADE ESTE BOTÓN  */}
      <Button 
        onPress={() => router.push('/register')} 
        style={{marginTop: 15}}
      >
        <Text>¿No tienes cuenta? Regístrate</Text>
      </Button>
    </View>
  );
};
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 20 }, input: { marginVertical: 10 } });