// src/screens/SuperAdmin/ZonaFormScreen.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, Title } from 'react-native-paper';
import { zonaService } from '../../services/zonaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function ZonaFormScreen() {
  const params = useLocalSearchParams();
  const existingZona = params.zona ? JSON.parse(params.zona) : null;
  const macrodistritoId = params.macrodistritoId;
  const isEditing = !!existingZona;

  const [nombre, setNombre] = useState(isEditing ? existingZona.nombre : '');
  const [descripcion, setDescripcion] = useState(isEditing ? existingZona.descripcion : '');
  const [estado, setEstado] = useState(isEditing ? existingZona.estado : true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!nombre) { Alert.alert('Error', 'El campo "Nombre" es obligatorio.'); return; }
    setLoading(true);

    const zonaData = { nombre, descripcion, estado, idMacrodistrito: parseInt(macrodistritoId) };

    try {
      if (isEditing) {
        await zonaService.updateZona(existingZona.idZona, zonaData);
        showSuccessToast("Zona actualizada con éxito.");
      } else {
        await zonaService.createZona(zonaData);
        showSuccessToast("Zona creada con éxito.");
      }
      router.back();
    } catch (error) {
      showErrorToast('No se pudo guardar la zona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>{isEditing ? 'Editar Zona' : 'Nueva Zona'}</Title>
      <TextInput label="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} mode="outlined"/>
      <TextInput label="Descripción" value={descripcion} onChangeText={setDescripcion} style={styles.input} mode="outlined" multiline/>
      <View style={styles.switchContainer}>
        <Text variant="bodyLarge">Estado Activo</Text>
        <Switch value={estado} onValueChange={setEstado} />
      </View>
      <Button mode="contained" onPress={handleSave} style={styles.button} loading={loading} disabled={loading}>
        <Text style={{color: 'white'}}>Guardar</Text>
      </Button>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 16 },
  button: { marginTop: 16, paddingVertical: 8 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
});