import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { icons } from '../constants'; // Ensure this is the correct import path for your icons

const FormField = ({ title, value, placeholder, handleChangeText, otherStyles,icon, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Track input focus state

  return (
    <View style={[{ marginBottom: 16 }, otherStyles]}>
      <Text style={{ fontSize: 16, color: '#000', marginBottom: 8, fontFamily: 'Montserrat-Bold', fontWeight: 'bold' }}>{title}</Text>

      <View
        style={[
          styles.inputContainer,
          { borderColor: isFocused ? '#4f71b9' : '#ccc' }, // Change border color based on focus
        ]}
      >
         {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <TextInput
          style={{ flex: 1, fontSize: 16, color: '#000', fontFamily: 'Montserrat-Regular' }}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#6b88c4"
          onChangeText={handleChangeText}
          secureTextEntry={title === 'Password' && !showPassword}
          onFocus={() => setIsFocused(true)}   // Change border color to purple on focus
          onBlur={() => setIsFocused(false)}    // Revert border color to gray on blur
          {...props}
        />

        {title === 'Password' && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={!showPassword ? icons.eye : icons.eyehide}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
   iconContainer: {
    marginRight: 8,
  },
});

export default FormField;
