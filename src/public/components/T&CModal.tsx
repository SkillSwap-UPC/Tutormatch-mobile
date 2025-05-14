import { Text } from '@/src/utils/TextFix';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onHide: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onHide, onAccept }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={onHide} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView}>
            {/* El contenido existente de tus términos y condiciones */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Introducción</Text>
              <Text style={styles.sectionText}>
                1.1. TutorMatch es una plataforma que conecta estudiantes con tutores para facilitar sesiones de tutoría académica.
              </Text>
            </View>
            
            {/* Mantén el resto de tus secciones... */}
          </ScrollView>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={16} color="#8B5CF6" style={{marginRight: 8}} />
            <Text style={styles.infoText}>
              Al hacer clic en "Aceptar", confirmas que has leído y estás de acuerdo con nuestros Términos y Condiciones, y nuestra Política de Privacidad.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{marginRight: 4}} />
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onHide}
            >
              <Ionicons name="close" size={16} color="#9CA3AF" style={{marginRight: 4}} />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
    maxHeight: 400,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  sectionText: {
    color: '#9ca3af',
    marginBottom: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 4,
    margin: 16,
    alignItems: 'center',
  },
  infoText: {
    color: '#9ca3af',
    flex: 1,
    fontSize: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  acceptButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
  },
});

export default TermsModal;