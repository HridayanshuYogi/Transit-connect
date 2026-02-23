import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function DriverScreen() {
  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <Text style={styles.title}>Driver Panel 🚍</Text>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Update Bus Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>View Assigned Bus</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Passenger Load Status</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Report Issue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  title: {
    fontSize: 26,
    color: "#1E88FF",
    fontWeight: "bold",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
  },
});