import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReviewItem = ({ review, userId, onLikeToggle }) => {
  const isLiked = review.likedBy?.includes(userId);

  return (
    <View style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: review.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>{review.username}</Text>
        </View>
        <Text style={styles.timestamp}>
         {new Date(review.timestamp.seconds * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    })}
        </Text>
      </View>

      <Text style={styles.reviewText}>{review.reviewText}</Text>

      <View style={styles.moodContainer}>
        {review.selectedMoods?.map((mood, index) => (
          <View key={index} style={styles.moodTag}>
            <Text style={styles.moodText}>{mood}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.likeContainer}>
          <TouchableOpacity
            onPress={() => onLikeToggle(review.id, isLiked)}
            style={[styles.likeButton, isLiked ? styles.liked : null]}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#becbe5' : '#aaa'}
            />
          </TouchableOpacity>
          <Text style={styles.likeCount}>
            {review.likes} {review.likes === 1 ? 'Like' : 'Likes'}
          </Text>
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{review.overallRating}</Text>
          <Ionicons name="star" size={16} color="gold" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    reviewContainer: {
        backgroundColor: '#e9eff5',
        padding: 10,
        marginBottom: 15,
        borderRadius: 10,
      },
      reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
      },
      userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    
      profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20, 
        marginRight: 10, 
      },
      username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E1E1E',
        fontFamily: 'Montserrat-Bold',
      },
      timestamp: {
        color: '#888',
        fontSize: 12,
      },
      reviewText: {
        fontSize: 16,
        marginBottom: 10,
        fontFamily: 'Montserrat-Regular'
      },
      moodContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
      },
      moodTag: {
        backgroundColor: '#4e71b8',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginRight: 5,
        marginBottom: 5,
      },
      moodText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'Montserrat-Bold'
      },
      bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
      },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    marginRight: 10,
   
  },
  liked: {
    color: '#becbe5',
  },
  likeCount: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Montserrat-Bold',
   
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    marginRight: 5,
  },
});

export default ReviewItem;
