// src/screens/Client/AreaDetalleScreen.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Text, Title } from 'react-native-paper';
import { areaDeportivaService } from '../../services/areaDeportivaService';
import { canchaService } from '../../services/canchaService';
import { showErrorToast } from '../../utils/toast';

export default function AreaDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [area, setArea] = useState(null);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [areaData, canchasData] = await Promise.all([
          areaDeportivaService.getAreaDeportivaById(id),
          canchaService.getCanchasByArea(id)
        ]);
        
        // Imprimimos los datos para confirmar (puedes borrar esta línea)
        console.log("Datos de Canchas recibidos:", JSON.stringify(canchasData, null, 2));

        setArea(areaData);
        setCanchas(canchasData);
      } catch (error) {
        showErrorToast("No se pudo cargar la información del área.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Componente para la cabecera del FlatList
  const renderHeader = () => (
    <Card.Content>
      <Title style={styles.title}>{area.nombreArea}</Title>
      <Paragraph style={styles.descripcion}>{area.descripcionArea}</Paragraph>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Horario:</Text>
        <Text style={styles.infoText}>{area.horaInicioArea} - {area.horaFinArea}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Teléfono:</Text>
        <Text style={styles.infoText}>{area.telefonoArea}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoText}>{area.emailArea}</Text>
      </View>
      <Title style={styles.sectionTitle}>Canchas Disponibles</Title>
    </Card.Content>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!area) {
     return (
       <View style={styles.container}>
         <Title>Área no encontrada</Title>
         <Button onPress={() => router.back()}>Volver</Button>
       </View>
     );
  }

  // Usamos FlatList como el componente principal
  return (
    <FlatList
      style={styles.container}
      data={canchas}
      keyExtractor={(item) => item.idCancha.toString()} // ✅ Esto era correcto
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <Card 
          style={[styles.canchaCard, !item.estado && styles.desactivadoCard]}
          onPress={() => router.push(`/client/cancha/${item.idCancha}`)} // ✅ Esto era correcto
        >
          <Card.Content>
            {/* ▼▼▼ ¡AQUÍ ESTÁN LAS CORRECCIONES! ▼▼▼ */}
            <Title>{item.nombre}</Title> 
            <Paragraph>Tipo: {item.tipoSuperficie}</Paragraph>
            <Paragraph>Costo: Bs. {item.costoHora}</Paragraph>
          </Card.Content>
        </Card>
      )}
      ListEmptyComponent={
        <Text style={{textAlign: 'center', marginTop: 20}}>
          No hay canchas disponibles en esta área.
        </Text>
      }
      ListFooterComponent={
        <Button onPress={() => router.back()} style={{marginTop: 20, marginBottom: 40}}>
          Volver a la lista
        </Button>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 15,
  }, 
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
  },
  descripcion: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  canchaCard: {
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  desactivadoCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5ff'
  }
});