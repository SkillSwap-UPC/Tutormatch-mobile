import React from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { TutoringSession } from '../types/Tutoring';
import TutoringCard from './TutoringCard';

interface TutoringRecommendationsProps {
  tutorings: TutoringSession[];
  onTutoringClick: (tutoringId: string) => void;
}

const TutoringRecommendations: React.FC<TutoringRecommendationsProps> = ({ 
  tutorings, 
  onTutoringClick 
}) => {
  // Si no hay tutorías, no renderizamos nada
  if (!tutorings || tutorings.length === 0) {
    return null;
  }
  
  // Determinamos el número de columnas según el ancho de pantalla
  const screenWidth = Dimensions.get('window').width;
  const numColumns = screenWidth >= 768 ? 2 : 1; // 2 columnas en tablets/pantallas grandes, 1 en móviles
  
  return (
    <View style={styles.container}>
      <FlatList
        data={tutorings}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <View style={[
            styles.cardContainer,
            { width: screenWidth >= 768 ? '48%' : '100%' }
          ]}>
            <TutoringCard 
              tutoring={item} 
              onClick={onTutoringClick} 
            />
          </View>
        )}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
  },
  list: {
    padding: 16,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  }
});

export default TutoringRecommendations;