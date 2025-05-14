import { Text } from '@/src/utils/TextFix';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from 'react-native-vector-icons/Feather';
import { RootStackParamList } from "../../../App";
import NavbarAuth from "../../components/NavbarAuth";
import { useAuth } from "../../hooks/useAuth";

// Define el tipo para la navegación
type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string>("");
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signInDirectWithSupabase, user } = useAuth();

  // Redirigir si ya hay un usuario autenticado
  useEffect(() => {
    if (user) {
      navigation.navigate('Dashboard');
    }
  }, [user, navigation]);

  // Función para validar el formato del correo UPC
  const validateEmail = (email: string): boolean => {
    const upcEmailRegex = /^[Uu]20([1-9][5-9]|[2-9][0-9])[a-zA-Z0-9]{5}@upc\.edu\.pe$/;
    return upcEmailRegex.test(email);
  };

  // Manejar el cambio en el campo de correo con validación
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setEmailError('El correo debe tener formato U20XXXXXXX@upc.edu.pe');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!email || !password) {
      showAlert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }
    
    // Validar el formato del correo antes de intentar iniciar sesión
    if (!validateEmail(email)) {
      showAlert('Formato incorrecto', 'Debes usar un correo institucional UPC con formato U20XXXXXXX@upc.edu.pe');
      return;
    }
    
    setLoading(true);

    try {
      // Primer intento: usando el método API
      console.log('Intentando con API backend...');
      let response = await signIn(email, password);
      
      // Si falla, intentar directamente con Supabase
      if (!response.success) {
        console.log('Intentando método alternativo con Supabase directamente...');
        response = await signInDirectWithSupabase(email, password);
      }
      
      console.log('====================================');
      console.log('Estado final de inicio de sesión:', { success: response.success, message: response.message });
      
      if (response.success) {
        // Si tenemos datos del usuario, los mostramos
        if (response.user) {
          console.log('👤 USUARIO LOGUEADO:');
          console.log('📧 Email:', response.user.email);
          console.log('🪪 ID:', response.user.id);
          console.log('👤 Nombre:', `${response.user.firstName} ${response.user.lastName}`);
          console.log('🧩 Rol:', response.user.role || 'No definido');
          console.log('📱 Teléfono:', response.user.phone || 'No especificado');
          console.log('🎓 Semestre:', response.user.semesterNumber || 'No especificado');
        } else {
          console.log('✅ Autenticación exitosa pero sin datos de perfil completos');
        }

        // Navegar al Dashboard independientemente de si tenemos el perfil completo
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }]
        });
      } else {
        console.log('❌ No se pudo autenticar al usuario');
        showAlert('Error de autenticación', response.message || 'No se pudo iniciar sesión');
      }
      console.log('====================================');
      
    } catch (error) {
      console.error('🔥 Error crítico durante el inicio de sesión:', error);
      showAlert('Error', 'Ha ocurrido un error inesperado al intentar iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para mostrar alertas de manera consistente
  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.container}>
      <NavbarAuth />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Iniciar Sesión</Text>
            <Text style={styles.cardSubtitle}>Ingresa tus credenciales para acceder a tu cuenta</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Correo electrónico</Text>
              </View>
              <TextInput
                placeholder="U20XXXXXXX@upc.edu.pe"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  emailError ? styles.inputError : null
                ]}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.registerText}>
              ¿No tienes una cuenta?{" "}
              <Text 
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Regístrate aquí
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212' // bg-dark
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  card: {
    backgroundColor: '#1E1E1E', // bg-dark-card
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D2D', // border-dark-border
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F0F0', // text-light
  },
  cardSubtitle: {
    color: '#9CA3AF', // text-light-gray
    marginTop: 4,
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#F0F0F0', // text-light
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2D2D2D', // bg-dark-light
    color: '#F0F0F0', // text-light
    borderWidth: 1,
    borderColor: '#2D2D2D', // border-dark-border
    padding: 12,
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#EF4444', // border-red-500
  },
  errorText: {
    color: '#EF4444', // text-red-500
    fontSize: 12,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    color: '#8B5CF6', // text-primary
    fontSize: 12,
  },
  button: {
    backgroundColor: '#8B5CF6', // bg-primary
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#6B46C1', // tono más oscuro para mostrar deshabilitado
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF', // text-light
    fontWeight: '500',
  },
  cardFooter: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerText: {
    fontSize: 12,
    color: '#F0F0F0', // text-light
    textAlign: 'center',
  },
  registerLink: {
    color: '#8B5CF6', // text-primary
    fontWeight: '500',
  },
});