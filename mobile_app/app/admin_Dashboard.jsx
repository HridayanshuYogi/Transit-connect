import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function AdminDashboard() {
  const [buses, setBuses] = useState([]);
  const [busName, setBusName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("");
  const [stats, setStats] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const router = useRouter();

  const API_URL = "http://10.0.2.2:5002/api/admin";

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchLiveBuses, 5000); // Auto-refresh live fleet
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetchBuses();
    fetchStats();
    fetchLiveBuses();
  };

  const fetchLiveBuses = async () => {
    try {
      const res = await fetch(`${API_URL}/live-buses`);
      const data = await res.json();
      setLiveBuses(data);
    } catch (error) {
      console.log("Live bus error:", error);
    }
  };

  const fetchBuses = async () => {
    try {
      const res = await fetch(`${API_URL}/buses`);
      const data = await res.json();
      setBuses(data);
    } catch (error) {
      console.log("Fetch buses error:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.log("Stats error:", error);
    }
  };

  const addBus = async () => {
    if (!busName || !from || !to || !price) {
      Alert.alert("Missing Info", "Please fill all fields before adding.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/add-bus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busName, from, to, price }),
      });
      if (res.ok) {
        Alert.alert("Success", "Bus added to the fleet.");
        setBusName(""); setFrom(""); setTo(""); setPrice("");
        fetchData();
      }
    } catch (error) {
      console.log("Add bus error:", error);
    }
  };

  const deleteBus = async (id) => {
    Alert.alert("Delete Bus", "Are you sure you want to remove this bus?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API_URL}/delete-bus/${id}`, { method: "DELETE" });
            fetchData();
          } catch (error) { console.log(error); }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#020617", "#0F172A"]} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Fleet Management</Text>
          <TouchableOpacity onPress={fetchData}>
            <Feather name="refresh-cw" size={22} color="#1E88FF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* STATS GRID */}
          <View style={styles.statsGrid}>
            <StatCard icon="users" title="Total Users" value={stats?.totalUsers || "0"} color="#3B82F6" />
            <StatCard icon="bus" title="Active Fleet" value={stats?.totalBuses || "0"} color="#10B981" />
            <StatCard icon="trello" title="Tickets Sold" value={stats?.totalTickets || "0"} color="#8B5CF6" />
            <StatCard icon="dollar-sign" title="Revenue" value={`₹${stats?.revenue || "0"}`} color="#F59E0B" />
          </View>

          {/* ADD BUS SECTION */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionHeader}>Deploy New Vehicle</Text>
            <View style={styles.inputGroup}>
                <TextInput placeholder="Bus Name (e.g. Express 24)" placeholderTextColor="#64748B" style={styles.input} value={busName} onChangeText={setBusName} />
                <View style={styles.rowInput}>
                    <TextInput placeholder="Origin" placeholderTextColor="#64748B" style={[styles.input, {flex: 1, marginRight: 10}]} value={from} onChangeText={setFrom} />
                    <TextInput placeholder="Destination" placeholderTextColor="#64748B" style={[styles.input, {flex: 1}]} value={to} onChangeText={setTo} />
                </View>
                <TextInput placeholder="Ticket Price (₹)" placeholderTextColor="#64748B" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={addBus}>
              <Text style={styles.addBtnText}>Deploy Bus</Text>
            </TouchableOpacity>
          </View>

          {/* LIVE MAP */}
          <Text style={styles.sectionHeader}>Live Operational Map</Text>
          <View style={styles.mapFrame}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              customMapStyle={mapDarkStyle}
              initialRegion={{
                latitude: 28.4595, longitude: 77.0266,
                latitudeDelta: 0.09, longitudeDelta: 0.09,
              }}
            >
              {liveBuses.map((bus) => (
                <Marker
                  key={bus._id}
                  coordinate={{
                    latitude: bus.currentLocation?.latitude || 28.4595,
                    longitude: bus.currentLocation?.longitude || 77.0266,
                  }}
                >
                  <View style={styles.busMarker}>
                    <MaterialCommunityIcons name="bus-side" size={14} color="#fff" />
                    <Text style={styles.markerText}>{bus.busName}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          </View>

          {/* VEHICLE INVENTORY */}
          <Text style={styles.sectionHeader}>Vehicle Inventory ({buses.length})</Text>
          {buses.map((item) => (
            <View key={item._id} style={styles.listCard}>
              <View style={styles.listInfo}>
                <Text style={styles.listBusName}>{item.busName}</Text>
                <Text style={styles.listRoute}>{item.from} → {item.to}</Text>
                <Text style={styles.listPrice}>Fare: ₹{item.price}</Text>
              </View>
              <TouchableOpacity style={styles.deleteIconButton} onPress={() => deleteBus(item._id)}>
                <Feather name="trash-2" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* LIVE MONITORING LIST */}
          <Text style={styles.sectionHeader}>Telemetry Feed</Text>
          {liveBuses.map((item) => (
            <View key={item._id} style={styles.telemetryCard}>
              <View style={styles.telemetryHeader}>
                <Text style={styles.listBusName}>{item.busName}</Text>
                <View style={[styles.statusTag, { backgroundColor: item.speed > 0 ? '#10B98120' : '#EF444420' }]}>
                    <Text style={{ color: item.speed > 0 ? '#10B981' : '#EF4444', fontSize: 10, fontWeight: 'bold' }}>{item.busStatus}</Text>
                </View>
              </View>
              <View style={styles.telemetryGrid}>
                <TelemetryInfo icon="fast-forward" label="Speed" value={`${item.speed} km/h`} />
                <TelemetryInfo icon="map-pin" label="Lat" value={item.currentLocation?.latitude?.toFixed(4)} />
                <TelemetryInfo icon="map-pin" label="Long" value={item.currentLocation?.longitude?.toFixed(4)} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

// --- REUSABLE COMPONENTS ---

function StatCard({ title, value, color, icon }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function TelemetryInfo({ icon, label, value }) {
  return (
    <View style={styles.teleItem}>
        <Feather name={icon} size={12} color="#64748B" />
        <Text style={styles.teleLabel}>{label}: </Text>
        <Text style={styles.teleValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  titleText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#111C2F', width: '48%', padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#1E293B' },
  statIconBox: { width: 35, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statTitle: { color: '#64748B', fontSize: 12, marginTop: 2 },

  glassCard: { backgroundColor: '#111C2F', padding: 20, borderRadius: 24, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
  sectionHeader: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  inputGroup: { marginBottom: 15 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  rowInput: { flexDirection: 'row' },
  addBtn: { backgroundColor: '#1E88FF', padding: 16, borderRadius: 15, alignItems: 'center', elevation: 5 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  mapFrame: { height: 250, borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1, borderColor: '#1E293B' },
  map: { flex: 1 },
  busMarker: { backgroundColor: '#1E88FF', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  markerText: { color: '#fff', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },

  listCard: { backgroundColor: '#111C2F', padding: 18, borderRadius: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B' },
  listInfo: { flex: 1 },
  listBusName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  listRoute: { color: '#64748B', fontSize: 13, marginTop: 2 },
  listPrice: { color: '#10B981', fontSize: 13, fontWeight: 'bold', marginTop: 4 },
  deleteIconButton: { padding: 10, backgroundColor: '#EF444415', borderRadius: 12 },

  telemetryCard: { backgroundColor: '#020617', padding: 15, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#1E293B' },
  telemetryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  telemetryGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  teleItem: { flexDirection: 'row', alignItems: 'center' },
  teleLabel: { color: '#64748B', fontSize: 10, marginLeft: 4 },
  teleValue: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
});

const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] }
];