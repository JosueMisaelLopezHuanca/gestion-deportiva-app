// src/screens/ControlUser/ReservasCancha.js
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { reservaService } from '../../services/reservaService';
import { qrService } from '../../services/qrService';
import ReservasCards from './ReservasCards';

/**
 * Muestra todas las reservas de una cancha.
 * Props:
 *  - canchaId: número (ID de la cancha). Si no se pasa, se usa 1 para pruebas.
 */
export default function ReservasCancha({ canchaId }) {
	const [reservas, setReservas] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		cargarReservas();
	}, [canchaId]);

	const cargarReservas = async () => {
		try {
			setLoading(true);
			setError(null);
			const id = canchaId ?? 1; // default para pruebas
			const data = await reservaService.getReservasByCanchaK(id);
			
			// Enriquecer cada reserva con vecesEscaneado desde los QRs
			const reservasEnriquecidas = await Promise.all(
				(Array.isArray(data) ? data : []).map(async (reserva) => {
					try {
						const qrs = await qrService.getQrsPorReserva(reserva.idReserva);
						// El backend devuelve vecesEscaneado en cada QR; usamos el primero o 0
						const vecesEscaneado = qrs?.[0]?.vecesEscaneado ?? 0;
						return { ...reserva, vecesEscaneado };
					} catch (err) {
						console.warn(`No se pudo cargar QRs de reserva ${reserva.idReserva}`);
						return { ...reserva, vecesEscaneado: 0 };
					}
				})
			);
			
			setReservas(reservasEnriquecidas);
		} catch (e) {
			console.error('Error al cargar reservas de la cancha:', e);
			setError('No se pudieron cargar las reservas');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View style={styles.center}> 
				<ActivityIndicator size="large" />
				<Text style={{ marginTop: 8 }}>Cargando reservas...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.center}>
				<Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
				<Button onPress={cargarReservas} mode="contained">Reintentar</Button>
			</View>
		);
	}

	if (!reservas.length) {
		return (
			<View style={styles.center}>
				<Text>No hay reservas en esta cancha</Text>
			</View>
		);
	}

	return <ReservasCards reservas={reservas} onRefresh={cargarReservas} />;
}

const styles = StyleSheet.create({
	center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
