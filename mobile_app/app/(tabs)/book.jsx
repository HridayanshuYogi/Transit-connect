import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import io from "socket.io-client";

// Ensure this IP matches your machine's local IP or 10.0.2.2 for Android Emulator
const socket = io("http://10.0.2.2:5002");

export default function BookScreen() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBus, setActiveBus] = useState(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    socket.on("seatUpdated", (data) => {
      if (activeBus && data.busName === activeBus.busName) {
        setBookedSeats((prev) =>
          prev.includes(data.seatNumber) ? prev : [...prev, data.seatNumber]
        );
      }
    });
    return () => socket.off("seatUpdated");
  }, [activeBus]);

  const fetchBuses = async () => {
    try {
      const response = await fetch("http://10.0.2.2:5002/api/buses");
      const data = await response.json();
      if (Array.isArray(data)) setBuses(data);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!from || !to) {
      Alert.alert("Selection Required", "Please select both Origin and Destination.");
      return;
    }

    // Fixed typo in logic and added trim/lowercase for robustness
    const result = buses.filter(b => 
      b.from?.toLowerCase().trim() === from.toLowerCase() && 
      b.to?.toLowerCase().trim() === to.toLowerCase()
    );

    if (result.length > 0) {
      setActiveBus(result[0]);
      setBookedSeats(result[0].bookedSeats || []);
      setFilteredBuses(result);
      setSelectedSeat(null); // Reset seat selection on new search
    } else {
      setFilteredBuses([]);
      Alert.alert("No Buses Found", "Try a different route.");
    }
  };

  const handleOpenPayment = (bus) => {
    if (!selectedSeat) {
      return Alert.alert("Wait", "Please select a seat from the layout first.");
    }
    setActiveBus(bus);
    setIsProcessing(false);
    setShowPaymentModal(true);
  };

  const completeBookingAfterPayment = async (method) => {
    setIsProcessing(true);
    setTimeout(async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const res = await fetch("http://10.0.2.2:5002/api/tickets", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({
            busName: activeBus.busName,
            seatNumber: selectedSeat,
            price: activeBus.price || 150,
            paymentStatus: "Paid",
            method
          }),
        });

        if (!res.ok) throw new Error("Booking failed on server");

        await fetch("http://10.0.2.2:5002/api/tickets/confirm-seat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seatNumber: selectedSeat, busName: activeBus.busName }),
        });

        socket.emit("seatBooked", { busName: activeBus.busName, seatNumber: selectedSeat });
        
        setBookedSeats((prev) => [...prev, selectedSeat]);
        setSelectedSeat(null);
        setShowPaymentModal(false);
        Alert.alert("Success ✅", "Enjoy your journey!");
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setIsProcessing(false);
      }
    }, 2000);
  };

  const renderSeat = (seat) => {
    const isBooked = bookedSeats.includes(seat);
    const isSelected = selectedSeat === seat;
    return (
      <TouchableOpacity
        key={seat}
        disabled={isBooked}
        onPress={() => setSelectedSeat(seat)}
        style={[
          styles.seat,
          isSelected && styles.selectedSeat,
          isBooked && styles.bookedSeat
        ]}
      >
        <MaterialCommunityIcons
          name={isBooked ? "car-seat-cooler" : "car-seat"}
          size={20}
          color={isBooked ? "#555" : isSelected ? "#fff" : "#1E88FF"}
        />
        <Text style={[styles.seatText, isSelected && { color: "#fff" }]}>{seat}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#1E88FF" />
    </View>
  );

  return (
    <LinearGradient colors={["#050B1A", "#000"]} style={styles.container}>
      <Text style={styles.headerTitle}>Find Your Ride 🚌</Text>

      {/* SEARCH CARD */}
      <View style={styles.searchCard}>
        <View style={styles.routeContainer}>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={from} onValueChange={setFrom} style={styles.picker} dropdownIconColor="#fff">
              <Picker.Item label="Origin" value="" color="#888" />
              <Picker.Item label="Sohna" value="sohna" color="#000" />
              <Picker.Item label="Gurgaon" value="gurgaon" color="#000" />
            </Picker>
          </View>
          <Ionicons name="swap-horizontal" size={20} color="#1E88FF" style={{ marginHorizontal: 10 }} />
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={to} onValueChange={setTo} style={styles.picker} dropdownIconColor="#fff">
              <Picker.Item label="Destination" value="" color="#888" />
              <Picker.Item label="Sohna" value="sohna" color="#000" />
              <Picker.Item label="Gurgaon" value="gurgaon" color="#000" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
          <LinearGradient colors={["#1E88FF", "#0052D4"]} style={styles.searchGradient}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchBtnText}>Search Buses</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBuses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.busCard}>
            <View style={styles.busHeader}>
              <Text style={styles.busName}>{item.busName}</Text>
              <Text style={styles.busPrice}>₹{item.price || '150'}</Text>
            </View>

            <View style={styles.busInterior}>
              <View style={styles.driverSection}>
                <MaterialCommunityIcons name="steering" size={28} color="#444" />
              </View>
              {[["A1", "A2", "A3", "A4"], ["A5", "A6", "A7", "A8"], ["A9", "A10", "A11", "A12"]].map((row, i) => (
                <View key={i} style={styles.busRow}>
                  <View style={styles.seatSide}>{row.slice(0, 2).map(renderSeat)}</View>
                  <View style={styles.aisle} />
                  <View style={styles.seatSide}>{row.slice(2, 4).map(renderSeat)}</View>
                </View>
              ))}
            </View>

            <View style={styles.legend}>
              <LegendItem color="#111C2F" label="Available" />
              <LegendItem color="#1E88FF" label="Selected" />
              <LegendItem color="#555" label="Booked" />
            </View>

            <TouchableOpacity 
              style={[styles.bookBtn, !selectedSeat && { opacity: 0.5 }]} 
              onPress={() => handleOpenPayment(item)}
            >
              <Text style={styles.bookBtnText}>
                {selectedSeat ? `Confirm Seat ${selectedSeat}` : "Select a Seat"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentBox}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Checkout</Text>
            {isProcessing ? (
              <View style={styles.processing}>
                <ActivityIndicator size="large" color="#1E88FF" />
                <Text style={styles.processingText}>Securing your seat...</Text>
              </View>
            ) : (
              <View style={{ width: "100%" }}>
                <PaymentOption title="UPI / GPay" icon="flash" color="#2ecc71" onPress={() => completeBookingAfterPayment("UPI")} />
                <PaymentOption title="Credit/Debit Card" icon="card" color="#1E88FF" onPress={() => completeBookingAfterPayment("Card")} />
                <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={styles.cancelBtn}>
                  <Text style={{ color: "#FF4444", fontWeight: "bold", textAlign: 'center' }}>Go Back</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const LegendItem = ({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
    <View style={[styles.legendDot, { backgroundColor: color, borderWidth: 1, borderColor: '#1E88FF' }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const PaymentOption = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.payOption} onPress={onPress}>
    <View style={[styles.payIconBox, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.payOptionText}>{title}</Text>
    <Ionicons name="chevron-forward" size={18} color="#555" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  loader: { flex: 1, backgroundColor: '#050B1A', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: "#fff", fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  searchCard: { backgroundColor: "#111C2F", padding: 15, borderRadius: 20, marginBottom: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" },
  routeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  pickerWrapper: { flex: 1, backgroundColor: "#fff", borderRadius: 12, overflow: 'hidden' },
  picker: { color: "#000", height: 50 },
  searchBtn: { borderRadius: 12, overflow: 'hidden' },
  searchGradient: { flexDirection: 'row', padding: 15, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  busCard: { backgroundColor: "#111C2F", padding: 20, borderRadius: 25, marginBottom: 25 },
  busHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  busName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  busPrice: { color: "#2ecc71", fontSize: 18, fontWeight: "bold" },
  busInterior: { backgroundColor: "#050B1A", padding: 20, borderRadius: 20, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  driverSection: { width: '100%', alignItems: 'flex-end', marginBottom: 15, paddingRight: 10 },
  busRow: { flexDirection: "row", marginBottom: 12, justifyContent: 'center' },
  seatSide: { flexDirection: "row" },
  aisle: { width: 35 },
  seat: { backgroundColor: "#111C2F", width: 48, height: 55, borderRadius: 10, margin: 4, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(30,136,255,0.2)" },
  selectedSeat: { backgroundColor: "#1E88FF", borderColor: "#fff" },
  bookedSeat: { backgroundColor: "#1a1a1a", borderColor: "transparent", opacity: 0.5 },
  seatText: { color: "#556789", fontSize: 10, marginTop: 2, fontWeight: 'bold' },
  legend: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  legendText: { color: "#556789", fontSize: 11 },
  bookBtn: { backgroundColor: "#1E88FF", padding: 18, borderRadius: 15, alignItems: "center" },
  bookBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  paymentBox: { backgroundColor: "#111C2F", padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: "center" },
  modalHandle: { width: 40, height: 5, backgroundColor: "#2A3547", borderRadius: 10, marginBottom: 20 },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 25 },
  payOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#050B1A', padding: 15, borderRadius: 15, marginBottom: 12, width: '100%' },
  payIconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  payOptionText: { color: '#fff', flex: 1, fontSize: 16, fontWeight: '600' },
  cancelBtn: { marginTop: 10, padding: 15, width: '100%' },
  processing: { padding: 40, alignItems: 'center' },
  processingText: { color: "#556789", marginTop: 15 }
});