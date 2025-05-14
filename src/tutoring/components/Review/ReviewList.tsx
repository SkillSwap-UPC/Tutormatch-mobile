import { Text } from '@/src/utils/TextFix';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { TutoringReview } from '../../types/Tutoring';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
    reviews: TutoringReview[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
    if (!Array.isArray(reviews) || reviews.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay reseñas disponibles.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={reviews}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ReviewCard review={item} />}
            contentContainerStyle={styles.container}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    separator: {
        height: 12, // Equivalente a gap-4 de Tailwind
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF', // Equivalente a text-gray-400
    }
});

export default ReviewList;