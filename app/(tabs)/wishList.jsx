import { View, Text, FlatList, TouchableOpacity,Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from '../../services/config'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useGlobalContext } from '@/context/GlobalProvider';
import {router} from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';

const WishList = () => {
  const { user } = useGlobalContext();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let unsubscribe;
    if (user) {
      // Real-time Firestore listener
      const q = query(collection(db, "wishlist"), where("userId", "==", user.userId));
      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedWishlist = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWishlist(fetchedWishlist);
      }, (error) => {
        console.error("Error fetching wishlist in real-time:", error);
      });
    }

    // Cleanup listener on component unmount
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const renderWishlistItem = ({ item }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3, // Shadow for Android
      }}
      onPress={() => router.push({
        pathname: '/location-detail',
        params: { id: item.location.id },
      })}
    >
      <Image
        source={{ uri: item.location.photoUrl ? item.location.photoUrl[0] : 'fallback_image_url' }}
        style={{ width: '100%', height: 150 }}
        resizeMode="cover"
      />
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 18, fontWeight: 'bold' }}>{item.location.name}</Text>
        <Text style={{ fontFamily: 'Montserrat-Regular', color: '#555', marginTop: 4 }}>{item.location.type}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, fontWeight: 'bold' }}>{item.location.rating}</Text>
        <Text style={{ marginLeft: 4, color: 'gold' }}>★</Text>
      </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, marginBottom:-35 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
      <Text style={{ fontFamily: 'Montserrat-Regular', textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 12 , marginTop:10}}>WishList</Text>
      </View>
      {wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          renderItem={renderWishlistItem}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No items in wishlist</Text>
        </View>
      )}
     
    </SafeAreaView>
  );
};

export default WishList;
