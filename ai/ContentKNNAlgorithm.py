from surprise import AlgoBase
from surprise import PredictionImpossible
from MovieLens import MovieLens
import math
import numpy as np
import heapq
import pandas as pd


class ContentKNNAlgorithm(AlgoBase):
    
    def __init__(self, k=40, alpha=0.7, rating_threshold=2.0, interest_weight=0.3):
      
        AlgoBase.__init__(self)
        self.k = k
        self.alpha = alpha  # Weight for genre similarity (1 - alpha is weight for rating similarity)
        self.rating_threshold = rating_threshold  # Minimum acceptable rating
        self.interest_weight = interest_weight  # Weight for interest-based similarity

    def fit(self, trainset):
        AlgoBase.fit(self, trainset)
    
        # Load content data
        ml = MovieLens()
        genres = ml.getGenres()
        ratings = ml.getMovieRatings()
        user_interests = ml.loadUserInterests()
        
#        print("User Interests Loaded:")
      #  for user, interests in user_interests.items():
       #     print(f"User {user}: {interests}")
        
       # print("\n🎭 Movie Genres Loaded:")
       # for movie_id, genre_list in genres.items():
           # print(f"   🎬 Movie {movie_id}: {genre_list}")
        
        print("Computing content-based similarity matrix...")
        
        # Initialize similarity matrix
        self.similarities = np.zeros((self.trainset.n_items, self.trainset.n_items))
        
        for thisRating in range(self.trainset.n_items):
            if thisRating % 100 == 0:
                print(thisRating, "of", self.trainset.n_items)
            
            for otherRating in range(thisRating + 1, self.trainset.n_items):
                thisMovieID = self.trainset.to_raw_iid(thisRating)
                otherMovieID = self.trainset.to_raw_iid(otherRating)
    
                # Compute similarities
                genreSimilarity = self.computeGenreSimilarity(thisMovieID, otherMovieID, genres)
                ratingSimilarity = self.computeRatingSimilarity(thisMovieID, otherMovieID, ratings)
                
                # Weighted combination of similarities
                finalSimilarity = (self.alpha * genreSimilarity) + ((1 - self.alpha) * ratingSimilarity)
                
                # Apply rating threshold (ignore very low-rated movies)
                if ratings.get(thisMovieID, 0) >= self.rating_threshold and ratings.get(otherMovieID, 0) >= self.rating_threshold:
                    self.similarities[thisRating, otherRating] = finalSimilarity
                    self.similarities[otherRating, thisRating] = finalSimilarity
    
        #  Ensure self-similarity (diagonal) is 1
       # np.fill_diagonal(self.similarities, 1.0)
    
        print("...done.")
        self.exportSimilarityMatrix()

        return self


    def computeGenreSimilarity(self, movie1, movie2, genres):
        """Compute Jaccard similarity between movie genres."""
        genres1 = set(genres.get(movie1, []))
        genres2 = set(genres.get(movie2, []))

        if not genres1 or not genres2:
            return 0  # No similarity if a movie has no genre information

        intersection = len(genres1.intersection(genres2))
        union = len(genres1.union(genres2))

        return intersection / union  # Jaccard similarity score

    def computeRatingSimilarity(self, movie1, movie2, ratings):
        """Compute rating similarity using an exponential decay function."""
        avg_rating1 = ratings.get(movie1, 0)
        avg_rating2 = ratings.get(movie2, 0)

        ratingDiff = abs(avg_rating1 - avg_rating2)

        return math.exp(-ratingDiff / 2.0)  # Exponential decay to normalize
    
        
    
       

    def computeInterestSimilarity(self, user, movie, genres, user_interests):
        """Check if user's interests match movie genres."""
    
        try:
            raw_user_id = self.trainset.to_raw_uid(user)
        except ValueError:
            raw_user_id = user
            
        # print(f"Raw User ID: {raw_user_id}")
        raw_user_id = int(raw_user_id) 
    
        user_interest_list = user_interests.get(raw_user_id, [])  
        movie_genre_list = genres.get(movie, [])
    
        #print(f"Trainset Raw User ID: {raw_user_id}")
       # print(f"User Interests Keys: {list(user_interests.keys())}")

        #if raw_user_id not in user_interests:
            #print(f"🚨 User ID {raw_user_id} not found in user interests!")
            
        print(f"🛠 Checking Interest Similarity for User {raw_user_id}, Movie {movie}")
        print(f"   - User Interests (IDs): {user_interest_list}")
        print(f"   - Movie Genres (IDs): {movie_genre_list}")
    
        if not user_interest_list:
            # print(f"🚨 No interests found for User {raw_user_id}")
            return 0
    
        #primary_genre = movie_genre_list[0] if movie_genre_list else None
    
        #return self.interest_weight if primary_genre in user_interest_list else 0
        interest_similarity = self.interest_weight if any(genre in user_interest_list for genre in movie_genre_list) else 0
    
        # print(f"   - Interest Similarity: {interest_similarity:.4f}")
        return interest_similarity


    
    def estimate(self, u, i):
        """Estimate the rating for user u and item i using k nearest neighbors."""
        if not (self.trainset.knows_user(u) and self.trainset.knows_item(i)):
            raise PredictionImpossible('User and/or item is unknown.')

        # Load user interests
        ml = MovieLens()
        genres = ml.getGenres()
        user_interests = ml.loadUserInterests()
        
        user_interests = ml.loadUserInterests()
        #print("User Interests in estimate method:", user_interests)
        
        #print("\n✅ DEBUG: User Interests Loaded:", user_interests)  # ADD THIS
        #print(f"\n🔍 Estimating for User {u}, Movie {i} ({self.trainset.to_raw_iid(i)})")

        
        # Find k most similar movies that the user has rated
        neighbors = []
        for rating in self.trainset.ur[u]:
            
            rated_movie_innerID = rating[0]
            rated_movie_rawID = self.trainset.to_raw_iid(rated_movie_innerID)
            user_rating = rating[1]
       
            movie_similarity = self.similarities[i, rating[0]]
            interest_similarity = self.computeInterestSimilarity(u, self.trainset.to_raw_iid(i), genres, user_interests)
            total_similarity = movie_similarity + interest_similarity  # Combine similarity factors
           
            # Print details for debugging
            print(f"   🎥 Comparing to Rated Movie {rated_movie_rawID}:")
            print(f"      - 🎭 Genre/Rating Similarity: {movie_similarity:.4f}")
            print(f"      - 💡 Interest Similarity: {interest_similarity:.4f}")
            print(f"      - 🔢 Total Similarity: {total_similarity:.4f}")
            print(f"      - ⭐ User's Rating: {user_rating:.2f}\n")
           
            neighbors.append((total_similarity, rating[1]))

        # Get top-K similar ratings
        k_neighbors = heapq.nlargest(self.k, neighbors, key=lambda t: t[0])

        # Compute predicted rating as weighted sum of neighbors
        simTotal = weightedSum = 0
        for (simScore, rating) in k_neighbors:
            if simScore > 0:
                simTotal += simScore
                weightedSum += simScore * rating
        
        if simTotal == 0:
            raise PredictionImpossible('No similar neighbors found.')

        #predicted_rating = weightedSum / simTotal
        #print(f"✅ Final Predicted Rating for Movie {i}: {predicted_rating:.2f}\n")
        #print("=" * 50)  # Separator for readability
        return weightedSum / simTotal  # Final predicted rating
    
    def exportSimilarityMatrix(self):
       """Export similarity matrix to a CSV file with both movie IDs and names."""
       print("Exporting similarity matrix to CSV...")
   
       # Get movie IDs and names
       ml = MovieLens()
       movie_ids = [self.trainset.to_raw_iid(innerID) for innerID in range(self.trainset.n_items)]
       movie_names = [ml.getMovieName(movie_id) for movie_id in movie_ids]
   
       # Create row and column labels with "ID - Name" format
       movie_labels = [f"{movie_id} - {name}" for movie_id, name in zip(movie_ids, movie_names)]
   
       # Convert similarity matrix to DataFrame with labeled rows and columns
       df_item_sim = pd.DataFrame(self.similarities, index=movie_labels, columns=movie_labels)
   
   
       # Save to CSV
       df_item_sim.to_csv("item_similarity_matrix.csv", encoding="utf-8-sig")
       print("Item similarity matrix saved to 'item_similarity_matrix.csv'.")





    # def get_recommendations(self, user_id, ml, n=10):
    #     """
    #     Get top N content-based recommendations for a given user.
    #     """
    #     try:
    #         user_inner_id = self.trainset.to_inner_uid(user_id)
    #     except ValueError:
    #         print(f"User {user_id} not found in training data.")
    #         return []


    #     user_inner_id = self.trainset.to_inner_uid(user_id)
    #     watched_movies = set([self.trainset.to_raw_iid(item[0]) for item in self.trainset.ur[user_inner_id]])
        
    #     all_movie_ids = set(self.trainset.to_raw_iid(i) for i in range(self.trainset.n_items))
    #     candidate_movies = all_movie_ids - watched_movies  # Movies the user hasn't seen
        
    #     recommendations = []
    #     for movie in candidate_movies:
    #         movie_inner_id = self.trainset.to_inner_iid(movie)
    #         predicted_rating = self.estimate(user_inner_id, movie_inner_id)
    #         recommendations.append((predicted_rating, movie))

    #     # Get top N recommendations
    #     top_n_recommendations = heapq.nlargest(n, recommendations, key=lambda x: x[0])

    #     # Convert movie IDs to names
    #     recommended_movies = [(ml.getMovieName(movie_id), rating) for rating, movie_id in top_n_recommendations]

    #     return recommended_movies

