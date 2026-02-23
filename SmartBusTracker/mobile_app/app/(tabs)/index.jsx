import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#050B1A", "#000814"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== KEEPING YOUR ORIGINAL HEADER ===== */}
        <Text style={styles.title}>SmartBusTracker 🚍</Text>
        <Text style={styles.subtitle}>
          Book and Track Your Bus Easily
        </Text>

        {/* ===== KEEPING TODAY CARD ===== */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Travel</Text>
          <Text style={styles.statsValue}>0 Tickets</Text>
        </View>

        {/* ===== QUICK ACTIONS ===== */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          <FeatureCard
            icon="ticket-outline"
            title="Seat Availability"
            onPress={() => router.push("/(tabs)/book")}
          />

          <FeatureCard
            icon="people-outline"
            title="Live Load"
            onPress={() => alert("Live Passenger Load")}
          />

          <FeatureCard
            icon="flame-outline"
            title="Crowd Heatmap"
            onPress={() => alert("Crowd Heatmap")}
          />

          <FeatureCard
            icon="create-outline"
            title="Modify Ticket"
            onPress={() => router.push("/(tabs)/tickets")}
          />

          <FeatureCard
            icon="chatbox-ellipses-outline"
            title="Complaint"
            onPress={() => alert("Complaint & Feedback")}
          />

          <FeatureCard
            icon="wallet-outline"
            title="Auto Fare"
            onPress={() => alert("Fare Calculation")}
          />

          <FeatureCard
            icon="medkit-outline"
            title="Bus Health"
            onPress={() => alert("Health & Safety")}
          />

          <FeatureCard
            icon="time-outline"
            title="Missed Bus"
            onPress={() => alert("Last/Missed Bus")}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* ===== FEATURE CARD ===== */

function FeatureCard({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#1E88FF" />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );
}

/* ===== STYLES ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
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
});