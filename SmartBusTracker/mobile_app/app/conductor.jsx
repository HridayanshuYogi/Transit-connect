import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
// BarCodeScanner will be imported dynamically when needed to avoid native module loading issues
// import { BarCodeScanner } from "expo-barcode-scanner";

export default function ConductorScreen() {
  return (
    
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <Text style={styles.title}>Conductor Panel 🎫</Text>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Scan Ticket QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Check Seat Availability</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>View Passenger List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardText}>Report Complaint</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const handleBarCodeScanned = ({ data }) => {
  const ticket = JSON.parse(data);

  // fetch(`http://10.0.2.2:5002/api/tickets/verify/${ticket.ticketId}`)
  fetch(`http://10.0.2.2:5002/api/tickets/verify/${ticket.ticketId}`)
    .then(res => res.json())
    .then(result => {
      if (result.valid) {
        Alert.alert("Valid Ticket ✅");
      } else {
        Alert.alert("Invalid Ticket ❌");
      }
    });
};

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