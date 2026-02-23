import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Alert, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const mapRef = useRef(null);

  // 🔥 NEW: Stops Data (Demo)
  const stops = [
    { id: 1, name: "Stop A", latitude: 28.6139, longitude: 77.2090 },
    { id: 2, name: "Stop B", latitude: 28.6239, longitude: 77.2190 },
    { id: 3, name: "Stop C", latitude: 28.6339, longitude: 77.2290 },
  ];

  useEffect(() => {
    getLocation();
  }, []);

  // Simulated Bus Movement (YOUR ORIGINAL LOGIC)
  useEffect(() => {
    if (!userLocation) return;

    const interval = setInterval(() => {
      setBusLocation((prev) => {
        if (!prev) {
          return {
            latitude: userLocation.latitude + 0.01,
            longitude: userLocation.longitude + 0.01,
          };
        }

        const newLocation = {
          latitude: prev.latitude + 0.0005,
          longitude: prev.longitude + 0.0005,
        };

        // 🔥 NEW: Auto move camera with bus
        mapRef.current?.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        return newLocation;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [userLocation]);

  const getLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission required", "Enable location permission");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc.coords);
    } catch (error) {
      Alert.alert("Error", "Unable to get location");
    }
  };

  if (!userLocation) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E88FF" />
      </View>
    );
  }

  const calculateDistance = () => {
    if (!busLocation) return 0;

    const dx = userLocation.latitude - busLocation.latitude;
    const dy = userLocation.longitude - busLocation.longitude;

    return (Math.sqrt(dx * dx + dy * dy) * 111).toFixed(2);
  };

  const eta = () => {
    const distance = calculateDistance();
    return ((distance / 40) * 60).toFixed(0);
  };

  // 🔥 NEW: Stop ETA + Status
  const getStopStatus = (stop) => {
    if (!busLocation) return "Upcoming";

    const dx = stop.latitude - busLocation.latitude;
    const dy = stop.longitude - busLocation.longitude;
    const distance = Math.sqrt(dx * dx + dy * dy) * 111;

    if (distance < 0.1) return "Arrived";
    if (distance < 0.5) return "Arriving";
    return "Upcoming";
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User Marker */}
        <Marker
          coordinate={userLocation}
          title="You"
          pinColor="blue"
        />

        {/* Bus Marker */}
        {busLocation && (
          <Marker
            coordinate={busLocation}
            title="Live Bus"
            description="Smart Express"
            pinColor="red"
          />
        )}

        {/* 🔥 NEW: Stop Markers */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.latitude,
              longitude: stop.longitude,
            }}
            title={stop.name}
            description={getStopStatus(stop)}
            pinColor={
              getStopStatus(stop) === "Arrived"
                ? "green"
                : getStopStatus(stop) === "Arriving"
                ? "orange"
                : "purple"
            }
          />
        ))}

        {/* Route Line */}
        {busLocation && (
          <Polyline
            coordinates={[userLocation, busLocation]}
            strokeWidth={4}
            strokeColor="#1E88FF"
          />
        )}
      </MapView>

      {/* Info Panel */}
      {busLocation && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Distance: {calculateDistance()} km
          </Text>
          <Text style={styles.infoText}>
            ETA: {eta()} mins
          </Text>
          <Text style={styles.infoText}>
            Status: On Time ✅
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#111C2F",
    padding: 15,
    borderRadius: 12,
  },
  infoText: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
});