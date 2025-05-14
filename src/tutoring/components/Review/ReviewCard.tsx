import { Text } from '@/src/utils/TextFix';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { TutoringReview } from '../../types/Tutoring';

interface ReviewCardProps {
  review: TutoringReview;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const [likes, setLikes] = useState<number>(review.likes || 0);
  const [liked, setLiked] = useState<boolean>(false);

  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
    } else {
      setLikes(likes - 1);
      setLiked(false);
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return 'Fecha no disponible';
    // Convertir la cadena a un objeto Date si es necesario
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    return parsedDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const StudentAvatar = () => (
    <>
      {review.student?.avatar ? (
        <Image 
          source={{ uri: review.student.avatar }}
          style={styles.avatar}
        />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {review.student?.firstName?.charAt(0)?.toUpperCase()}
            {review.student?.lastName?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
      )}
    </>
  );

  const RatingDisplay = () => (
    <View style={styles.ratingContainer}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= review.rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
      <Text style={styles.ratingText}>{review.rating}/5</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <StudentAvatar />
        <View style={styles.headerInfo}>
          <Text style={styles.studentName}>
            {review.student?.firstName + ' ' + review.student?.lastName} 
          </Text>
          <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <RatingDisplay />

        {/* Comentario */}
        <View style={styles.commentContainer}>
          <Text style={styles.comment}>{review.comment || 'Sin comentarios adicionales.'}</Text>
        </View>

        {/* Likes */}
        <View style={styles.likesContainer}>
          <TouchableOpacity
            onPress={handleLike}
            style={[
              styles.likeButton,
              liked ? styles.likedButton : {}
            ]}
          >
            <Ionicons
              name="heart"
              size={16}
              color={liked ? '#FFFFFF' : '#9CA3AF'}
              style={styles.heartIcon}
              solid={liked}
            />
            <Text style={[styles.likeButtonText, liked ? styles.likedButtonText : {}]}>
              {liked ? 'Te gusta' : 'Me gusta'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.likesCount}>{likes} {likes === 1 ? 'like' : 'likes'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#252525',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 48, 
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4c5eeb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    marginLeft: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  content: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  commentContainer: {
    padding: 16,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginBottom: 12,
  },
  comment: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  likedButton: {
    backgroundColor: '#DC2626',
  },
  heartIcon: {
    marginRight: 4,
  },
  likeButtonText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  likedButtonText: {
    color: '#FFFFFF',
  },
  likesCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ReviewCard;