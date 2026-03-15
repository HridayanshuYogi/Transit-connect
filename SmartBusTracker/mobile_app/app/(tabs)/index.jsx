import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

export default function HomeScreen() {

  const router = useRouter();

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const [modalType, setModalType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const livePassengers = 34;
  const busCapacity = 50;
  const standAvgPassengers = 18;

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {

    try {

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoadingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

    } catch (error) {
      console.log("Location error:", error);
    }

    setLoadingLocation(false);

  };

  const loadPercent = Math.floor(
    (livePassengers / busCapacity) * 100
  );

  const calculateFare = (km) => {
    const baseFare = 20;
    return baseFare + km * 5;
  };

  const nextBusTime = () => {

    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);

    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  };

  return (

    <LinearGradient
      colors={["#050B1A", "#000814"]}
      style={styles.container}
    >

      {/* RIGHT SIDE MENU DRAWER */}

      <Modal visible={menuOpen} transparent animationType="fade">

        <View style={styles.drawerOverlay}>

          <View style={styles.drawer}>

            <Text style={styles.drawerTitle}>Menu</Text>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
            >
              <Text style={styles.drawerText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/(tabs)/tickets");
              }}
            >
              <Text style={styles.drawerText}>My Tickets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/admin_Dashboard");
              }}
            >
              <Text style={styles.drawerText}>Admin Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => setMenuOpen(false)}
            >
              <Text style={styles.drawerText}>Close</Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>


      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>
          SmartBusTracker 🚍
        </Text>

        <Text style={styles.subtitle}>
          Book and Track Your Bus Easily
        </Text>

        {/* MENU BUTTON */}

        <View style={styles.menuButton}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Ionicons name="menu" size={30} color="#fff" />
          </TouchableOpacity>
        </View>


        {/* MAP */}

        <View style={styles.mapContainer}>

          {loadingLocation ? (

            <ActivityIndicator size="large" color="#1E88FF" />

          ) : location ? (

            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              showsUserLocation
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >

              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="You"
              />

            </MapView>

          ) : (

            <Text style={{ color: "#aaa" }}>
              Location permission denied
            </Text>

          )}

        </View>


        {/* TODAY CARD */}

        <View style={styles.statsCard}>

          <Text style={styles.statsTitle}>
            Stand Avg Passengers
          </Text>

          <Text style={styles.statsValue}>
            {standAvgPassengers} People
          </Text>

        </View>


        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>


        <View style={styles.grid}>

          <FeatureCard
            icon="people-outline"
            title="Live Load"
            onPress={() => setModalType("load")}
          />

          <FeatureCard
            icon="create-outline"
            title="Modify Ticket"
            onPress={() => router.push("/(tabs)/tickets")}
          />

          <FeatureCard
            icon="wallet-outline"
            title="Auto Fare"
            onPress={() => setModalType("fare")}
          />

          <FeatureCard
            icon="time-outline"
            title="Missed Bus"
            onPress={() => setModalType("missed")}
          />

        </View>

      </ScrollView>


      {/* INFO MODALS */}

      <Modal visible={menuOpen} transparent animationType="fade">

<TouchableOpacity
style={styles.drawerOverlay}
activeOpacity={1}
onPress={() => setMenuOpen(false)}
>

<View style={styles.drawer}>

<Text style={styles.drawerTitle}>My Profile</Text>

<TouchableOpacity
style={styles.profileBtn}
onPress={()=>{
setMenuOpen(false);
router.push("/edit-profile");
}}
>
<Text style={styles.profileText}>Edit Profile</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.profileBtn}
onPress={()=>{
setMenuOpen(false);
router.push("/about");
}}
>
<Text style={styles.profileText}>About</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.profileBtn}
onPress={()=>{
setMenuOpen(false);
router.push("/driver");
}}
>
<Text style={styles.profileText}>Driver Panel</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.profileBtn}
onPress={()=>{
setMenuOpen(false);
router.push("/conductor");
}}
>
<Text style={styles.profileText}>Conductor Panel</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.profileBtn}
onPress={()=>{
setMenuOpen(false);
router.push("/admin_Dashboard");
}}
>
<Text style={styles.profileText}>Admin Dashboard</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.logoutBtn}
onPress={()=>{
setMenuOpen(false);
router.replace("/(auth)/login");
}}
>
<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

</View>

</TouchableOpacity>

</Modal>

    </LinearGradient>

  );

}


function FeatureCard({ icon, title, onPress }) {

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#1E88FF" />
      <Text style={styles.cardText}>{title}</Text>
    </TouchableOpacity>
  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  mapContainer: {
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#111C2F",
  },

  map: {
    width: "100%",
    height: "100%",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88FF",
  },

  subtitle: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 6,
    marginBottom: 20,
  },

  statsCard: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },

  statsTitle: {
    color: "#888",
    fontSize: 14,
  },

  statsValue: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#111C2F",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: "center",
  },

  cardText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#111C2F",
    padding: 20,
    borderRadius: 15,
    width: "80%",
  },

  modalTitle: {
    color: "#1E88FF",
    fontSize: 18,
    marginBottom: 10,
  },

  modalText: {
    color: "#fff",
    marginBottom: 5,
  },

  closeBtn: {
    marginTop: 15,
    backgroundColor: "#1E88FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  menuButton: {
    position: "absolute",
    right: 20,
    top: 10,
    zIndex: 10,
  },

drawerOverlay:{
flex:1,
backgroundColor:"rgba(0,0,0,0.5)",
flexDirection:"row",
justifyContent:"flex-end"
},

drawer:{
width:200,
backgroundColor:"#111C2F",
paddingTop:20,
paddingHorizontal:20
},

drawerTitle:{
color:"#1E88FF",
fontSize:22,
marginBottom:20,
fontWeight:"bold"
},

profileBtn:{
backgroundColor:"#34495e",
padding:14,
borderRadius:12,
marginBottom:10,
alignItems:"center"
},

profileText:{
color:"#fff",
fontWeight:"bold"
},

logoutBtn:{
backgroundColor:"#1E88FF",
padding:14,
borderRadius:12,
alignItems:"center",
marginTop:10
},

logoutText:{
color:"#fff",
fontWeight:"bold"
}

});