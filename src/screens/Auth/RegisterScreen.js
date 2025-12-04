import AsyncStorage from '@react-native-async-storage/async-storage'; // Importamos AsyncStorage
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Agregamos useEffect
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';

// Asegúrate de que las rutas sean correctas según tu proyecto
import Logo from '../../components/common/Logo';
import { COLORS } from '../../constants/colors';
import { authService } from '../../services/authService';

// 1. DEFINIMOS EL COMPONENTE FUERA PARA QUE NO PIERDA EL FOCO
const CustomInput = ({ label, value, onChangeText, icon, ...props }) => (
    <View style={styles.inputWrapper}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        outlineColor="rgba(255,255,255,0.2)"
        activeOutlineColor={COLORS.primary}
        textColor="#FFF"
        theme={{ colors: { background: 'rgba(31, 41, 55, 0.6)', onSurfaceVariant: '#9CA3AF' } }}
        left={<TextInput.Icon icon={icon} color={COLORS.primary} />}
        {...props}
      />
    </View>
);

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Modales
  // Cambiamos a false inicial para evitar parpadeos mientras leemos memoria
  const [showTutorial, setShowTutorial] = useState(false); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateObject, setDateObject] = useState(new Date());

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    fechaNacimiento: '', 
    urlImagen: 'https://cdn-icons-png.flaticon.com/512/4814/4814852.png',
    categoria: 'NUEVO'
  });

  // --- LÓGICA DE ASYNC STORAGE PARA EL TUTORIAL ---
useEffect(() => {
    // Agrega esta línea para BORRAR la memoria cada vez que entras (solo mientras desarrollas)
    AsyncStorage.removeItem('hasSeenRegisterTutorial'); 
    
    checkTutorialStatus();
  }, []);

