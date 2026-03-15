// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";

// export default function DriverScreen() {
//   return (
//     <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
//       <Text style={styles.title}>Driver Panel 🚍</Text>

//       <TouchableOpacity style={styles.card}>
//         <Text style={styles.cardText}>Update Bus Location</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card}>
//         <Text style={styles.cardText}>View Assigned Bus</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card}>
//         <Text style={styles.cardText}>Passenger Load Status</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={styles.card}>
//         <Text style={styles.cardText}>Report Issue</Text>
//       </TouchableOpacity>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 25, paddingTop: 50 },
//   title: {
//     fontSize: 26,
//     color: "#1E88FF",
//     fontWeight: "bold",
//     marginBottom: 30,
//   },
//   card: {
//     backgroundColor: "#111C2F",
//     padding: 20,
//     borderRadius: 15,
//     marginBottom: 15,
//   },
//   cardText: {
//     color: "#fff",
//     fontSize: 16,
//   },
// });



import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";

import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

export default function DriverScreen() {

  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);

  const busName = "258"; // Example bus number


  // GET LOCATION PERMISSION
  const requestPermission = async () => {

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {

      Alert.alert("Permission denied");

      return false;

    }

    return true;

  };



  // START TRACKING
  const startTracking = async () => {

    const granted = await requestPermission();

    if (!granted) return;

    setTracking(true);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
      },

      async (loc) => {

        const { latitude, longitude, speed } = loc.coords;

        setLocation({
          latitude,
          longitude,
        });

        try {

          await fetch(
            "http://10.0.2.2:5002/api/location/update",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                busName,
                latitude,
                longitude,
                speed: speed || 40
              }),
            }
          );

        } catch (error) {

          console.log("Location update error:", error);

        }

      }
    );

  };



  const stopTracking = () => {

    setTracking(false);

    Alert.alert("Tracking Stopped");

  };



  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Driver Panel
      </Text>


      {location && (

        <MapView
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >

          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={`Bus ${busName}`}
            description="Live Location"
          />

        </MapView>

      )}



      <TouchableOpacity
        style={styles.startBtn}
        onPress={startTracking}
        disabled={tracking}
      >
        <Text style={styles.btnText}>
          Start Bus Tracking
        </Text>
      </TouchableOpacity>



      <TouchableOpacity
        style={styles.stopBtn}
        onPress={stopTracking}
      >
        <Text style={styles.btnText}>
          Stop Tracking
        </Text>
      </TouchableOpacity>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#050B1A",
    paddingTop: 50,
  },

  title: {
    color: "#1E88FF",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },

  map: {
    flex: 1,
  },

  startBtn: {
    backgroundColor: "#2ecc71",
    padding: 15,
    margin: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  stopBtn: {
    backgroundColor: "#e74c3c",
    padding: 15,
    margin: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

});