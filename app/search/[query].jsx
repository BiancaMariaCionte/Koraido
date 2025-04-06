import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query as firestoreQuery, or, where } from 'firebase/firestore';
import { db } from '../../services/config.js';
import { router } from 'expo-router';
import SearchInput from '../../components/SearchInput'
import Fuse from 'fuse.js';

const Search = () => {
  const { query } = useLocalSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query || '');
  
  const fetchFilteredLocations = async () => {
    try {
      setLoading(true);

      const snapshot = await getDocs(collection(db, 'locations'));
    const allLocations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));


      const fuse = new Fuse(allLocations, {
        keys: ['name'],
        threshold: 0.4,        
      });
      const filteredResults = fuse.search(query || '');
      const filteredLocations = filteredResults.map(result => result.item);

      setLocations(filteredLocations);
    } catch (error) {
      console.error('Error fetching filtered locations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) fetchFilteredLocations();
  }, [query]);
  

  const RenderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => router.push({ pathname: '/location-detail', params: { id: item.id } })}
    >
      <Image
        source={{ uri: item.photoUrl ? item.photoUrl[0] : 'fallback_image_url' }}
        style={styles.locationImage}
        resizeMode="cover"
      />
      <View style={styles.locationDetails}>
        <View style={{ flex: 1 }}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationType}>{item.type}</Text>
        </View>
        <View style={styles.locationRating}>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.ratingStar}>★</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}> Search results for </Text> 
      <Text style={styles.queryText}>"{query}"</Text>
      <SearchInput
  query={localQuery}
  setQuery={setLocalQuery} // Update the local state here
  handleSearch={(value) => {
    router.push({ pathname: `/search/${value}` });
  }}
/>
    
    <View style={{ marginVertical: 16 }} />
      {loading ? (
        <ActivityIndicator size="large" color="#cd548d" style={styles.loading} />
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RenderLocationItem item={item} />}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    marginBottom: 16,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  locationImage: {
    width: '100%',
    height: 150,
  },
  locationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  locationName: {
    fontSize: 18,
    marginBottom: 4,
    fontFamily: 'Montserrat-Regular',
  },
  locationType: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Montserrat-Regular',
  },
  locationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
    fontFamily: 'Montserrat-Bold'
  },
  ratingStar: {
    fontSize: 16,
    color: '#FFD700',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 32,
    fontFamily: 'Montserrat-Regular',
  },
  queryText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Montserrat-Regular',
    marginBottom: 10,
    marginTop: -10,
    marginLeft: 5
  },
});

export default Search;