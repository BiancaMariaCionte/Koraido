import os
import csv
import sys
import re

from surprise import Dataset
from surprise import Reader
from collections import defaultdict
import numpy as np
import csv
import os
import pandas as pd

class MovieLens:

    movieID_to_name = {}
    name_to_movieID = {}
    ratingsPath = 'ml-latest-small/ratings.csv' 
    moviesPath = 'ml-latest-small/movies.csv'  
    userInfoPath = 'ml-latest-small/user_info.xlsx'
    
    def loadMovieLensLatestSmall(self):

        # Look for files relative to the directory we are running from
        os.chdir(os.path.dirname(sys.argv[0]))

        self.movieID_to_name = {}
        self.name_to_movieID = {}

        reader = Reader(line_format='user item rating timestamp', sep=',', skip_lines=1)

        ratingsDataset = Dataset.load_from_file(self.ratingsPath, reader=reader)

        with open(self.moviesPath, newline='', encoding='ISO-8859-1') as csvfile:
            movieReader = csv.reader(csvfile)
            next(movieReader)  # Skip header line
            for row in movieReader:
                movieID = row[0]  # Keep it as a string
                movieName = row[1]
                self.movieID_to_name[movieID] = movieName
                self.name_to_movieID[movieName] = movieID

        return ratingsDataset

    def getUserRatings(self, user):
        userRatings = []
        hitUser = False
        with open(self.ratingsPath, newline='') as csvfile:
            ratingReader = csv.reader(csvfile)
            next(ratingReader)
            for row in ratingReader:
                userID = int(row[0])  # User ID stays as an integer
                if user == userID:
                    movieID = row[1]  # Keep as string
                    rating = float(row[2])
                    userRatings.append((movieID, rating))
                    hitUser = True
                if hitUser and user != userID:
                    break

        return userRatings

# count how many times each movie was rated
    # def getPopularityRanks(self):
    #     ratings = defaultdict(int)
    #     rankings = defaultdict(int)
    #     with open(self.ratingsPath, newline='') as csvfile:
    #         ratingReader = csv.reader(csvfile)
    #         next(ratingReader)
    #         for row in ratingReader:
    #             movieID = row[1]  # Keep as string
    #             ratings[movieID] += 1
    #     rank = 1
    #     for movieID, ratingCount in sorted(ratings.items(), key=lambda x: x[1], reverse=True):
    #         rankings[movieID] = rank
    #         rank += 1
    #     return rankings
    
  
    
    def getMovieRatings(self):
       ratings = {}
       with open(self.moviesPath, newline='', encoding='ISO-8859-1') as csvfile:
           movieReader = csv.reader(csvfile)
           next(movieReader)
           for row in movieReader:
               movieID = row[0]
               rating = float(row[3])  # Assuming rating is in the 4th column
               ratings[movieID] = rating
       return ratings
   
  
    
    def getGenres(self):
        genres = defaultdict(list)
        self.genreIDs = {}  # Store genre IDs globally
        maxGenreID = 0

        with open(self.moviesPath, newline='', encoding='ISO-8859-1') as csvfile:
            movieReader = csv.reader(csvfile)
            next(movieReader)  # Skip header line
            for row in movieReader:
                movieID = row[0]  # Keep as string
                genreList = row[2].split('|')  # Assuming genres are in the 3rd column
                genreIDList = []
                for genre in genreList:
                    if genre in self.genreIDs:
                        genreID = self.genreIDs[genre]
                    else:
                        genreID = maxGenreID
                        self.genreIDs[genre] = genreID
                        maxGenreID += 1
                    genreIDList.append(genreID)
                genres[movieID] = genreIDList
        return genres
    
    
    def loadUserInterests(self):
        """Ensure user interests match genre IDs by using the same dictionary."""
        user_interests = defaultdict(list)

        # Ensure genres are already processed
        if not hasattr(self, 'genreIDs'):
            self.getGenres()  # Generate genre ID mappings if not already loaded

        df = pd.read_excel(self.userInfoPath)

        for _, row in df.iterrows():
            userID = int(row['userId'])
            interestList = row['interests'].split('|') if pd.notna(row['interests']) else []
            interestIDList = []
        
            for interest in interestList:
                if interest in self.genreIDs:  # Ensure consistency
                    interestIDList.append(self.genreIDs[interest])  # Use genre ID mapping

            user_interests[userID] = interestIDList  # Assign matched genre IDs to user interests
        
        
        return user_interests
    
    def getMovieName(self, movieID):
        return self.movieID_to_name.get(movieID, "")
        
    def getMovieID(self, movieName):
        return self.name_to_movieID.get(movieName, "")