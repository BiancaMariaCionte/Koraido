import { TouchableOpacity, Image, View, Text } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

export const RenderLocationItem = React.memo(({ item }) => (
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
));
