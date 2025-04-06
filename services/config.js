import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCU8wEuGvCrvydSj2xCjtypQonSeb1kk64",
  authDomain: "koraido.firebaseapp.com",
  projectId: "koraido",
  storageBucket: "koraido.appspot.com",
  messagingSenderId: "1072807098932",
  appId: "1:1072807098932:web:ab38b886ccc1621f046861",
  measurementId: "G-DJFTF6PQ9F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export {app,auth,db};
