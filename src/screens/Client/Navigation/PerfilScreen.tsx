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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { getClienteById, updateCliente } from '../../../services/ClienteApi';

export default function PerfilScreen() {
  const router = useRouter();
   const { userData, isLoading: authLoading } = useAuth();

  const [cliente, setCliente] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openPhotoModal, setOpenPhotoModal] = useState(false);

  // === Imágenes por defecto (puedes reemplazar con assets locales)
  const defaultPhotos = [
    'https://cdn-icons-png.flaticon.com/512/4814/4814852.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135769.png',
    'https://cdn-icons-png.flaticon.com/512/3135/3135823.png',
  ];

  // === Colores
  const COLORS = {
    pb6: '#FFFFFF',
    pb5: '#41BFB2',
    pb3: '#F28627',
    pb1: '#D61727',
    pb4: '#F2EFEB',
    grayDark: '#1F2937',
    grayMedium: '#6B7280',
    grayLight: '#F3F4F6',
    white: '#FFFFFF',
    black: '#000000',
  };

  // === Cargar cliente
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
  }, [ userData?.id]);

  // === Manejar cambios
  const handleInput = (field: string, value: string) => {
    setCliente((prev: any) => ({ ...prev, [field]: value }));
  };

  // === Guardar cambios
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: COLORS.grayMedium }]}>
          Cargando tu perfil...
        </Text>
      </View>
    );
  }

  if (!cliente) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: COLORS.pb1 }]}>
          No se encontró tu perfil.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Título */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: COLORS.grayDark }]}>👤 Mi perfil</Text>
      </View>

      {/* Tarjeta principal */}
      <View style={[styles.card, { backgroundColor: COLORS.pb6 }]}>
        {/* Foto de perfil */}
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: cliente.urlImagen || defaultPhotos[0] }}
            style={styles.profileImage}
          />
          <TouchableOpacity
            onPress={() => setOpenPhotoModal(true)}
            style={[styles.cameraButton, { backgroundColor: COLORS.pb5 }]}
          >
            <Ionicons name="camera" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Campos editables */}
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
              <Text style={[styles.fieldLabel, { color: COLORS.grayMedium }]}>{label}</Text>
              <TextInput
                value={cliente[field] || ''}
                editable={editMode}
                onChangeText={(value) => handleInput(field, value)}
                style={[
                  styles.input,
                  { 
                    color: COLORS.grayDark,
                    backgroundColor: editMode ? COLORS.pb6 : COLORS.pb4,
                  }
                ]}
                placeholder={`Ingrese ${label.toLowerCase()}`}
              />
            </View>
          ))}
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          {!editMode ? (
            <TouchableOpacity
              onPress={() => setEditMode(true)}
              style={[styles.button, { backgroundColor: COLORS.pb5 }]}
            >
              <Text style={[styles.buttonText, { color: COLORS.white }]}>Editar perfil</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setEditMode(false)}
                style={[styles.button, { backgroundColor: COLORS.grayLight }]}
              >
                <Ionicons name="close" size={16} color={COLORS.grayDark} />
                <Text style={[styles.buttonText, { color: COLORS.grayDark }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.button, { backgroundColor: COLORS.pb5 }]}
              >
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
                <Text style={[styles.buttonText, { color: COLORS.white }]}>Guardar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Modal de fotos */}
      <Modal visible={openPhotoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: COLORS.pb6 }]}>
            <Text style={[styles.modalTitle, { color: COLORS.grayDark }]}>Seleccionar foto</Text>
            <View style={styles.photosGrid}>
              {defaultPhotos.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleInput('urlImagen', img);
                    setOpenPhotoModal(false);
                  }}
                  style={styles.photoOption}
                >
                  <Image source={{ uri: img }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setOpenPhotoModal(false)}
              style={[styles.closeButton, { backgroundColor: COLORS.pb5 }]}
            >
              <Text style={[styles.closeButtonText, { color: COLORS.white }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  card: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
    marginBottom: 24,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#41BFB2',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldsContainer: {
    width: '100%',
  },
  fieldRow: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: 'Inter',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  photoOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});