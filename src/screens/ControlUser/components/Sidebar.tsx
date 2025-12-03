import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'canchas',
      label: 'Canchas',
      icon: (isActive: boolean) => (
        <MaterialIcons
          name="sports-basketball"
          size={24}
          color={isActive ? '#000000' : '#CCCCCC'}
        />
      ),
      path: '/controluser/canchas',
    },
    {
      id: 'reservas',
      label: 'Reservas',
      icon: (isActive: boolean) => (
        <MaterialCommunityIcons
          name="calendar"
          size={24}
          color={isActive ? '#000000' : '#CCCCCC'}
        />
      ),
      path: '/reservas',
      subItems: [
        { label: 'Mis Reservas', path: '/reservas/mis-reservas' },
        { label: 'Historial', path: '/reservas/historial' },
        { label: 'Calendario', path: '/reservas/calendario' },
      ],
    },
    {
      id: 'escanear',
      label: 'Escanear',
      icon: (isActive: boolean) => (
        <MaterialIcons
          name="qr-code-scanner"
          size={24}
          color={isActive ? '#000000' : '#CCCCCC'}
        />
      ),
      path: '/escanear',
    },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const handleNavigation = (path: string) => {
    router.push(path as any);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Menú</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {menuItems.map((item) => {
          const isItemActive = isActive(item.path);
          const isExpanded = expandedMenus[item.id];

          return (
            <View key={item.id} style={styles.menuSection}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  isItemActive && styles.activeMenuItem,
                ]}
                onPress={() => {
                  if (item.subItems) {
                    toggleMenu(item.id);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.iconContainer}>
                    {item.icon(isItemActive)}
                  </View>
                  <Text
                    style={[
                      styles.menuItemText,
                      isItemActive && styles.activeMenuItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {item.subItems && (
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={isItemActive ? '#000000' : '#CCCCCC'}
                  />
                )}
              </TouchableOpacity>

              {item.subItems && isExpanded && (
                <View style={styles.subMenu}>
                  {item.subItems.map((subItem) => {
                    const isSubActive = isActive(subItem.path);
                    return (
                      <TouchableOpacity
                        key={subItem.path}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        onPress={() => handleNavigation(subItem.path)}
                      >
                        <Text
                          style={[
                            styles.subMenuItemText,
                            isSubActive && styles.activeSubMenuItemText,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                        {isSubActive && (
                          <View style={styles.activeIndicator} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <FontAwesome5
            name="power-off"
            size={20}
            color="#FF3B30"
          />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRightWidth: 1,
    borderRightColor: '#000000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingVertical: 8,
  },
  menuSection: {
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: '#FFFFFF',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  activeMenuItemText: {
    color: '#000000',
  },
  subMenu: {
    marginLeft: 60,
    marginRight: 20,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  activeSubMenuItem: {
    backgroundColor: '#3A3A3A',
  },
  subMenuItemText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  activeSubMenuItemText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#2A2A2A',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 10,
  },
});

export default Sidebar;