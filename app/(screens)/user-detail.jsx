import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet,Modal, ScrollView,Animated,Dimensions,Easing, ImageBackground, Image, Alert, Pressable, Platform, TouchableOpacity } from 'react-native';
import React, { useState , useEffect, useRef } from 'react';
import { launchImageLibraryAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { setDoc, doc ,getDoc, updateDoc} from 'firebase/firestore';
import { db, auth } from '../../services/config';
import { router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { icons } from '../../constants';
import Ionicons from '@expo/vector-icons/Ionicons';
//import { CountryModalProvider } from 'react-native-country-picker-modal';
import CountryPicker from 'react-native-country-picker-modal';
import CountryPickerField from '../../components/CountryPickerField';

const UserDetails = () => {
  // State for form fields
  const [form, setForm] = useState({
    gender: '',
    nationality: '',
    dateOfBirth: ''
  });


  const [profilePicture, setProfilePicture] = useState('');
  const [interests, setInterests] = useState([
    'K-Pop',
    'Food',
    'History',
    'Architecture',
    'Shopping',
    'Photography',
    'Dance',
    'Culture',
    'K-Drama',
    'Café',
    'Religion',
    'Park',
    'Nature',
  ]);


  const [selectedInterests, setSelectedInterests] = useState([]);
  const { updateUserData } = useGlobalContext();
  const [showInterestMessage, setShowInterestMessage] = useState(false);

  const [date, setDate] = useState(new Date()); // For the DatePicker
  const [showPicker, setShowPicker] = useState(false); // Show/hide date picker
  const [isModalVisible, setIsModalVisible] = useState(false); // State to toggle modal visibility
  const slideAnim = useState(new Animated.Value(Dimensions.get('window').height))[0]; 
 
  const profilePic = require('@/assets/images/profileDef.jpg'); 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }
  
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setForm({
          gender: userData.gender || '',
          nationality: userData.nationality || '',
          dateOfBirth: userData.dateOfBirth || '',
        });
      
        setSelectedInterests(userData.interests || []);

        if (userData.profileImage) {
          setProfilePicture(userData.profileImage);
        } else {
          setProfilePicture(null); // Default image if none found
        }

        }else{
          Alert.alert('Error', 'User data not found');
        }
    }catch (error) {
      console.error('Error fetching user data: ', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const handleSelectCountry = (country) => {
    setForm((prevForm) => ({
      ...prevForm,
      nationality: {
        name: country.name,
        code: country.cca2, // Use 'cca2' for country code
      },
    }));
  };
  
  

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0, // Slide to the bottom of the screen
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').height, 
      duration: 50, 
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false); 
    });
  };

  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/*',
      name: 'profile_picture.jpg',
    });
    formData.append('upload_preset', 'profile_picture');
    formData.append('cloud_name', 'doar4yyrn');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/doar4yyrn/image/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (response.ok) {
        // Set the profile picture but don't upload it to Firebase yet
        setProfilePicture(result.secure_url);
      } else {
        console.error('Cloudinary upload error:', result.error.message);
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
    }
  };

  const handleSelectImage = async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissions required', 'We need access to your gallery to upload a profile picture.');
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      await uploadToCloudinary(result.assets[0].uri);
      closeModal();
    }
  };

  const handleDeleteProfilePicture = async () => {
    setProfilePicture(null); 
    closeModal();
  };

  // Function to toggle the date picker visibility
  const toggleDatepicker = () => {
    setShowPicker(!showPicker);
  };

  // Date picker change handler
  const onChange = ({ type }, selectedDate) => {
    if (type === 'set') {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setForm({ ...form, dateOfBirth: currentDate.toDateString() }); // Store date as string
      if (Platform.OS === 'android') {
        toggleDatepicker(); // Close date picker on Android
      }
    } else {
      toggleDatepicker(); // Close date picker if canceled
    }
  };

  // For iOS, confirm the selected date
  const confirmIOSDate = () => {
    setForm({ ...form, dateOfBirth: date.toDateString() });
    toggleDatepicker();
  };


  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );

    if (!showInterestMessage) {
      setShowInterestMessage(true);
      setTimeout(() => setShowInterestMessage(false), 4000);
    }
  };


  const countryCode = form.nationality?.code ?? 'US';

  const handleSubmit = async () => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'User ID is missing');
      return;
    }

    try {
      // Prepare the user data
      const userData = {
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        nationality: form.nationality  || { name: 'Unknown', code: 'US' },
        interests: selectedInterests,
      };

      // Include the updated profile picture only when submitting
      if (profilePicture !== require('@/assets/images/profileDef.jpg')) {
        userData.profileImage = profilePicture;
      }

      // Save the data to Firebase
      await setDoc(doc(db, 'users', userId), userData, { merge: true }); // Use merge to avoid overwriting existing data

      // Update the global context
      await updateUserData(userId);

      Alert.alert('Success', 'Details saved successfully!');
      router.push('/profile'); // Navigate to the profile page after success
    } catch (error) {
      console.error('Error saving user details: ', error);
      Alert.alert('Error', 'Failed to save details. Please try again.');
    }
  };

  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
              


        {/* Logo at the top */}
        <View style={styles.logoContainer}>
        <TouchableOpacity onPress={openModal} >
        <ImageBackground
  source={profilePicture && profilePicture !== 'default' ? { uri: profilePicture } : require('@/assets/images/profileDef.jpg')}
  style={styles.profileImage}
  imageStyle={{ borderRadius: 50 }}
