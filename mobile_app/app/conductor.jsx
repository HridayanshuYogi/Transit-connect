import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Modal, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function ConductorScreen() {
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // --- Feature 1: QR Verification ---
  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    setShowScanner(false);
    
    try {
      // Assuming QR data is a JSON string containing ticketId
      const ticketData = JSON.parse(data);
      const response = await fetch(`http://10.0.2.2:5002/api/tickets/verify/${ticketData.ticketId}`);
      const result = await response.json();

      if (result.valid) {
        Alert.alert("Verified ✅", `Passenger: ${result.passengerName}\nSeat: ${result.seatNumber}`);
      } else {
        Alert.alert("Invalid ❌", "This ticket is not valid or already used.");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid QR Code Format");
    }
    setScanned(false);
  };

  // --- Feature 2: Fetch Passenger List ---
  const fetchPassengers = async () => {
    setLoading(true);
    setShowPassengerList(true);
    try {
      // You can filter this by the specific bus assigned to the conductor
      const response = await fetch(`http://10.0.2.2:5002/api/tickets`); 
      const data = await response.json();
      setPassengers(data);
    } catch (error) {
      Alert.alert("Error", "Could not fetch passenger list");
    } finally {
      setLoading(false);
    }
  };

  // Permission UI
  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>We need camera permission to scan tickets</Text>
        <TouchableOpacity style={styles.card} onPress={requestPermission}>
          <Text style={styles.cardText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <Text style={styles.title}>Conductor Panel 🎫</Text>

      {/* Main Dashboard Buttons */}
      <TouchableOpacity style={styles.card} onPress={() => setShowScanner(true)}>
        <Text style={styles.cardText}>🔍 Scan Ticket QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={fetchPassengers}>
        <Text style={styles.cardText}>📋 View Passenger List</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => Alert.alert("Total Seats: 12", "Booked: " + passengers.length)}>
        <Text style={styles.cardText}>💺 Check Seat Availability</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => Alert.alert("Notice", "Complaint portal opening soon")}>
        <Text style={styles.cardText}>⚠️ Report Complaint</Text>
      </TouchableOpacity>

      {/* --- QR Scanner Modal --- */}
      <Modal visible={showScanner} animationType="slide">
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowScanner(false)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close Scanner</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </Modal>

      {/* --- Passenger List Modal --- */}
      <Modal visible={showPassengerList} animationType="fade" transparent={true}>
        <View style={styles.modalContent}>
          <LinearGradient colors={["#111C2F", "#050B1A"]} style={styles.listContainer}>
            <Text style={styles.modalTitle}>Current Passengers</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#1E88FF" />
            ) : (
              <FlatList
                data={passengers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <View style={styles.passengerItem}>
                    <Text style={styles.pTextName}>{item.busName} - Seat {item.seatNumber}</Text>
                    <Text style={styles.pTextSub}>{item.from} ➔ {item.to}</Text>
                  </View>
                )}
              />
            )}
            <TouchableOpacity style={styles.closeBtnList} onPress={() => setShowPassengerList(false)}>
              <Text style={{ color: "#fff" }}>Go Back</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 50 },
  title: { fontSize: 26, color: "#1E88FF", fontWeight: "bold", marginBottom: 30 },
  card: { backgroundColor: "#111C2F", padding: 20, borderRadius: 15, marginBottom: 15 },
  cardText: { color: "#fff", fontSize: 16 },
  
  // Scanner
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  closeBtn: { backgroundColor: "#FF4444", padding: 15, borderRadius: 10 },

  // Passenger List
  modalContent: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", padding: 20 },
  listContainer: { padding: 20, borderRadius: 20, flex: 0.8 },
  modalTitle: { color: "#1E88FF", fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  passengerItem: { borderBottomWidth: 1, borderBottomColor: "#2A3547", paddingVertical: 10 },
  pTextName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  pTextSub: { color: "#aaa", fontSize: 12 },
  closeBtnList: { marginTop: 20, backgroundColor: "#1E88FF", padding: 15, borderRadius: 10, alignItems: "center" },
});