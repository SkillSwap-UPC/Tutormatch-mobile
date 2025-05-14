import { Text } from '@/src/utils/TextFix';
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import TutoringCard from '../../tutoring/components/TutoringCard';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import DashboardLayout from '../components/DashboardLayout';
import { SemesterService } from '../services/SemesterService';

type RouteParamList = {
  TutoringsBySemester: {
    semesterId: string;
  };
};

const TutoringsBySemester: React.FC = () => {
  // Usar React Navigation para obtener parámetros en lugar de useParams de react-router-dom
  const route = useRoute<RouteProp<RouteParamList, 'TutoringsBySemester'>>();
  const { semesterId } = route.params;
  
  const [tutorings, setTutorings] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterName, setSemesterName] = useState<string>('');

  useEffect(() => {
    const fetchTutorings = async () => {
      if (!semesterId) {
        setError("No se especificó un semestre");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Obtener información del semestre
        const semesterData = await SemesterService.getSemesterById(semesterId);

        // Guardar el nombre del semestre para mostrarlo en el título
        if (semesterData && semesterData.name) {
          setSemesterName(semesterData.name);
        } else {
          setSemesterName('Semestre');
        }

        // 2. Obtener todos los cursos del semestre
        const courses = semesterData.courses || [];

        // 3. Obtener todas las tutorías
        const allTutorings = await TutoringService.getAllTutoringSessions();

        // 4. Filtrar tutorías por los cursos del semestre
        const courseIds = courses.map((course: any) => course.id);
        const filteredTutorings = allTutorings.filter(tutoring =>
          tutoring.courseId && courseIds.includes(tutoring.courseId)
        );

        setTutorings(filteredTutorings);
      } catch (err) {
        console.error('Error al cargar las tutorías:', err);
        setError('Error al cargar las tutorías. Intente nuevamente más tarde.');
        setSemesterName('Semestre desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorings();
  }, [semesterId]);

  return (
    <DashboardLayout>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>
          {semesterName} Semester
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F05C5C" />
            <Text style={styles.loadingText}>Cargando tutorías...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : tutorings.length > 0 ? (
          <View style={styles.tutoringGrid}>
            {tutorings.map((tutoring) => (
              <TutoringCard key={tutoring.id} tutoring={tutoring} />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No hay tutorías disponibles para este semestre.
          </Text>
        )}
      </ScrollView>
    </DashboardLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    borderWidth: 1,
    borderColor: '#B91C1C',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  errorText: {
    color: '#EF4444',
  },
  tutoringGrid: {
    flexDirection: 'column',
  },
  emptyText: {
    color: '#9CA3AF',
  },
});

export default TutoringsBySemester;