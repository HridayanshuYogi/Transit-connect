import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  FlatList, Modal, ActivityIndicator, ScrollView 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from 'react-native-qrcode-svg';

// --- CONFIGURATION ---
const STOPS = ["Sohna", "Badshahpur", "Subhash Chowk", "Rajiv Chowk", "IFFCO Chowk", "Gurgaon"];
const BASE_FARE = 10; 
const PRICE_PER_STOP = 10; 
const TOTAL_SEATS = 12;
const BACKEND_URL = "http://192.168.1.15:5002"; // ⚠️ REPLACE WITH YOUR LOCAL IP

export default function ConductorScreen() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showStopPicker, setShowStopPicker] = useState({ visible: false, type: "" });
  const [showPassengerList, setShowPassengerList] = useState(false);
  
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [source, setSource] = useState(STOPS[0]); 
  const [destination, setDestination] = useState(STOPS[1]);
  const [fare, setFare] = useState(20);

  const busDetails = { busId: "BUS_123_XYZ", busName: "SmartExpress 502" };

  // --- 1. FETCH PASSENGERS ON LOAD ---
  useEffect(() => {
    loadPassengerData();
  }, []);

  const loadPassengerData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets`);
      const data = await response.json();
      setPassengers(data);
    } catch (e) {
      console.log("Fetch Error:", e.message);
    }
  };

  // --- 2. FARE CALCULATION ---
  useEffect(() => {
    const start = STOPS.indexOf(source);
    const end = STOPS.indexOf(destination);
    if (start !== -1 && end !== -1 && end > start) {
      setFare(BASE_FARE + ((end - start) * PRICE_PER_STOP));
    } else {
      setFare(0);
    }
  }, [source, destination]);

  // --- 3. RANDOM SEAT ALLOCATION LOGIC ---
  const allocateRandomSeat = () => {
    const allSeats = Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1);
    const takenSeats = passengers.map(p => p.seatNumber);
    const availableSeats = allSeats.filter(seat => !takenSeats.includes(seat));

    if (availableSeats.length === 0) return null;

    // Pick a random index from available seats
    const randomIndex = Math.floor(Math.random() * availableSeats.length);
    return availableSeats[randomIndex];
  };

  // --- 4. OFFLINE BOOKING HANDLER ---
  const handleOfflineBooking = async () => {
    if (fare <= 0) {
      Alert.alert("Invalid Route", "Please select a valid destination.");
      return;
    }

    const assignedSeat = allocateRandomSeat();
    if (!assignedSeat) {
      Alert.alert("Bus Full", "No seats available.");
      return;
    }

    Alert.alert("Confirm Cash Booking", `Collect ₹${fare}\nAssigned Seat: ${assignedSeat}`, [
      { text: "Cancel" },
      { text: "Confirm", onPress: async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/tickets/offline`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                busId: busDetails.busId,
                from: source,
                to: destination,
                fare: fare,
                seatNumber: assignedSeat,
                paymentMethod: "cash",
                status: "booked"
              })
            });

            if (response.ok) {
              Alert.alert("Success ✅", `Ticket Booked! Seat: ${assignedSeat}`);
              loadPassengerData(); // Refresh list
            }
          } catch (e) {
            Alert.alert("Error", "Could not connect to server.");
          }
      }}
    ]);
  };

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Conductor Panel 🎫</Text>

        {/* TRIP CONFIGURATION */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>Route & Pricing</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.miniSelector} onPress={() => setShowStopPicker({ visible: true, type: "source" })}>
              <Text style={styles.selectorLabel}>FROM</Text>
              <Text style={styles.selectorValue}>{source}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.miniSelector} onPress={() => setShowStopPicker({ visible: true, type: "destination" })}>
              <Text style={styles.selectorLabel}>TO</Text>
              <Text style={styles.selectorValue}>{destination}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fareBox}>
            <Text style={styles.fareText}>Total: <Text style={styles.price}>₹{fare}</Text></Text>
          </View>

          <TouchableOpacity 
            style={[styles.mainBtn, styles.onlineBtn, { opacity: fare > 0 ? 1 : 0.5 }]} 
            onPress={() => fare > 0 && setShowQRModal(true)}
          >
            <Text style={styles.btnText}>📲 Show Payment QR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.mainBtn, styles.offlineBtn, { opacity: fare > 0 ? 1 : 0.5 }]} 
            onPress={handleOfflineBooking}
          >
            <Text style={styles.btnText}>💵 Cash Booking (Offline)</Text>
          </TouchableOpacity>
        </View>

        {/* MANAGEMENT BUTTONS */}
        <View style={styles.mgmtRow}>
            <TouchableOpacity style={styles.mgmtCard} onPress={() => { loadPassengerData(); setShowPassengerList(true); }}>
                <Text style={styles.mgmtTitle}>📋 Passengers</Text>
                <Text style={styles.mgmtSub}>{passengers.length} Booked</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mgmtCard} onPress={() => Alert.alert("Capacity", `Available: ${TOTAL_SEATS - passengers.length} / ${TOTAL_SEATS}`)}>
                <Text style={styles.mgmtTitle}>💺 Available</Text>
                <Text style={styles.mgmtSub}>{TOTAL_SEATS - passengers.length} Seats Left</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL: STOP PICKER --- */}
      <Modal visible={showStopPicker.visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.pickerBox}>
            <FlatList data={STOPS} keyExtractor={i => i} renderItem={({item}) => (
              <TouchableOpacity style={styles.stopItem} onPress={() => {
                if(showStopPicker.type === 'source') setSource(item); else setDestination(item);
                setShowStopPicker({visible: false});
              }}><Text style={styles.stopText}>{item}</Text></TouchableOpacity>
            )} />
          </View>
        </View>
      </Modal>

      {/* --- MODAL: QR CODE --- */}
      <Modal visible={showQRModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.qrCard}>
            <Text style={styles.qrHeader}>Scan & Pay ₹{fare}</Text>
            <QRCode value={JSON.stringify({busId: busDetails.busId, amount: fare, from: source, to: destination})} size={200}/>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQRModal(false)}><Text style={{color: '#fff'}}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: PASSENGER LIST --- */}
      <Modal visible={showPassengerList} transparent animationType="fade">
        <View style={styles.overlay}>
          <LinearGradient colors={["#111C2F", "#050B1A"]} style={styles.listContainer}>
            <Text style={styles.modalHeader}>Live Passenger List</Text>
            <FlatList 
              data={passengers} 
              keyExtractor={i => i._id} 
              renderItem={({item}) => (
                <View style={styles.passengerItem}>
                   <View style={styles.seatBadge}><Text style={styles.seatText}>{item.seatNumber}</Text></View>
                   <View>
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.from} ➔ {item.to}</Text>
                      <Text style={{color: '#888', fontSize: 11}}>{item.paymentMethod === 'cash' ? '💵 Cash' : '💳 Online'}</Text>
                   </View>
                </View>
              )} 
            />
            <TouchableOpacity style={styles.listClose} onPress={() => setShowPassengerList(false)}><Text style={{color: '#fff'}}>Close</Text></TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 24, color: "#1E88FF", fontWeight: "bold", marginBottom: 20 },
  
  inputCard: { backgroundColor: "#111C2F", padding: 20, borderRadius: 20, marginBottom: 15 },
  label: { color: "#1E88FF", fontWeight: "bold", marginBottom: 15, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  miniSelector: { backgroundColor: '#050B1A', width: '48%', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#2A3547' },
  selectorLabel: { color: '#888', fontSize: 10, marginBottom: 4 },
  selectorValue: { color: '#fff', fontWeight: 'bold' },

  fareBox: { alignItems: 'center', marginVertical: 15 },
  fareText: { color: '#888', fontSize: 14 },
  price: { color: '#fff', fontSize: 28, fontWeight: 'bold' },

  mainBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  onlineBtn: { backgroundColor: '#1E88FF' },
  offlineBtn: { backgroundColor: '#28A745' },

  mgmtRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mgmtCard: { backgroundColor: '#111C2F', width: '48%', padding: 15, borderRadius: 15 },
  mgmtTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  mgmtSub: { color: '#1E88FF', fontSize: 12, marginTop: 4 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  pickerBox: { backgroundColor: '#111C2F', width: '80%', borderRadius: 15, padding: 10, maxHeight: '50%' },
  stopItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#2A3547' },
  stopText: { color: '#fff', textAlign: 'center' },

  qrCard: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center' },
  qrHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  closeBtn: { backgroundColor: '#FF4444', marginTop: 20, paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 },

  listContainer: { width: '90%', height: '70%', borderRadius: 20, padding: 20 },
  modalHeader: { color: '#1E88FF', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  passengerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A3547' },
  seatBadge: { backgroundColor: '#1E88FF', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  seatText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  listClose: { marginTop: 15, backgroundColor: '#1E88FF', padding: 12, borderRadius: 10, alignItems: 'center' }
});