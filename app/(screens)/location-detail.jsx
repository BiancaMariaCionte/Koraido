import { View, Text, Image, StyleSheet, SafeAreaView,Dimensions, Modal,ScrollView, FlatList, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc,setDoc,getDocs,query, where, deleteDoc,arrayRemove, arrayUnion, increment, orderBy, onSnapshot,addDoc ,updateDoc, collection, runTransaction} from 'firebase/firestore';
import { db } from '../../services/config.js'; 
import { useGlobalContext } from '@/context/GlobalProvider';
import {Ionicons} from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient';
import ReviewForm from '../../components/ReviewForm';
import CustomButton from '../../components/CustomButton'; 
import { useRouter } from 'expo-router'; 
import ReviewItem from '../../components/ReviewItem';
import { Linking } from 'react-native';
import { icons } from '../../constants';

const screenWidth = Dimensions.get('window').width;


const LocationDetail = () => {
  const [location, setLocation] = useState(null);
  const [newReviewText, setNewReviewText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useLocalSearchParams(); // Get the document ID from route params
  const { user } = useGlobalContext(); // Assume user is available in context
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistDocId, setWishlistDocId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReviewFormVisible, setIsReviewFormVisible] = useState(false);

  const [reviews, setReviews] = useState([]);

  const router = useRouter(); 


   // Check if user is not loaded
   if (!user) {
    return <Text>Loading user...</Text>;
  }

  // // Function to fetch location details from Firestore
  // const fetchLocationDetails = async () => {
  //   try {
  //     const docRef = doc(db, 'locations', id); // Reference to the document in 'locations' collection
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists()) {
  //       setLocation({ id: docSnap.id, ...docSnap.data() });
  //     } else {
  //       console.log("No such document!");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching location:", error);
  //   }
  // };

  const fetchLocationDetails = () => {
    try {
      const docRef = doc(db, 'locations', id); // Reference to the document in 'locations' collection
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setLocation({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      });
      return unsubscribe; // Return the cleanup function
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };
  
  const fetchReviews = () => {
    try {
      const reviewsQuery = query(
        collection(db, 'locations', id, 'reviews'),
        orderBy('overallRating', 'desc'),
        orderBy('timestamp', 'desc')
      );
      const unsubscribe = onSnapshot(reviewsQuery, (querySnapshot) => {
        const reviewsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(reviewsArray);
      });
      return unsubscribe; // Return the cleanup function
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };
  
  

   // Like or unlike a review
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

  useEffect(() => {
    if (id) {
      // fetchLocationDetails();
      // fetchReviews();
      
      checkIfFavorite(id); // Check if the location is a favorite
      const unsubscribeLocation = fetchLocationDetails(); // Listener for location details
      const unsubscribeReviews = fetchReviews(); // Listener for reviews
      
      return () => {
        if (unsubscribeLocation) unsubscribeLocation(); // Cleanup
        if (unsubscribeReviews) unsubscribeReviews(); // Cleanup
      };
    }
  }, [id]);

  const checkIfFavorite = async (locationId) => {
    if (!user) return;
    try {
      const q = query(collection(db, "wishlist"), where("userId", "==", user.userId), where("location.id", "==", locationId));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setIsFavorite(true);
        setWishlistDocId(querySnapshot.docs[0].id); // Store the document ID for deletion
      } else {
        setIsFavorite(false);
        setWishlistDocId(null);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  if (!location) return <Text>Loading...</Text>;
  
  const openModal = (index) => {
    setSelectedImageIndex(index);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const renderImage = ({ item, index }) => (
    <View style={styles.imageContainer}>
    <TouchableOpacity onPress={() => openModal(index)}>
      <Image source={{ uri: item }} style={styles.imageStyle} resizeMode="cover" />
    </TouchableOpacity>
    <LinearGradient
    colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
    style={styles.bottomOverlay}
  />
    <TouchableOpacity style={styles.wishlistButton}
        onPress={handleFavoriteToggle}
        disabled={isLoading}
        //  onPress={() => onSetFavourite(location)
        >
      <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={30} color={isFavorite ? "#becbe5" : "white"} />
      </TouchableOpacity>
    </View>
  );

  const handleFavoriteToggle = async () => {
    if (!user || !location || isLoading) return;

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from wishlist
        if (wishlistDocId) {
          await deleteDoc(doc(db, "wishlist", wishlistDocId));
          console.log("Removed from wishlist");
          setIsFavorite(false);
        }
      } else {
        // Add to wishlist
        const wishlistRef = collection(db, "wishlist");
        const newDoc = await addDoc(wishlistRef, {
          location: location,
          userId: user.userId,
        });
        console.log("Added to wishlist");
        setIsFavorite(true);
        setWishlistDocId(newDoc.id);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    } finally{
      setIsLoading(false)
    }
  };

  const handleSeeMoreReviews = () => {
    router.push({ pathname: '/all-reviews', params: { id } });
  };

  const renderReviewItem = ({ item }) => {
    <ReviewItem
    review={item}
    userId={user.userId}
    onLikeToggle={handleLikeToggle}
  />
  };


  const handleSubmitReview = async (review) => {
    const locationRef = doc(db, 'locations', id); // Reference to the location document
    const reviewsRef = collection(db, 'locations', id, 'reviews'); // Subcollection for reviews
  
    try {
      await runTransaction(db, async (transaction) => {
        const locationDoc = await transaction.get(locationRef);
        if (!locationDoc.exists()) {
          throw new Error('Location does not exist!');
        }
  
        // Current location rating
        const currentRating = locationDoc.data().rating || 0;
        const reviewCount = locationDoc.data().reviewCount || 1; // Current number of reviews
  
        // Add the new review
        const newReviewRef = await addDoc(reviewsRef, {
          ...review,
          timestamp: new Date(),
          userId: user.userId,
          username: user.username,
          profileImage: user.profileImage,
        });
  
        // Calculate new average rating
        const totalRating = currentRating * reviewCount; // Total accumulated rating
        const newTotalRating = totalRating + review.overallRating; // Add new review's rating
        const newReviewCount = reviewCount + 1; // Increment review count
        const newAverageRating = (newTotalRating / newReviewCount).toFixed(1); // Calculate new average

        // Update location rating and review count
        transaction.update(locationRef, {
          rating: parseFloat(newAverageRating),
          reviewCount: newReviewCount,
        });
  
        console.log('New review added with ID:', newReviewRef.id);
        console.log('Location rating updated:', newAverageRating);
      });
    } catch (error) {
      console.error('Error updating location rating:', error);
    }
  };


const openNaverMap = () => {
  if (location.placeNId) {
    // Open Naver Maps directly to the place entry
    const url = `nmap://place?id=${location.placeNId}`;
    const webUrl = `https://map.naver.com/p/entry/place/${location.placeNId}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(webUrl);
    });

  } else if (location.latitude && location.longitude) {
    // Open Naver Map with coordinates (less accurate for places)
    const url = `nmap://route/public?dlat=${location.latitude}&dlng=${location.longitude}&dname=${encodeURIComponent(location.name)}`;
    const webUrl = `https://map.naver.com/v5/directions/-/-/${location.longitude},${location.latitude},${encodeURIComponent(location.name)}`;

    Linking.openURL(url).catch(() => {
      Linking.openURL(webUrl);
    });

  } else if (location.address) {
    // Open Naver Map with address search
    const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(location.address)}`;
    Linking.openURL(webUrl);
  } else {
    Alert.alert("Error", "Location data is missing!");
  }
};


  // const openNaverMap = () => {
  //   if (location.latitude && location.longitude) {
  //     // Open Naver Map with coordinates
  //     const url = `nmap://route/public?dlat=${location.latitude}&dlng=${location.longitude}&dname=${encodeURIComponent(location.name)}`;
      
  //     // Fallback to Web version if the app is not installed
  //     const webUrl = `https://map.naver.com/v5/directions/-/-/${location.longitude},${location.latitude},${encodeURIComponent(location.name)}`;


  //     Linking.openURL(url).catch(() => {
  //       Linking.openURL(webUrl);
  //     });
  
  //   } else if (location.address) {
  //     // Open Naver Map with address search
  //     const webUrl = `https://map.naver.com/v5/search/${encodeURIComponent(location.address)}`;
  //     Linking.openURL(webUrl);
  //   } else {
  //     alert("Location data is missing!");
  //   }
  // };
  
  return (
   
    <ScrollView style={styles.container}
    contentContainerStyle={styles.contentContainer}>
       <SafeAreaView style={styles.container}>
     <Text className="text-2xl font-bold"style={{ fontFamily: 'Montserrat-Bold',  marginHorizontal: 10, marginTop:20}}>{location.name}</Text>
     <Text style={styles.textStyle} >{location.type}</Text>

      <FlatList
        data={location.photoUrl}
        renderItem={renderImage}
        style={styles.newsImg}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        pagingEnabled // Snap images to screen width
        showsHorizontalScrollIndicator={false}
        
      />

      {/* <Image source={{ uri: location.photoUrl }} className="w-full h-48" resizeMode="cover" /> */}
     
      <View style={styles.row}>
      <Ionicons name="star-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.rating} </Text>
    </View>
      {/* <Text  style={styles.textStyle}>Rating: {location.rating} ★</Text> */}
      <View style={styles.row}>
      <Ionicons name="pin-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.address}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="wallet-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}>{location.price}</Text>
    </View>
    <View style={styles.row}>
      <Ionicons name="brush-outline" size={24} color="black" style={styles.iconStyle} />
      <Text style={styles.textStyle}> {location.theme +" "}</Text>
    </View>


    <CustomButton
  title={isReviewFormVisible ? "Cancel" : "Write a Review"}
  handlePress={() => setIsReviewFormVisible(!isReviewFormVisible)}
  containerStyles=" w-full my-4" // Optional Tailwind or custom styles for the button
  textStyles="text-lg font-bold" // Optional additional text styling
  isLoading={false} // Update this to handle loading state if required
  disabled={false} // Update this to disable the button when needed
/>


{isReviewFormVisible && (

<ReviewForm
   onSubmitReview={(review) => handleSubmitReview(review)}
/>
)}

{/* 
           <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
        /> */}

{/* <Text style={styles.textStyle}>Reviews</Text> */}
 {/* Reviews Header */}
 <View style={styles.reviewsHeader}>
          <Text style={styles.textStyle}>Reviews</Text>
          {reviews.length > 3 && (
            <TouchableOpacity onPress={handleSeeMoreReviews}>
              <Text style={styles.seeMoreButton}>See More</Text>
            </TouchableOpacity>
          )}
        </View>
<View>
{reviews.slice(0, 3).map((review) => (
    <ReviewItem
      key={review.id}
      review={review}
      userId={user.userId}
      onLikeToggle={handleLikeToggle}
    />
  ))}
  {/* {reviews.slice(0, 3).map((review) => (
    <View key={review.id} style={styles.reviewContainer}>
      {renderReviewItem({ item: review })}
    </View>
  ))} */}

</View>
{/* {reviews.length > 3 && (
  <TouchableOpacity onPress={handleSeeMoreReviews}>
    <Text style={styles.seeMoreButton}>See More</Text>
  </TouchableOpacity> */}
{/* )} */}
      

     {/* Full-screen image modal */}
     <Modal visible={isModalVisible} transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            source={{ uri: location.photoUrl[selectedImageIndex] }}
            style={{ width: '100%', height: '80%' }}
            resizeMode="contain"
          />
           {/* Close Button */}
           <TouchableOpacity onPress={closeModal} style={{ position: 'absolute', top: 40, right: 20 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
          {/* Navigation Buttons */}
          {selectedImageIndex > 0 && (
            <TouchableOpacity
              onPress={() => setSelectedImageIndex(selectedImageIndex - 1)}
              style={{ position: 'absolute', left: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 32 }}>‹</Text>
            </TouchableOpacity>
          )}
          {selectedImageIndex < location.photoUrl.length - 1 && (
            <TouchableOpacity
              onPress={() => setSelectedImageIndex(selectedImageIndex + 1)}
              style={{ position: 'absolute', right: 20 }}
            >
              <Text style={{ color: 'white', fontSize: 32 }}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      <CustomButton
  title="Get Directions"
  handlePress={openNaverMap}
  containerStyles="w-full my-4 bg-green-500"
  textStyles="text-lg font-bold text-white"
  icon={<Image source={icons.naverMap} style={{ width: 26, height: 22, marginRight: 10}} />} // Use Naver Map icon here

/>

      
      </SafeAreaView>
    </ScrollView>
   
  );
};

export default LocationDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10, 
    backgroundColor: '#fff',
  },
  
  newsImg: {
  
    borderRadius: 10,
    marginVertical: 10,
  },
  contentContainer:{
    paddingBottom: 20, 
  
  },

  imageContainer: {
    width: screenWidth - 40, 
    height: 240,
    marginHorizontal: 10, 
    borderWidth: 2, 
    borderColor: '#ccc', 
    borderRadius: 10, 
    overflow: 'hidden', 
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  textStyle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    marginVertical: 10, 
    marginHorizontal: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5, 
    marginHorizontal:5
  },
  iconStyle: {
    marginRight: -1, 
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 60, 
    borderRadius: 9, 
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 10, 
    right: 10,
    zIndex: 1,
  },

  reviewContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginBottom: 15,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
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
    width: 30,
    height: 30,
    borderRadius: 20, 
    marginRight: 10, 
  },
  username: {
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold'
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
  addReviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
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
  seeMoreButton:{
    fontSize: 15,
  fontFamily: 'Montserrat-Bold',
   color: '#6b88c4' ,
   marginRight: 10
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
 

})