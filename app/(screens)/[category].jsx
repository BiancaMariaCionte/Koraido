import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/config';
import { RenderLocationItem } from '../../components/RenderLocationItem';
import Fuse from 'fuse.js';
import SearchInput from '../../components/SearchInput';

const categorySubcategories = {
  Food: ['Restaurant', 'Bakery', 'Pastry', 'Café', 'Bar','Ice cream'],
  Landmark: ['Neighborhood', 'Museum', 'History','Religion','Theater', 'Library','Monument'],
  Shopping: ['Shopping Mall', 'Shopping Street', 'Store'],
  City: ['Architecture','Park','Exhibition','Entertainment Agency','Zoo','Nature'],
  KPop: ['Enhypen', 'TXT', 'BTS']
};

const Category = () => {
  const { category } = useLocalSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [query, setQuery] = useState('');

  const subcategories = categorySubcategories[category] || [];

  const fetchLocations = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'locations'));
      const locationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const normalizedSubcategories = subcategories.map((subcat) => subcat.toLowerCase());

      const filteredLocations = locationsData.filter(
        (location) =>
          location.type &&
          normalizedSubcategories.includes(location.type.toLowerCase())
      );

      setLocations(filteredLocations);

      if (subcategories.length > 0 && !selectedSubcategory) {
        setSelectedSubcategory(subcategories[0]);
      }
    } catch (error) {
      console.error('Error fetching locations: ', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBySubcategory = React.useMemo(() => {
    if (!selectedSubcategory) return locations;
  
    const subcategoryLocations = locations.filter(
      (location) =>
        String(location.type || '').toLowerCase() === selectedSubcategory.toLowerCase()
    );
  
    if (query) {
      const fuse = new Fuse(subcategoryLocations, {
        keys: ['name'],
        threshold: 0.4, // Adjust as needed for flexibility
      });
  
      const searchResults = fuse.search(query);
  
      // Return sorted results
      return searchResults.map((result) => result.item);
    }
  
    return subcategoryLocations;
  }, [locations, selectedSubcategory, query]);
  

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery); // Update query state to trigger the filtering logic
  };
  
  

  useEffect(() => {
    fetchLocations();
  }, [category]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a2b4da" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingTop: 20 }}>
        {/* Search Input */}
        <View style={{ paddingHorizontal: 10, marginBottom: 16 }}>
        <SearchInput
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch} // Pass the search handler
          />
        </View>

        {/* Subcategory Selector */}
        {subcategories.length > 0 && (
          <View style={{ marginBottom: 16, paddingHorizontal: 10 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subcategoryContainer}
            >
              {subcategories.map((subcat) => (
                <TouchableOpacity
                  key={subcat}
                  style={[
                    styles.subcategoryButton,
                    selectedSubcategory === subcat && styles.subcategoryButtonSelected,
                  ]}
                  onPress={() => setSelectedSubcategory(subcat)}
                >
                  <Text
                    style={[
                      styles.subcategoryText,
                      selectedSubcategory === subcat && styles.subcategoryTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {subcat || 'Unknown'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filtered Results */}
        <FlatList
          data={filteredBySubcategory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RenderLocationItem item={item} />}
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              No {selectedSubcategory || category} locations match your search.
            </Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subcategoryButton: {
    width: 130,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  subcategoryButtonSelected: {
    backgroundColor: '#a2b4da',
  },
  subcategoryText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  subcategoryTextSelected: {
    color: '#fff',
    fontFamily: 'Montserrat-Regular',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Montserrat-Regular',
  },
});

export default Category;
