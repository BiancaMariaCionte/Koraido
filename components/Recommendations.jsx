// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, ActivityIndicator } from 'react-native';
// import axios from 'axios';

// const Recommendations = () => {
//   const [recommendations, setRecommendations] = useState({ userBased: [], itemBased: [],  contentBased: [] });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRecommendations = async () => {
//       try {
//         const response = await axios.get(`http://192.168.0.198:5000/recommendations?user_id=1013`);
        
//         if (response.data.error) {
//           console.error("API Error:", response.data.error);
//           setRecommendations({ userBased: [], itemBased: [], contentBased: []  });
//           return;
//         }

//         setRecommendations({
//           userBased: response.data.user_based || [],
//           itemBased: response.data.item_based || [],
//           contentBased: response.data.content_based || []
//         });

//       } catch (error) {
//         console.error("Error fetching recommendations:", error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRecommendations();
//   }, []);

//   if (loading) {
//     return <ActivityIndicator size="large" color="#a2b4da" style={{ marginVertical: 20 }} />;
//   }

//   return (
//     <View style={{ marginVertical: 20, paddingHorizontal: 16 }}>
//       {/* User-Based Recommendations */}
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
//         User-Based Recommendations
//       </Text>
//       <FlatList
//         data={recommendations.userBased}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={{ padding: 10, backgroundColor: '#fff', marginVertical: 5, borderRadius: 10 }}>
//             <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
//             <Text style={{ fontSize: 14, color: 'gray' }}>AI Score: {item.score}</Text>
//           </View>
//         )}
//       />

//       {/* Item-Based Recommendations */}
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
//         Item-Based Recommendations
//       </Text>
//       <FlatList
//         data={recommendations.itemBased}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={{ padding: 10, backgroundColor: '#fff', marginVertical: 5, borderRadius: 10 }}>
//             <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
//             <Text style={{ fontSize: 14, color: 'gray' }}>AI Score: {item.score}</Text>
//           </View>
//         )}
//       />
//       {/* Content-Based Recommendations */}
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>
//         Content-Based Recommendations
//       </Text>
//       <FlatList
//         data={recommendations.contentBased}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={{ padding: 10, backgroundColor: '#fff', marginVertical: 5, borderRadius: 10 }}>
//             <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
//             <Text style={{ fontSize: 14, color: 'gray' }}>AI Score: {item.score}</Text>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default Recommendations;


import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`http://192.168.0.198:5000/recommendations?user_id=1013`);

        if (response.data.error) {
          console.error("❌ API Error:", response.data.error);
          setRecommendations([]);
          return;
        }

        // Only store the final ensemble recommendations
        setRecommendations(response.data.ensemble || []);
      } catch (error) {
        console.error("❌ Error fetching recommendations:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#a2b4da" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={{ marginVertical: 20, paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        Recommended for You
      </Text>

      {recommendations.length === 0 ? (
        <Text style={{ color: 'gray', fontSize: 16 }}>No recommendations found.</Text>
      ) : (
        <FlatList
          data={recommendations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 12, backgroundColor: '#fff', marginVertical: 6, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
              <Text style={{ fontSize: 14, color: 'gray' }}>AI Score: {item.score}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Recommendations;
