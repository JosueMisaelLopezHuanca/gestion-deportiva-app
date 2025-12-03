// src/screens/Client/CanchaDetalleScreen.js
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { canchaService } from '../../services/canchaService';
import { disciplinaService } from '../../services/disciplinaService';
import { reservaService } from '../../services/reservaService';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

// src/screens/Client/CanchaDetalleScreen.js
import { Calendar } from 'react-native-calendars';

export default function CanchaDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userData } = useAuth(); 

  const [cancha, setCancha] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [selectedDisciplina, setSelectedDisciplina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // 1. Carga inicial de datos
  useEffect(() => {
    const fetchCanchaDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [canchaData, reservasData, sepracticaData] = await Promise.all([
          canchaService.getCanchaById(id),
          reservaService.getReservasByCancha(id),
          disciplinaService.getDisciplinasByCancha(id)
        ]);
        
        setCancha(canchaData);
        setReservas(reservasData);
        
        // Lógica de ENRIQUECIMIENTO (pide el nombre de cada disciplina por su ID)
        const disciplinaIds = sepracticaData.map(sp => sp.idDisciplina);
        const disciplinaDetallesPromises = disciplinaIds.map(disciplinaId => 
          disciplinaService.getDisciplinaById(disciplinaId)
        );
        const disciplinasCompletas = await Promise.all(disciplinaDetallesPromises);
        
        setDisciplinas(disciplinasCompletas);
        if (disciplinasCompletas.length > 0) {
          setSelectedDisciplina(disciplinasCompletas[0].idDisciplina);
        }
      } catch (error) {
        showErrorToast("No se pudo cargar la información de la cancha.");
      } finally {
        setLoading(false);
      }
    };
    fetchCanchaDetails();
  }, [id]);

  // 2. Carga horarios cada vez que la fecha cambia
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!selectedDate || !id) return;
      setLoadingHorarios(true);
      setHorariosDisponibles([]);
      try {
        const horarios = await reservaService.getHorariosDisponibles(id, selectedDate);
        setHorariosDisponibles(horarios);
        setSelectedHorario(horarios.length > 0 ? horarios[0] : null);
      } catch (error) {
        showErrorToast('No se pudieron cargar los horarios.');
      } finally {
        setLoadingHorarios(false);
      }
    };
    fetchHorarios();
  }, [selectedDate, id]);

  // 3. Lógica para el botón de reservar
  const handleReserva = async () => {
    if (!selectedDisciplina || !selectedHorario || !selectedDate) {
      Alert.alert("Error", "Por favor, selecciona disciplina, fecha y horario.");
      return;
    }
    
    // El horario viene como "08:00 - 08:30". Lo separamos.
    const [horaInicio, horaFin] = selectedHorario.split(' - ');
    
    const datosReserva = {
      fecha: selectedDate,
      horaInicio: horaInicio,
      horaFin: horaFin,
    };

    try {
      setLoading(true);
      await reservaService.crearReservaCompleta(
        datosReserva,
        cancha.idCancha,
        selectedDisciplina,
        userData.idPersona, // 👈 Esta línea ahora recibirá el ID correcto
        cancha.costoHora
      );
      showSuccessToast("¡Reserva creada con éxito!");
      router.back();
    } catch (error) {
      showErrorToast("No se pudo crear la reserva.");
    } finally {
      setLoading(false);
    }
  };
  // Define la cabecera de la lista
  const renderHeader = () => (
    <Card.Content>
      <Title style={styles.title}>{cancha?.nombre}</Title>
      <Paragraph style={styles.infoText}>Tipo: {cancha?.tipoSuperficie}</Paragraph>
      <Paragraph style={styles.infoText}>Capacidad: {cancha?.capacidad} personas</Paragraph>
      <Paragraph style={styles.infoText}>Costo por hora: Bs. {cancha?.costoHora}</Paragraph>

      <Title style={styles.sectionTitle}>Reservar Horario</Title>
      
      {/* Paso 1: Selector de Disciplina */}
      <Text style={styles.pickerLabel}>Paso 1: Selecciona la Disciplina:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedDisciplina}
          onValueChange={(itemValue) => setSelectedDisciplina(itemValue)}
          enabled={disciplinas.length > 0}
        >
          {disciplinas.length === 0 ? (
            <Picker.Item label="No hay disciplinas asignadas" value={null} />
          ) : (
            disciplinas.map((d) => (
              <Picker.Item key={d.idDisciplina} label={d.nombre} value={d.idDisciplina} /> 
            ))
          )}
        </Picker>
      </View>
      
      {/* Paso 2: Calendario */}
      <Text style={styles.pickerLabel}>Paso 2: Selecciona la Fecha</Text>
      <Calendar
        style={styles.calendar}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#6200ee' }
        }}
        minDate={new Date().toISOString().split('T')[0]} // No se pueden reservar días pasados
      />

      {/* Paso 3: Selector de Horario */}
      <Text style={styles.pickerLabel}>Paso 3: Selecciona el Horario</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedHorario}
          onValueChange={(itemValue) => setSelectedHorario(itemValue)}
          enabled={!loadingHorarios && horariosDisponibles.length > 0}
        >
          {loadingHorarios ? (
            <Picker.Item label="Cargando horarios..." value={null} />
          ) : horariosDisponibles.length === 0 ? (
            <Picker.Item label="No hay horarios para esta fecha" value={null} />
          ) : (
            horariosDisponibles.map((horario) => (
              <Picker.Item key={horario} label={horario} value={horario} /> 
            ))
          )}
        </Picker>
      </View>
      
      <Button mode="contained" onPress={handleReserva} loading={loading} disabled={loading || !selectedHorario}>
        <Text style={{color: 'white'}}>Confirmar Reserva</Text>
      </Button>
      
      <Title style={styles.sectionTitle}>Reservas Existentes</Title>
    </Card.Content>
  );
  
  // Define el pie de página de la lista
  const renderFooter = () => (
    <Button onPress={() => router.back()} style={{marginTop: 20, marginBottom: 40}}>
      Volver
    </Button>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!cancha) {
    return (
     <View style={styles.noCanchaContainer}>
       <Text style={styles.noCanchaText}>No se encontró la cancha solicitada.</Text>
       <Button onPress={() => router.back()}>Volver</Button>
     </View>
   );
  }

  // El FlatList final que usa las funciones de arriba
  return (
    <FlatList
      style={styles.container}
      data={reservas}
      keyExtractor={(item) => item.idReserva.toString()}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      renderItem={({ item }) => (
        <Card style={styles.reservaCard}>
          <Card.Content>
            <Paragraph>Fecha: {item.fechaReserva}</Paragraph>
            <Paragraph>Hora: {item.horaInicio} - {item.horaFin}</Paragraph>
            <Paragraph>Estado: {item.estadoReserva}</Paragraph>
          </Card.Content>
        </Card>
      )}
      ListEmptyComponent={<Text style={{textAlign: 'center'}}>Esta cancha aún no tiene reservas.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noCanchaContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noCanchaText: { fontSize: 18, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
  infoText: { fontSize: 16, color: '#555', marginBottom: 5 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 30, marginBottom: 10 },
  reservaCard: { marginBottom: 10, backgroundColor: '#f0f0f0', marginHorizontal: 10 },
  pickerLabel: { color: '#6c757d', marginBottom: 8, fontSize: 16 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 5,
    marginBottom: 20,
    justifyContent: 'center',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginBottom: 20,
  }
});