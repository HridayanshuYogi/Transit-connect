import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// Sleek Dark Map Style
const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [busNumber, setBusNumber] = useState("");
  const [activeBus, setActiveBus] = useState(null);
  const mapRef = useRef(null);

  const stops = [
    { id: 1, name: "Sohna Terminal", latitude: 28.24, longitude: 77.06 },
    { id: 2, name: "Sector 48 Stop", latitude: 28.41, longitude: 77.04 },
    { id: 3, name: "Iffco Chowk", latitude: 28.47, longitude: 77.07 },
  ];

  useEffect(() => { getLocation(); }, []);

  // Simulated Bus Logic
  useEffect(() => {
    if (!userLocation || !activeBus) return;
    const interval = setInterval(() => {
      setBusLocation((prev) => {
        const startLat = prev ? prev.latitude : userLocation.latitude + 0.02;
        const startLng = prev ? prev.longitude : userLocation.longitude + 0.02;
        return { latitude: startLat - 0.0004, longitude: startLng - 0.0004 };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [userLocation, activeBus]);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Permission Denied");
    let loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
  };

  const calculateDistance = () => {
    if (!busLocation || !userLocation) return "0.0";
    const d = Math.sqrt(Math.pow(userLocation.latitude - busLocation.latitude, 2) + Math.pow(userLocation.longitude - busLocation.longitude, 2)) * 111;
    return d.toFixed(1);
  };

  return (
    <View style={styles.container}>
      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="bus" size={20} color="#1E88FF" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Search Bus Number (e.g. 24B)"
            placeholderTextColor="#888"
            style={styles.input}
            value={busNumber}
            onChangeText={setBusNumber}
          />
          <TouchableOpacity onPress={() => { setActiveBus(busNumber); Alert.alert("Live Tracking Started"); }}>
            <Ionicons name="search-circle" size={35} color="#1E88FF" />
          </TouchableOpacity>
        </View>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        style={styles.map}
        initialRegion={{
          latitude: 28.4595,
          longitude: 77.0266,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="You">
            <View style={styles.userMarkerOuter}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {busLocation && (
          <>
            <Marker coordinate={busLocation} flat rotation={45}>
              <View style={styles.busMarker}>
                <Ionicons name="bus" size={24} color="#fff" />
              </View>
            </Marker>
            <Polyline
              coordinates={[userLocation, busLocation]}
              strokeColor="#1E88FF"
              strokeWidth={3}
              lineDashPattern={[5, 5]}
            />
          </>
        )}

        {stops.map(stop => (
          <Marker key={stop.id} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}>
            <Ionicons name="location" size={22} color="#A855F7" />
          </Marker>
        ))}
      </MapView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => mapRef.current?.animateToRegion({ ...userLocation, latitudeDelta: 0.02, longitudeDelta: 0.02 })}>
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom Info Sheet */}
      {activeBus && (
        <View style={styles.bottomSheet}>
          <LinearGradient colors={["#111C2F", "#050B1A"]} style={styles.sheetGradient}>
            <View style={styles.dragHandle} />
            
            <View style={styles.row}>
              <View>
                <Text style={styles.busTitle}>Bus No: {activeBus}</Text>
                <Text style={styles.busStatus}>Express Line • On Time</Text>
              </View>
              <View style={styles.etaBox}>
                <Text style={styles.etaText}>{(calculateDistance() * 2.5).toFixed(0)} min</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="navigate-outline" size={18} color="#1E88FF" />
                <Text style={styles.statLabel}>{calculateDistance()} km away</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={18} color="#10B981" />
                <Text style={styles.statLabel}>65% Full</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={() => mapRef.current?.animateToRegion({ ...busLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
              <Text style={styles.actionButtonText}>Focus on Bus</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050B1A" },
  map: { width: width, height: height },
  
  // Search Bar
  searchContainer: { position: 'absolute', top: 50, width: '100%', paddingHorizontal: 20, zIndex: 5 },
  searchBar: { 
    backgroundColor: '#111C2F', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 55, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1E293B',
    elevation: 10
  },
  input: { flex: 1, color: '#fff', fontSize: 16 },

  // Markers
  userMarkerOuter: { width: 30, height: 30, backgroundColor: 'rgba(30, 136, 255, 0.3)', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  userMarkerInner: { width: 12, height: 12, backgroundColor: '#1E88FF', borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  busMarker: { backgroundColor: '#1E88FF', padding: 8, borderRadius: 10, borderWidth: 2, borderColor: '#fff' },

  // Floating Buttons
  fabContainer: { position: 'absolute', right: 20, bottom: height * 0.35 },
  fab: { backgroundColor: '#1E88FF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },

  // Bottom Sheet
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
  sheetGradient: { padding: 20, paddingTop: 10 },
  dragHandle: { width: 40, height: 5, backgroundColor: '#2A3547', borderRadius: 3, alignSelf: 'center', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  busTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  busStatus: { color: '#10B981', fontSize: 14 },
  etaBox: { backgroundColor: '#1E88FF', padding: 10, borderRadius: 12 },
  etaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  statsRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statLabel: { color: '#aaa', fontSize: 13 },

  actionButton: { backgroundColor: '#1E293B', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2A3547' },
  actionButtonText: { color: '#fff', fontWeight: 'bold' }
});