import { Text } from '@/src/utils/TextFix';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from '@expo/vector-icons'; // Librería de iconos incorporada
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../public/hooks/useAuth';
import { SemesterService } from '../services/SemesterService';

// Iconos disponibles para asignar a los semestres (usando @expo/vector-icons)
const getIconByIndex = (index: number) => {
  const icons = [
    <FontAwesome5 name="code" size={22} color="#f05c5c" />,
    <MaterialIcons name="layers" size={22} color="#f05c5c" />,
    <MaterialIcons name="storage" size={22} color="#f05c5c" />,
    <MaterialCommunityIcons name="server" size={22} color="#f05c5c" />,
    <MaterialIcons name="desktop-mac" size={22} color="#f05c5c" />,
    <MaterialIcons name="smartphone" size={22} color="#f05c5c" />,
    <Ionicons name="globe" size={22} color="#f05c5c" />,
    <MaterialIcons name="check-box" size={22} color="#f05c5c" />
  ];
  return icons[index % icons.length];
};

// Interfaz para semestres ya formateados
interface FormattedSemester {
  icon: React.ReactNode;
  semester: string;
  path: keyof RootStackParamList;
}

interface SidebarProps {
  style?: any;
}
// Define the navigation param list type
type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Support: undefined;
  ForgotPassword: undefined;
  Register: undefined;
  CreateTutoring: undefined;
  TutoringDetail: { id: string };
  SemesterDetail: { semesterId: string };
};

const Sidebar: React.FC<SidebarProps> = ({ style }) => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<FormattedSemester[]>([]);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  
  useEffect(() => {
    const updateLayout = () => {
      const { width } = Dimensions.get('window');
      setIsMobile(width < 768);
    };
    
    const subscription = Dimensions.addEventListener('change', updateLayout);
    updateLayout();
    
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setLoading(true);
        const data = await SemesterService.getSemesters();
        
        if (Array.isArray(data)) {
          const formattedSemesters = data.map((sem, index) => {
            const match = sem.name.match(/(\d+)/);
            const semNumber = match ? parseInt(match[1]) - 1 : index;
            
            return {
              icon: getIconByIndex(semNumber),
              semester: sem.name,
              path: 'SemesterDetail' as keyof RootStackParamList
            };
          });
          
          const sortedSemesters = formattedSemesters.sort((a, b) => {
            const numA = parseInt(a.semester.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.semester.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });
          
          setSemesters(sortedSemesters);
        }
      } catch (error) {
        console.error('Error al cargar semestres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSemesters();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true
    }).start();
  }, [isOpen, slideAnim]);

  const handleLinkPress = (path: keyof RootStackParamList, params?: any) => {
    if (isMobile) {
      setIsOpen(false);
    }
    navigation.navigate(path, params);
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {isMobile && !isOpen && (
        <TouchableOpacity 
          style={styles.openButton}
          onPress={toggleSidebar}
          accessibilityLabel="Abrir menú"
        >
          <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {isMobile && isOpen && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}

      <Animated.View 
        style={[
          styles.sidebar,
          { transform: [{ translateX: slideAnim }] },
          style
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/imgs/TutorMatch.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>TutorMatch</Text>
          </View>
          <TouchableOpacity onPress={() => setIsOpen(false)}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <MaterialIcons name="search" size={18} color="#9ca3af" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Buscar cualquier curso"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {user?.role === 'tutor' && (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleLinkPress('CreateTutoring')}
            >
              <Text style={styles.addButtonText}>Añadir Tutoría</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && (
          <View style={styles.userInfoContainer}>
            <View style={styles.userProfile}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{user.firstName?.charAt(0) || 'U'}</Text>
                </View>
              )}
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userEmail}>
                  {user.email}
                </Text>
              </View>
            </View>

            <View style={styles.userMeta}>
              <Text style={styles.userRole}>
                {user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.academicYear || '4º Semestre'}
              </Text>
              <TouchableOpacity onPress={() => handleLinkPress('Profile')}>
                <Text style={styles.viewProfile}>Ver perfil completo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView style={styles.semesterContainer}>
          <Text style={styles.sectionTitle}>Ingeniería de Software</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#f05c5c" />
            </View>
          ) : semesters.length > 0 ? (
            semesters.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.semesterItem}
                onPress={() => handleLinkPress(item.path, { semesterId: index + 1 })}
              >
                <View style={styles.semesterIcon}>{item.icon}</View>
                <Text style={styles.semesterText}>{item.semester}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noSemesters}>No hay semestres disponibles</Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.footerButton}
            onPress={() => handleLinkPress('Support')}
          >
            <MaterialIcons name="help-outline" size={18} color="#f05c5c" style={styles.footerIcon} />
            <Text style={styles.footerButtonText}>Soporte / Ayuda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={18} color="#f05c5c" style={styles.footerIcon} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  openButton: {
    position: 'absolute',
    top: 80,
    left: 0,
    zIndex: 50,
    backgroundColor: '#f05c5c',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 8,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 30,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: 280,
    backgroundColor: '#2c2c2c',
    zIndex: 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 24,
    width: 24,
  },
  logoText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 36,
    paddingVertical: 8,
    color: 'white',
    flex: 1,
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#f05c5c',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  userInfoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f05c5c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitial: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  userEmail: {
    color: '#9ca3af',
    fontSize: 14,
  },
  userMeta: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRole: {
    color: '#9ca3af',
    fontSize: 14,
  },
  viewProfile: {
    color: '#f05c5c',
    fontSize: 14,
  },
  semesterContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  semesterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  semesterIcon: {
    marginRight: 12,
  },
  semesterText: {
    color: '#dddddd',
    fontWeight: '500',
  },
  noSemesters: {
    textAlign: 'center',
    padding: 8,
    color: '#9ca3af',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  footerIcon: {
    marginRight: 12,
  },
  footerButtonText: {
    color: '#dddddd',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#f05c5c',
    fontWeight: '500',
  }
});

export default Sidebar;