// src/screens/AyudaScreen.tsx
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, LayoutAnimation, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Habilitar animación suave en Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqs = [
  {
    question: "¿Puedo cancelar mi reserva?",
    answer: "Sí. Según el tiempo de anticipación:\n• Más de 24 horas → devolución 100%\n• Entre 12 y 24 horas → 70%\n• Menos de 12 horas → sin devolución (salvo fuerza mayor justificada).\nEl reembolso se hace al mismo método en máximo 7 días hábiles."
  },
  {
    question: "¿Puedo reprogramar o cambiar de cancha?",
    answer: "Sí, una vez gratis si lo haces con más de 6 horas de anticipación. Ve a “Mis Reservas” → Reprogramar o Cambiar Cancha. Si la nueva es más cara, pagas la diferencia."
  },
  {
    question: "¿Qué métodos de pago hay?",
    answer: "• QR y Tarjeta → siempre disponibles\n• Efectivo en cancha → solo si la reserva es para hoy y faltan menos de 12 horas\nTambién ofrecemos pago en 2, 3, 4 o 5 cuotas."
  },
  // ... agrega el resto de preguntas aquí
];

export default function AyudaScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}> AYUDA</Text>
      <Text style={styles.subtitle}>
        Centro de ayuda. Preguntas frecuentes y soporte.
      </Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity onPress={() => toggleItem(index)} style={styles.questionContainer}>
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={openIndex === index ? "chevron-up" : "chevron-down"}
                size={24}
                color="#41bfb2"
              />
            </TouchableOpacity>
            {openIndex === index && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          ¿Aún tienes dudas? Escríbenos al chat o WhatsApp y te respondemos en minutos.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fefefe" },
  scroll: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4, textAlign: "center", color: "#000" },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: "center", color: "#555" },
  card: { borderRadius: 12, marginBottom: 12, overflow: "hidden", backgroundColor: "#fff", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  questionContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  question: { fontSize: 16, fontWeight: "600", flex: 1, color: "#000" },
  answerContainer: { paddingHorizontal: 16, paddingBottom: 12 },
  answer: { fontSize: 14, lineHeight: 20, color: "#555" },
  footer: { marginTop: 20, textAlign: "center", fontStyle: "italic", color: "#888" },
});
