import { View, TouchableOpacity, Text , Image, FlatList, StyleSheet} from 'react-native'
import React from 'react'
import { icons } from '../constants';
import { useNavigation } from 'expo-router'; 

const categoriesData = [
    { id: '1', name: 'City', icon: icons.city, route: 'City' },
    { id: '2', name: 'Landmark', icon: icons.landmark, route: 'Landmark' },
    { id: '3', name: 'Food', icon: icons.food, route: 'Food' },
    { id: '4', name: 'KPop', icon: icons.kpop, route: 'KPop' },
    { id: '5', name: 'Shopping', icon: icons.shopping, route: 'Shopping' },
  ];

  const Cathegories = () => {
    const navigation = useNavigation();

    return (
        <FlatList
            data={categoriesData}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => navigation.push('(screens)/[category]', { category: item.name })}


                >
                    <Image source={item.icon} style={styles.icon} />
                    <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
    );
};

const styles = StyleSheet.create({
  categoryButton: {
    width: 85,
    height: 85,
    borderRadius: 40,
    backgroundColor: '#ccd6eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
   
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
});


export default Cathegories