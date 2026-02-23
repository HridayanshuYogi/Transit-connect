import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BookScreen() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatType, setSeatType] = useState("Window");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const TOTAL_SEATS = 12;

  const generateSeats = () =>
    Array.from({ length: TOTAL_SEATS }, (_, i) => `A${i + 1}`);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await fetch(
        "http://192.168.1.34:5002/api/buses"
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setBuses(data);
        setFilteredBuses(data);
      } else {
        const demo = [
          {
            _id: "1",
            busName: "Smart Express",
            from: "Delhi",
            to: "Jaipur",
            price: 450,
          },
        ];
        setBuses(demo);
        setFilteredBuses(demo);
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFare = (basePrice) => {
    let extra = 0;
    if (seatType === "Window") extra = 20;
    if (seatType === "Aisle") extra = 10;
    return basePrice + extra;
  };

  const handleSearch = () => {
    if (!from || !to) {
      Alert.alert("Select From and To");
      return;
    }

    const result = buses.filter(
      (bus) => bus.from === from && bus.to === to
    );

    setFilteredBuses(result);
  };

  const handleBook = async (bus) => {
    if (!selectedSeat) {
      Alert.alert("Select Seat First");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        "http://192.168.1.34:5001/api/tickets",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            busName: bus.busName,
            from: bus.from,
            to: bus.to,
            date: new Date(),
            seatNumber: selectedSeat,
            seatType,
            price: calculateFare(bus.price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Booking Failed", data.message);
        return;
      }

      Alert.alert("Success 🎫", "Seat Booked!");
      setSelectedSeat(null);
    } catch (error) {
      Alert.alert("Booking Error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1E88FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Bus 🚌</Text>

      <Text style={styles.label}>From</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={from}
          onValueChange={(itemValue) => setFrom(itemValue)}
        >
          <Picker.Item label="Select From" value="" />
          <Picker.Item label="Delhi" value="Delhi" />
          <Picker.Item label="Jaipur" value="Jaipur" />
        </Picker>
      </View>

      <Text style={styles.label}>To</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={to}
          onValueChange={(itemValue) => setTo(itemValue)}
        >
          <Picker.Item label="Select To" value="" />
          <Picker.Item label="Delhi" value="Delhi" />
          <Picker.Item label="Jaipur" value="Jaipur" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={{ color: "#fff" }}>Search Buses</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredBuses}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={{ color: "#fff", textAlign: "center", marginTop: 20 }}>
            No buses found
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.route}>
              {item.from} → {item.to}
            </Text>

            <Text style={styles.price}>
              Base Fare: ₹{item.price}
            </Text>

            <Text style={styles.section}>Select Seat</Text>
            <View style={styles.seatGrid}>
              {generateSeats().map((seat) => (
                <TouchableOpacity
                  key={seat}
                  style={[
                    styles.seat,
                    selectedSeat === seat && styles.selectedSeat,
                  ]}
                  onPress={() => setSelectedSeat(seat)}
                >
                  <Text style={{ color: "#fff" }}>{seat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.section}>Seat Type</Text>
            <View style={styles.typeRow}>
              {["Window", "Middle", "Aisle"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    seatType === type && styles.selectedType,
                  ]}
                  onPress={() => setSeatType(type)}
                >
                  <Text style={{ color: "#fff" }}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fare}>
              Total Fare: ₹{calculateFare(item.price)}
            </Text>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBook(item)}
            >
              <Text style={{ color: "#fff" }}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B1A",
    padding: 20,
    paddingTop: 50,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#050B1A",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 15,
  },
  label: {
    color: "#aaa",
    marginBottom: 5,
  },
  pickerBox: {
    backgroundColor: "#111C2F",
    borderRadius: 10,
    marginBottom: 15,
  },
  searchBtn: {
    backgroundColor: "#1E88FF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111C2F",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  route: {
    color: "#ffff",
    fontSize: 16,
  },
  price: {
    color: "#1E88FF",
    marginVertical: 5,
  },
  section: {
    color: "#aaa",
    marginTop: 10,
  },
  seatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  seat: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  selectedSeat: {
    backgroundColor: "#1E88FF",
  },
  typeRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  typeButton: {
    backgroundColor: "#333",
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  selectedType: {
    backgroundColor: "#1E88FF",
  },
  fare: {
    color: "#fff",
    marginTop: 10,
    fontWeight: "bold",
  },
  bookBtn: {
    backgroundColor: "#1E88FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});