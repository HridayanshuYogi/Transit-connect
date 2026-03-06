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
  const [reservationTime, setReservationTime] = useState(null);
  const [timer, setTimer] = useState(0);
  const [seatType, setSeatType] = useState("Window");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);

  const TOTAL_SEATS = 12;

  const generateSeats = () =>
    Array.from({ length: TOTAL_SEATS }, (_, i) => `A${i + 1}`);

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (from && to) {
        handleSearch();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [from, to]);

  // 🔥 Reservation Countdown Timer
  useEffect(() => {
    if (!reservationTime) return;

    const interval = setInterval(() => {
      const remaining = Math.floor(
        (reservationTime - Date.now()) / 1000
      );

      if (remaining <= 0) {
        setSelectedSeat(null);
        setReservationTime(null);
        setTimer(0);
        clearInterval(interval);
        Alert.alert("Reservation Expired ⏳");
      } else {
        setTimer(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservationTime]);

  const fetchBuses = async () => {
    try {
      const response = await fetch(
        // "http://10.0.2.2:5002/api/buses"
        "http://10.0.2.2:5002/api/buses"
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
            bookedSeats: ["A1", "A3"],
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
    setSelectedSeat(null);

    if (result.length > 0) {
      setBookedSeats(result[0].bookedSeats || []);
    } else {
      setBookedSeats([]);
    }
  };

  const handleBook = async (bus) => {
    if (!selectedSeat) {
      Alert.alert("Select Seat First");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        // "http://10.0.2.2:5002/api/tickets",
        "http://10.0.2.2:5002/api/tickets",
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

      // 🔥 Confirm Seat (change reserved → booked)
      await fetch(
        "http://10.0.2.2:5002/api/tickets/confirm-seat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seatNumber: selectedSeat,
          }),
        }
      );

      Alert.alert("Success 🎫", "Seat Booked!");

      setBookedSeats([...bookedSeats, selectedSeat]);
      setSelectedSeat(null);
      setReservationTime(null);
      setTimer(0);

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
        <Picker selectedValue={from} onValueChange={setFrom}>
          <Picker.Item label="Select From" value="" />
          <Picker.Item label="Delhi" value="Delhi" />
          <Picker.Item label="Jaipur" value="Jaipur" />
        </Picker>
      </View>

      <Text style={styles.label}>To</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={to} onValueChange={setTo}>
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

            <Text style={{ color: "#aaa", marginTop: 5 }}>
              Available Seats: {TOTAL_SEATS - bookedSeats.length}
            </Text>

            <Text style={styles.section}>Select Seat</Text>
            <View style={styles.seatGrid}>
              {generateSeats().map((seat) => {
                const isBooked = bookedSeats.includes(seat);

                return (
                  <TouchableOpacity
                    key={seat}
                    disabled={isBooked}
                    style={[
                      styles.seat,
                      selectedSeat === seat && styles.selectedSeat,
                      isBooked && styles.bookedSeat,
                    ]}
                    onPress={async () => {
                      try {
                        const response = await fetch(
                          // "http://10.0.2.2:5002/api/tickets/reserve-seat",
                          "http://10.0.2.2:5002/api/tickets/reserve-seat",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              busName: item.busName,
                              seatNumber: seat,
                            }),
                          }
                        );

                        if (!response.ok) {
                          Alert.alert("Seat Already Reserved");
                          return;
                        }

                        setSelectedSeat(seat);
                        setReservationTime(
                          Date.now() + 5 * 60 * 1000
                        );
                        setTimer(300);
                      } catch (error) {
                        Alert.alert("Reservation Error");
                      }
                    }}
                  >
                    <Text style={{ color: "#fff" }}>{seat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedSeat && (
              <Text style={{ color: "orange", marginTop: 5 }}>
                Seat reserved for: {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")}
              </Text>
            )}

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
    color: "#fff",
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
  bookedSeat: {
    backgroundColor: "red",
    opacity: 0.6,
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