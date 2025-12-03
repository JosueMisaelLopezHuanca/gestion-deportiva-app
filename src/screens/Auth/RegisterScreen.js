// src/screens/Auth/RegisterScreen.js
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title } from 'react-native-paper';
import { authService } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados para todos los campos del SignupRequest
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');

  // ▼▼▼ ¡AQUÍ ESTÁ EL CAMBIO! ▼▼▼
  // Damos al usuario las 3 opciones de rol que puede solicitar.
  const [rolSolicitado, setRolSolicitado] = useState('CLIENTE'); 

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);

    const signupData = {
      username: username.trim(),
      password: password.trim(),
      email: email.trim(),
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      fechaNacimiento,
      telefono: telefono.trim(),
      rolSolicitado, // Enviamos el rol que el usuario seleccionó
      urlImagen: null,
    };

    try {
      const response = await authService.signup(signupData);
      Alert.alert(
        'Registro Exitoso',
        response.message || 'Solicitud registrada. Pendiente de aprobación.',
        [{ text: 'OK', onPress: () => router.push('/login') }]
      );
    } catch (error) {
      Alert.alert('Error de Registro', error.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Crear una Cuenta</Title>

      <TextInput label="Nombre de Usuario" value={username} onChangeText={setUsername} style={styles.input} mode="outlined" />
      <TextInput label="Contraseña" value={password} onChangeText={setPassword} style={styles.input} mode="outlined" secureTextEntry />
      <TextInput label="Confirmar Contraseña" value={confirmPassword} onChangeText={setConfirmPassword} style={styles.input} mode="outlined" secureTextEntry />
      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} mode="outlined" keyboardType="email-address" />
      <TextInput label="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} mode="outlined" />
      <TextInput label="Apellido Paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} style={styles.input} mode="outlined" />
      <TextInput label="Apellido Materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} style={styles.input} mode="outlined" />
      <TextInput label="Teléfono (8 dígitos)" value={telefono} onChangeText={setTelefono} style={styles.input} mode="outlined" keyboardType="phone-pad" maxLength={8} />
      <TextInput label="Fecha Nacimiento (YYYY-MM-DD)" value={fechaNacimiento} onChangeText={setFechaNacimiento} style={styles.input} mode="outlined" />

      <Text variant="bodyLarge" style={styles.pickerLabel}>Solicitar Rol</Text>
      <View style={styles.pickerContainer}>
        {/* ▼▼▼ ¡PICKER ACTUALIZADO! ▼▼▼ */}
        <Picker
          selectedValue={rolSolicitado}
          onValueChange={(itemValue) => setRolSolicitado(itemValue)}
        >
          <Picker.Item label="Cliente (para reservar)" value="CLIENTE" />
          <Picker.Item label="Administrador (de un área)" value="ADMINISTRADOR" />
          <Picker.Item label="Usuario Control (para escanear)" value="USUARIO_CONTROL" />
        </Picker>
      </View>

      <Button mode="contained" onPress={handleRegister} style={styles.button} loading={loading} disabled={loading}>
        <Text style={{color: 'white'}}>Registrarse</Text>
      </Button>
      <Button onPress={() => router.push('/login')} style={styles.buttonSecondary}>
        <Text>¿Ya tienes cuenta? Inicia sesión</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { textAlign: 'center', marginBottom: 20, marginTop: 20 },
  input: { marginBottom: 12 },
  button: { marginTop: 16, paddingVertical: 8 },
  buttonSecondary: { marginTop: 10, marginBottom: 40 },
  pickerLabel: { color: '#6c757d', marginTop: 10, marginLeft: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#888', borderRadius: 5, marginBottom: 20, justifyContent: 'center' },
});