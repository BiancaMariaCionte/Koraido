import { StyleSheet, View, Image, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, Redirect, router } from 'expo-router';
import CustomButton from '../components/CustomButton';
import { useGlobalContext } from '../context/GlobalProvider';
import { LogBox } from 'react-native';



export default function App() {
  const {isLoading, isLoggedIn} = useGlobalContext();
  if(!isLoading && isLoggedIn) return <Redirect href="/home"/>

  LogBox.ignoreLogs([
    'Support for defaultProps will be removed', // Adjust as needed
  ]);
 
  return (
    <ImageBackground 
      source={require('../assets/images/background.jpg')} 
      style={styles.backgroundImage}
    >

    <SafeAreaView style={styles.safeArea}>
      <StatusBar style='dark' backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('C:/Users/Bianca/Desktop/3rdYear/Licenta/Koraido/assets/icons/Logo.png')}
            style={styles.logo}
            resizeMethod='contain'
          />
         
        </View>
        <CustomButton
          title="Continue with Email"
          handlePress={() => router.push('/sign-in')}
          containerStyles="w-3/4 mt-5" // Adjusted margin for better spacing
        />
      </ScrollView>
    </SafeAreaView>
  </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, // Allow the ScrollView to grow to fill the area
    justifyContent: 'center', // Center children vertically
    alignItems: 'center', // Center children horizontally
  },
  logoContainer: {
    marginBottom: 20, // Space below the logo container
    alignItems: 'center', // Center logo horizontally
  },
  logo: {
    width: 380, // Width of the logo
    height: 180, // Height of the logo
  },
});
