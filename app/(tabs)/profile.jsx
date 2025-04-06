import { View, Text, TouchableOpacity, Image, SafeAreaView, RefreshControl, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import React, { useState,useEffect } from 'react';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { icons } from '../../constants';
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from '../..//services/config';
import ReviewItem from '@/components/ReviewItem';

const Profile = () => {
  const { isLoggedIn, logout, user } = useGlobalContext();
  const [activeTab, setActiveTab] = useState('Reviews'); 
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false); 

  useEffect(() => {
    
    if (!isLoggedIn) {
      router.replace('/sign-in');
    }
  }, [isLoggedIn]);

  // Move fetchUserReviews outside the useEffect
const fetchUserReviews = async () => {
  if (user?.userId) {
    try {
      setIsLoading(true); // Set loading to true at the start
      const locationsCollectionRef = collection(db, 'locations');
      const locationsSnapshot = await getDocs(locationsCollectionRef);

      const userReviews = [];

      for (const locationDoc of locationsSnapshot.docs) {
        const reviewsRef = collection(locationDoc.ref, 'reviews');
        const q = query(reviewsRef, where('userId', '==', user.userId));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          userReviews.push({
            id: doc.id,
            locationId: locationDoc.id,
            ...doc.data(),
          });
        });
      }

      setReviews(userReviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    } finally {
      setIsLoading(false); // Ensure loading state is cleared
    }
  }
};

// Fetch reviews on component mount and when user changes
useEffect(() => {
  fetchUserReviews();
}, [user]);

// Refresh control handler
const onRefresh = async () => {
  setRefreshing(true); // Start refresh spinner
  await fetchUserReviews();
  setRefreshing(false); // Stop refresh spinner
};

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.replace('/sign-in'); // Redirect to login page after logout
    } else {
      console.error("Logout failed:", result.msg);
    }
  };

  const profilePic = require('@/assets/images/profileDef.jpg'); // Adjust the path as necessary

  const navigateToUserDetail = () => {
    router.push('/user-detail'); // Navigate to the user-detail page
  };

  const handleLikeToggle = async (reviewId, isLiked) => {
    // Add your like toggle logic here
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
    console.log(`Toggling like for review ${reviewId}, currently liked: ${isLiked}`);
  };

  const handleReviewPress = (locationId) => {
    // Navigate to the location detail page
    router.push({ pathname: '/location-detail', params: { id: locationId } });
  };

  

  return (
     <SafeAreaView style={{ flex: 1 }}>
    {/* Top Section */}
    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
      <Image
        source={user?.profileImage ? { uri: user.profileImage } : profilePic}
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, fontFamily: 'Montserrat-Bold' }}>
        {user?.username || 'User'}
      </Text>
      <View style={styles.buttonRow}>
        <CustomButton
          title="Sign out"
          handlePress={handleLogout}
          containerStyles={styles.button}
        />
        <CustomButton
          title="Edit profile"
          handlePress={navigateToUserDetail}
          containerStyles={styles.button}
        />
      </View>
    </View>

    {/* Tabs */}
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'Reviews' && styles.activeTab]}
        onPress={() => setActiveTab('Reviews')}
      >
        <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'Info' && styles.activeTab]}
        onPress={() => setActiveTab('Info')}
      >
        <Text style={[styles.tabText, activeTab === 'Info' && styles.activeTabText]}>Info</Text>
      </TouchableOpacity>
    </View>

    {/* Content */}
    {activeTab === 'Reviews' ? (
      isLoading ? (
        <ActivityIndicator size="large" color="#a2b4da" style={{ marginTop: 20 }} />
      ) :
      reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleReviewPress(item.locationId)}>
            <ReviewItem
              review={item}
              userId={user.userId}
              onLikeToggle={handleLikeToggle}
            />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.reviewsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      ) : (
        <Text style={styles.noDataText}>No reviews yet.</Text>
      )
    ) : (
      <ScrollView contentContainerStyle={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Image source={icons.earth} style={styles.icon} />
          <Text style={styles.infoText}>{user?.nationality || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Image source={icons.email} style={styles.icon} />
          <Text style={styles.infoText}>{user?.email || 'No Email'}</Text>
        </View>
        <View style={styles.interestsSection}>
          <Text style={styles.infoText}>Interests:</Text>
          <View style={styles.interestsList}>
            {user?.interests?.map((interest, index) => (
              <View key={index} style={styles.interestItem}>
                <Image source={icons.star} style={styles.interestIcon} />
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            )) || <Text style={styles.infoText}>No Interests</Text>}
          </View>
        </View>
      </ScrollView>
    )}
  </SafeAreaView>
  );

};
const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  reviewContainer: {
    backgroundColor: '#e8edf6', // Card background
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    marginHorizontal:5
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#EDEDED',
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop:10
  },
  moodTag: {
    backgroundColor: '#4e71b8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  moodText: {
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    marginRight: 5,
  },
  liked: {
    color: '#FF5252',
  },
  likeCount: {
    fontSize: 14,
    color: '#000',
    marginLeft:10,
    fontFamily: 'Montserrat-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  ratingText: {
    fontSize: 14,
    color: '#000',
    marginRight: 5,
    fontFamily: 'Montserrat-Bold',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
    fontFamily: 'Montserrat-Bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20, // Space from top section
    width: '50%',
    gap: 15, // Add space between buttons
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8, 
    marginLeft: -10,
  },
  infoText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    marginTop:20
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  reviewsList: {
    padding: 10,
  },
  reviewItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  reviewTimestamp: {
    fontSize: 12,
    color: '#888',
    
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  infoContainer: {
    padding: 10,
    marginHorizontal: 15
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  interestsSection: {
    width: '90%',
    marginTop: 1,
  },
  interestsList: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  interestIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  interestText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    color: '#333',
  },
};

export default Profile;
