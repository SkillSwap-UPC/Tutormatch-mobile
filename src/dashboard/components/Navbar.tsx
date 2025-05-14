import { Text } from '@/src/utils/TextFix';
import {
  Ionicons,
  MaterialIcons
} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../public/hooks/useAuth';
import { AuthService } from '../../public/services/authService';
import LogoutModal from '../../user/components/LogOutProfileModal';
import { UserService } from '../../user/services/UserService';
import { User as UserType } from '../../user/types/User';
import CreateTutoringModal from './CreateTutoringModal';

const Navbar = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogOutModalVisible, setLogOutModalVisible] = useState(false);
  const [logoutAccount, setLogoutAccount] = useState(false);
  type RootStackParamList = {
    Dashboard: undefined;
    Login: undefined;
    Profile: undefined;
  };
  
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { signOut, user: authUser } = useAuth();

  // Obtener los datos del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);

        // Primero intentamos obtener el usuario del hook useAuth
        if (authUser) {
          setCurrentUser(authUser);
          setError(null);
          setLoading(false);
          return;
        }

        // Verificar si hay una sesión activa
        if (!await AuthService.hasActiveSession()) {
          setError('Sesión no encontrada');
          setLoading(false);
          return;
        }

        // Obtener el ID del usuario actual
        const currentUserId = await AuthService.getCurrentUserId();

        // Obtener el perfil completo desde AuthService
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          setCurrentUser(userProfile);
          setError(null);
        } else {
          // Como último recurso, intentar obtener desde el UserService
          try {
            if (currentUserId) {
              const userData = await UserService.getUserById(currentUserId);
              setCurrentUser(userData);
              setError(null);
            }
          } catch (serviceError) {
            console.error('Error al obtener usuario desde UserService:', serviceError);
            setError('Error al cargar los datos del usuario');
          }
        }
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [authUser]);

  const handleOpenModal = () => {
    setModalVisible(true);
    setMobileMenuOpen(false);
  };

  const handleHideModal = () => {
    setModalVisible(false);
  };

  const handleSaveTutoring = (tutoring: any) => {
    console.log('Tutoring saved:', tutoring);
    // Aquí irían las llamadas a la API para guardar la tutoría
    setModalVisible(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    setLogoutAccount(true);
    try {
      const { success } = await signOut();
      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLogoutAccount(false);
      setLogOutModalVisible(false);
    }
  };

  // Verificar si el usuario es un tutor
  const isTutor = currentUser?.role === 'tutor';

  const isValidAvatarUrl = (url: string | undefined): boolean => {
    return !!url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  if (loading) {
    return (
      <View style={styles.navContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={styles.logoLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('../../assets/imgs/TutorMatch.png')} 
                  style={styles.logo} 
                />
              </View>
              <Text style={styles.logoText}>TutorMatch</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F05C5C" />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !currentUser) {
    return (
      <View style={styles.navContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={styles.logoLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('../../assets/imgs/TutorMatch.png')} 
                  style={styles.logo} 
                />
              </View>
              <Text style={styles.logoText}>TutorMatch</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const avatarInitial = currentUser.firstName?.charAt(0) || 'U';

  return (
    <>
      <View style={styles.navContainer}>
        <View style={styles.innerContainer}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <TouchableOpacity 
              style={styles.logoLink}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <View style={styles.logoWrapper}>
                <Image 
                  source={require('../../assets/imgs/TutorMatch.png')} 
                  style={styles.logo} 
                />
              </View>
              <Text style={styles.logoText}>TutorMatch</Text>
            </TouchableOpacity>
          </View>

          {/* Barra de búsqueda - Visible solo en tablet */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar cualquier curso"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Botones derecha */}
          <View style={styles.rightButtonsContainer}>
            {/* Botón Añadir Tutoría (solo si es tutor) */}
            {isTutor && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleOpenModal}
              >
                <Text style={styles.addButtonText}>Añadir Tutoría</Text>
              </TouchableOpacity>
            )}
            
            {/* Botón globo idiomas */}
            <TouchableOpacity style={styles.globeButton}>
              <Ionicons name="globe" size={24} color="white" />
            </TouchableOpacity>
            
            {/* Perfil y menú */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={toggleProfileDropdown}
            >
              {currentUser.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={styles.avatar}
                  onError={() => console.warn('Error al cargar avatar')}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{avatarInitial}</Text>
                </View>
              )}
              <MaterialIcons name="arrow-drop-down" size={20} color="white" />
            </TouchableOpacity>
            
            {/* Botón menú hamburguesa móvil */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <MaterialIcons name="close" size={24} color="white" />
              ) : (
                <MaterialIcons name="menu" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Dropdown de perfil */}
      <Modal
        visible={profileDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileDropdownOpen(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1}
          onPress={() => setProfileDropdownOpen(false)}
        >
          <View style={[styles.profileDropdown, { right: 10, top: 60 }]}>
            <View style={styles.userHeader}>
              {currentUser.avatar ? (
                <Image
                  source={{ uri: currentUser.avatar }}
                  style={styles.dropdownAvatar}
                />
              ) : (
                <View style={styles.dropdownAvatarPlaceholder}>
                  <Text style={styles.dropdownAvatarInitial}>{avatarInitial}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{currentUser.firstName} {currentUser.lastName}</Text>
                <Text style={styles.userEmail}>{currentUser.email}</Text>
              </View>
            </View>

            <View style={styles.userMeta}>
              <Text style={styles.userDetails}>
                {currentUser.semesterNumber}° Semestre {'\n'} 
                {currentUser.academicYear}
              </Text>
              <Text style={styles.userRole}>
                {currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate('Profile');
                setProfileDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Ver perfil completo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => {
                setLogOutModalVisible(true);
                setProfileDropdownOpen(false);
              }}
            >
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menú móvil desplegable */}
      <Modal
        visible={mobileMenuOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMobileMenuOpen(false)}
      >
        <View style={styles.mobileMenuContainer}>
          <ScrollView style={styles.mobileMenuContent}>
            {/* Barra de búsqueda móvil */}
            <View style={styles.mobileSearchContainer}>
              <MaterialIcons name="search" size={20} color="#9CA3AF" style={styles.mobileSearchIcon} />
              <TextInput
                style={styles.mobileSearchInput}
                placeholder="Buscar cualquier curso"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Botón de "Añadir Tutoría" solo si es tutor */}
            {isTutor && (
              <TouchableOpacity
                style={styles.mobileAddButton}
                onPress={() => {
                  handleOpenModal();
                  setMobileMenuOpen(false);
                }}
              >
                <Text style={styles.mobileAddButtonText}>Añadir Tutoría</Text>
              </TouchableOpacity>
            )}

            {/* Información del usuario en móvil */}
            <View style={styles.mobileUserInfo}>
              <View style={styles.mobileUserHeader}>
                {currentUser.avatar ? (
                  <Image
                    source={{ uri: currentUser.avatar }}
                    style={styles.mobileAvatar}
                    onError={() => console.warn('Error al cargar avatar')}
                  />
                ) : (
                  <View style={styles.mobileAvatarPlaceholder}>
                    <Text style={styles.mobileAvatarInitial}>{avatarInitial}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.mobileUserName}>{currentUser.firstName} {currentUser.lastName}</Text>
                  <Text style={styles.mobileUserEmail}>{currentUser.email}</Text>
                </View>
              </View>

              <View style={styles.mobileUserMeta}>
                <Text style={styles.mobileUserDetails}>
                  {currentUser.semesterNumber}° Semestre - {currentUser.academicYear}
                </Text>
                <Text style={styles.mobileUserRole}>
                  {currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.mobileMenuItem}
                onPress={() => {
                  navigation.navigate('Profile');
                  setMobileMenuOpen(false);
                }}
              >
                <Text style={styles.mobileMenuItemText}>Ver perfil completo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mobileMenuItem}
                onPress={() => {
                  setLogOutModalVisible(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Text style={styles.mobileLogoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal para crear tutoría - solo si es tutor */}
      {isTutor && (
        <CreateTutoringModal
          visible={modalVisible}
          onHide={handleHideModal}
          onSave={handleSaveTutoring}
          currentUser={currentUser}
        />
      )}

      {/* Modal de confirmación para cerrar sesión */}
      <LogoutModal
        visible={isLogOutModalVisible}
        onHide={() => setLogOutModalVisible(false)}
        onConfirm={handleLogout}
        loading={logoutAccount}
      />
    </>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#2C2C2C',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  innerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrapper: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  logo: {
    height: 24,
    width: 24,
  },
  logoText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
    marginLeft: 8,
  },
  searchContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    display: 'none'
  },
  searchInputWrapper: {
    width: '100%',
    maxWidth: 400,
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
    flex: 1,
    paddingLeft: 40,
    paddingRight: 12,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    color: 'white',
  },
  rightButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
    display: 'none'
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  globeButton: {
    padding: 8,
    borderRadius: 20,
    display: 'none'
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 20,
    display: 'none'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F05C5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    display: 'flex',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profileDropdown: {
    position: 'absolute',
    width: 250,
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dropdownAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  dropdownAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F05C5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dropdownAvatarInitial: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    paddingTop: 12,
    marginBottom: 12,
  },
  userDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  userRole: {
    color: '#F05C5C',
    fontSize: 12,
  },
  dropdownItem: {
    paddingVertical: 8,
    borderRadius: 4,
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 14,
  },
  logoutText: {
    color: '#F05C5C',
    fontSize: 14,
  },
  mobileMenuContainer: {
    flex: 1,
    backgroundColor: '#2C2C2C',
  },
  mobileMenuContent: {
    flex: 1,
    padding: 16,
  },
  mobileSearchContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileSearchIcon: {
    position: 'absolute',
    left: 10,
    zIndex: 1,
  },
  mobileSearchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 12,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    color: 'white',
  },
  mobileAddButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  mobileAddButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  mobileUserInfo: {
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
    paddingTop: 16,
  },
  mobileUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mobileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  mobileAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F05C5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mobileAvatarInitial: {
    color: 'white',
    fontWeight: '600',
  },
  mobileUserName: {
    color: 'white',
    fontWeight: '600',
  },
  mobileUserEmail: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  mobileUserMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  mobileUserDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  mobileUserRole: {
    color: '#F05C5C',
    fontSize: 12,
  },
  mobileMenuItem: {
    paddingVertical: 12,
    borderRadius: 4,
  },
  mobileMenuItemText: {
    color: 'white',
    fontSize: 16,
  },
  mobileLogoutText: {
    color: '#F05C5C',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
  errorText: {
    color: '#F05C5C',
  },
  loginButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: '500',
  }
});

export default Navbar;