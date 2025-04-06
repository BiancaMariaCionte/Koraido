import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from './CustomButton'; // Import your CustomButton component

const ReviewForm = ({ onSubmitReview }) => {
  const [foodRating, setFoodRating] = useState(0);
  const [atmosphereRating, setAtmosphereRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedMoods, setSelectedMoods] = useState([]);

  const moods = ['Cozy', 'Romantic', 'Family-Friendly', 'Modern', 'Rustic', 'Lively', 'Chill', 'Elegant','Adventurous','Artsy'];

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter((item) => item !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const calculateOverallRating = () => ((foodRating + atmosphereRating) / 2).toFixed(1);

  const handleSubmit = () => {
    const overallRating = calculateOverallRating();
    onSubmitReview({
      foodRating,
      atmosphereRating,
      reviewText,
      selectedMoods,
      overallRating: parseFloat(overallRating),
      timestamp: new Date(),
    });
    // Reset the form
    setFoodRating(0);
    setAtmosphereRating(0);
    setReviewText('');
    setSelectedMoods([]);
  };

  return (
    <View style={styles.formContainer}>
      {/* Rating Rows */}
      <View style={styles.ratingRow}>
        <Text style={styles.label}>Food:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setFoodRating(star)}>
              <Ionicons
                name={star <= foodRating ? 'star' : 'star-outline'}
                size={24}
                color="#6a87c3"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingRow}>
        <Text style={styles.label}>Atmosphere:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setAtmosphereRating(star)}>
              <Ionicons
                name={star <= atmosphereRating ? 'star' : 'star-outline'}
                size={24}
                color="#6a87c3"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Review Input */}
      <TextInput
        style={styles.input}
        placeholder="Write your review here..."
        placeholderTextColor="#7893c9"
        multiline
        value={reviewText}
        onChangeText={setReviewText}
      />

      {/* Mood Selection */}
      <Text style={styles.label}>Mood or Vibe:</Text>
      <View style={styles.moodsContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              selectedMoods.includes(mood) ? styles.moodButtonSelected : null,
            ]}
            onPress={() => toggleMood(mood)}
          >
            <Text
              style={[
                styles.moodButtonText,
                selectedMoods.includes(mood) ? styles.moodButtonTextSelected : null,
              ]}
            >
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     {/* Submit Button */}
     <CustomButton
        title="Submit Review"
        handlePress={handleSubmit}
        containerStyles="mt-5 w-full"
        isLoading={false}
        disabled={!reviewText.trim() || foodRating === 0 || atmosphereRating === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    marginRight: 10,
    fontFamily: 'Montserrat-Bold'
  },
  starsContainer: {
    flexDirection: 'row',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular'
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
  },
  moodButtonSelected: {
    backgroundColor: '#94a9d4',
  },
  moodButtonText: {
    color: '#555',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular'
  },
  moodButtonTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReviewForm;