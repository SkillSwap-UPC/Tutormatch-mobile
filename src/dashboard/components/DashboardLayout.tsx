import React, { ReactNode, useEffect, useState } from 'react';
import { Dimensions, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import Navbar from './Navbar';
import Sidebar from './SideBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isWideScreen, setIsWideScreen] = useState(false);

  // Detectar si estamos en una pantalla ancha (tablet/desktop)
  useEffect(() => {
    const detectScreenSize = () => {
      const { width } = Dimensions.get('window');
      setIsWideScreen(width >= 768); // Consideramos 768px como punto de quiebre para tablets
    };

    detectScreenSize();
    const subscription = Dimensions.addEventListener('change', detectScreenSize);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2c2c2c" barStyle="light-content" />
      
      {/* Navbar en la parte superior */}
      <View style={styles.navbarContainer}>
        <Navbar />
      </View>

      <View style={styles.contentWrapper}>
        {/* Sidebar - visible permanentemente en pantallas anchas */}
        {isWideScreen && (
          <View style={styles.sidebarContainer}>
            <Sidebar style={styles.sidebar} />
          </View>
        )}

        {/* En móvil, el Sidebar se muestra como un drawer que aparece desde la izquierda */}
        {!isWideScreen && (
          <Sidebar />
        )}

        {/* Contenido principal */}
        <View 
          style={[
            styles.mainContent,
            isWideScreen && styles.mainContentWithSidebar
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e',
  },
  navbarContainer: {
    width: '100%',
    zIndex: 50,
    // Evitar que elementos del contenido principal aparezcan detrás del navbar
    elevation: 4, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: '#2c2c2c',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: 280,
    height: '100%',
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    zIndex: 40,
  },
  sidebar: {
    width: 280,
    height: '100%',
  },
  mainContent: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  mainContentWithSidebar: {
    marginLeft: 280, // Ancho del sidebar
  }
});

export default DashboardLayout;