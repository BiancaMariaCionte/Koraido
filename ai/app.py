# from flask import Flask, request, jsonify
# from flask_cors import CORS 
# import heapq
# from collections import defaultdict
# from operator import itemgetter
# import pandas as pd
# import numpy as np
# from surprise import Dataset, Reader, KNNBasic
# import csv


# app = Flask(__name__)
# #CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}}) 
# # Load Dataset and Train Models
# class MovieLens:
#     def __init__(self):
#         movieID_to_name = {}
#         self.name_to_movieID = {}
#         self.ratingsPath = 'ml-latest-small/ratings.csv'  
#         self.moviesPath = 'ml-latest-small/movies.csv'  

#     def loadMovieLensLatestSmall(self):
#         reader = Reader(line_format='user item rating timestamp', sep=',', skip_lines=1)
#         ratingsDataset = Dataset.load_from_file(self.ratingsPath, reader=reader)

#         with open(self.moviesPath, newline='', encoding='ISO-8859-1') as csvfile:
#             movieReader = csv.reader(csvfile)
#             next(movieReader)  # Skip header line
#             for row in movieReader:
#                 movieID = row[0]  
#                 movieName = row[1]
#                 self.movieID_to_name[movieID] = movieName
#                 self.name_to_movieID[movieName] = movieID

#         return ratingsDataset

#     def getMovieName(self, movieID):
#         return self.movieID_to_name.get(movieID, "")

# ml = MovieLens()
# data = ml.loadMovieLensLatestSmall()
# trainSet = data.build_full_trainset()

# # Train User-Based KNN Model
# sim_options_user = {'name': 'cosine', 'user_based': True}
# userKNN = KNNBasic(sim_options=sim_options_user)
# userKNN.fit(trainSet)
# user_sims = userKNN.compute_similarities()

# # Train Item-Based KNN Model
# sim_options_item = {'name': 'pearson', 'user_based': False}
# itemKNN = KNNBasic(sim_options=sim_options_item)
# itemKNN.fit(trainSet)
# item_sims = itemKNN.compute_similarities()

# # Map App User IDs to Dataset User IDs
# user_mapping = {
#     "logged_in_user_1": "1013",  # Example mapping
#     "logged_in_user_2": "1022"
# }

# def get_recommendations_for_user(user_id):
#     dataset_user_id = user_mapping.get(user_id, "1013")  # Default if not mapped
#     testUserInnerID = trainSet.to_inner_uid(dataset_user_id)

#     k = 10
#     similarityRow = user_sims[testUserInnerID]
#     similarUsers = [(innerID, score) for innerID, score in enumerate(similarityRow) if innerID != testUserInnerID]
#     kNeighbors = heapq.nlargest(k, similarUsers, key=lambda t: t[1])

#     candidates = defaultdict(float)
#     for similarUser in kNeighbors:
#         innerID = similarUser[0]
#         userSimilarityScore = similarUser[1]
#         theirRatings = trainSet.ur[innerID]
#         for rating in theirRatings:
#             candidates[rating[0]] += (rating[1] / 5.0) * userSimilarityScore

#     watched = {itemID: 1 for itemID, _ in trainSet.ur[testUserInnerID]}
#     recommendations = []

#     for itemID, ratingSum in sorted(candidates.items(), key=itemgetter(1), reverse=True):
#         if itemID not in watched:
#             movieID = trainSet.to_raw_iid(itemID)
#             recommendations.append({
#                 "id": movieID,
#                 "name": ml.getMovieName(movieID),
#                 "score": round(ratingSum, 3)
#             })
#         if len(recommendations) >= 10:
#             break

#     return recommendations

# @app.route('/recommendations', methods=['GET'])
# def recommend():
#     #user_id = request.args.get('user_id')#modified
#     user_id = request.args.get('user_id','1013')#modified
#     if not user_id:
#         return jsonify({"error": "User ID is required"}), 400

#     recommendations = get_recommendations_for_user(user_id)
#     return jsonify({"recommendations": recommendations})

# if __name__ == '__main__':
#      app.run(debug=True, host='0.0.0.0', port=5000)