const checkTutorialStatus = async () => {
    try {
      // ANTES: 'hasSeenRegisterTutorial'
      // AHORA: 'hasSeenRegisterTutorial_v2' (o cualquier otro nombre)
      const hasSeen = await AsyncStorage.getItem('hasSeenRegisterTutorial_v2'); 
      
      if (hasSeen !== 'true') {
        setShowTutorial(true);
      }
    } catch (error) {
      console.log('Error leyendo tutorial status:', error);
    }
  };

  const handleCloseTutorial = async () => {
    setShowTutorial(false);
    try {
      // Asegúrate de usar EL MISMO nombre nuevo aquí también
      await AsyncStorage.setItem('hasSeenRegisterTutorial_v2', 'true');
    } catch (error) {
      console.log('Error guardando tutorial status:', error);
    }
  };
  // ------------------------------------------------

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onDateChange = (event, selectedDate) => {
    // En Android hay que cerrar el modal manualmente tras seleccionar
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setDateObject(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('fechaNacimiento', formattedDate);
    }
    
    // Para iOS, el botón de cierre se maneja aparte o se deja visible
    if (event.type === 'dismissed') {
        setShowDatePicker(false);
    }
  };

  const handlePreSubmit = () => {
    if (!formData.username || !formData.password || !formData.nombre || !formData.telefono || !formData.fechaNacimiento) {
      Toast.show({ type: 'error', text1: 'Faltan datos', text2: 'Completa los campos obligatorios (*)' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalRegister = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      await authService.registerCliente(formData);
      Alert.alert(
        '¡Bienvenido!',
        'Tu cuenta ha sido creada exitosamente.',
        [{ text: 'Iniciar Sesión', onPress: () => router.push('/login') }]
      );
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error de Registro', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop' }}
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <Logo size="small" showText={false} />
        </View>

        <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
        >
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad deportiva</Text>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>
            
            <CustomInput 
                label="Nombre *" 
                value={formData.nombre}
                onChangeText={(text) => handleChange('nombre', text)}
                icon="account" 
            />
            <CustomInput 
                label="Apellido Paterno *" 
                value={formData.apellidoPaterno}
                onChangeText={(text) => handleChange('apellidoPaterno', text)}
                icon="account-outline" 
            />
            <CustomInput 
                label="Apellido Materno" 
                value={formData.apellidoMaterno}
                onChangeText={(text) => handleChange('apellidoMaterno', text)}
                icon="account-outline" 
            />
            
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <TextInput
                    mode="outlined"
                    label="Fecha de Nacimiento *"
                    value={formData.fechaNacimiento}
                    editable={false} 
                    style={styles.input}
                    outlineColor="rgba(255,255,255,0.2)"
                    theme={{ colors: { background: 'rgba(31, 41, 55, 0.6)', onSurfaceVariant: '#9CA3AF' } }}
                    textColor="#FFF"
                    right={<TextInput.Icon icon="calendar" color={COLORS.primary} onPress={() => setShowDatePicker(true)}/>}
                />
            </TouchableOpacity>
            
            {showDatePicker && (
                <DateTimePicker
                    value={dateObject}
                    mode="date"
                    display="default"
                    maximumDate={new Date()} 
                    onChange={onDateChange}
                />
            )}

            <CustomInput 
                label="Teléfono *" 
                value={formData.telefono}
                onChangeText={(text) => handleChange('telefono', text)}
                icon="phone" 
                keyboardType="phone-pad" 
                maxLength={8} 
            />

            <Text style={styles.sectionTitle}>Datos de Cuenta</Text>
            
            <CustomInput 
                label="Usuario *" 
                value={formData.username}
                onChangeText={(text) => handleChange('username', text)}
                icon="badge-account-horizontal" 
                autoCapitalize="none" 
            />
            <CustomInput 
                label="Email *" 
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                icon="email" 
                keyboardType="email-address" 
                autoCapitalize="none" 
            />
            <CustomInput 
                label="Contraseña *" 
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                icon="lock" 
                secureTextEntry 
            />

            <TouchableOpacity style={styles.registerButton} onPress={handlePreSubmit}>
                <Text style={styles.registerButtonText}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* --- MODAL TUTORIAL (CON LÓGICA ASYNC) --- */}
      <Modal visible={showTutorial} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalIcon}>👋</Text>
                <Text style={styles.modalTitle}>¡Bienvenido a QJUEGO!</Text>
                <Text style={styles.modalText}>
                    Para registrarte y reservar canchas, necesitamos algunos datos reales.
                </Text>
                <View style={styles.tutorialSteps}>
                    <Text style={styles.stepText}>1. Ingresa tu nombre real.</Text>
                    <Text style={styles.stepText}>2. Selecciona tu fecha de nacimiento.</Text>
                    <Text style={styles.stepText}>3. Crea un usuario único.</Text>
                </View>
                {/* Aquí llamamos a handleCloseTutorial en vez de setShowTutorial(false) */}
                <Button mode="contained" onPress={handleCloseTutorial} buttonColor={COLORS.primary}>
                    Entendido, ¡Vamos!
                </Button>
            </View>
        </View>
      </Modal>

      {/* --- MODAL CONFIRMACIÓN --- */}
      <Modal visible={showConfirmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
                <Text style={styles.confirmTitle}>¿Están correctos tus datos?</Text>
                <Text style={styles.confirmSubtitle}>Verifica antes de enviar</Text>
                
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryItem}><Text style={styles.bold}>Nombre:</Text> {formData.nombre} {formData.apellidoPaterno} {formData.apellidoMaterno}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.bold}>Usuario:</Text> {formData.username}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.bold}>Teléfono:</Text> {formData.telefono}</Text>
                    <Text style={styles.summaryItem}><Text style={styles.bold}>Fecha Nac:</Text> {formData.fechaNacimiento}</Text>
                </View>

                <View style={styles.confirmButtons}>
                    <Button 
                        mode="outlined" 
                        onPress={() => setShowConfirmModal(false)}
                        style={styles.cancelBtn}
                        textColor={COLORS.error || '#EF4444'}
                    >
                        Corregir
                    </Button>
                    <Button 
                        mode="contained" 
                        onPress={handleFinalRegister}
                        style={styles.confirmBtn}
                        buttonColor={COLORS.primary}
                        loading={loading}
                    >
                        {loading ? 'Enviando...' : 'Sí, Registrarme'}
                    </Button>
                </View>
            </View>
        </View>
      </Modal>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 
  },
  backText: { color: '#FFF', fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  formContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 5 },
  inputWrapper: { marginBottom: 12 },
  input: { backgroundColor: 'transparent', fontSize: 14 },
  dateButton: { marginBottom: 12 },
  
  registerButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, marginTop: 20,
    shadowColor: COLORS.primary, shadowOpacity: 0.4, elevation: 5
  },
  registerButtonText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  // Estilos Modales
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1F2937', borderRadius: 20, padding: 30, alignItems: 'center', width: '100%' },
  modalIcon: { fontSize: 40, marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  modalText: { color: '#D1D5DB', textAlign: 'center', marginBottom: 20 },
  tutorialSteps: { alignSelf: 'flex-start', marginBottom: 20 },
  stepText: { color: COLORS.primary, fontSize: 14, marginBottom: 5 },

  confirmCard: { backgroundColor: '#111827', borderRadius: 20, padding: 25, width: '100%', borderWidth: 1, borderColor: COLORS.primary },
  confirmTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center' },
  confirmSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 },
  summaryContainer: { backgroundColor: '#1F2937', padding: 15, borderRadius: 10, marginBottom: 20 },
  summaryItem: { color: '#D1D5DB', marginBottom: 5, fontSize: 15 },
  bold: { fontWeight: 'bold', color: '#FFF' },
  confirmButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cancelBtn: { flex: 1, borderColor: COLORS.error },
  confirmBtn: { flex: 1 }
});