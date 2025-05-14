import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import StarRating from 'react-native-star-rating';
import { UserService } from '../../user/services/UserService';
import { User } from '../../user/types/User';
import { TutoringService } from '../services/TutoringService';
import { TutoringSession } from '../types/Tutoring';

interface TutoringCardProps {
  tutoring: TutoringSession;
  onClick?: (tutoringId: string) => void;
}

const TutoringCard: React.FC<TutoringCardProps> = ({ tutoring, onClick }) => {
  const [tutor, setTutor] = useState<User | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<StackNavigationProp<any>>();

  useEffect(() => {
    const fetchTutorAndReviews = async () => {
      try {
        // Obtener información del tutor
        if (tutoring.tutorId) {
          const tutorData = await UserService.getUserById(tutoring.tutorId.toString());
          setTutor(tutorData);
        }

        // Obtener reseñas y calcular valoración
        const reviews = await TutoringService.getReviews(tutoring.id.toString());
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setRating(parseFloat((totalRating / reviews.length).toFixed(1)));
          setReviewCount(reviews.length);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorAndReviews();
  }, [tutoring.id, tutoring.tutorId]);

  // Imagen por defecto si no hay una
  const defaultImage = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

  const handlePress = () => {
    if (onClick) {
      onClick(tutoring.id);
    } else {
      navigation.navigate('TutoringDetail', { id: tutoring.id });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: tutoring.imageUrl || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{tutoring.title}</Text>
        
        {/* Información del tutor */}
        <View style={styles.tutorContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <Text style={styles.tutorName}>
              {tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Tutor desconocido'}
            </Text>
          )}
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : '0.0'}</Text>
          <StarRating
            disabled={true}
            maxStars={5}
            rating={Math.round(rating)}
            starSize={16}
            fullStarColor="#F05C5C"
            emptyStarColor="rgba(240, 92, 92, 0.4)"
            containerStyle={styles.starRating}
          />
          <Text style={styles.reviewCount}>({reviewCount} reseñas)</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>{tutoring.description}</Text>
        <Text style={styles.price}>S/. {tutoring.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#2D2D2D'
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tutorContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorName: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginRight: 4,
  },
  starRating: {
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  }
});

export default TutoringCard;