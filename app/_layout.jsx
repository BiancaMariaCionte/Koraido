import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { SplashScreen, Stack } from 'expo-router'
import { useFonts } from "expo-font";
import { useEffect } from "react";
import GlobalProvider from "../context/GlobalProvider"
import "../global.css"
import { TouchableOpacity } from 'react-native';
import { icons } from '../constants';
import {router} from 'expo-router'

SplashScreen.preventAutoHideAsync();


 

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    
  });

  useEffect(() => {
    if (error) throw error;

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  if (!fontsLoaded && !error) {
    return null;
  }

  
  return (
    <GlobalProvider>
    <Stack>
        <Stack.Screen name="index" options={{headerShown: false}}/>
       
        <Stack.Screen name="(auth)"
        options={{headerShown: false}}/>
        <Stack.Screen name="(tabs)"
        options={{headerShown: false}}/>
        <Stack.Screen name="(screens)"
        options={{headerShown: false}}/>
        <Stack.Screen name="(screens)/location-detail"
        options={{
          
          headerShown:false
          }}/>
           <Stack.Screen name="(screens)/user-detail"
        options={{headerShown: false}}/>
         <Stack.Screen name="(screens)/all-locations"
        options={{headerShown: false}}/>
         <Stack.Screen name="(screens)/all-reviews"
        options={{headerShown: false}}/>
         <Stack.Screen name="search/[query]" options={{ headerShown: false }} />
         <Stack.Screen name="(screens)/[category]" options={{ headerShown: false }} />

        
    </Stack>
    </GlobalProvider>
    
  )
}

export default RootLayout
