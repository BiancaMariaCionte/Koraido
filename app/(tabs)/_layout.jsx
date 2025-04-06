import { View, Image } from 'react-native';
import { Tabs } from 'expo-router';
import React from 'react';

const TabIcon = ({ icon, color, focused }) => {
  return (
    <View>
      <Image
        source={icon}
        style={{
          width: 24,
          height: 24,
          tintColor: focused ? '#95aad5' : 'gray', // Optional to change color when focused
        }}
      />
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      <Tabs
      
        screenOptions={{
          tabBarStyle: {
            position: "absolute", // Floating effect
            backgroundColor: "#ffffff", 
            borderTopColor: "#eaedf2", 
            borderRadius: 25, 
            marginHorizontal: 20, 
            marginBottom: 10, 
            height: 60, 
            paddingBottom: 8, 
            justifyContent: 'center',
            shadowColor: "#000", 
            shadowOffset: { width: 0, height: 5 }, // Shadow offset
            shadowOpacity: 0.3, // Shadow transparency
            shadowRadius: 4, // Shadow spread
            elevation: 3, // Elevation for Android shadow
          },
           tabBarShowLabel: false
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
              style={{
                justifyContent: "flex-end", 
                alignItems: "center",
                marginBottom: -13, 
              }}
            >
              <Image
                source={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/home.png')}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: focused ? "#95aad5" : "gray",
                }}
              />
            </View>
            ),
          }}
        />
        <Tabs.Screen
          name="wishList"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  marginBottom: -13, 
                }}
              >
                <Image
                  source={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/heart.png')}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? "#95aad5" : "gray",
                  }}
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  justifyContent: "flex-end", 
                  alignItems: "center",
                  marginBottom: -13, 
                }}
              >
                <Image
                  source={require('@/assets/icons/user.png')}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? "#95aad5" : "gray",
                  }}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
