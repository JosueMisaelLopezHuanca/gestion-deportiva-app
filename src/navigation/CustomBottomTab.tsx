import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Home,
  Search,
  History,
  HelpCircle,
  User,
} from "lucide-react-native";
import { useRouter } from "expo-router";

const COLORS = {
  background: "#FFFFFF",
  active: "#41bfb2",
  inactive: "#666666",
};

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  
  buscar: Search,
  index: Home,
  "mis-reservas": History,
  ayuda: HelpCircle,
  perfil: User,
};

const LABELS: Record<string, string> = {
  index: "Inicio",
  buscar: "Buscar",
  "mis-reservas": "Reservas",
  ayuda: "Ayuda",
  perfil: "Perfil",
};

export default function CustomBottomTab({
  state,
  descriptors,
  navigation,
}: {
  state: any;
  descriptors: any;
  navigation: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 64,
        backgroundColor: COLORS.background,
        justifyContent: "space-around",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 10,
        elevation: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const label = route.name;
        const Icon = ICONS[label];

        return (
          <TouchableOpacity
            key={label}
            onPress={() => navigation.navigate(label)}
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              transform: [{ scale: isFocused ? 0.97 : 1 }],
            }}
          >
            {Icon && (
              <Icon
                size={22}
                color={isFocused ? COLORS.active : COLORS.inactive}
                style={{ marginBottom: 4 }}
              />
            )}
            <Text
              style={{
                fontSize: 12,
                fontFamily: "JosefinSans",
                color: isFocused ? COLORS.active : COLORS.inactive,
              }}
            >
              {LABELS[label] ?? label.replace("-", " ")}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
