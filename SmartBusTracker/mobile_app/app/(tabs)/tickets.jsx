import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import QRCode from "react-native-qrcode-svg";

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  // 🔥 NEW STATES FOR MODIFY
  const [modifyTicketId, setModifyTicketId] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);

  /* ================= FETCH TICKETS ================= */

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setTickets([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://10.0.2.2:5002/api/tickets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (error) {
      Alert.alert("Server Error", "Unable to fetch tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, [])
  );

  /* ================= AUTO REFRESH ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  /* ================= STATUS LOGIC ================= */

  const getStatus = (ticket) => {
    if (ticket.status === "cancelled") return "Cancelled ❌";

    if (!ticket.date) return "Confirmed ✅";

    const today = new Date();
    const travel = new Date(ticket.date);

    if (travel.toDateString() === today.toDateString())
      return "Today 🟡";

    if (travel < today)
      return "Completed 🟢";

    return "Upcoming 🔵";
  };

  const getStatusColor = (ticket) => {
    const status = getStatus(ticket);

    if (status.includes("Cancelled")) return "#D32F2F";
    if (status.includes("Completed")) return "#4CAF50";
    if (status.includes("Today")) return "#FFA000";
    return "#1E88FF";
  };

  /* ================= MODIFY ================= */

  const handleModify = (ticket) => {
    const status = getStatus(ticket);

    if (
      status.includes("Completed") ||
      status.includes("Cancelled")
    ) {
      Alert.alert(
        "Cannot Modify",
        "Trip already completed or cancelled"
      );
      return;
    }

    setModifyTicketId(ticket._id);
    setSelectedSeat(null);
  };

  const confirmModify = async (ticketId) => {
    if (!selectedSeat) {
      Alert.alert("Select a seat first");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://10.0.2.2:5002/api/tickets/${ticketId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatNumber: selectedSeat }),
      }
    );

    if (response.ok) {
      Alert.alert("Seat Updated ✅");
      setModifyTicketId(null);
      setSelectedSeat(null);
      fetchTickets();
    } else {
      Alert.alert("Modification Failed");
    }
  };

  /* ================= CANCEL ================= */

  const handleCancel = async (ticket) => {
    const status = getStatus(ticket);

    if (status.includes("Completed")) {
      Alert.alert("Cannot Cancel", "Trip already completed");
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `http://10.0.2.2:5002/api/tickets/${ticket._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.ok) {
      Alert.alert("Cancelled ✅");
      fetchTickets();
    } else {
      Alert.alert("Cancel Failed");
    }
  };

  /* ================= SHARE ================= */

  const shareTicket = async (ticket) => {
    await Share.share({
      message: `🎫 SmartBus Ticket
Route: ${ticket.from} → ${ticket.to}
Bus: ${ticket.busName}
Seat: ${ticket.seatNumber}
Status: ${getStatus(ticket)}
Booking ID: ${ticket._id}`,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
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
      <Text style={styles.title}>My Tickets 🎫</Text>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No tickets booked yet 🚍
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Text style={styles.route}>
              {item.from} → {item.to}
            </Text>

            <Text style={styles.info}>
              Bus: {item.busName}
            </Text>

            <Text style={styles.info}>
              Seat: {item.seatNumber}
            </Text>

            <Text
              style={[
                styles.status,
                { color: getStatusColor(item) },
              ]}
            >
              {getStatus(item)}
            </Text>

            <Text style={styles.price}>
              ₹{item.price}
            </Text>

            {/* MODIFY BUTTON */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modifyBtn}
                onPress={() => handleModify(item)}
              >
                <Text style={styles.btnText}>Modify</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* 🔥 MODIFY PANEL (ANDROID SAFE) */}
            {modifyTicketId === item._id && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: "#aaa", marginBottom: 5 }}>
                  Select New Seat
                </Text>

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10","A11","A12"].map(seat => (
                    <TouchableOpacity
                      key={seat}
                      style={{
                        backgroundColor:
                          selectedSeat === seat ? "#1E88FF" : "#333",
                        padding: 8,
                        borderRadius: 6,
                        margin: 4,
                      }}
                      onPress={() => setSelectedSeat(seat)}
                    >
                      <Text style={{ color: "#fff" }}>{seat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.modifyBtn, { marginTop: 8 }]}
                  onPress={() => confirmModify(item._id)}
                >
                  <Text style={styles.btnText}>Confirm Seat</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* QR TOGGLE */}
            <TouchableOpacity
              style={styles.modifyBtn}
              onPress={() =>
                setShowQR(showQR === item._id ? null : item._id)
              }
            >
              <Text style={styles.btnText}>
                {showQR === item._id
                  ? "Hide QR"
                  : "Show QR"}
              </Text>
            </TouchableOpacity>

            {showQR === item._id && (
              <View style={{ alignItems: "center", marginTop: 10 }}>
                <QRCode value={item._id} size={120} />
              </View>
            )}

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => shareTicket(item)}
            >
              <Text style={styles.btnText}>
                Share Ticket
              </Text>
            </TouchableOpacity>

          </View>
        )}
      />
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B1A",
    padding: 20,
    paddingTop: 50,
  },
  loader: {
    flex: 1,
    backgroundColor: "#050B1A",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    marginBottom: 20,
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 50,
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
    fontWeight: "bold",
  },
  info: {
    color: "#ccc",
    marginTop: 5,
  },
  price: {
    color: "#1E88FF",
    fontSize: 16,
    marginTop: 8,
  },
  status: {
    marginTop: 5,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  modifyBtn: {
    backgroundColor: "#FFA000",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: "#D32F2F",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  shareBtn: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});