// src/components/AreaCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { Ionicons } from '@expo/vector-icons'; // ✅ Agregamos ícono de ojo

interface Area {
  idAreadeportiva: number;
  nombreArea: string;
  telefonoArea?: string;
  emailArea?: string;
  horaInicioArea?: string;
  horaFinArea?: string;
  urlImagen?: string;
  imagenes?: { urlAcceso: string }[];
}

// ✅ CORREGIDO: sin /api
const server = "http://192.168.100.25:8032"; 

interface AreaCardProps {
  area: Area;
  onPress: () => void;
}
const getFullImageUrl = (urlAcceso?: string) => {
  if (!urlAcceso) return "https://placehold.co/400x300?text=Sin+imagen";
  if (urlAcceso.startsWith("http")) return urlAcceso;
  return `${server}${urlAcceso.startsWith('/') ? urlAcceso : `/${urlAcceso}`}`;
};

const AreaCard: React.FC<AreaCardProps> = ({ area, onPress }) => {
  // ====== ESTADO (ABIERTO/CERRADO) ======
  const getEstado = () => {
    if (!area.horaInicioArea || !area.horaFinArea)
      return { abierto: false, texto: "Horario no definido" };

    const now = new Date();
    const minutosActual = now.getHours() * 60 + now.getMinutes();

    const [h1, m1] = area.horaInicioArea.split(":").map(Number);
    const [h2, m2] = area.horaFinArea.split(":").map(Number);

    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;

    const abierto = minutosActual >= inicio && minutosActual <= fin;

    return { abierto, texto: abierto ? "Abierto" : "Cerrado" };
  };

  const estado = getEstado();

  // ====== IMAGEN ======
  const getImageUrl = () => {
    if (area.imagenes?.[0]?.urlAcceso) {
      return getFullImageUrl(area.imagenes[0].urlAcceso);
    }
    if (area.urlImagen) {
      return getFullImageUrl(area.urlImagen);
    }
    return getFullImageUrl(undefined);
  };


  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View
        entering={FadeIn.duration(500)}
        exiting={FadeOut}
        style={styles.card}
      >
        {/* Imagen */}
        <Image
          source={{ uri: getImageUrl() }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Overlay oscuro */}
        <View style={styles.overlay} />

        {/* Ícono de ojo (como en CanchaCard) */}
        <TouchableOpacity style={styles.detailButton}>
          <Ionicons name="eye" size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Contenido encima de la imagen */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{area.nombreArea}</Text>

          {area.telefonoArea && (
            <Text style={styles.info}>{area.telefonoArea}</Text>
          )}

          {area.emailArea && (
            <Text style={styles.info} numberOfLines={1}>
              {area.emailArea}
            </Text>
          )}

          {/* Estado + número de fotos */}
          <View style={styles.footer}>
            <View
              style={[
                styles.estadoBadge,
                { backgroundColor: estado.abierto ? "#46c4b7" : "#d40000" },
              ]}
            >
              <Text style={styles.estadoText}>{estado.texto}</Text>
            </View>

            {area.imagenes?.length > 0 && (
              <Text style={styles.imageCount}>
                {area.imagenes.length} foto
                {area.imagenes.length > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 380,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#000",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginRight: 18,
    position: 'relative', // ✅ Necesario para absolute
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  detailButton: { // ✅ Estilo del botón de ojo
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  info: {
    color: "#eee",
    fontSize: 14,
    marginBottom: 2,
  },
  footer: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  estadoText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  imageCount: {
    color: "#ddd",
    fontSize: 12,
  },
});

export default AreaCard;