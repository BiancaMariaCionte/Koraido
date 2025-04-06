import { View, Text, ScrollView, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import { StyleSheet } from 'react-native';
import CustomButton from '../../components/CustomButton';
import {Link} from 'expo-router'
import { auth, db } from '../../services/config.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where,getDocs,addDoc , setDoc, doc } from 'firebase/firestore';
import { router } from 'expo-router';


const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const[isSubmitting, setIsSubmitting] = useState(false)

  const submit = async() => {
    if(!form.username || !form.email || !form.password){
      Alert.alert('Error', 'Please fill in all the fields')
    }
    setIsSubmitting(true);
    try{
        // Check if the username already exists
        const usersRef = collection(db, "users");
        const usernameQuery = query(usersRef, where("username", "==", form.username));
        const querySnapshot = await getDocs(usernameQuery);
  
        if (!querySnapshot.empty) {
          Alert.alert('Error', 'The username is already in use. Please choose another one');
          return;
        }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      try {
        const docRef = await setDoc(doc(db, "users", userCredential?.user?.uid), {
          username: form.username,
           email: form.email,
           password: form.password,
           userId: userCredential?.user?.uid,
           createAt: new Date(),
        });
       // console.log("Document written with ID: ", docRef.uid);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
     console.log('User created and data stored in Firebase');

     //set it to global state
     router.replace('/home')
    }catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'The email is already in use by another account');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters');
      } else {
        Alert.alert('Error', 'Failed to create an account. Please try again.');
      }
      //console.error("Error signing up", error.message)
    }finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.titleText}>Sign Up</Text>

        {/* Username field */}
          <FormField
          title="Username"
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
          otherStyles={styles.formField}
        />

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
          title="Sign Up"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={isSubmitting}
        />
        <View className="justify-center pt-5 flex-row gap-2">
        <Text style={styles.signUpText}>
           Have an account already?
          </Text>
          <Link href="/sign-in"
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

export default SignUp;

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
    marginBottom: -35
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