from flask import Flask, request, jsonify
from flask_cors import CORS
import heapq
from collections import defaultdict
from operator import itemgetter
import pandas as pd
import numpy as np
from surprise import Dataset, Reader, KNNBasic
import csv
from ContentKNNAlgorithm import ContentKNNAlgorithm
from Evaluator import Evaluator

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Load Dataset and Train Models
class MovieLens:
    def __init__(self):
        self.movieID_to_name = {}
        self.name_to_movieID = {}
        self.ratingsPath = 'ml-latest-small/ratings.csv'
        self.moviesPath = 'ml-latest-small/movies.csv'

    def loadMovieLensLatestSmall(self):
        reader = Reader(line_format='user item rating timestamp', sep=',', skip_lines=1)
        ratingsDataset = Dataset.load_from_file(self.ratingsPath, reader=reader)

        with open(self.moviesPath, newline='', encoding='ISO-8859-1') as csvfile:
            movieReader = csv.reader(csvfile)
            next(movieReader)  # Skip header line
            for row in movieReader:
                movieID = row[0]
                movieName = row[1]
                self.movieID_to_name[movieID] = movieName
                self.name_to_movieID[movieName] = movieID

        return ratingsDataset

    def getMovieName(self, movieID):
        return self.movieID_to_name.get(movieID, "")

ml = MovieLens()
data = ml.loadMovieLensLatestSmall()
trainSet = data.build_full_trainset()

# Train User-Based KNN Model
sim_options_user = {'name': 'cosine', 'user_based': True}
userKNN = KNNBasic(sim_options=sim_options_user)
userKNN.fit(trainSet)
user_sims = userKNN.compute_similarities()

# Train Item-Based KNN Model
sim_options_item = {'name': 'pearson', 'user_based': False}
itemKNN = KNNBasic(sim_options=sim_options_item)
itemKNN.fit(trainSet)
item_sims = itemKNN.compute_similarities()



# Train Content-Based KNN Model
contentKNN = ContentKNNAlgorithm()
contentKNN.fit(trainSet)



def get_user_based_recommendations(testUserInnerID):
    """Get User-Based Recommendations"""
    k = 10
    similarityRow = user_sims[testUserInnerID]
    similarUsers = [(innerID, score) for innerID, score in enumerate(similarityRow) if innerID != testUserInnerID]
    kNeighbors = heapq.nlargest(k, similarUsers, key=lambda t: t[1])

    candidates = defaultdict(float)
    for similarUser in kNeighbors:
        innerID = similarUser[0]
        userSimilarityScore = similarUser[1]
        theirRatings = trainSet.ur[innerID]
        for rating in theirRatings:
            candidates[rating[0]] += (rating[1] / 5.0) * userSimilarityScore

    watched = {itemID: 1 for itemID, _ in trainSet.ur[testUserInnerID]}
    recommendations = []

    for itemID, ratingSum in sorted(candidates.items(), key=itemgetter(1), reverse=True):
        if itemID not in watched:
            movieID = trainSet.to_raw_iid(itemID)
            recommendations.append({
                "id": movieID,
                "name": ml.getMovieName(movieID),
                "score": round(ratingSum, 3)
            })
        if len(recommendations) >= 10:
            break

    return recommendations

def get_item_based_recommendations(testUserInnerID):
    """Get Item-Based Recommendations"""
    k = 10
    testUserRatings = trainSet.ur[testUserInnerID]
    kNeighbors = heapq.nlargest(k, testUserRatings, key=lambda t: t[1])

    candidates = defaultdict(float)
    for itemID, rating in kNeighbors:
        similarityRow = item_sims[itemID]
        for innerID, score in enumerate(similarityRow):
            candidates[innerID] += score * (rating / 5.0)

    watched = {itemID: 1 for itemID, _ in trainSet.ur[testUserInnerID]}
    recommendations = []

    for itemID, ratingSum in sorted(candidates.items(), key=itemgetter(1), reverse=True):
        if itemID not in watched:
            movieID = trainSet.to_raw_iid(itemID)
            recommendations.append({
                "id": movieID,
                "name": ml.getMovieName(movieID),
                "score": round(ratingSum, 3)
            })
        if len(recommendations) >= 10:
            break

    return recommendations


