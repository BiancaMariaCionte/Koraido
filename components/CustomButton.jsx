import { TouchableOpacity, View, Text } from 'react-native'
import React from 'react'


const CustomButton = ({ title, handlePress, containerStyles, textStyles, isLoading, icon}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-[#4e71b8] rounded-lg h-16 w-3/4 justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
     // disabled={isLoading || disabled}
    >
      <View className="flex-row items-center justify-center">
        {/* Render the icon if provided */}
        {icon} 
        {/* Text */}
        <Text className={`text-white text-lg font-semibold ${textStyles}`} style={{ fontFamily: 'Montserrat-Regular' }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default CustomButton;
