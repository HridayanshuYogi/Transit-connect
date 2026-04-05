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
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function TicketsScreen() {
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) { setTickets([]); setLoading(false); return; }
      const response = await fetch("http://10.0.2.2:5002/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTickets(); }, []));

  useEffect(() => {
    const interval = setInterval(() => { fetchTickets(); }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (ticket) => {
    if (ticket.status === "cancelled") return "CANCELLED";
    const travel = new Date(ticket.date || new Date());
    const today = new Date();
    if (travel.toDateString() === today.toDateString()) return "TODAY";
    return travel < today ? "PAST" : "UPCOMING";
  };

  const getTheme = (status) => {
    switch (status) {
      case "CANCELLED": return { color: "#FF5252" };
      case "TODAY": return { color: "#FFC107" };
      case "PAST": return { color: "#4CAF50" };
      default: return { color: "#1E88FF" };
    }
  };

  const handleCancel = async (ticket) => {
    const status = getStatus(ticket);
    if (status === "PAST") { Alert.alert("Cannot Cancel", "Trip already completed"); return; }
    
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this ticket?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`http://10.0.2.2:5002/api/tickets/${ticket._id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) { fetchTickets(); } 
            else { Alert.alert("Cancel Failed"); }
          },
        },
      ]
    );
  };

  const handleShare = async (ticket) => {
    try {
      await Share.share({
        message: `🎫 SmartBus Ticket\n🚌 Bus: ${ticket.busName}\n📍 Route: ${ticket.from} ➔ ${ticket.to}\n💺 Seat: ${ticket.seatNumber}\n📅 Date: ${new Date(ticket.date).toLocaleDateString()}\n\nSafe travels with SmartBus!`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color="#1E88FF" /></View>
  );

  return (
    <LinearGradient colors={["#050B1A", "#000814"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journeys</Text>
        <Text style={styles.subtitle}>{tickets.length} Registered Tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTickets} tintColor="#1E88FF" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bus-marker" size={80} color="#1A263F" />
            <Text style={styles.empty}>No journeys planned yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = getStatus(item);
          const theme = getTheme(status);

          return (
            <View style={styles.ticketCard}>
              <View style={styles.cardMain}>
                <View style={styles.brandRow}>
                  <View style={styles.busInfo}>
                    <Ionicons name="bus-outline" size={18} color="#1E88FF" />
                    <Text style={styles.busName}>{item.busName}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme.color + "20" }]}>
                    <Text style={[styles.badgeText, { color: theme.color }]}>{status}</Text>
                  </View>
                </View>

                <View style={styles.routeRow}>
                  <View>
                    <Text style={styles.cityCode}>{item.from?.substring(0, 3).toUpperCase() || "ORG"}</Text>
                    <Text style={styles.cityName}>{item.from}</Text>
                  </View>
                  <View style={styles.pathContainer}>
                    <View style={styles.pathLine} />
                    <MaterialCommunityIcons name="bus-side" size={24} color="#1E88FF" />
                    <View style={[styles.pathLine, styles.dashedLine]} />
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.cityCode}>{item.to?.substring(0, 3).toUpperCase() || "DST"}</Text>
                    <Text style={styles.cityName}>{item.to}</Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View>
                    <Text style={styles.label}>DATE</Text>
                    <Text style={styles.value}>{new Date(item.date || Date.now()).toLocaleDateString()}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>SEAT</Text>
                    <Text style={styles.value}>{item.seatNumber}</Text>
                  </View>
                  <View>
                    <Text style={styles.label}>PRICE</Text>
                    <Text style={styles.value}>₹{item.price}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.separator}>
                <View style={styles.holeLeft} />
                <View style={styles.dashLine} />
                <View style={styles.holeRight} />
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.footerActions}>
                  {/* QR BUTTON */}
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setShowQR(showQR === item._id ? null : item._id)}>
                    <Ionicons name={showQR === item._id ? "eye-off" : "qr-code-outline"} size={20} color="#fff" />
                    <Text style={styles.btnText}>Ticket</Text>
                  </TouchableOpacity>

                  {/* SHARE BUTTON */}
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
                    <Ionicons name="share-social-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>Share</Text>
                  </TouchableOpacity>
                  
                  {/* CANCEL BUTTON */}
                  {status !== "CANCELLED" && status !== "PAST" && (
                     <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => handleCancel(item)}>
                        <Ionicons name="trash-outline" size={20} color="#FF5252" />
                        <Text style={[styles.btnText, { color: "#FF5252" }]}>Cancel</Text>
                     </TouchableOpacity>
                  )}
                </View>

                {showQR === item._id && (
                  <View style={styles.qrContent}>
                     <View style={styles.qrWrapper}>
                        <QRCode value={item._id} size={150} backgroundColor="white" />
                     </View>
                     <Text style={styles.qrHint}>Show this ID to the conductor upon boarding</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  loader: { flex: 1, backgroundColor: "#050B1A", justifyContent: "center", alignItems: "center" },
  header: { marginTop: 60, marginBottom: 25 },
  title: { color: "#fff", fontSize: 32, fontWeight: "bold", letterSpacing: -1 },
  subtitle: { color: "#556789", fontSize: 14, marginTop: 4 },
  ticketCard: { marginBottom: 25 },
  cardMain: { backgroundColor: "#111C2F", padding: 25, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  busInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  busName: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "900" },
  routeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 10 },
  cityCode: { color: "#1E88FF", fontSize: 24, fontWeight: "900" },
  cityName: { color: "#556789", fontSize: 12, marginTop: 2 },
  pathContainer: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 15 },
  pathLine: { flex: 1, height: 2, backgroundColor: "#2A3547" },
  dashedLine: { backgroundColor: "transparent", borderStyle: "dashed", borderWidth: 1, borderColor: "#2A3547" },
  infoGrid: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  label: { color: "#556789", fontSize: 10, fontWeight: "bold", marginBottom: 5 },
  value: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  separator: { height: 30, backgroundColor: "#111C2F", flexDirection: "row", alignItems: "center" },
  holeLeft: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#050B1A", marginLeft: -15 },
  holeRight: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#050B1A", marginRight: -15 },
  dashLine: { flex: 1, height: 1, borderStyle: "dashed", borderWidth: 1, borderColor: "#2A3547", marginHorizontal: 10 },
  cardFooter: { backgroundColor: "#111C2F", padding: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: 0 },
  footerActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#1A263F", paddingTop: 15 },
  
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  cancelBtn: { borderLeftWidth: 1, borderLeftColor: "#1A263F" },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  qrContent: { alignItems: "center", marginTop: 20, backgroundColor: "#050B1A", padding: 20, borderRadius: 20 },
  qrWrapper: { padding: 12, backgroundColor: "#fff", borderRadius: 12 },
  qrHint: { color: "#556789", fontSize: 12, marginTop: 15, fontWeight: "bold", textAlign: "center" },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  empty: { color: "#556789", fontSize: 16, marginTop: 20 }
});