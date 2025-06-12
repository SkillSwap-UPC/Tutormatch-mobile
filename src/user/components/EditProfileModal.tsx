import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from '../../utils/TextFix';
import { useAvatar } from '../hooks/avatarContext';
import { UserService } from '../services/UserService';
import { User } from '../types/User';

interface EditProfileModalProps {
  visible: boolean;
  onHide: () => void;
  user: User;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onHide,
  user,
  onSave
}) => {
  const [formData, setFormData] = useState<User>(user);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.avatar);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const { updateAvatarUrl } = useAvatar();

  // Reiniciar los datos del formulario cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setFormData(user);
      setProfileImage(user.avatar);
    }
  }, [user, visible]);

  const handleInputChange = (name: string, value: string) => {
    if (name === 'phone') {
      // Solo permitir dígitos numéricos (0-9)
      const numericValue = value.replace(/[^0-9]/g, '');

      // Validación específica para teléfonos peruanos que deben empezar con 9
      if (numericValue.length > 0 && numericValue[0] !== '9') {
        // Si no empieza con 9, forzar que empiece con 9
        setFormData({ ...formData, [name]: '9' + numericValue.substring(numericValue.length > 1 ? 1 : 0) });
      } else {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave({ ...formData, avatar: profileImage });
    onHide();
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

  const handleImageUpload = async () => {
    try {
      // Solicitar permisos primero
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se requieren permisos para acceder a la galería');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Avatar suele ser cuadrado
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      // Obtener el primer activo seleccionado
      const selectedAsset = result.assets[0];

      // Validaciones básicas
      if (selectedAsset.fileSize && selectedAsset.fileSize > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Previsualización inmediata
      setProfileImage(selectedAsset.uri);

      setUploadingImage(true);
      Alert.alert('Subiendo', 'Subiendo imagen al servidor...');

      // Crear objeto de información de imagen compatible
      const imageInfo = {
        uri: selectedAsset.uri,
        type: `image/${selectedAsset.uri.split('.').pop() || 'jpeg'}`,
        name: selectedAsset.uri.split('/').pop() || 'avatar.jpg',
        size: selectedAsset.fileSize
      };

      // Subir archivo usando el servicio mejorado
      const uploadedUrl = await UserService.uploadAvatar(formData.id, imageInfo);

      // Actualizar con la URL real del servidor
      setProfileImage(uploadedUrl);

      setFormData(prevFormData => ({
        ...prevFormData,
        avatar: uploadedUrl
      }));

      updateAvatarUrl(uploadedUrl);

      Alert.alert('Éxito', 'Imagen subida correctamente');
    } catch (error: any) {
      console.error('Error detallado al subir imagen:', error);

      // Limpiar la previsualización si hay error
      setProfileImage(user.avatar);

      Alert.alert('Error', error.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    // Si no hay imagen, no hay nada que eliminar
    if (!profileImage) {
      return;
    }

    try {
      setUploadingImage(true);

      // Mostrar alerta de carga
      Alert.alert('Eliminando', 'Eliminando foto de perfil...');

      // Extraer el nombre del archivo del avatar actual
      let avatarFileName = null;
      try {
        const urlObj = new URL(profileImage);
        const pathParts = urlObj.pathname.split('/');
        // El nombre del archivo suele ser el último segmento de la ruta
        avatarFileName = pathParts[pathParts.length - 1];
      } catch (e) {
        console.warn('No se pudo obtener el nombre del archivo del avatar:', e);
        throw new Error('No se pudo identificar el archivo de avatar para eliminar');
      }

      // Aquí iría la llamada a tu API para eliminar el avatar
      // Ejemplo ficticio:
      // const deleteResponse = await UserService.deleteAvatar(formData.id, avatarFileName);

      // Limpiar la imagen de perfil
      setProfileImage(undefined);

      // Actualizar el formData
      setFormData(prevFormData => ({
        ...prevFormData,
        avatar: undefined
      }));

      // Actualizar el avatar en el contexto
      updateAvatarUrl(null);

      Alert.alert('Éxito', 'Foto de perfil eliminada correctamente');
    } catch (error: any) {
      console.error('Error al eliminar avatar:', error);
      Alert.alert('Error', error.message || 'Error al eliminar la foto de perfil');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onHide}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.contentContainer}>
              {/* Foto de perfil */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foto de Perfil</Text>
                <View style={styles.profileImageContainer}>
                  <View style={styles.avatarContainer}>
                    {uploadingImage ? (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      </View>
                    ) : profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarPlaceholder}>
                        {formData.firstName?.charAt(0) || formData.lastName?.charAt(0) || 'U'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handleImageUpload}
                      disabled={uploadingImage}
                    >
                      <Text style={styles.uploadButtonText}>
                        {uploadingImage ? 'Subiendo...' : 'Cambiar foto'}
                      </Text>
                    </TouchableOpacity>
                    {profileImage && (
                      <TouchableOpacity
                        onPress={handleRemoveImage}
                        disabled={uploadingImage}
                        style={styles.removeButton}
                      >
                        <Text style={styles.removeButtonText}>Eliminar foto</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Nombre */}
              <View style={styles.section}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  style={styles.input}
                />
              </View>

              {/* Apellido */}
              <View style={styles.section}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  style={styles.input}
                />
              </View>

              {/* Año académico */}
              <View style={styles.section}>
                <Text style={styles.label}>Año Académico</Text>
                <TextInput
                  value={formData.academicYear}
                  onChangeText={(value) => handleInputChange('academicYear', value)}
                  style={styles.input}
                />
              </View>

              {/* Teléfono */}
              <View style={styles.section}>
                <Text style={styles.label}>
                  Teléfono
                  <Text style={styles.labelHint}> (Solo números, formato peruano)</Text>
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  style={styles.input}
                  placeholder="Ejemplo: 999999999"
                  maxLength={9}
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>
                  Debe empezar con 9 y contener 9 dígitos sin espacios ni caracteres especiales.
                </Text>
              </View>

              {/* Biografía */}
              <View style={styles.section}>
                <Text style={styles.label}>Biografía</Text>
                <TextInput
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Botones de acción */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onHide}
                  disabled={uploadingImage}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={uploadingImage}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  profileImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F05C5C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    backgroundColor: '#F05C5C',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  removeButton: {
    marginTop: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#F05C5C',
    fontSize: 14,
  },
  label: {
    color: '#E5E7EB',
    marginBottom: 8,
  },
  labelHint: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#252525',
    color: 'white',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
  saveButton: {
    backgroundColor: '#F05C5C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default EditProfileModal;