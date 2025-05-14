import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../public/hooks/useAuth';
import TutoringRecommendations from '../../tutoring/components/TutoringRecommendations';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import DashboardLayout from '../components/DashboardLayout';

type RootStackParamList = {
  TutoringDetail: { id: string};
  Profile: undefined;
};

const DashboardPage: React.FC = () => {
  // Obtener datos del usuario desde useAuth
  const { user, loading: userLoading } = useAuth();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  // Estados para tutorías recomendadas
  const [recommendedTutorings, setRecommendedTutorings] = useState<TutoringSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener datos de tutorías de la API
  useEffect(() => {
    const fetchTutorings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener todas las tutorías disponibles
        const tutoringsData = await TutoringService.getAllTutoringSessions();

        // En una aplicación real, aquí aplicaríamos lógica de recomendación basada
        // en el perfil del usuario, historial, cursos, etc.
        setRecommendedTutorings(tutoringsData);

      } catch (error) {
        console.error('Error al cargar las tutorías recomendadas:', error);
        setError('No se pudieron cargar las tutorías recomendadas. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorings();
  }, []);

  // Manejar clic en una tarjeta de tutoría
  const handleTutoringClick = (tutoringId: string) => {
    navigation.navigate('TutoringDetail', { id: tutoringId });
  };

  // Determinar si estamos cargando cualquier dato
  const loading = userLoading || isLoading;

  return (
    <DashboardLayout>
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f05c5c" />
            <Text style={styles.loadingText}>Cargando datos del dashboard...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* Perfil del usuario */}
            {user && (
              <View style={styles.profileCard}>
                <View style={styles.profileContent}>
                  <View style={styles.avatarContainer}>
                    {user.avatar ? (
                      <Image 
                        source={{ uri: user.avatar }} 
                        style={styles.avatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>
                          {user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.welcomeText}>
                      ¡Hola de nuevo, {user.firstName} {user.lastName}!
                    </Text>
                    <Text style={styles.userRole}>
                      {user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.semesterNumber}° Semestre
                    </Text>
                    <Text style={styles.userAcademicYear}>{user.academicYear || 'No especificado'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Text style={styles.profileButtonText}>Ver perfil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sección de tutorías recomendadas */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>
                Tutorías disponibles para ti
              </Text>
              {recommendedTutorings.length > 0 ? (
                <TutoringRecommendations
                  tutorings={recommendedTutorings}
                  onTutoringClick={handleTutoringClick}
                />
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyStateText}>
                    Aún no hay tutorías recomendadas disponibles.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginVertical: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  profileCard: {
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileContent: {
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f05c5c',
    justifyContent: 'center',
    alignItems: 'center', 
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  userRole: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  userAcademicYear: {
    color: '#9ca3af',
    fontSize: 14,
  },
  profileButton: {
    backgroundColor: '#f05c5c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyStateContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default DashboardPage;