>


               <View style={styles.cameraIconContainer}>
                <Image source={icons.camera} style={styles.cameraIcon} />
              </View>
        </ImageBackground>
        </TouchableOpacity>
        </View>

         {/* Modal for Dimming Effect */}
      {isModalVisible && (
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="none" // No animation for the entire modal
          onRequestClose={closeModal}
        >
          {/* Dimming Overlay */}
          <TouchableOpacity style={styles.modalOverlay}  activeOpacity={1}  onPress={closeModal} />

          {/* Animated Bottom Content */}
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity style={[styles.modalButton, styles.uploadButton]} onPress={handleSelectImage}>
              <Text style={styles.modalButtonText}>Upload from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton]}
              onPress={handleDeleteProfilePicture}
            >
              <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
                Delete Profile Picture
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}




        {/* User Details Title */}
        <Text style={styles.titleText}>User Details</Text>

        {/* Gender Field */}
        
        <FormField
          placeholder="Gender(F/M/Non)"
          value={form.gender}
          handleChangeText={(e) => setForm({ ...form, gender: e })}
          otherStyles={styles.formField}
          keyboardType="default"
          icon={<Ionicons name="person-outline" size={24} color="#6b88c4" />}
        />

        {/* Date of Birth Field */}
        {showPicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={date}
            onChange={onChange}
            style={styles.datePicker}
            textColor='black'
          />
        )}

        {showPicker && Platform.OS === 'ios' && (
          <View style={styles.iosButtonContainer}>
            <TouchableOpacity
              onPress={toggleDatepicker}
            >
              <Text style={styles.iosButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={confirmIOSDate}
            >
              <Text style={styles.iosButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        {!showPicker && (
            <FormField
              placeholder="Date of Birth (DD/MM/YYYY)"
              value={form.dateOfBirth}
              handleChangeText={(e) => setForm({ ...form, dateOfBirth: e })}
              otherStyles={styles.formField}
              editable={false}
              icon={<Ionicons name="calendar-outline" size={24} color="#6b88c4" />}
              onPress={toggleDatepicker}
            />
        )}

        {/* Nationality Field */}
        {/* <FormField
          placeholder="Country"
          value={form.nationality}
          handleChangeText={(e) => setForm({ ...form, nationality: e })}
          otherStyles={styles.formField}
          icon={<Ionicons name="earth-outline" size={24} color="#6b88c4" />}
        /> */}
        {/* Nationality Field */}
<View style={styles.countryPickerContainer}>
  <Text style={styles.label}>Country</Text>
  <CountryPicker
    withFilter
    withFlag
    withCountryNameButton
    countryCode={countryCode}
    onSelect={handleSelectCountry}
    theme={{
      fontFamily: 'Montserrat-Regular',
      fontSize: 16,
    }}
    containerButtonStyle={styles.countryPickerButton}
  />
  {/* {form.nationality.name && (
    <Text style={styles.selectedCountryText}>{form.nationality.name}</Text>
  )} */}
</View>

 {/* Interests */}
 <Text style={styles.label}>Interests</Text>
        <View style={styles.interestsContainer}>
          {interests.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestButton,
                selectedInterests.includes(interest) && styles.interestButtonSelected,
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text
                style={[
                  styles.interestButtonText,
                  selectedInterests.includes(interest) && styles.interestButtonTextSelected,
                ]}
              >
                {interest}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        
        {/* Submit Button */}
        <CustomButton
          title="Submit"
          handlePress={handleSubmit}
          containerStyles="mt-7"
        />



      </ScrollView>
    </SafeAreaView>
  );
};

export default UserDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  countryPickerContainer: {
    width: '100%',
    marginBottom: 15,
    
  },
  countryPickerButton: {
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
  selectedCountryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
    fontFamily: 'Montserrat-Regular',
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoContainer: {
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 35,
  },
  logo: {
    width: 300,
    height: 300,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: -15,
    marginBottom: 1,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  formField: {
    width: '100%',
    marginBottom: 5,
    fontFamily: 'Montserrat-Bold',
  },
  datePicker: {
    height: 120,
    marginTop: -10,
    color:'black'
  },
  iosButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginVertical: 10,
   
  },
  iosButtonText: {
    color: '#6b88c4',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 20
  },
  profileImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 50,
  },
  cameraIcon: {
    width: 20,
    height: 20,
    tintColor: '#6b88c4', // Change icon color as needed
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  interestButton: {
    backgroundColor: '#e6e6e6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  interestButtonSelected: {
    backgroundColor: '#94a9d4',
  },
  interestButtonText: {
    color: '#555',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
  },
  interestButtonTextSelected: {
    color: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
    fontFamily: 'Montserrat-Bold',
  
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20, // Added bottom left border radius
    borderBottomRightRadius: 20, // Added bottom right border radius
    padding: 16,
    position: 'absolute',
    bottom: 0,
    width: '97%', // Adjust the width to leave space from left and right margins
    alignSelf: 'center', // Ensure it's centered horizontally
    marginBottom: 5,
  },
  modalButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: 'transparent', 
    borderBottomWidth: 0, 
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Montserrat-Regular'
  },
  deleteButtonText: {
    color: '#6b88c4', // Light color for delete button text
  },
  uploadButton: {
    backgroundColor: '#6a87c3', // Blue color for the "Upload from Gallery" button
    borderRadius: 12, // Ensuring rounded corners
  },
});
