import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [modalType, setModalType] = useState(null);

  // 🔥 Simulated Data
  const livePassengers = 34;
  const busCapacity = 50;
  const standAvgPassengers = 18;

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLoadingLocation(false);
    } catch (error) {
      setLoadingLocation(false);
    }
  };

  const loadPercent = Math.floor(
    (livePassengers / busCapacity) * 100
  );

  const calculateFare = (km) => {
    const baseFare = 20;
    return baseFare + km * 5;
  };

  const nextBusTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <LinearGradient
      colors={["#050B1A", "#000814"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>SmartBusTracker 🚍</Text>
        <Text style={styles.subtitle}>
          Book and Track Your Bus Easily
        </Text>

        {/* MAP */}
        <View style={styles.mapContainer}>
          {loadingLocation ? (
            <ActivityIndicator size="large" color="#1E88FF" />
          ) : location ? (
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              showsUserLocation
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={location} title="You" />
            </MapView>
          ) : (
            <Text style={{ color: "#aaa" }}>
              Location permission denied
            </Text>
          )}
        </View>

        {/* TODAY CARD */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Stand Avg Passengers</Text>
          <Text style={styles.statsValue}>
            {standAvgPassengers} People
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <FeatureCard
            icon="people-outline"
            title="Live Load"
            onPress={() => setModalType("load")}
          />

          <FeatureCard
            icon="create-outline"
            title="Modify Ticket"
            onPress={() => router.push("/(tabs)/tickets")}
          />

          <FeatureCard
            icon="wallet-outline"
            title="Auto Fare"
            onPress={() => setModalType("fare")}
          />

          <FeatureCard
            icon="time-outline"
            title="Missed Bus"
            onPress={() => setModalType("missed")}
          />
        </View>
      </ScrollView>

      {/* 🔥 MODAL SYSTEM */}
      <Modal visible={modalType !== null} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>

            {modalType === "load" && (
              <>
                <Text style={styles.modalTitle}>Live Bus Load</Text>
                <Text style={styles.modalText}>
                  Passengers: {livePassengers}/{busCapacity}
                </Text>
                <Text style={styles.modalText}>
                  Load: {loadPercent}%
                </Text>
              </>
            )}

            {modalType === "fare" && (
              <>
                <Text style={styles.modalTitle}>Auto Fare</Text>
                <Text style={styles.modalText}>
                  5 KM = ₹{calculateFare(5)}
                </Text>
                <Text style={styles.modalText}>
                  10 KM = ₹{calculateFare(10)}
                </Text>
              </>
            )}

            {modalType === "missed" && (
              <>
                <Text style={styles.modalTitle}>Next Bus</Text>
                <Text style={styles.modalText}>
                  Next bus at {nextBusTime()}
                </Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalType(null)}
            >
              <Text style={{ color: "#fff" }}>Close</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

function FeatureCard({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#1E88FF" />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  mapContainer: {
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#111C2F",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88FF",
  },
  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 6,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },
  statsTitle: {
    color: "#888",
    fontSize: 14,
  },
  statsValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#111C2F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
  },
  cardText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 15,
    width: "80%",
  },
  modalTitle: {
    color: "#1E88FF",
    fontSize: 18,
    marginBottom: 10,
  },
  modalText: {
    color: "#fff",
    marginBottom: 5,
  },
  closeBtn: {
    marginTop: 15,
    backgroundColor: "#1E88FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});