import { Tabs } from "expo-router";
import CustomBottomTab from "../../../src/navigation/CustomBottomTab";

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomBottomTab {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="buscar" />
      <Tabs.Screen name="mis-reservas" />
      <Tabs.Screen name="ayuda" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
