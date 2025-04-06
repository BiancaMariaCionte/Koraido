import { collection, doc, addDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const addReview = async (locationId, user, newReviewText, foodRating, atmosphereRating, selectedMoods) => {
  if (newReviewText.trim() === '') return;

  try {
    const reviewsRef = collection(db, 'locations', locationId, 'reviews');
    const locationRef = doc(db, 'locations', locationId);

    const review = {
      userId: user.userId,
      username: user.username,
      reviewText: newReviewText,
      foodRating,
      atmosphereRating,
      overallRating: (foodRating + atmosphereRating) / 2,
      selectedMoods,
      timestamp: new Date(),
      likes: 0,
      likedBy: [],
    };

    // Add the review
    await addDoc(reviewsRef, review);

    // Fetch all reviews to calculate the average rating
    const reviewsSnapshot = await getDocs(reviewsRef);
    const totalRatings = reviewsSnapshot.docs.reduce((acc, doc) => acc + doc.data().overallRating, 0);
    const averageRating = (totalRatings / reviewsSnapshot.size).toFixed(1);

    // Update location with the new average rating
    await updateDoc(locationRef, { rating: parseFloat(averageRating) });
  } catch (error) {
    console.error('Error adding review: ', error);
  }
};
