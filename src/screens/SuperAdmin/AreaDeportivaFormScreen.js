// src/screens/SuperAdmin/AreaDeportivaFormScreen.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth'; // Importamos useAuth
import { areaDeportivaService } from '../../services/areaDeportivaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function AreaDeportivaFormScreen() {
  const params = useLocalSearchParams();
  const existingArea = params.area ? JSON.parse(params.area) : null;
  const zonaId = params.zonaId;
  const isEditing = !!existingArea;
  const { userData } = useAuth(); // Obtenemos los datos del usuario logueado
  const router = useRouter();

  // Estados basados en el DTO
  const [nombreArea, setNombreArea] = useState(isEditing ? existingArea.nombreArea : '');
  const [descripcionArea, setDescripcionArea] = useState(isEditing ? existingArea.descripcionArea : '');
  const [emailArea, setEmailArea] = useState(isEditing ? existingArea.emailArea : '');
  const [telefonoArea, setTelefonoArea] = useState(isEditing ? existingArea.telefonoArea : '');
  const [horaInicioArea, setHoraInicioArea] = useState(isEditing ? existingArea.horaInicioArea : '08:00');
  const [horaFinArea, setHoraFinArea] = useState(isEditing ? existingArea.horaFinArea : '16:00');
  const [latitud, setLatitud] = useState(isEditing ? existingArea.latitud.toString() : '');
  const [longitud, setLongitud] = useState(isEditing ? existingArea.longitud.toString() : '');
  const [estado, setEstado] = useState(isEditing ? existingArea.estado : true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nombreArea || !latitud || !longitud || !userData) {
      Alert.alert('Error', 'Nombre, Latitud, Longitud y Admin ID son obligatorios.');
      return;
    }
    setLoading(true);

    // ▼▼▼ ¡LA CORRECCIÓN CLAVE ESTÁ AQUÍ! ▼▼▼
    // Aseguramos que los valores numéricos sean números y que las horas sean cadenas limpias.
    const areaData = {
      nombreArea,
      descripcionArea,
      emailArea,
      telefonoArea,
      
      // Spring necesita las horas en formato String "HH:mm"
      horaInicioArea: horaInicioArea.trim(), 
      horaFinArea: horaFinArea.trim(),
      
      // Los campos numéricos DEBEN ser convertidos de string a float
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      
      estado,
      idZona: parseInt(zonaId),
      id: userData.id, // ID del administrador (Superusuario)
      urlImagen: existingArea ? existingArea.urlImagen : null,
    };

    try {
      if (isEditing) {
        await areaDeportivaService.updateAreaDeportiva(existingArea.idAreadeportiva, areaData);
        showSuccessToast("Área actualizada.");
      } else {
        await areaDeportivaService.createAreaDeportiva(areaData);
        showSuccessToast("Área creada.");
      }
      router.back();
    } catch (error) {
      // Si el error es 400 (Bad Request), lo más probable es que sea por el formato de hora o teléfono.
      showErrorToast(`No se pudo guardar el área. Código: ${error.response?.status || 'Red'}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>{isEditing ? 'Editar Área' : 'Nueva Área Deportiva'}</Title>
      
      <TextInput label="Nombre del Área" value={nombreArea} onChangeText={setNombreArea} style={styles.input} mode="outlined"/>
      <TextInput label="Descripción" value={descripcionArea} onChangeText={setDescripcionArea} style={styles.input} mode="outlined" multiline/>
      <TextInput label="Email de Contacto" value={emailArea} onChangeText={setEmailArea} style={styles.input} mode="outlined" keyboardType="email-address"/>
      <TextInput label="Teléfono (8 dígitos)" value={telefonoArea} onChangeText={setTelefonoArea} style={styles.input} mode="outlined" keyboardType="phone-pad" maxLength={8}/>
      <TextInput label="Hora Inicio (HH:mm)" value={horaInicioArea} onChangeText={setHoraInicioArea} style={styles.input} mode="outlined"/>
      <TextInput label="Hora Fin (HH:mm)" value={horaFinArea} onChangeText={setHoraFinArea} style={styles.input} mode="outlined"/>
      <TextInput label="Latitud" value={latitud} onChangeText={setLatitud} style={styles.input} mode="outlined" keyboardType="numeric"/>
      <TextInput label="Longitud" value={longitud} onChangeText={setLongitud} style={styles.input} mode="outlined" keyboardType="numeric"/>
      
      <View style={styles.switchContainer}>
        <Text variant="bodyLarge">Estado Activo</Text>
        <Switch value={estado} onValueChange={setEstado} />
      </View>

      <Button mode="contained" onPress={handleSave} style={styles.button} loading={loading} disabled={loading}>
        <Text style={{color: 'white'}}>Guardar</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 }, // Eliminamos paddingTop para el ScrollView
  title: { textAlign: 'center', marginBottom: 20, marginTop: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 16, paddingVertical: 8, marginBottom: 40 }, // Margen al final
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
});
