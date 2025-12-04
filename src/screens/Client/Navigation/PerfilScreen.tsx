// app/(client)/perfil.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useAuth } from '../../../hooks/useAuth';
import { getClienteById, updateCliente } from '../../../services/ClienteApi';

export default function PerfilScreen() {
  const { userData, logout } = useAuth();

  const [cliente, setCliente] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);

  const defaultPhotos = [
    'https://cdn-icons-png.flaticon.com/512/4814/4814852.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135769.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135823.png',
  ];

  const COLORS = {
    primary: '#41BFB2',
    danger: '#D61727',
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
  };

  useEffect(() => {
    if (!userData?.id) return;

    const fetchCliente = async () => {
      try {
        const data = await getClienteById(userData.id);
        setCliente(data);
      } catch (error) {
        console.error('Error al cargar cliente:', error);
        Alert.alert('Error', 'No se pudo cargar tu perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [userData?.id]);

  const handleInput = (field: string, value: string) => {
    setCliente((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!cliente) return;

    try {
      await updateCliente(cliente.id, cliente);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      setEditMode(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.grayMedium }}>Cargando tu perfil...</Text>
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.danger }}>No se encontró tu perfil.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Mi perfil</Text>

      <View style={styles.card}>
        {/* Foto de perfil */}
        <TouchableOpacity style={styles.profileContainer} onPress={() => setOpenPhotoModal(true)}>
          <Image
            source={{ uri: cliente.urlImagen || defaultPhotos[0] }}
            style={styles.profileImage}
          />
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>

        {/* Campos de información */}
        <View style={styles.fieldsContainer}>
          {[
            { label: 'Nombre', field: 'nombre' },
            { label: 'Apellido paterno', field: 'apellidoPaterno' },
            { label: 'Apellido materno', field: 'apellidoMaterno' },
            { label: 'Correo', field: 'email' },
            { label: 'Teléfono', field: 'telefono' },
            { label: 'Fecha de nacimiento', field: 'fechaNacimiento' },
          ].map(({ label, field }) => (
            <View key={field} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                value={cliente[field] || ''}
                editable={editMode}
                onChangeText={(value) => handleInput(field, value)}
                placeholder={`Ingrese ${label.toLowerCase()}`}
                style={[
                  styles.input,
                  { backgroundColor: editMode ? COLORS.white : COLORS.grayLight, color: COLORS.grayDark },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          {!editMode ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: COLORS.primary }]}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.buttonText}>Editar perfil</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: COLORS.grayLight }]}
                onPress={() => setEditMode(false)}
              >
                <Text style={[styles.buttonText, { color: COLORS.grayDark }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: COLORS.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal fotos */}
      <Modal visible={openPhotoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: COLORS.white }]}>
            <Text style={styles.modalTitle}>Seleccionar foto</Text>
            <View style={styles.photosGrid}>
              {defaultPhotos.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoOption}
                  onPress={() => {
                    handleInput('urlImagen', img);
                    setOpenPhotoModal(false);
                  }}
                >
                  <Image source={{ uri: img }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: COLORS.primary }]} onPress={() => setOpenPhotoModal(false)}>
              <Text style={[styles.closeButtonText, { color: COLORS.white }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#1F2937' },
  card: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  profileContainer: { alignItems: 'center', marginBottom: 24 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#41BFB2' },
  changePhotoText: { marginTop: 8, color: '#41BFB2', fontWeight: '600' },
  fieldsContainer: { width: '100%' },
  fieldRow: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#6B7280' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  logoutButton: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D61727' },
  logoutText: { color: '#D61727', fontWeight: '600', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { width: '100%', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 16 },
  photoOption: { width: 60, height: 60, borderRadius: 30, overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  closeButton: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  closeButtonText: { fontSize: 14, fontWeight: '600' },
});