def get_content_based_recommendations(testUserInnerID):
    """Get Content-Based Recommendations for a user."""
    k = 10  # Number of similar movies to consider
    testUserRatings = trainSet.ur[testUserInnerID]  # Get the user's ratings

    candidates = defaultdict(float)
    
    # Iterate over the movies the user has rated
    for itemID, rating in testUserRatings:
        similarityRow = contentKNN.similarities[itemID]

        # Compute weighted sum of similarity scores
        for innerID, score in enumerate(similarityRow):
            if score > 0:  # Only consider positive similarities
                candidates[innerID] += score * (rating / 5.0)

    # Filter out already watched movies
    watched = {itemID for itemID, _ in testUserRatings}
    recommendations = []

    for itemID, ratingSum in sorted(candidates.items(), key=itemgetter(1), reverse=True):
        if itemID not in watched:
            movieID = trainSet.to_raw_iid(itemID)
            name = ml.getMovieName(movieID)

            recommendations.append({
                "id": movieID,
                "name": name,
                "score": round(ratingSum, 3)
            })

        if len(recommendations) >= 10:
            break

    return recommendations
    



@app.route('/recommendations', methods=['GET'])
def recommend():
    user_id = request.args.get('user_id', '1013')  # Default to '1013' if no user_id provided
    print(f"🔍 Received user_id: {user_id}")  # Debugging line
    try:
        testUserInnerID = trainSet.to_inner_uid(user_id)
        print(f"✅ Mapped to inner user ID: {testUserInnerID}")  # Debugging line
    except ValueError:
        print(f"❌ Error: User ID {user_id} not found in dataset.")
        return jsonify({"error": "User ID not found"}), 404

    user_based_recs = get_user_based_recommendations(testUserInnerID)
    item_based_recs = get_item_based_recommendations(testUserInnerID)
    content_based_recs = get_content_based_recommendations(testUserInnerID)

     # 💡 Add this line
    ensemble_recs = ensemble_recommendations(user_based_recs, item_based_recs, content_based_recs)
    
    print(f"🎯 Generated recommendations for user {user_id}")  # Debugging line
    print(f"📌 User-Based: {len(user_based_recs)} | Item-Based: {len(item_based_recs)} | Content-Based: {len(content_based_recs)}")  # Debugging line
    print(f"🧠 Ensemble Recommendations: {[rec['name'] for rec in ensemble_recs]}")

    
    return jsonify({
        "user_based": user_based_recs,
        "item_based": item_based_recs,
        "content_based": content_based_recs,
        "ensemble": ensemble_recs  # ✅ Add this to response
    })

print("Sample Content Similarity Matrix:")
print(contentKNN.similarities[:5, :5])  # Print a small portion

def ensemble_recommendations(user_recs, item_recs, content_recs, weights=(0.5, 0.2, 0.3)):
    combined_scores = defaultdict(float)
    all_recs = [user_recs, item_recs, content_recs]
    
    for rec_list, weight in zip(all_recs, weights):
        for rec in rec_list:
            combined_scores[rec['id']] += weight * rec['score']

    # Sort and get top 10
    sorted_recs = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
    
    final_recommendations = []
    for movie_id, score in sorted_recs[:10]:
        final_recommendations.append({
            "id": movie_id,
            "name": ml.getMovieName(movie_id),
            "score": round(score, 3)
        })
    
    return final_recommendations


def print_content_based_recommendations(user_id):
    try:
        testUserInnerID = trainSet.to_inner_uid(user_id)
        recommendations = get_content_based_recommendations(testUserInnerID)
        
        if not recommendations:
            print(f"No recommendations found for user {user_id}.")
            return
        
        print(f"Top Content-Based Recommendations for User {user_id}:")
        for idx, rec in enumerate(recommendations, start=1):
            print(f"{idx}. {rec['name']} (Score: {rec['score']})")
    except ValueError:
        print(f"Error: User ID {user_id} not found in dataset.")

# Example usage
print_content_based_recommendations('1013')

if __name__ == '__main__':
     app.run(debug=True, host='0.0.0.0', port=5000)
