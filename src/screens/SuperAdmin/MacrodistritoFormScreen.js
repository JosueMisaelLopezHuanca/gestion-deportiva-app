import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput, Title } from 'react-native-paper';
import { macrodistritoService } from '../../services/macrodistritoService';

export default function MacrodistritoFormScreen() {
  const params = useLocalSearchParams();
  const existingMacrodistrito = params.macrodistrito ? JSON.parse(params.macrodistrito) : null;
  const isEditing = !!existingMacrodistrito;

  const [nombre, setNombre] = useState(isEditing ? existingMacrodistrito.nombre : '');
  const [descripcion, setDescripcion] = useState(isEditing ? existingMacrodistrito.descripcion : '');
  const [estado, setEstado] = useState(isEditing ? existingMacrodistrito.estado : true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!nombre) {
      Alert.alert('Error', 'El campo "Nombre" es obligatorio.');
      return;
    }
    setLoading(true);

    const macrodistritoData = {
      nombre,
      descripcion,
      estado,
    };

    try {
      if (isEditing) {
        await macrodistritoService.updateMacrodistrito(existingMacrodistrito.idMacrodistrito, macrodistritoData);
      } else {
        await macrodistritoService.createMacrodistrito(macrodistritoData);
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el macrodistrito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>{isEditing ? 'Editar Macrodistrito' : 'Nuevo Macrodistrito'}</Title>
      
      <TextInput
        label="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
      />
      
      <View style={styles.switchContainer}>
        <Text variant="bodyLarge">Estado Activo</Text>
        <Switch value={estado} onValueChange={setEstado} />
      </View>

      <Button 
        mode="contained" 
        onPress={handleSave} 
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        {/* ▼▼▼ ¡AQUÍ ESTÁ LA CORRECCIÓN FINAL! ▼▼▼ */}
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});