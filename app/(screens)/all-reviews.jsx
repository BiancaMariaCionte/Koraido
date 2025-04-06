import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../../services/config';
import { useGlobalContext } from '@/context/GlobalProvider';
import ReviewItem from '@/components/ReviewItem';

const AllReviews = () => {
  const { id } = useLocalSearchParams(); // the location ID passed as a param
  const [reviews, setReviews] = useState([]);
  const { user } = useGlobalContext(); 
  useEffect(() => {
    const fetchReviews = () => {
      const reviewsQuery = query(
        collection(db, 'locations', id, 'reviews'),
        orderBy('overallRating','desc'),
        orderBy('timestamp', 'desc')
      );

      const unsubscribe = onSnapshot(reviewsQuery, (querySnapshot) => {
        const reviewsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsArray);
      });

      return unsubscribe;
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleLikeToggle = async (reviewId, isLiked) => {
      const reviewRef = doc(db, 'locations', id, 'reviews', reviewId);
      const userId = user.userId;
  
      try {
        if (isLiked) {
          await updateDoc(reviewRef, {
            likedBy: arrayRemove(userId),
            likes: increment(-1)
          });
        } else {
          await updateDoc(reviewRef, {
            likedBy: arrayUnion(userId),
            likes: increment(1)
          });
        }
      } catch (error) {
        console.log('Error toggling like: ', error);
      }
    };
  
  


  return (
    
           <SafeAreaView style={styles.container}>
           <Text className="text-2xl font-bold" style={styles.pageTitle}>
        All Reviews
      </Text>
    <FlatList
      data={reviews}
      renderItem={({ item }) => (
        <ReviewItem
          review={item}
          userId={user.userId}
          onLikeToggle={handleLikeToggle}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
    />
    </SafeAreaView>
    
  );
};

export default AllReviews;

const styles = StyleSheet.create({

  container: {
    padding: 10,
    backgroundColor: '#fff',
  },
  contentContainer:{
    paddingBottom: 20, 
  
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginTop:15,
    marginBottom: 10,
    marginHorizontal: 10,
  },
});
