import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AboutScreen() {
  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>About SmartBusTracker 🚍</Text>

        <Text style={styles.text}>
          SmartBusTracker is a real-time bus tracking and ticket booking
          application designed to make daily travel simple and smart.
        </Text>

        <Text style={styles.text}>
          Features include:
        </Text>

        <Text style={styles.list}>• Live Bus Tracking</Text>
        <Text style={styles.list}>• Seat Booking</Text>
        <Text style={styles.list}>• ETA Calculation</Text>
        <Text style={styles.list}>• Driver & Conductor Panels</Text>
        <Text style={styles.list}>• Profile Management</Text>

        <Text style={styles.footer}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88FF",
    marginBottom: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
  },
  list: {
    color: "#2ecc71",
    fontSize: 15,
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    color: "#888",
    textAlign: "center",
  },
});