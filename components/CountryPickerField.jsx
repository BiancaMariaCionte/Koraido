import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import Ionicons from '@expo/vector-icons/Ionicons';

const CountryPickerField = ({ title, value, onSelectCountry }) => {
  const [isFocused, setIsFocused] = useState(false); // Track focus for styling

  return (
    <View style={[styles.container, { borderColor: isFocused ? '#4f71b9' : '#ccc' }]}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        onPress={() => setIsFocused(!isFocused)} // Toggle focus for the picker
        style={styles.pickerWrapper}
      >
        <Ionicons name="earth-outline" size={24} color="#6b88c4" style={styles.icon} />
        <CountryPicker
          withFilter
          withFlag
          withCountryNameButton={false} // To style consistently
          onSelect={onSelectCountry}
          containerButtonStyle={styles.pickerButton}
          visible={isFocused}
          onClose={() => setIsFocused(false)}
        />
        <Text style={styles.valueText}>
          {value?.name || 'Select Country'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CountryPickerField;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  title: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerButton: {
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    color: '#6b88c4',
    marginLeft: 10,
    fontFamily: 'Montserrat-Regular',
  },
  icon: {
    marginRight: 10,
  },
});
