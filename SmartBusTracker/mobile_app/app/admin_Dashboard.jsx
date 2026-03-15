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
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";

export default function AdminDashboard() {

  const [buses, setBuses] = useState([]);

  const [busName, setBusName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [price, setPrice] = useState("");

  const [stats, setStats] = useState(null);
  const [liveBuses, setLiveBuses] = useState([]);
  const router = useRouter();



  useEffect(() => {
    fetchBuses();
    fetchStats();
    fetchLiveBuses();
  }, []);

const fetchLiveBuses = async () => {

  try {

    const res = await fetch(
      "http://10.0.2.2:5002/api/admin/live-buses"
    );

    const data = await res.json();

    setLiveBuses(data);

  } catch (error) {

    console.log("Live bus error:", error);

  }

};

  const fetchBuses = async () => {

    try {

      const res = await fetch(
        "http://10.0.2.2:5002/api/admin/buses"
      );

      const data = await res.json();

      setBuses(data);

    } catch (error) {

      console.log("Fetch buses error:", error);

    }

  };



  const fetchStats = async () => {

    try {

      const res = await fetch(
        "http://10.0.2.2:5002/api/admin/stats"
      );

      const data = await res.json();

      setStats(data);

    } catch (error) {

      console.log("Stats error:", error);

    }

  };



  const addBus = async () => {

    if (!busName || !from || !to || !price) {

      Alert.alert("Fill all fields");

      return;

    }

    try {

      const res = await fetch(
        "http://10.0.2.2:5002/api/admin/add-bus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            busName,
            from,
            to,
            price,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {

        Alert.alert("Bus Added");

        setBusName("");
        setFrom("");
        setTo("");
        setPrice("");

        fetchBuses();
        fetchStats();

      } else {

        Alert.alert(data.message);

      }

    } catch (error) {

      console.log("Add bus error:", error);

    }

  };



  const deleteBus = async (id) => {

    try {

      await fetch(
        `http://10.0.2.2:5002/api/admin/delete-bus/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchBuses();
      fetchStats();

    } catch (error) {

      console.log("Delete bus error:", error);

    }

  };



  return (

  <LinearGradient colors={["#050B1A", "#000"]} style={{ flex: 1 }}>

    <View style={styles.container}>

      <Text style={styles.title}>
        Admin Dashboard
      </Text>

      {/* STATS SECTION */}

      {stats && (

        <View style={styles.statsContainer}>

          <StatCard title="Users" value={stats.totalUsers} />
          <StatCard title="Buses" value={stats.totalBuses} />
          <StatCard title="Tickets" value={stats.totalTickets} />
          <StatCard title="Revenue" value={`₹${stats.revenue}`} />

        </View>

      )}

      {/* SCROLLABLE CONTENT */}

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ADD BUS SECTION */}

        <View style={styles.card}>

          <Text style={styles.sectionTitle}>
            Add New Bus
          </Text>

          <TextInput
            placeholder="Bus Name"
            placeholderTextColor="#888"
            style={styles.input}
            value={busName}
            onChangeText={setBusName}
          />

          <TextInput
            placeholder="From"
            placeholderTextColor="#888"
            style={styles.input}
            value={from}
            onChangeText={setFrom}
          />

          <TextInput
            placeholder="To"
            placeholderTextColor="#888"
            style={styles.input}
            value={to}
            onChangeText={setTo}
          />

          <TextInput
            placeholder="Price"
            placeholderTextColor="#888"
            style={styles.input}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={addBus}
          >
            <Text style={styles.btnText}>
              Add Bus
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.sectionTitle}>
Live Fleet Map
</Text>

<View style={styles.mapContainer}>

<MapView
  style={styles.map}
  initialRegion={{
    latitude: 28.4595,
    longitude: 77.0266,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
>

{liveBuses.map((bus) => (

  <Marker
    key={bus._id}
    coordinate={{
      latitude: bus.currentLocation?.latitude || 28.4595,
      longitude: bus.currentLocation?.longitude || 77.0266,
    }}
    title={bus.busName}
    description={`${bus.from} → ${bus.to}`}
  />

))}

</MapView>

</View>



        {/* BUS LIST */}

        <Text style={styles.sectionTitle}>
          Bus List
        </Text>

        <FlatList
          data={buses}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (

            <View style={styles.busCard}>

              <Text style={styles.busName}>
                {item.busName}
              </Text>

              <Text style={styles.route}>
                {item.from} → {item.to}
              </Text>

              <Text style={styles.price}>
                ₹{item.price}
              </Text>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteBus(item._id)}
              >
                <Text style={styles.btnText}>
                  Delete
                </Text>
              </TouchableOpacity>

            </View>

          )}
        />



        {/* LIVE BUS MONITORING */}

        <Text style={styles.sectionTitle}>
          Live Bus Monitoring
        </Text>

        <FlatList
          data={liveBuses}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          renderItem={({ item }) => (

            <View style={styles.busCard}>

              <Text style={styles.busName}>
                {item.busName}
              </Text>

              <Text style={styles.route}>
                {item.from} → {item.to}
              </Text>

              <Text style={styles.route}>
                Speed: {item.speed} km/h
              </Text>

              <Text style={styles.route}>
                Status: {item.busStatus}
              </Text>

              <Text style={styles.route}>
                Location: {item.currentLocation?.latitude} , {item.currentLocation?.longitude}
              </Text>

            </View>

          )}
        />

      </ScrollView>

    </View>

  </LinearGradient>

);

}



/* STAT CARD COMPONENT */

function StatCard({ title, value }) {

  return (

    <View style={styles.statCard}>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statTitle}>
        {title}
      </Text>

    </View>

  );

}



const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    color: "#1E88FF",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#1F2A44",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addBtn: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  busCard: {
    backgroundColor: "#111C2F",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  busName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  route: {
    color: "#aaa",
  },

  price: {
    color: "#1E88FF",
    marginBottom: 10,
  },

  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    backgroundColor: "#111C2F",
    width: "48%",
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  statValue: {
    color: "#1E88FF",
    fontSize: 22,
    fontWeight: "bold",
  },

  statTitle: {
    color: "#aaa",
  },

  mapContainer: {
  height: 220,
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 20,
},

map: {
  flex: 1,
},

});