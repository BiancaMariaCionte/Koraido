import { View, Text, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { StyleSheet } from 'react-native';
import CustomButton from '../../components/CustomButton';
import {Link, router} from 'expo-router'
import { auth } from '../../services/config'; 
import { signInWithEmailAndPassword } from 'firebase/auth';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const[isSubmitting, setIsSubmitting] = useState(false)

  const submit = async() => {
    if(!form.email || !form.password){
      Alert.alert('Error', 'Please fill in all the fields')
    }

    setIsSubmitting(true);
    try {
      
      await signInWithEmailAndPassword(auth, form.email, form.password);
      console.log('User signed in successfully');

      // Here you can redirect the user to the main app screen
      // For example, if you're using Expo Router, you could do:
   
      router.replace('/home')

    } catch (error) {
      //console.error("Error signing in:", error);
    
      if (error.code === 'auth/invalid-credential') {
        Alert.alert('Error', 'Invalid email or password ');
      } else if (error.code === 'auth/invalid-email'){
        Alert.alert('Error', 'Invalid email');
      }
      
    } finally {
      setIsSubmitting(false);
    }

  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo at the top */}
        <View style={styles.logoContainer}>
          <Image
            source={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/Logo.png')}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        {/* Log in to Koraido text */}
        <Text style={styles.titleText}>Log In</Text>

        {/* Email Field */}
        <FormField
          title="Email"
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          otherStyles={styles.formField}
          keyboardType="email-address"
        />

        {/* Password Field */}
        <FormField
          title="Password"
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
          otherStyles={styles.formField}
         
        />
        <CustomButton
          title="Sign In"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
        <View className="justify-center pt-5 flex-row gap-2">
        <Text style={styles.signUpText}>
            Don't have an account?
          </Text>
          <Link href="/sign-up"
           className="text-sm"
           style={styles.signUpLink} 

           >
            Sign Up
          </Link>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, // Allow the ScrollView to expand to fill the entire screen
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    marginTop: -50, // Remove the top margin
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: -40,
    marginBottom: 30,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    alignSelf: 'flex-start'
  },
  formField: {
    width: '100%',
    marginBottom: 16,
    fontFamily: 'Montserrat-Bold'
  },
  
  signUpText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Montserrat-Regular', // Regular font for the question text
  },
  signUpLink: {
    fontSize: 14,
    color: '#9b5f9b', // Light purple color for "Sign Up"
    fontFamily: 'Montserrat-Bold', // Bold font for "Sign Up"
    
  },
});
