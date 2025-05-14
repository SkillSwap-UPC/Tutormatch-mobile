import { Text } from '@/src/utils/TextFix';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Course } from '../../course/types/Course';
import TimeSlotSelectorBySection from '../../schedule/components/TimeSelectorBySection';
import { TutoringImageService } from '../../tutoring/services/TutoringImageService';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { User } from '../../user/types/User';
import { SemesterService } from '../services/SemesterService';

interface CreateTutoringModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (tutoring: any) => void;
  currentUser: User;
}

const CreateTutoringModal: React.FC<CreateTutoringModalProps> = ({
  visible,
  onHide,
  onSave,
  currentUser
}) => {
  // Estado para los semestres y cursos
  const [semesters, setSemesters] = useState<{ id: number; name: string; courses: Course[] }[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Estado del formulario
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(0);
  const [whatTheyWillLearn, setWhatTheyWillLearn] = useState<string>('');
  const [courseImage, setCourseImage] = useState<string | undefined>(undefined);
  const [imageInfo, setImageInfo] = useState<ImagePicker.ImagePickerResult | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [imageUploaded, setImageUploaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Franjas horarias y días de la semana
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayMapping: Record<string, number> = {
    'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
  };
  const morningTimeSlots = ['08-09', '09-10', '10-11', '11-12'];
  const afternoonTimeSlots = ['13-14', '14-15', '15-16', '16-17'];
  const eveningTimeSlots = ['18-19', '19-20', '20-21', '21-22'];
  const allTimeSlots = [...morningTimeSlots, ...afternoonTimeSlots, ...eveningTimeSlots];
  const [availableTimes, setAvailableTimes] = useState<{ [day: string]: { [timeSlot: string]: boolean } }>({});

  // Cargar los semestres desde el servicio
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const data = await SemesterService.getSemesters();
        setSemesters(data); // Guardar los semestres en el estado
      } catch (error) {
        console.error('Error fetching semesters:', error);
        showToast('error', 'No se pudieron cargar los semestres.');
      }
    };

    if (visible) {
      fetchSemesters();
      initializeTimeSlots();
    }
  }, [visible]);

  // Verificar validez del formulario cuando cambian los valores
  useEffect(() => {
    checkFormValidity();
  }, [selectedSemester, selectedCourse, description, price, whatTheyWillLearn, courseImage, availableTimes]);

  // Inicializar slots de tiempo
  const initializeTimeSlots = () => {
    const times: { [day: string]: { [timeSlot: string]: boolean } } = {};
    for (let day of daysOfWeek) {
      times[day] = {};
      for (let timeSlot of allTimeSlots) {
        times[day][timeSlot] = false;
      }
    }
    setAvailableTimes(times);
  };

  // Función para mostrar toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Manejar selección de semestre
  const onSemesterSelected = (semesterName: string) => {
    setSelectedSemester(semesterName);
    const selectedSemesterObj = semesters.find((sem) => sem.name === semesterName);
    setAvailableCourses(selectedSemesterObj ? selectedSemesterObj.courses : []);
    setSelectedCourse(null);
  };

  // Validar formulario
  const checkFormValidity = () => {
    const valid =
      selectedSemester !== '' &&
      selectedCourse !== null &&
      description !== '' &&
      price > 0 &&
      whatTheyWillLearn !== '' &&
      courseImage !== undefined &&
      areTimeSlotsSelected();

    setIsFormValid(valid);
  };

  // Verificar si hay slots de tiempo seleccionados
  const areTimeSlotsSelected = (): boolean => {
    for (let day of daysOfWeek) {
      for (let timeSlot of allTimeSlots) {
        if (availableTimes[day]?.[timeSlot]) {
          return true;
        }
      }
    }
    return false;
  };

  // Manejar selección de imagen
  const handleImagePicker = async () => {
    try {
      // Solicitar permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showToast('error', 'Se requiere permiso para acceder a la galería');
        return;
      }

      // Lanzar el selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Validar tamaño (aproximado basado en dimensiones y calidad)
        const approximateSize = selectedAsset.width * selectedAsset.height * 0.4 / 1024;
        if (approximateSize > 5 * 1024) { // > 5MB
          setErrorMessage('La imagen es demasiado grande. El tamaño máximo es 5MB.');
          return;
        }
        
        setCourseImage(selectedAsset.uri);
        setImageInfo(result);
        setImageUploaded(true);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setErrorMessage('Error al seleccionar imagen. Inténtalo nuevamente.');
    }
  };

  const onConfirmAddTutoring = async () => {
    if (!isFormValid || !selectedCourse) return;

    try {
      setIsSubmitting(true);

      // 1. Preparar el formato del campo whatTheyWillLearn
      const formattedWhatTheyWillLearn = whatTheyWillLearn
        .split('\n')
        .map(item => item.trim())
        .filter(item => item);

      // 2. Preparar los horarios disponibles en el formato correcto
      const availableTimeSlots = [];
      for (let day of daysOfWeek) {
        for (let timeSlot of allTimeSlots) {
          if (availableTimes[day]?.[timeSlot]) {
            const [start, end] = timeSlot.split('-');

            availableTimeSlots.push({
              dayOfWeek: dayMapping[day],
              startTime: `${start}:00`,
              endTime: `${end}:00`
            });
          }
        }
      }

      // Usar una imagen temporal primero
      let imageUrl = 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=';

      // 3. Crear el objeto de tutoría con todos los datos necesarios
      const newTutoring = {
        tutorId: currentUser.id,
        courseId: selectedCourse.id,
        title: selectedCourse.name,
        description,
        price: Number(price),
        whatTheyWillLearn: formattedWhatTheyWillLearn,
        imageUrl, // Usamos la imagen temporal por ahora
        availableTimes: availableTimeSlots
      };

      console.log('Enviando datos de tutoría:', newTutoring);

      // 4. Guardar la tutoría con el servicio actualizado
      const createdTutoring = await TutoringService.createTutoring(newTutoring);

      // 5. Ahora que tenemos el ID, subir la imagen si existe
      if (imageInfo && imageInfo.assets && imageInfo.assets.length > 0 && createdTutoring.id) {
        setUploadingImage(true);
        try {
          const asset = imageInfo.assets[0];
          const uploadedImageUrl = await TutoringImageService.uploadTutoringImage(
            createdTutoring.id, 
            {
              uri: asset.uri,
              type: `image/${asset.uri.split('.').pop()}`,
              name: `tutoring-${createdTutoring.id}.${asset.uri.split('.').pop()}`
            }
          );
          console.log('Imagen subida correctamente:', uploadedImageUrl);
          
          // Actualizar la tutoría con la nueva URL de imagen
          await TutoringService.updateTutoring(createdTutoring.id, { 
            imageUrl: uploadedImageUrl 
          });
          
          // Actualizar el objeto local para devolverlo correctamente
          createdTutoring.imageUrl = uploadedImageUrl;
        } catch (imageError: any) {
          console.error('Error al subir la imagen:', imageError);
          showToast('error', imageError.message || 'No se pudo subir la imagen, pero la tutoría se creó correctamente.');
          
          // La tutoría ya se creó con la imagen por defecto, así que continuamos
        } finally {
          setUploadingImage(false);
        }
      }

      // 6. Mostrar mensaje de éxito y limpiar el formulario
      showToast('success', 'Tutoría creada correctamente.');
      resetForm();
      onSave(createdTutoring);
      onHide();

    } catch (error: any) {
      console.error('Error al crear la tutoría:', error);
      
      // Mensaje de error más descriptivo
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        'No se pudo crear la tutoría. Por favor, revise los datos e inténtelo de nuevo.';

      showToast('error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear el formulario
  const resetForm = () => {
    setSelectedSemester('');
    setSelectedCourse(null);
    setDescription('');
    setPrice(0);
    setWhatTheyWillLearn('');
    setCourseImage(undefined);
    setImageInfo(null);
    setImageUploaded(false);
    setErrorMessage('');
    initializeTimeSlots();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onHide}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Tutoría</Text>
              <TouchableOpacity onPress={onHide} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {/* Selector de semestre */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Semestre del curso</Text>
                <View style={styles.semesterGrid}>
                  {semesters.map((semester) => (
                    <TouchableOpacity
                      key={semester.id}
                      style={[
                        styles.semesterButton,
                        selectedSemester === semester.name && styles.selectedSemesterButton
                      ]}
                      onPress={() => onSemesterSelected(semester.name)}
                    >
                      <Text 
                        style={[
                          styles.semesterButtonText,
                          selectedSemester === semester.name && styles.selectedSemesterButtonText
                        ]}
                      >
                        {semester.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selector de curso */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Nombre del curso</Text>
                <View style={styles.pickerContainer}>
                  {Platform.OS === 'ios' ? (
                    <Picker
                      selectedValue={selectedCourse?.id}
                      onValueChange={(itemValue) => {
                        const course = availableCourses.find(c => c.id === itemValue);
                        setSelectedCourse(course || null);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      <Picker.Item label="Seleccione un curso" value="" />
                      {availableCourses.map((course) => (
                        <Picker.Item key={course.id} label={course.name} value={course.id} />
                      ))}
                    </Picker>
                  ) : (
                    <Picker
                      selectedValue={selectedCourse?.id}
                      onValueChange={(itemValue) => {
                        const course = availableCourses.find(c => c.id === itemValue);
                        setSelectedCourse(course || null);
                      }}
                      style={styles.picker}
                      dropdownIconColor="white"
                    >
                      <Picker.Item label="Seleccione un curso" value="" />
                      {availableCourses.map((course) => (
                        <Picker.Item key={course.id} label={course.name} value={course.id} />
                      ))}
                    </Picker>
                  )}
                </View>
              </View>

              {/* Descripción del curso */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Descripción</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={5}
                  placeholder="Ingrese la descripción del curso"
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
              </View>

              {/* Precio del curso */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Precio</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceCurrency}>S/.</Text>
                  <TextInput
                    value={price.toString()}
                    onChangeText={(text) => {
                      const value = parseFloat(text);
                      setPrice(isNaN(value) || value < 0 ? 0 : value);
                    }}
                    keyboardType="numeric"
                    placeholder="Ingrese el precio"
                    placeholderTextColor="#9ca3af"
                    style={styles.priceInput}
                  />
                </View>
              </View>

              {/* Imagen del curso */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Imagen del curso</Text>
                
                {!courseImage ? (
                  <TouchableOpacity 
                    style={styles.imageUploadButton}
                    onPress={handleImagePicker}
                    disabled={uploadingImage}
                  >
                    <Text style={styles.imageUploadButtonText}>Subir imagen</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.imagePreviewContainer}>
                    {uploadingImage && (
                      <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#F05C5C" />
                      </View>
                    )}
                    <Image
                      source={{ uri: courseImage }}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        setCourseImage(undefined);
                        setImageInfo(null);
                        setImageUploaded(false);
                        setErrorMessage('');
                      }}
                      disabled={uploadingImage}
                    >
                      <Text style={styles.removeImageButtonText}>Eliminar imagen</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {imageUploaded && (
                  <Text style={styles.successText}>Imagen lista para subir</Text>
                )}
                {errorMessage && (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                )}
              </View>

              {/* Qué aprenderán */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>¿Qué aprenderán?</Text>
                <TextInput
                  value={whatTheyWillLearn}
                  onChangeText={setWhatTheyWillLearn}
                  multiline
                  numberOfLines={4}
                  placeholder="Ingrese lo que aprenderán los estudiantes"
                  placeholderTextColor="#9ca3af"
                  style={styles.textArea}
                />
                <Text style={styles.helperText}>Separe cada punto con una nueva línea</Text>
              </View>

              {/* Horarios disponibles */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Horarios disponibles</Text>
                <Text style={styles.helperText}>Toque en los espacios para marcar su disponibilidad</Text>
                
                <TimeSlotSelectorBySection
                  days={daysOfWeek}
                  initialSelectedSlots={availableTimes}
                  onChange={(newSelectedSlots) => {
                    setAvailableTimes(newSelectedSlots);
                  }}
                />
              </View>

              {/* Botones de acción */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!isFormValid || isSubmitting || uploadingImage) && styles.disabledButton
                  ]}
                  onPress={onConfirmAddTutoring}
                  disabled={!isFormValid || isSubmitting || uploadingImage}
                >
                  {isSubmitting ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="white" />
                      <Text style={styles.submitButtonText}>Agregando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.submitButtonText}>Añadir Tutoría</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Toast mensaje */}
      {toastVisible && (
        <View style={[
          styles.toast,
          toastType === 'success' ? styles.successToast : styles.errorToast
        ]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'white',
    marginBottom: 12,
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  semesterButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    margin: 4,
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
  },
  selectedSemesterButton: {
    backgroundColor: '#F05C5C',
    borderColor: '#F05C5C',
  },
  semesterButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  selectedSemesterButtonText: {
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
    overflow: 'hidden',
  },
  picker: {
    color: 'white',
    backgroundColor: '#1a1a1a',
  },
  pickerItem: {
    color: 'white',
  },
  textArea: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    padding: 12,
    color: 'white',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  priceCurrency: {
    color: 'white',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    color: 'white',
  },
  imageUploadButton: {
    backgroundColor: '#F05C5C',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  imageUploadButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderRadius: 4,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    resizeMode: 'cover',
  },
  removeImageButton: {
    backgroundColor: '#F05C5C',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  removeImageButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  successText: {
    color: '#10b981',
    marginTop: 8,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 8,
  },
  helperText: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 24,
    alignItems: 'flex-end',
  },
  submitButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: '#6b7280',
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successToast: {
    backgroundColor: '#059669',
  },
  errorToast: {
    backgroundColor: '#dc2626',
  },
  toastText: {
    color: 'white',
    marginLeft: 8,
  },
});

export default CreateTutoringModal;