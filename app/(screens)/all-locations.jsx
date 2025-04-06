import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/config';
import { router } from 'expo-router';

const AllLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'locations'));
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const RenderLocationItem = ({ item }) => (
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
        elevation: 3, 
      }}
      onPress={() => router.push({
        pathname: '/location-detail',
        params: { id: item.id },
      })}
    >
      <Image
        source={{ uri: item.photoUrl ? item.photoUrl[0] : 'fallback_image_url' }}
        style={{ width: '100%', height: 150 }}
        resizeMode="cover"
      />
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ fontFamily: 'Montserrat-Regular', color: '#555', marginTop: 4 }}>{item.type}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, fontWeight: 'bold' }}>{item.rating}</Text>
          <Text style={{ marginLeft: 4, color: 'gold' }}>★</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <Text style={{ fontFamily: 'Montserrat-Regular', textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 12, marginTop: 10 }}>
          All Locations
        </Text>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#cd548d" />
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RenderLocationItem item={item} />}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </SafeAreaView>
  );
};

export default AllLocations;
