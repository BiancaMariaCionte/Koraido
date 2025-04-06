import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect} from 'react';
import { icons } from '../constants'; // Ensure this is the correct import path for your icons
import { usePathname, router } from 'expo-router';

const SearchInput = ({ query, setQuery, handleSearch }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className="flex-row space-x-4"
      style={[
        styles.inputContainer,
        { borderColor: isFocused ? '#bb8fbb' : '#ccc' }, // Change border color based on focus
      ]}
    >
      <TextInput
        style={{ flex: 1, fontSize: 16, fontFamily: 'Montserrat-Regular' }}
        value={query}
        placeholder="Where would you like to go?"
        placeholderTextColor="#020305"
        onChangeText={(e) => setQuery(e)}
        onFocus={() => setIsFocused(true)}   // Change border color to purple on focus
        onBlur={() => setIsFocused(false)}    // Revert border color to gray on blur
      />

      <TouchableOpacity
        onPress={() => {
          if (!query) {
            return Alert.alert(
              'Missing query',
              'Please input something to search within the category.'
            );
          }
          // Call the passed handleSearch function
          handleSearch(query);
        }}
      >
        <Image
          source={icons.search}
          className="w-5 h-5"
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 214, 235, 0.5)', 
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    
  },
});

export default SearchInput;
