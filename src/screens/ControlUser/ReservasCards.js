// src/screens/ControlUser/ReservasCards.js
import { useRouter } from 'expo-router';
import { Calendar, Clock, Info, MapPin } from 'lucide-react-native';
import React from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

const formatTime = (t) => (t ? String(t).split(':').slice(0, 2).join(':') : '—');

const EstadoPill = ({ estado }) => {
	const e = String(estado || '').toUpperCase();
	let bg = '#FDE68A', fg = '#92400E', label = estado || '—'; // Pendiente (default amber)
	if (e.includes('CONFIRM')) { bg = '#BBF7D0'; fg = '#065F46'; label = 'Confirmada'; }
	else if (e.includes('CANCEL')) { bg = '#FECACA'; fg = '#7F1D1D'; label = 'Cancelada'; }
	else if (e.includes('PEND')) { bg = '#FDE68A'; fg = '#92400E'; label = 'Pendiente'; }
	return (
		<View style={[styles.pill, { backgroundColor: bg }]}>
			<Text style={[styles.pillText, { color: fg }]}>{label}</Text>
		</View>
	);
};

function ReservaItem({ r, onScan }) {
	const fecha = r.fechaReserva || r.fecha || '—';
	const hi = formatTime(r.horaInicio);
	const hf = formatTime(r.horaFin);
	const cancha = r.cancha || {}; // nombre, tipoSuperficie, tamano, iluminacion, cubierta
	const disciplina = r.disciplina || {}; // nombre, descripcion
	const estadoUpper = String(r.estadoReserva || '').toUpperCase();

	const handleScan = () => {
		if (estadoUpper.includes('PEND')) {
			Alert.alert(
				'Reserva en pendiente',
				'Reserva en pendiente, aun no se realizo el pago completo, aun no se le generaron qrs al cliente'
			);
			return;
		}
		if (estadoUpper.includes('CANCEL')) {
			Alert.alert(
				'Reserva cancelada',
				'RESERVA CANCELADA, NO EXISTEN QRS PARA ESTA RESERVA, INDICAR AL CLIENTE SE DIRIJA A DMINISTRACION PARA EL REEMBOLSO DE SU DINERO SEGUN TERMINOS Y CONDICIONES'
			);
			return;
		}
		if (onScan) {
			onScan(r);
		} else {
			Alert.alert('Escanear', `Escanear QR de la reserva #${r.idReserva}`);
		}
	};

	return (
		<Card style={styles.card} mode="elevated">
			{/* Badge de escaneos restantes en esquina */}
			{(() => {
				const capacidad = (r.capacidadTotal ?? r.cancha?.capacidad ?? null);
				const escaneos = (r.vecesEscaneado ?? 0);
				if (typeof capacidad === 'number') {
					const restantes = Math.max(capacidad - escaneos, 0);
					return (
						<View style={[styles.remainingBadge, restantes === 0 && styles.remainingBadgeFull]}>
							<Text style={styles.remainingBadgeText}>
								{restantes > 0 ? `${restantes}` : '0'}
							</Text>
						</View>
					);
				}
				return null;
			})()}
			<Card.Content>
				<Text style={styles.header}>Detalles de la Reserva</Text>

				{/* Bloque principal: fecha, horario, estado, notas */}
				<View style={styles.mainInfo}>
					<View style={styles.mainRow}>
						<Calendar size={16} color="#41BFB3" />
						<Text style={styles.mainText}><Text style={styles.bold}>Fecha:</Text> {fecha}</Text>
					</View>
					<View style={styles.mainRow}>
						<Clock size={16} color="#41BFB3" />
						<Text style={styles.mainText}><Text style={styles.bold}>Horario:</Text> {hi} – {hf}</Text>
					</View>
					<View style={styles.mainRow}>
						<Info size={16} color="#41BFB3" />
						<Text style={styles.mainText}><Text style={styles.bold}>Estado:</Text> </Text>
						<EstadoPill estado={r.estadoReserva} />
					</View>
					{!!r.observaciones && (
						<View style={[styles.mainRow, { alignItems: 'flex-start' }]}>
							<View style={{ width: 16 }} />
							<Text style={[styles.mainText, { flex: 1 }]}><Text style={styles.bold}>Notas:</Text> {r.observaciones}</Text>
						</View>
					)}
				</View>

				{/* Sección derecha (apilada en móvil): Cancha */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<MapPin size={16} color="#41BFB3" />
						<Text style={styles.sectionTitle}>Cancha</Text>
					</View>
					<View style={styles.sectionBody}>
						<Text style={styles.line}><Text style={styles.bold}>Nombre:</Text> {cancha.nombre || '—'}</Text>
						<Text style={styles.line}><Text style={styles.bold}>Superficie:</Text> {cancha.tipoSuperficie || '—'}</Text>
						<Text style={styles.line}><Text style={styles.bold}>Tamaño:</Text> {cancha.tamano || '—'}</Text>
						<Text style={styles.line}><Text style={styles.bold}>Iluminación:</Text> {cancha.iluminacion || '—'}</Text>
						<Text style={styles.line}><Text style={styles.bold}>Cubierta:</Text> {cancha.cubierta || '—'}</Text>
					</View>
				</View>

				{/* Disciplina */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Disciplina</Text>
					</View>
					<View style={styles.sectionBody}>
						<Text style={[styles.line, { fontWeight: '700' }]}>{disciplina.nombre || 'Sin disciplina'}</Text>
						<Text style={[styles.line, { opacity: 0.85 }]}>
							{disciplina?.descripcion
								? `${disciplina.descripcion.substring(0, 100)}${disciplina.descripcion.length > 100 ? '…' : ''}`
								: 'Sin descripción'}
						</Text>
					</View>
				</View>

				{/* Botón único */}
				<View style={styles.footer}> 
					<Button
						mode="contained"
						onPress={handleScan}
						style={styles.scanBtn}
						labelStyle={styles.scanLabel}
					>
						escanear qr de la reserva
					</Button>
				</View>
			</Card.Content>
		</Card>
	);
}

export default function ReservasCards({ reservas = [], onScanReserva, onRefresh }) {
	const router = useRouter();
	const handleScan = (reserva) => {
		const estadoUpper = String(reserva.estadoReserva || '').toUpperCase();
		// Bloquea solo pendientes y canceladas con mensajes
		if (estadoUpper.includes('PEND')) {
			Alert.alert(
				'Reserva en pendiente',
				'Reserva en pendiente, aun no se realizo el pago completo, aun no se le generaron qrs al cliente'
			);
			return;
		}
		if (estadoUpper.includes('CANCEL')) {
			Alert.alert(
				'Reserva cancelada',
				'RESERVA CANCELADA, NO EXISTEN QRS PARA ESTA RESERVA, INDICAR AL CLIENTE SE DIRIJA A DMINISTRACION PARA EL REEMBOLSO DE SU DINERO SEGUN TERMINOS Y CONDICIONES'
			);
			return;
		}
		// Para estado en curso, confirmada u otros válidos: abre cámara
		router.push('/controluser/qr-validator');
	};
	
	const handleScanComplete = () => {
		// Recargar datos tras escanear para actualizar vecesEscaneado
		if (onRefresh) onRefresh();
	};
	
	return (
		<FlatList
			data={reservas}
			keyExtractor={(r) => String(r.idReserva ?? Math.random())}
			renderItem={({ item }) => <ReservaItem r={item} onScan={handleScan} />}
			contentContainerStyle={styles.list}
			onRefresh={onRefresh}
			refreshing={false}
		/>
	);
}

const styles = StyleSheet.create({
	list: { padding: 16 },
	card: {
		marginBottom: 16,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		overflow: 'hidden',
		elevation: 3,
		position: 'relative',
	},
	header: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 12, color: '#1a1a1a' },
	mainInfo: { gap: 8, marginBottom: 12 },
	mainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	mainText: { fontSize: 14, color: '#333' },
	bold: { fontWeight: '700' },
	pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginLeft: 6 },
	pillText: { fontSize: 12, fontWeight: '700' },

	section: { marginTop: 8 },
	sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
	sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
	sectionBody: { backgroundColor: '#F3F4F6', padding: 10, borderRadius: 12, gap: 4 },
	line: { fontSize: 13, color: '#333' },

	footer: { marginTop: 14, alignItems: 'center' },
	scanBtn: { backgroundColor: '#41BFB3', borderRadius: 10, paddingHorizontal: 12 },
	scanLabel: { textTransform: 'none', fontWeight: '700' },
});
