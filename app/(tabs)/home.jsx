import { View, Text, FlatList,StyleSheet, RefreshControl, TouchableOpacity, Image,ActivityIndicator, StatusBar  } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '../../components/SearchInput'
import Cathegories from '../../components/Cathegories'
import { useGlobalContext } from '@/context/GlobalProvider'
import {router} from 'expo-router'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/config.js';
import { LinearGradient } from "expo-linear-gradient";
import Recommendations from '../../components/Recommendations'
import axios from 'axios';

const Home = () => {
  const[refreshing, setRefreshing] = useState(false)
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true) 
  const { user} = useGlobalContext();
  const [query, setQuery] = useState(''); // State to manage the search query


  const fetchLocations = async () =>{
    try{
      const snapshot = await getDocs(collection(db, 'locations' ))
      const locationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setLocations(locationsData)

    }catch (error){
        console.error("Error fetching locations: ", error)
    }finally{
      setLoading(false) 
    }
  }

  useEffect(() =>{
    fetchLocations()
  }, [])

  const greetingMessage = () => {
    const currentTime = new Date().getHours();
    if (currentTime < 12) {
      return "Good Morning";
    } else if (currentTime < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const message = greetingMessage();

  // Handle search query
  const handleSearch = (searchQuery) => {
    if (!searchQuery) return;
    router.push({ pathname: `/search/${searchQuery}` });
  };

  
  
  const onRefresh = async() => {
    setRefreshing(true)
    await fetchLocations() 
    setRefreshing(false)
  }

    // we render each location item as a horizontal card
  const RenderLocationItem = React.memo(({ item , onPress}) => (
    <TouchableOpacity
    className="bg-white shadow-lg mb-4" 
    style={{
        marginHorizontal: 16, 
        borderRadius: 20, 
        overflow: 'hidden',
        
    }}
    onPress={() => onPress(item.id)}
      >
        <Image
          source={{ uri: item.photoUrl ? item.photoUrl[0] : 'fallback_image_url' }}
          style={{
            width: '100%',
            height: 150, 
          }}
          resizeMode="cover"
          
        />
        <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between' }}>
         
         {/* text container for name and type */}
      <View style={{ flex: 1 }}>
        <Text
          className="text-lg font-semibold"
          style={{ fontFamily: 'Montserrat-Regular', fontSize: 18 }}
        >
          {item.name}
        </Text>
        <Text
          className="text-sm text-gray-500"
          style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, marginTop: 4 }}
        >
          {item.type}
        </Text>
      </View>


        
       {/* Rating container, aligned to the right */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{fontFamily: 'Montserrat-Bold'}}className="text-lg font-semibold mr-1">{item.rating}</Text>
        <Text className="text-yellow-400">★</Text>
      </View>
    </View>
      </TouchableOpacity>
    ));


  return (
    <LinearGradient 
    colors={['#ffffff', '#ffffff']}
    style={{ flex: 1 }} 
  >
    <SafeAreaView style={styles.container}>
    <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {loading ? ( // Show loading spinner if data is still being fetched
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a2b4da" />
        </View>
      ) : (
      <FlatList
        data={locations.slice(0,5)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RenderLocationItem item={item} onPress={(id) => router.push({ pathname: '/location-detail', params: { id } })}/>}
        contentContainerStyle={{ paddingBottom: 0 }}
        initialNumToRender={5} 
        maxToRenderPerBatch={10} 
        updateCellsBatchingPeriod={50} 
        keyboardShouldPersistTaps="handled" // Add this prop
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-3xl font-bold" style={{ fontFamily: 'Montserrat-Regular' }}>
                  {message}
                </Text>
                <Text className="text-2xl font-medium text-gray-600" style={{ fontFamily: 'Montserrat-Regular' }}>
                  {user?.username || 'User'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/profile')}>
                <Image
                   source={user?.profileImage ? { uri: user.profileImage } : require('@/assets/images/profileDef.jpg')}
                  className="w-16 h-16 rounded-full"
                />
              </TouchableOpacity>
            </View>


            <SearchInput
  query={query}
  setQuery={(value) => {
    setQuery(value); // Update the state
  }}
  handleSearch={handleSearch}
/>
<Recommendations />


            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-2xl font-bold mb-4" style={{ fontFamily: 'Montserrat-Regular' }}>
                Categories
              </Text>
              <Cathegories />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text className="text-2xl font-bold mb-2"  style={{ fontFamily: 'Montserrat-Regular' }}>
            Locations
          </Text>
          <TouchableOpacity onPress={() => router.push('/all-locations')}>
                    <Text className="text-lg font-medium"
                     style={{ color: '#6b88c4' }}>See more</Text>
                  </TouchableOpacity>
                </View>
          </View>
          
        )}
        
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        
        />
        
      )}
      

    </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: -35
},

})
export default Home